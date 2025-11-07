import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a localized date format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

/**
 * Parse a time string (HH:MM:SS) to total seconds
 * @param timeString - Time string in HH:MM:SS format
 * @returns Total seconds
 */
export function parseTimeToSeconds(timeString: string): number {
  const parts = timeString.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

/**
 * Format total seconds to HH:MM:SS format
 * @param totalSeconds - Total seconds
 * @returns Time string in HH:MM:SS format
 */
export function formatSecondsToTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Format a time string to display without hours if under 1 hour
 * @param timeString - Time string in HH:MM:SS format
 * @returns Formatted time string (MM:SS if under 1 hour, otherwise HH:MM:SS)
 */
export function formatTime(timeString: string): string {
  if (!timeString) return timeString;
  
  // Trim whitespace
  const trimmed = timeString.trim();
  
  // Handle different time formats
  const parts = trimmed.split(':');
  
  // If it's already in MM:SS format (2 parts), return as-is
  if (parts.length === 2) {
    return trimmed;
  }
  
  // If it's in HH:MM:SS format (3 parts)
  if (parts.length === 3) {
    const hoursStr = parts[0].trim();
    const hours = parseInt(hoursStr, 10);
    
    // If hours is 0, "00", or NaN, return MM:SS format
    if (isNaN(hours) || hours === 0 || hoursStr === '00' || hoursStr === '0') {
      // Ensure minutes and seconds are properly formatted
      const minutes = (parts[1] || '00').trim();
      const seconds = (parts[2] || '00').trim();
      return `${minutes}:${seconds}`;
    }
    
    // If hours is 1-9, remove leading zero and return H:MM:SS
    // If hours is 10+, keep as is (though this won't happen in practice)
    if (hours >= 1 && hours < 10) {
      const minutes = (parts[1] || '00').trim();
      const seconds = (parts[2] || '00').trim();
      return `${hours}:${minutes}:${seconds}`;
    }
  }
  
  // Otherwise return as-is (for 10+ hours, though this won't happen)
  return trimmed;
}

/**
 * Calculate studs for a run using simple flat rates
 * Studs are awarded for:
 * - All verified runs (full game, individual levels, and community golds)
 * - All platforms
 * - All categories
 * - Both solo and co-op runs are eligible
 * 
 * Studs calculation:
 * - Base studs: 10 studs for all verified runs
 * - Top 3 bonus: additional bonus studs for Full Game runs ranked 1st, 2nd, or 3rd (NOT applied to ILs, Community Golds, or obsolete runs)
 * - IL/Community Gold: Individual Levels and Community Golds only receive base studs (no rank bonuses)
 * - Co-op split: Co-op runs split studs equally between both players (0.5x multiplier)
 * - Obsolete runs: Only receive base studs (no rank bonuses), but still subject to co-op split
 * 
 * Full Game Solo runs:
 * - Rank 1: 10 + 50 = 60 studs
 * - Rank 2: 10 + 30 = 40 studs
 * - Rank 3: 10 + 20 = 30 studs
 * - All others: 10 studs
 * 
 * Full Game Co-op runs:
 * - Studs are split equally between both players
 * - Rank 1: (10 + 50) / 2 = 30 studs per player
 * - Rank 2: (10 + 30) / 2 = 20 studs per player
 * - Rank 3: (10 + 20) / 2 = 15 studs per player
 * - All others: 10 / 2 = 5 studs per player
 * 
 * IL/Community Gold Solo runs (base studs only, no rank bonuses):
 * - All ranks: 10 studs
 * 
 * IL/Community Gold Co-op runs (base studs only, then split):
 * - All ranks: 10 / 2 = 5 studs per player
 * 
 * @param timeString - Time string in HH:MM:SS format (not used but kept for compatibility)
 * @param categoryName - Name of the category (not used but kept for compatibility)
 * @param platformName - Name of the platform (not used but kept for compatibility)
 * @param categoryId - Optional category ID (not used but kept for compatibility)
 * @param platformId - Optional platform ID (not used but kept for compatibility)
 * @param rank - Optional rank of the run in its category (1-3 for bonus studs, only for Full Game)
 * @param runType - Optional run type ('solo' or 'co-op'). If 'co-op', studs are split in half
 * @param leaderboardType - Optional leaderboard type ('regular', 'individual-level', or 'community-golds'). ILs and community golds receive base studs only
 * @param isObsolete - Optional flag indicating if the run is obsolete. Obsolete runs only receive base studs (no rank bonuses)
 * @returns Studs awarded for the run (already split for co-op runs)
 */
export function calculatePoints(
  timeString: string, 
  categoryName: string, 
  platformName?: string,
  categoryId?: string,
  platformId?: string,
  rank?: number,
  runType?: 'solo' | 'co-op',
  leaderboardType?: 'regular' | 'individual-level' | 'community-golds',
  isObsolete?: boolean
): number {
  // Base studs for all verified runs
  const basePoints = 10;
  
  // Check if this is an IL or Community Gold
  const isILOrCommunityGold = leaderboardType === 'individual-level' || leaderboardType === 'community-golds';
  
  // ILs, Community Golds, and obsolete runs only get base studs (no rank bonuses)
  if (isObsolete === true || isILOrCommunityGold) {
    let points = basePoints;
    
    // CRITICAL: For co-op runs, ALWAYS split studs equally between both players
    const isCoOp = runType === 'co-op' || 
                   (typeof runType === 'string' && runType.toLowerCase().includes('co-op')) ||
                   (typeof runType === 'string' && runType.toLowerCase() === 'coop');
    
    if (isCoOp) {
      points = points / 2;
    }
    
    // Round to nearest integer to avoid floating point issues
    return Math.round(points);
  }
  
  // For Full Game runs, apply rank bonuses
  // Ensure rank is a number for comparison
  // Handle null, undefined, and non-number values
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
  
  // Start with base studs
  let points = basePoints;

  // Add top 3 bonus if applicable (only for Full Game runs)
  // Only apply bonus if rank is exactly 1, 2, or 3
  if (numericRank !== undefined && numericRank >= 1 && numericRank <= 3 && Number.isInteger(numericRank)) {
    if (numericRank === 1) {
      points += 50; // 1st place bonus
    } else if (numericRank === 2) {
      points += 30; // 2nd place bonus
    } else if (numericRank === 3) {
      points += 20; // 3rd place bonus
    }
  }

  // CRITICAL: For co-op runs, ALWAYS split studs equally between both players
  // This ensures both players get half the studs for co-op runs
  // Studs are already split here, so each player gets the returned value
  // Safeguard: Check for 'co-op' or 'coop' (case-insensitive) to handle any variations
  const isCoOp = runType === 'co-op' || 
                 (typeof runType === 'string' && runType.toLowerCase().includes('co-op')) ||
                 (typeof runType === 'string' && runType.toLowerCase() === 'coop');
  
  if (isCoOp) {
    points = points / 2;
  }

  // Round to nearest integer to avoid floating point issues
  return Math.round(points);
}
