// Runs and Leaderboard operations
import {
  addLeaderboardEntryFirestore,
  updateLeaderboardEntryFirestore,
  deleteLeaderboardEntryFirestore,
  getRecentRunsFirestore,
  getPlayerRunsFirestore,
  getPlayerPendingRunsFirestore,
  getUnverifiedLeaderboardEntriesFirestore,
  updateRunVerificationStatusFirestore,
  updateRunObsoleteStatusFirestore,
  deleteAllLeaderboardEntriesFirestore
} from "../data/firestore/runs";

import {
  getLeaderboardEntriesFirestore,
  getLeaderboardEntryByIdFirestore
} from "../data/firestore/leaderboards";

import { LeaderboardEntry } from "@/types/database";

export const getLeaderboardEntries = async (
  categoryId?: string,
  platformId?: string,
  runType?: 'solo' | 'co-op',
  includeObsolete?: boolean,
  leaderboardType?: 'regular' | 'individual-level' | 'community-golds',
  levelId?: string,
  subcategoryId?: string
): Promise<LeaderboardEntry[]> => {
  return getLeaderboardEntriesFirestore(categoryId, platformId, runType, includeObsolete, leaderboardType, levelId, subcategoryId);
};

export const getLeaderboardEntryById = getLeaderboardEntryByIdFirestore;
export const addLeaderboardEntry = addLeaderboardEntryFirestore;
export const getRecentRuns = getRecentRunsFirestore;
export const getPlayerRuns = getPlayerRunsFirestore;
export const getPlayerPendingRuns = getPlayerPendingRunsFirestore;
export const getUnverifiedLeaderboardEntries = getUnverifiedLeaderboardEntriesFirestore;

export const updateLeaderboardEntry = async (runId: string, data: Partial<LeaderboardEntry>): Promise<boolean> => {
  try {
    return await updateLeaderboardEntryFirestore(runId, data);
  } catch (error: any) {
    // Re-throw with more context
    throw new Error(error.message || error.code || "Failed to update run");
  }
};

export const updateRunVerificationStatus = updateRunVerificationStatusFirestore;
export const deleteLeaderboardEntry = deleteLeaderboardEntryFirestore;
export const deleteAllLeaderboardEntries = deleteAllLeaderboardEntriesFirestore;
export const updateRunObsoleteStatus = updateRunObsoleteStatusFirestore;

export const runTypes = [
  { id: "solo", name: "Solo" },
  { id: "co-op", name: "Co-op" },
];

