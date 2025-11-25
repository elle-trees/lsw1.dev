import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  limit as firestoreLimit,
} from "firebase/firestore";
import { LeaderboardEntry, Player } from "@/types/database";
import { leaderboardEntryConverter, playerConverter } from "./converters";

/**
 * Debug function to check autoclaiming status for a specific user
 * This helps diagnose why autoclaiming might not be working
 */
export const debugAutoclaimingForUser = async (
  displayNameOrUid: string
): Promise<{
  player: Player | null;
  playerSrcUsername: string | null;
  normalizedPlayerSrcUsername: string | null;
  importedRuns: Array<{
    id: string;
    srcPlayerName: string | undefined;
    normalizedSrcPlayerName: string;
    playerId: string | undefined;
    verified: boolean;
    isUnclaimed: boolean;
    matches: boolean;
  }>;
  summary: {
    totalImportedRuns: number;
    matchingRuns: number;
    unclaimedMatchingRuns: number;
    alreadyClaimedMatchingRuns: number;
  };
}> => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  // Find the player
  let player: Player | null = null;
  
  // Try by UID first
  const playerByUidQuery = query(
    collection(db, "players").withConverter(playerConverter),
    where("uid", "==", displayNameOrUid),
    firestoreLimit(1)
  );
  const playerByUidSnapshot = await getDocs(playerByUidQuery);
  
  if (!playerByUidSnapshot.empty) {
    player = playerByUidSnapshot.docs[0].data();
  } else {
    // Try by display name
    const playerByNameQuery = query(
      collection(db, "players").withConverter(playerConverter),
      where("displayName", "==", displayNameOrUid),
      firestoreLimit(1)
    );
    const playerByNameSnapshot = await getDocs(playerByNameQuery);
    
    if (!playerByNameSnapshot.empty) {
      player = playerByNameSnapshot.docs[0].data();
    } else {
      // Fallback: search all players (case-insensitive)
      const allPlayersQuery = query(
        collection(db, "players").withConverter(playerConverter),
        firestoreLimit(1000)
      );
      const allPlayersSnapshot = await getDocs(allPlayersQuery);
      const found = allPlayersSnapshot.docs
        .map(doc => doc.data())
        .find(p => 
          p.displayName?.toLowerCase() === displayNameOrUid.toLowerCase() ||
          p.uid === displayNameOrUid
        );
      if (found) {
        player = found;
      }
    }
  }

  if (!player) {
    return {
      player: null,
      playerSrcUsername: null,
      normalizedPlayerSrcUsername: null,
      importedRuns: [],
      summary: {
        totalImportedRuns: 0,
        matchingRuns: 0,
        unclaimedMatchingRuns: 0,
        alreadyClaimedMatchingRuns: 0,
      },
    };
  }

  const playerSrcUsername = player.srcUsername || null;
  const normalizedPlayerSrcUsername = playerSrcUsername
    ? playerSrcUsername.trim().toLowerCase()
    : null;

  // Get all imported runs
  const importedRunsQuery = query(
    collection(db, "leaderboardEntries").withConverter(leaderboardEntryConverter),
    where("importedFromSRC", "==", true)
  );
  const importedRunsSnapshot = await getDocs(importedRunsQuery);
  const allImportedRuns = importedRunsSnapshot.docs.map(doc => doc.data());

  // Process runs
  const processedRuns = allImportedRuns.map(run => {
    const normalizedSrcPlayerName = run.srcPlayerName
      ? run.srcPlayerName.trim().toLowerCase()
      : "";
    const isUnclaimed =
      !run.playerId || run.playerId === "imported" || run.playerId.trim() === "";
    const matches =
      normalizedPlayerSrcUsername !== null &&
      normalizedSrcPlayerName === normalizedPlayerSrcUsername;

    return {
      id: run.id,
      srcPlayerName: run.srcPlayerName,
      normalizedSrcPlayerName,
      playerId: run.playerId,
      verified: run.verified || false,
      isUnclaimed,
      matches,
    };
  });

  const matchingRuns = processedRuns.filter(r => r.matches);
  const unclaimedMatchingRuns = matchingRuns.filter(r => r.isUnclaimed);
  const alreadyClaimedMatchingRuns = matchingRuns.filter(r => !r.isUnclaimed);

  return {
    player,
    playerSrcUsername,
    normalizedPlayerSrcUsername,
    importedRuns: processedRuns,
    summary: {
      totalImportedRuns: allImportedRuns.length,
      matchingRuns: matchingRuns.length,
      unclaimedMatchingRuns: unclaimedMatchingRuns.length,
      alreadyClaimedMatchingRuns: alreadyClaimedMatchingRuns.length,
    },
  };
};

/**
 * Check a specific run's srcPlayerName value and compare it to a username
 * Useful for debugging why autoclaiming isn't working
 */
export const checkRunSrcPlayerName = async (
  runId: string,
  expectedUsername?: string
): Promise<{
  runId: string;
  srcPlayerName: string | undefined;
  normalizedSrcPlayerName: string;
  playerId: string | undefined;
  verified: boolean;
  importedFromSRC: boolean;
  expectedUsername?: string;
  normalizedExpectedUsername?: string;
  matches: boolean;
}> => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const runRef = doc(db, "leaderboardEntries", runId).withConverter(leaderboardEntryConverter);
  const runSnap = await getDoc(runRef);

  if (!runSnap.exists()) {
    throw new Error(`Run ${runId} not found`);
  }

  const run = runSnap.data();
  const normalizedSrcPlayerName = run.srcPlayerName
    ? String(run.srcPlayerName).trim().toLowerCase()
    : "";
  const normalizedExpectedUsername = expectedUsername
    ? expectedUsername.trim().toLowerCase()
    : undefined;

  return {
    runId,
    srcPlayerName: run.srcPlayerName,
    normalizedSrcPlayerName,
    playerId: run.playerId,
    verified: run.verified || false,
    importedFromSRC: run.importedFromSRC || false,
    expectedUsername,
    normalizedExpectedUsername,
    matches: normalizedExpectedUsername
      ? normalizedSrcPlayerName === normalizedExpectedUsername
      : false,
  };
};

