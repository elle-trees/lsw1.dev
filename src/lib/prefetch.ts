/**
 * Comprehensive prefetching system for routes and data
 * 
 * This module provides utilities to prefetch:
 * 1. Route chunks (JavaScript bundles)
 * 2. Page data (Firestore queries, API calls, etc.)
 */

// Removed useHref - no longer needed with TanStack Router

// Route to data prefetch mapping
type PrefetchDataFn = (params?: Record<string, string>) => Promise<void> | void;

interface RoutePrefetchConfig {
  // Function to prefetch data for this route
  prefetchData?: PrefetchDataFn;
  // Whether to prefetch route chunk (default: true)
  prefetchRoute?: boolean;
}

// Map of route patterns to their prefetch configurations
const routePrefetchMap: Map<string | RegExp, RoutePrefetchConfig> = new Map();

/**
 * Register a route pattern with its prefetch configuration
 */
export function registerRoutePrefetch(
  pattern: string | RegExp,
  config: RoutePrefetchConfig
) {
  routePrefetchMap.set(pattern, config);
}

/**
 * Get prefetch config for a route
 */
function getPrefetchConfig(path: string): RoutePrefetchConfig | null {
  for (const [pattern, config] of routePrefetchMap.entries()) {
    if (typeof pattern === "string") {
      // Exact match or starts with
      if (path === pattern || path.startsWith(pattern + "/")) {
        return config;
      }
    } else if (pattern instanceof RegExp) {
      if (pattern.test(path)) {
        return config;
      }
    }
  }
  return null;
}

/**
 * Prefetch route chunk (JavaScript bundle)
 */
export function prefetchRoute(href: string): void {
  if (typeof document === "undefined") return;
  
  // Check if already prefetched
  const existingLink = document.querySelector(`link[data-prefetch-route="${href}"]`);
  if (existingLink) return;

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = href;
  link.as = "document";
  link.setAttribute("data-prefetch-route", href);
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}

/**
 * Extract route params from a path using route patterns
 */
function extractRouteParams(path: string, pattern: string | RegExp): Record<string, string> | undefined {
  if (typeof pattern === "string") {
    // For simple string patterns, try to match dynamic segments
    const patternParts = pattern.split("/");
    const pathParts = path.split("/");
    
    if (patternParts.length !== pathParts.length) return undefined;
    
    const params: Record<string, string> = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(":")) {
        const paramName = patternParts[i].slice(1);
        params[paramName] = pathParts[i];
      }
    }
    return Object.keys(params).length > 0 ? params : undefined;
  } else if (pattern instanceof RegExp) {
    // For regex patterns, extract named groups or use match groups
    const match = path.match(pattern);
    if (!match) return undefined;
    
    // Try to extract from match groups
    if (match.length > 1) {
      // For /player/:playerId pattern, the first group would be playerId
      if (pattern.source.includes("player")) {
        return { playerId: match[1] };
      } else if (pattern.source.includes("run")) {
        return { runId: match[1] };
      }
    }
  }
  return undefined;
}

/**
 * Prefetch data for a route
 */
export async function prefetchRouteData(
  path: string,
  params?: Record<string, string>
): Promise<void> {
  // Find matching config
  let config: RoutePrefetchConfig | null = null;
  let matchedPattern: string | RegExp | null = null;
  
  for (const [pattern, cfg] of routePrefetchMap.entries()) {
    if (typeof pattern === "string") {
      if (path === pattern || path.startsWith(pattern + "/")) {
        config = cfg;
        matchedPattern = pattern;
        break;
      }
    } else if (pattern instanceof RegExp) {
      if (pattern.test(path)) {
        config = cfg;
        matchedPattern = pattern;
        break;
      }
    }
  }
  
  if (config?.prefetchData) {
    try {
      // If params not provided, try to extract from path
      let finalParams = params;
      if (!finalParams && matchedPattern) {
        finalParams = extractRouteParams(path, matchedPattern);
      }
      await config.prefetchData(finalParams);
    } catch (error) {
      // Silent fail - prefetching should not break the app
      // Prefetch failures are expected and don't need logging
    }
  }
}

/**
 * Prefetch both route and data for a path
 */
