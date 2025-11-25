import { useRef, useCallback } from "react";
import { useRouter } from "@tanstack/react-router";
import { prefetchRouteData } from "@/lib/prefetch";

/**
 * Comprehensive prefetch hook for routes and data
 * 
 * This hook provides prefetching capabilities that:
 * 1. Prefetch route chunks using TanStack Router's built-in prefetching
 * 2. Prefetch page data (Firestore queries, etc.) on hover
 * 3. Work with both static and dynamic routes
 * 
 * @param to - The route path to prefetch (TanStack Router format)
 * @param params - Optional parameters for dynamic routes (e.g., { playerId: "123" })
 * @returns Event handlers for mouse enter
 */
export function usePrefetch(
  to: string,
  params?: Record<string, string>
) {
  const router = useRouter();
  const hasPrefetched = useRef(false);

  const buildPath = useCallback(() => {
    let path = to;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        path = path.replace(`$${key}`, value);
      });
    }
    return path;
  }, [to, params]);

  const handleMouseEnter = useCallback(() => {
    if (hasPrefetched.current) return;
    
    const path = buildPath();
    
    // Use TanStack Router's built-in prefetching
    try {
      if (typeof router.preloadRoute === 'function') {
        router.preloadRoute({ to, params });
      }
    } catch (error) {
      // Fallback if preloadRoute doesn't exist
    }
    
    // Prefetch data using our system
    prefetchRouteData(path, params).catch(() => {
      // Silent fail
    });
    
    hasPrefetched.current = true;
  }, [to, params, router, buildPath]);

  return {
    onMouseEnter: handleMouseEnter,
    prefetch: () => {
      if (!hasPrefetched.current) {
        handleMouseEnter();
      }
    },
  };
}

/**
 * Legacy hook for backward compatibility
 * @deprecated Use usePrefetch instead
 */
export function usePrefetchOnHover(to: string) {
  return usePrefetch(to);
}

/**
 * Hook to prefetch data for visible items (e.g., in a list)
 * Useful for prefetching player/run details when they're visible in the viewport
 */
export function usePrefetchVisible(
  _items: Array<{ id: string; type: "player" | "run" }>
) {
  const prefetchedIds = useRef<Set<string>>(new Set());

  const prefetchItem = useCallback((item: { id: string; type: "player" | "run" }) => {
    if (prefetchedIds.current.has(item.id)) return;

    const prefetchFn = async () => {
      if (item.type === "player") {
        const { getPlayerByUidFirestore: getPlayerByUid } = await import("@/lib/data/firestore/players");
        const { getPlayerRunsFirestore: getPlayerRuns } = await import("@/lib/data/firestore/runs");
        await Promise.all([
          getPlayerByUid(item.id).catch(() => null),
          getPlayerRuns(item.id).catch(() => null),
        ]);
      } else if (item.type === "run") {
        const { getLeaderboardEntryByIdFirestore: getLeaderboardEntryById } = await import("@/lib/data/firestore/leaderboards");
        await getLeaderboardEntryById(item.id).catch(() => null);
      }
    };

    prefetchFn();
    prefetchedIds.current.add(item.id);
  }, []);

  return { prefetchItem };
}
