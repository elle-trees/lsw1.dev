/**
 * Hook for managing users in the admin panel
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { Player } from "@/types/database";

const itemsPerPage = 25;

export function useUsersManagement() {
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [playersPage, setPlayersPage] = useState(1);
  const [playersSearchQuery, setPlayersSearchQuery] = useState("");
  const [playersSortBy, setPlayersSortBy] = useState<'joinDate' | 'displayName' | 'totalPoints' | 'totalRuns'>('joinDate');
  const [playersSortOrder, setPlayersSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editingPlayerForm, setEditingPlayerForm] = useState<Partial<Player>>({});
  const [savingPlayer, setSavingPlayer] = useState(false);
  const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);
  const [showDeletePlayerDialog, setShowDeletePlayerDialog] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<{ id: string; displayName: string } | null>(null);
  const [deletePlayerRuns, setDeletePlayerRuns] = useState(false);

  const fetchPlayers = useCallback(async () => {
    setLoadingPlayers(true);
    try {
      const { getAllPlayersFirestore } = await import("@/lib/data/firestore/players");
      const players = await getAllPlayersFirestore(playersSortBy, playersSortOrder);
      setAllPlayers(players);
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlayers(false);
    }
  }, [playersSortBy, playersSortOrder, toast]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setEditingPlayerForm({
      displayName: player.displayName || "",
      email: player.email || "",
      isAdmin: player.isAdmin || false,
      nameColor: player.nameColor || "#cba6f7",
      bio: player.bio || "",
      pronouns: player.pronouns || "",
      twitchUsername: player.twitchUsername || "",
      srcUsername: player.srcUsername || "",
    });
  };

  const handleSavePlayer = async () => {
    if (!editingPlayer) return;
    
    setSavingPlayer(true);
    try {
      const { updatePlayerFirestore } = await import("@/lib/data/firestore/players");
      const success = await updatePlayerFirestore(editingPlayer.id, editingPlayerForm);
      if (success) {
        toast({
          title: "Success",
          description: "User updated successfully.",
        });
        setEditingPlayer(null);
        setEditingPlayerForm({});
        await fetchPlayers();
      } else {
        throw new Error("Failed to update user.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user.",
        variant: "destructive",
      });
    } finally {
      setSavingPlayer(false);
    }
  };

  const handleDeletePlayerClick = (player: Player) => {
    setPlayerToDelete({ id: player.id, displayName: player.displayName || "Unknown" });
    setShowDeletePlayerDialog(true);
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;
    
    setDeletingPlayerId(playerToDelete.id);
    try {
      const { deletePlayerFirestore } = await import("@/lib/data/firestore/players");
      const result = await deletePlayerFirestore(playerToDelete.id, deletePlayerRuns);
      if (result.success) {
        toast({
          title: "User Deleted",
          description: `User deleted successfully.${result.deletedRuns ? ` ${result.deletedRuns} runs were also deleted.` : ""}`,
        });
        setShowDeletePlayerDialog(false);
        setPlayerToDelete(null);
        setDeletePlayerRuns(false);
        await fetchPlayers();
      } else {
        throw new Error(result.error || "Failed to delete user.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    } finally {
      setDeletingPlayerId(null);
    }
  };

  const filteredPlayers = useMemo(() => {
    return allPlayers.filter(player => {
      if (!playersSearchQuery.trim()) return true;
      const query = playersSearchQuery.toLowerCase();
      return (
        player.displayName?.toLowerCase().includes(query) ||
        player.email?.toLowerCase().includes(query) ||
        player.uid?.toLowerCase().includes(query) ||
        player.twitchUsername?.toLowerCase().includes(query) ||
        player.srcUsername?.toLowerCase().includes(query)
      );
    });
  }, [allPlayers, playersSearchQuery]);

  const paginatedPlayers = useMemo(() => {
    return filteredPlayers.slice(
      (playersPage - 1) * itemsPerPage,
      playersPage * itemsPerPage
    );
  }, [filteredPlayers, playersPage]);

  return {
    allPlayers,
    loadingPlayers,
    playersPage,
    setPlayersPage,
    playersSearchQuery,
    setPlayersSearchQuery,
    playersSortBy,
    setPlayersSortBy,
    playersSortOrder,
    setPlayersSortOrder,
    editingPlayer,
    setEditingPlayer,
    editingPlayerForm,
    setEditingPlayerForm,
    savingPlayer,
    deletingPlayerId,
    showDeletePlayerDialog,
    setShowDeletePlayerDialog,
    playerToDelete,
    deletePlayerRuns,
    setDeletePlayerRuns,
    filteredPlayers,
    paginatedPlayers,
    itemsPerPage,
    handleEditPlayer,
    handleSavePlayer,
    handleDeletePlayerClick,
    handleDeletePlayer,
    fetchPlayers,
    currentUser,
  };
}

