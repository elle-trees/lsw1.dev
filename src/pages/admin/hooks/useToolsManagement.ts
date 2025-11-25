/**
 * Hook for managing tools (manual run submission and admin status management)
 */

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

export function useToolsManagement() {
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Manual run state
  const [manualRunLeaderboardType, setManualRunLeaderboardType] = useState<'regular' | 'individual-level' | 'community-golds'>('regular');
  const [manualRun, setManualRun] = useState({
    playerName: "",
    playerUsername: "",
    player2Name: "",
    category: "",
    level: "",
    platform: "",
    runType: "solo" as 'solo' | 'co-op',
    time: "",
    date: new Date().toISOString().split('T')[0],
    videoUrl: "",
    comment: "",
    verified: true,
    verifiedBy: "",
  });
  const [addingManualRun, setAddingManualRun] = useState(false);

  // Admin management state
  const [adminUserInput, setAdminUserInput] = useState("");
  const [adminSearchType, setAdminSearchType] = useState<"displayName" | "uid">("displayName");
  const [settingAdmin, setSettingAdmin] = useState(false);
  const [foundPlayer, setFoundPlayer] = useState<{ uid: string; displayName: string; email: string; isAdmin: boolean } | null>(null);
  const [searchingPlayer, setSearchingPlayer] = useState(false);

  const handleSearchPlayer = async () => {
    if (!adminUserInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a display name or UID.",
        variant: "destructive",
      });
      return;
    }

    setSearchingPlayer(true);
    setFoundPlayer(null);

    try {
      let player = null;
      if (adminSearchType === "displayName") {
        const { getPlayerByDisplayNameFirestore } = await import("@/lib/data/firestore/players");
        player = await getPlayerByDisplayNameFirestore(adminUserInput.trim());
      } else {
        const { getPlayerByUidFirestore } = await import("@/lib/data/firestore/players");
        player = await getPlayerByUidFirestore(adminUserInput.trim());
      }

      if (player) {
        setFoundPlayer({
          uid: player.uid,
          displayName: player.displayName || "",
          email: player.email || "",
          isAdmin: Boolean(player.isAdmin),
        });
      } else {
        toast({
          title: "Player Not Found",
          description: `No player found with ${adminSearchType === "displayName" ? "display name" : "UID"}: ${adminUserInput.trim()}`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to search for player.",
        variant: "destructive",
      });
    } finally {
      setSearchingPlayer(false);
    }
  };

  const handleSetAdminStatus = async (uid: string, isAdmin: boolean) => {
    setSettingAdmin(true);
    try {
      const { setPlayerAdminStatusFirestore } = await import("@/lib/data/firestore/players");
      const success = await setPlayerAdminStatusFirestore(uid, isAdmin);
      if (success) {
        toast({
          title: "Success",
          description: `Admin status ${isAdmin ? "granted" : "revoked"} successfully.`,
        });
        if (foundPlayer && foundPlayer.uid === uid) {
          setFoundPlayer({ ...foundPlayer, isAdmin });
        }
      } else {
        throw new Error("Failed to update admin status.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update admin status.",
        variant: "destructive",
      });
    } finally {
      setSettingAdmin(false);
    }
  };

  const handleAddManualRun = async (e: React.FormEvent, firestorePlatforms: { id: string; name: string }[], fetchUnverifiedRuns: () => Promise<void>) => {
    e.preventDefault();
    if (!currentUser?.uid) return;
    
    if (!manualRun.playerName || !manualRun.category || !manualRun.platform || !manualRun.time || !manualRun.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if ((manualRunLeaderboardType === 'individual-level' || manualRunLeaderboardType === 'community-golds') && !manualRun.level) {
      toast({
        title: "Missing Information",
        description: "Please select a level.",
        variant: "destructive",
      });
      return;
    }
    
    if (manualRun.runType === 'co-op' && !manualRun.player2Name) {
      toast({
        title: "Missing Information",
        description: "Please enter Player 2 name for co-op runs.",
        variant: "destructive",
      });
      return;
    }
    
    setAddingManualRun(true);
    try {
      let playerId: string | null = null;
      
      if (manualRun.playerUsername.trim()) {
        const { getPlayerByDisplayNameFirestore } = await import("@/lib/data/firestore/players");
        const player = await getPlayerByDisplayNameFirestore(manualRun.playerUsername.trim());
        if (player) {
          playerId = player.uid;
          if (player.displayName && player.displayName !== manualRun.playerName) {
            toast({
              title: "Player Found",
              description: `Using player account: ${player.displayName}`,
            });
          }
        }
      }
      
      if (!playerId && manualRun.playerName.trim()) {
        const { getPlayerByDisplayNameFirestore } = await import("@/lib/data/firestore/players");
        const player = await getPlayerByDisplayNameFirestore(manualRun.playerName.trim());
        if (player) {
          playerId = player.uid;
        }
      }
      
      if (!playerId) {
        playerId = "";
        toast({
          title: "Player Not Found",
          description: `Player "${manualRun.playerName}" does not have an account. Run will be submitted but won't be linked to any player profile until claimed.`,
          variant: "default",
        });
      }
      
      const entry: any = {
        playerId: playerId,
        playerName: manualRun.playerName,
        category: manualRun.category,
        platform: manualRun.platform,
        runType: manualRun.runType,
        leaderboardType: manualRunLeaderboardType,
        time: manualRun.time,
        date: manualRun.date,
        verified: manualRun.verified,
      };
      
      if (manualRun.runType === 'co-op' && manualRun.player2Name && manualRun.player2Name.trim()) {
        entry.player2Name = manualRun.player2Name.trim();
      }
      if ((manualRunLeaderboardType === 'individual-level' || manualRunLeaderboardType === 'community-golds') && manualRun.level) {
        entry.level = manualRun.level;
      }
      if (manualRun.videoUrl && manualRun.videoUrl.trim()) {
        entry.videoUrl = manualRun.videoUrl.trim();
      }
      if (manualRun.comment && manualRun.comment.trim()) {
        entry.comment = manualRun.comment.trim();
      }
      if (manualRun.verified) {
        if (manualRun.verifiedBy && manualRun.verifiedBy.trim()) {
          entry.verifiedBy = manualRun.verifiedBy.trim();
        } else if (currentUser) {
          entry.verifiedBy = currentUser.displayName || currentUser.email || currentUser.uid;
        }
      }
      
      const { addLeaderboardEntryFirestore } = await import("@/lib/data/firestore/runs");
      const result = await addLeaderboardEntryFirestore(entry);
      if (result) {
        toast({
          title: "Run Added",
          description: "Manual run has been added successfully.",
        });
        setManualRun({
          playerName: "",
          playerUsername: "",
          player2Name: "",
          category: "",
          level: "",
          platform: firestorePlatforms[0]?.id || "",
          runType: "solo",
          time: "",
          date: new Date().toISOString().split('T')[0],
          videoUrl: "",
          comment: "",
          verified: true,
          verifiedBy: "",
        });
        setManualRunLeaderboardType('regular');
        await fetchUnverifiedRuns();
      } else {
        throw new Error("Failed to add run.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add manual run.",
        variant: "destructive",
      });
    } finally {
      setAddingManualRun(false);
    }
  };

  return {
    // Manual run
    manualRunLeaderboardType,
    setManualRunLeaderboardType,
    manualRun,
    setManualRun,
    addingManualRun,
    handleAddManualRun,
    // Admin management
    adminUserInput,
    setAdminUserInput,
    adminSearchType,
    setAdminSearchType,
    settingAdmin,
    foundPlayer,
    setFoundPlayer,
    searchingPlayer,
    handleSearchPlayer,
    handleSetAdminStatus,
  };
}

