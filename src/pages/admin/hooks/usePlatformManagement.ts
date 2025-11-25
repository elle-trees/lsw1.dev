/**
 * Hook for managing platforms in the admin panel
 */

import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getPlatformTranslation } from "@/lib/i18n/entity-translations";

export function usePlatformManagement() {
  const { toast } = useToast();
  const [firestorePlatforms, setFirestorePlatforms] = useState<{ id: string; name: string }[]>([]);
  const [newPlatformName, setNewPlatformName] = useState("");
  const [editingPlatform, setEditingPlatform] = useState<{ id: string; name: string } | null>(null);
  const [editingPlatformName, setEditingPlatformName] = useState("");
  const [addingPlatform, setAddingPlatform] = useState(false);
  const [updatingPlatform, setUpdatingPlatform] = useState(false);
  const [reorderingPlatform, setReorderingPlatform] = useState<string | null>(null);

  const fetchPlatforms = useCallback(async () => {
    try {
      const { getPlatformsFirestore } = await import("@/lib/data/firestore/platforms");
      const platformsData = await getPlatformsFirestore();
      setFirestorePlatforms(platformsData);
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to load platforms.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  const handleAddPlatform = async () => {
    if (!newPlatformName.trim()) {
      return;
    }
    setAddingPlatform(true);
    try {
      const { addPlatformFirestore } = await import("@/lib/data/firestore/platforms");
      const platformId = await addPlatformFirestore(newPlatformName.trim());
      if (platformId) {
        toast({
          title: "Platform Added",
          description: "Platform has been added.",
        });
        setNewPlatformName("");
        await fetchPlatforms();
      } else {
        throw new Error("Another platform with this name already exists.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add platform.",
        variant: "destructive",
      });
    } finally {
      setAddingPlatform(false);
    }
  };

  const handleStartEditPlatform = (platform: { id: string; name: string }) => {
    setEditingPlatform(platform);
    setEditingPlatformName(platform.name);
  };

  const handleCancelEditPlatform = () => {
    setEditingPlatform(null);
    setEditingPlatformName("");
  };

  const handleSaveEditPlatform = async () => {
    if (!editingPlatform || !editingPlatformName.trim()) {
      return;
    }
    
    setUpdatingPlatform(true);
    try {
      const { updatePlatformFirestore } = await import("@/lib/data/firestore/platforms");
      const success = await updatePlatformFirestore(editingPlatform.id, editingPlatformName.trim());
      if (success) {
        toast({
          title: "Platform Updated",
          description: "Platform has been updated.",
        });
        setEditingPlatform(null);
        setEditingPlatformName("");
        await fetchPlatforms();
      } else {
        throw new Error("Another platform with this name already exists.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update platform.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPlatform(false);
    }
  };

  const handleDeletePlatform = async (platformId: string) => {
    if (!window.confirm("Are you sure you want to delete this platform? This may affect existing runs.")) {
      return;
    }
    try {
      const { deletePlatformFirestore } = await import("@/lib/data/firestore/platforms");
      const success = await deletePlatformFirestore(platformId);
      if (success) {
        toast({
          title: "Platform Deleted",
          description: "Platform has been removed.",
        });
        await fetchPlatforms();
      } else {
        throw new Error("Failed to delete platform. It may not exist or you may not have permission.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete platform.",
        variant: "destructive",
      });
    }
  };

  const handleMovePlatformUp = async (platformId: string) => {
    setReorderingPlatform(platformId);
    try {
      const { movePlatformUpFirestore } = await import("@/lib/data/firestore/platforms");
      const success = await movePlatformUpFirestore(platformId);
      if (success) {
        await fetchPlatforms();
      } else {
        toast({
          title: "Cannot Move",
          description: "Platform is already at the top.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move platform.",
        variant: "destructive",
      });
    } finally {
      setReorderingPlatform(null);
    }
  };

  const handleMovePlatformDown = async (platformId: string) => {
    setReorderingPlatform(platformId);
    try {
      const { movePlatformDownFirestore } = await import("@/lib/data/firestore/platforms");
      const success = await movePlatformDownFirestore(platformId);
      if (success) {
        await fetchPlatforms();
      } else {
        toast({
          title: "Cannot Move",
          description: "Platform is already at the bottom.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move platform.",
        variant: "destructive",
      });
    } finally {
      setReorderingPlatform(null);
    }
  };

  return {
    firestorePlatforms,
    newPlatformName,
    setNewPlatformName,
    editingPlatform,
    editingPlatformName,
    setEditingPlatformName,
    addingPlatform,
    updatingPlatform,
    reorderingPlatform,
    handleAddPlatform,
    handleStartEditPlatform,
    handleCancelEditPlatform,
    handleSaveEditPlatform,
    handleDeletePlatform,
    handleMovePlatformUp,
    handleMovePlatformDown,
    fetchPlatforms,
  };
}