export async function prefetchRouteAndData(
  href: string,
  path: string,
  params?: Record<string, string>
): Promise<void> {
  const config = getPrefetchConfig(path);
  
  // Prefetch route chunk if enabled (default: true)
  if (config?.prefetchRoute !== false) {
    prefetchRoute(href);
  }
  
  // Prefetch data if configured
  if (config?.prefetchData) {
    await prefetchRouteData(path, params);
  }
}

/**
 * Helper function to prefetch static data (categories, platforms, levels)
 * Shared between multiple prefetch functions
 */
async function prefetchStaticData(categoryType?: 'regular' | 'individual-level' | 'community-golds') {
  const { getCategories, getPlatforms, getLevels } = await import("@/lib/data/firestore");
  await Promise.all([
    getCategories(categoryType || "regular").catch(() => null),
    getPlatforms().catch(() => null),
    getLevels().catch(() => null)
  ]);
}

/**
 * Initialize route prefetch configurations
 * This should be called once when the app loads
 */
export function initializeRoutePrefetches() {
  // Import data fetching functions lazily to avoid circular dependencies
  const prefetchIndex = async () => {
    const [{ getRecentRunsFirestore: getRecentRuns }, { getAllVerifiedRunsFirestore: getAllVerifiedRuns }] = await Promise.all([
      import("@/lib/data/firestore/runs"),
      import("@/lib/data/firestore/src-imports")
    ]);
    // Prefetch recent runs and stats
    await Promise.all([
      getRecentRuns(20).catch(() => null),
      getAllVerifiedRuns().catch(() => null)
    ]);
  };

  const prefetchLeaderboards = async () => {
    await prefetchStaticData("regular");
  };

  const prefetchSubmitRun = async () => {
    await prefetchStaticData("regular");
  };

  const prefetchPlayer = async (params?: Record<string, string>) => {
    const playerId = params?.playerId;
    if (!playerId) return;
    const [{ getPlayerByUidFirestore: getPlayerByUid }, { getPlayerRunsFirestore: getPlayerRuns }] = await Promise.all([
      import("@/lib/data/firestore/players"),
      import("@/lib/data/firestore/runs")
    ]);
    // Prefetch player data and their runs
    await Promise.all([
      getPlayerByUid(playerId).catch(() => null),
      getPlayerRuns(playerId).catch(() => null)
    ]);
  };

  const prefetchRun = async (params?: Record<string, string>) => {
    const runId = params?.runId;
    if (!runId) return;
    const { getLeaderboardEntryById, getCategories, getPlatforms } = await import("@/lib/data/firestore");
    // Prefetch run data and related static data
    await Promise.all([
      getLeaderboardEntryById(runId).catch(() => null),
      getCategories().catch(() => null),
      getPlatforms().catch(() => null)
    ]);
  };

  const prefetchPointsLeaderboard = async () => {
    const { getPlayersByPoints } = await import("@/lib/data/firestore");
    await getPlayersByPoints().catch(() => null);
  };

  // Register routes
  registerRoutePrefetch("/", {
    prefetchData: prefetchIndex,
  });

  registerRoutePrefetch("/leaderboards", {
    prefetchData: prefetchLeaderboards,
  });

  registerRoutePrefetch("/submit", {
    prefetchData: prefetchSubmitRun,
  });

  // Register dynamic routes with param extraction
  registerRoutePrefetch(/^\/player\/(.+)$/, {
    prefetchData: async (params?: Record<string, string>) => {
      // Extract playerId from params or try to extract from path
      const playerId = params?.playerId;
      if (playerId) {
        await prefetchPlayer({ playerId });
      }
    },
  });

  registerRoutePrefetch(/^\/run\/(.+)$/, {
    prefetchData: async (params?: Record<string, string>) => {
      // Extract runId from params or try to extract from path
      const runId = params?.runId;
      if (runId) {
        await prefetchRun({ runId });
      }
    },
  });

  registerRoutePrefetch("/points", {
    prefetchData: prefetchPointsLeaderboard,
  });

  // Other routes don't need data prefetching or will be handled dynamically
  registerRoutePrefetch("/settings", { prefetchRoute: true });
  registerRoutePrefetch("/admin", { prefetchRoute: true });
  registerRoutePrefetch("/live", { prefetchRoute: true });
  registerRoutePrefetch("/downloads", { prefetchRoute: true });
  registerRoutePrefetch("/stats", { prefetchRoute: true });
}

