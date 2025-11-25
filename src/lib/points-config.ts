/**
 * Points configuration subscription initialization
 * Extracted from utils.ts to avoid dynamic import of entire utils module
 */

import type { PointsConfig } from "@/types/database";
import { DEFAULT_POINTS_CONFIG } from "@/config";

// Cache for points config to avoid repeated Firestore reads
let cachedPointsConfig: PointsConfig | null = null;
let configCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let configSubscription: (() => void) | null = null;
let isSubscribed = false;

/**
 * Initialize real-time subscription for points config
 * This ensures the cache is always up-to-date
 */
export function initializePointsConfigSubscription(): void {
  if (isSubscribed) return;
  
  (async () => {
    try {
      const { subscribeToPointsConfigFirestore } = await import("@/lib/data/firestore/points");
      const unsubscribe = subscribeToPointsConfigFirestore((config: PointsConfig | null) => {
        if (config) {
          cachedPointsConfig = config;
          configCacheTime = Date.now();
        }
      });
      
      if (unsubscribe) {
        configSubscription = unsubscribe;
        isSubscribed = true;
      }
    } catch (error) {
      // Error handling is done in the subscription function
    }
  })();
}

/**
 * Get points configuration (with caching and real-time updates)
 */
async function getPointsConfigCached(): Promise<PointsConfig> {
  // Initialize subscription if not already done
  if (!isSubscribed) {
    initializePointsConfigSubscription();
  }
  
  const now = Date.now();
  if (cachedPointsConfig && (now - configCacheTime) < CACHE_DURATION) {
    return cachedPointsConfig;
  }

  try {
    const { getPointsConfigFirestore } = await import("@/lib/data/firestore/points");
    cachedPointsConfig = await getPointsConfigFirestore();
    configCacheTime = now;
    return cachedPointsConfig || DEFAULT_POINTS_CONFIG;
  } catch (_error) {
    // Return default config on error
    return DEFAULT_POINTS_CONFIG;
  }
}

/**
 * Clear the points config cache (useful after updating config)
 */
export function clearPointsConfigCache(): void {
  cachedPointsConfig = null;
  configCacheTime = 0;
}


/**
 * Calculate studs for a run using configurable rates
 * 
 * @param timeString - Time string in HH:MM:SS format (not used but kept for compatibility)
 * @param categoryName - Name of the category (not used but kept for compatibility)
 * @param platformName - Name of the platform (not used but kept for compatibility)
 * @param categoryId - Optional category ID (not used but kept for compatibility)
 * @param platformId - Optional platform ID (not used but kept for compatibility)
 * @param rank - Optional rank of the run in its category (1-3 for bonus studs)
 * @param runType - Optional run type ('solo' or 'co-op')
 * @param leaderboardType - Optional leaderboard type ('regular', 'individual-level', or 'community-golds')
 * @param isObsolete - Optional flag indicating if the run is obsolete
 * @param config - Optional points configuration (if not provided, will fetch from Firestore)
 * @returns Studs awarded for the run (already split for co-op runs)
 */
export async function calculatePoints(
  timeString: string, 
  categoryName: string, 
  platformName?: string,
  categoryId?: string,
  platformId?: string,
  rank?: number,
  runType?: 'solo' | 'co-op',
  leaderboardType?: 'regular' | 'individual-level' | 'community-golds',
  isObsolete?: boolean,
  config?: PointsConfig
): Promise<number> {
  // Get config if not provided
  const pointsConfig = config || await getPointsConfigCached();
  
  // Check if this is an IL or Community Gold
  const isIL = leaderboardType === 'individual-level';
  const isCommunityGold = leaderboardType === 'community-golds';
  const isILOrCommunityGold = isIL || isCommunityGold;
  
  // Check if co-op
  const isCoOp = runType === 'co-op' || 
                 (typeof runType === 'string' && runType.toLowerCase().includes('co-op')) ||
                 (typeof runType === 'string' && runType.toLowerCase() === 'coop');
  
  // Start with base points
  let points = pointsConfig.basePoints;
  
  // Apply obsolete multiplier if obsolete
  if (isObsolete === true) {
    points = points * pointsConfig.obsoleteMultiplier;
  } else {
    // Apply IL/Community Gold multiplier if applicable
    if (isIL) {
      points = points * pointsConfig.ilMultiplier;
    } else if (isCommunityGold) {
      points = points * pointsConfig.communityGoldsMultiplier;
    }
  }
  
  // Apply rank bonuses if applicable
  // CRITICAL: Rank bonuses are NEVER applied to obsolete runs
  let numericRank: number | undefined = undefined;
  if (rank !== undefined && rank !== null) {
    if (typeof rank === 'number' && !isNaN(rank)) {
      numericRank = rank;
    } else {
      const parsed = Number(rank);
      if (!isNaN(parsed) && parsed > 0) {
        numericRank = parsed;
      }
    }
  }
  
  // Add rank bonuses if applicable
  // CRITICAL: Obsolete runs never receive rank bonuses, only base points (with obsolete multiplier)
  if (numericRank !== undefined && numericRank >= 1 && numericRank <= 3 && Number.isInteger(numericRank) && isObsolete !== true) {
    // Check if rank bonuses apply to this leaderboard type
    const canApplyRankBonus = 
      leaderboardType === 'regular' || 
      (isIL && pointsConfig.applyRankBonusesToIL) ||
      (isCommunityGold && pointsConfig.applyRankBonusesToCommunityGolds);
    
    if (canApplyRankBonus) {
      if (numericRank === 1) {
        points += pointsConfig.rank1Bonus;
      } else if (numericRank === 2) {
        points += pointsConfig.rank2Bonus;
      } else if (numericRank === 3) {
        points += pointsConfig.rank3Bonus;
      }
    }
  }
  
  // Apply co-op multiplier
  if (isCoOp) {
    points = points * pointsConfig.coOpMultiplier;
  }
  
  // Round to nearest integer to avoid floating point issues
  return Math.round(points);
}

