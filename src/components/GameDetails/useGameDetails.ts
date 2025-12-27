/**
 * Hook for managing GameDetails data fetching and state
 */

import { useState, useEffect } from "react";
import { GameDetailsConfig } from "@/types/database";
import type { User as FirebaseUser } from "firebase/auth";
import { useGame } from "@/contexts/GameContext";

interface UseGameDetailsResult {
  config: GameDetailsConfig | null;
  loading: boolean;
  unclaimedRunsCount: number;
  unverifiedRunsCount: number;
  resetNotificationCounts: () => void;
}

export function useGameDetails(
  currentUser: (FirebaseUser & { isAdmin: boolean }) | null,
  authLoading: boolean,
): UseGameDetailsResult {
  const { currentGame } = useGame();
  const [config, setConfig] = useState<GameDetailsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [unclaimedRunsCount, setUnclaimedRunsCount] = useState(0);
  const [unverifiedRunsCount, setUnverifiedRunsCount] = useState(0);

  // Fetch game details config
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const { getGameDetailsConfigFirestore } =
          await import("@/lib/data/firestore/game-details");
        const gameConfig = await getGameDetailsConfigFirestore(currentGame.id);
        setConfig(gameConfig);
      } catch (error) {
        console.error("Error fetching game details config:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [currentGame]);

  // Fetch notification counts
  useEffect(() => {
    if (!currentUser || authLoading) {
      setUnclaimedRunsCount(0);
      setUnverifiedRunsCount(0);
      return;
    }

    const fetchNotificationCounts = async () => {
      try {
        const { getPlayerByUidFirestore } =
          await import("@/lib/data/firestore/players");
        const { getUnclaimedRunsBySRCUsernameFirestore } =
          await import("@/lib/data/firestore/src-imports");
        const { getUnverifiedLeaderboardEntriesFirestore } =
          await import("@/lib/data/firestore/runs");

        // Check for unclaimed runs (for all users)
        const player = await getPlayerByUidFirestore(currentUser.uid);
        if (player?.srcUsername) {
          try {
            const unclaimedRuns = await getUnclaimedRunsBySRCUsernameFirestore(
              player.srcUsername,
            );
            setUnclaimedRunsCount(unclaimedRuns.length);
          } catch (error) {
            setUnclaimedRunsCount(0);
          }
        } else {
          setUnclaimedRunsCount(0);
        }

        // Check for unverified runs (for admins only)
        if (currentUser.isAdmin) {
          try {
            const unverifiedRuns =
              await getUnverifiedLeaderboardEntriesFirestore();
            // Count only manually submitted runs (not imported)
            const manualUnverified = unverifiedRuns.filter(
              (run) => !run.importedFromSRC,
            );
            setUnverifiedRunsCount(manualUnverified.length);
          } catch (error) {
            setUnverifiedRunsCount(0);
          }
        } else {
          setUnverifiedRunsCount(0);
        }
      } catch (error) {
        // Silent fail
      }
    };

    fetchNotificationCounts();

    // Refresh counts every 30 seconds
    const interval = setInterval(fetchNotificationCounts, 30000);

    return () => clearInterval(interval);
  }, [currentUser, authLoading]);

  const resetNotificationCounts = () => {
    setUnclaimedRunsCount(0);
    setUnverifiedRunsCount(0);
  };

  return {
    config,
    loading,
    unclaimedRunsCount,
    unverifiedRunsCount,
    resetNotificationCounts,
  };
}
