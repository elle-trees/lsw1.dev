/**
 * Hook for managing levels in the admin panel
 */

import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Category, Level } from "@/types/database";

export function useLevelManagement(levelLeaderboardType: 'individual-level' | 'community-golds') {
  const { toast } = useToast();
  const [availableLevels, setAvailableLevels] = useState<Level[]>([]);
  const [firestoreCategories, setFirestoreCategories] = useState<Category[]>([]);
  const [newLevelName, setNewLevelName] = useState("");
  const [editingLevel, setEditingLevel] = useState<{ id: string; name: string } | null>(null);
  const [editingLevelName, setEditingLevelName] = useState("");
  const [addingLevel, setAddingLevel] = useState(false);
  const [updatingLevel, setUpdatingLevel] = useState(false);
  const [reorderingLevel, setReorderingLevel] = useState<string | null>(null);

  const fetchLevels = useCallback(async () => {
    try {
      const { getLevelsFirestore } = await import("@/lib/data/firestore/levels");
      const levelsData = await getLevelsFirestore();
      setAvailableLevels(levelsData);
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to load levels.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchCategories = useCallback(async () => {
    try {
      // For community-golds, use regular categories; for individual-level, use IL categories
      const categoryType = levelLeaderboardType === 'community-golds' ? 'regular' : 'individual-level';
      const { getCategoriesFirestore } = await import("@/lib/data/firestore/categories");
      const categoriesData = await getCategoriesFirestore(categoryType);
      setFirestoreCategories(categoriesData);
    } catch (_error) {
      // Silent fail
    }
  }, [levelLeaderboardType]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  const handleAddLevel = async () => {
    if (!newLevelName.trim()) {
      return;
    }
    setAddingLevel(true);
    try {
      const { addLevelFirestore } = await import("@/lib/data/firestore/levels");
      const levelId = await addLevelFirestore(newLevelName.trim());
      if (levelId) {
        toast({
          title: "Level Added",
          description: "Level has been added.",
        });
        setNewLevelName("");
        await fetchLevels();
      } else {
        throw new Error("Another level with this name already exists.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add level.",
        variant: "destructive",
      });
    } finally {
      setAddingLevel(false);
    }
  };

  const handleStartEditLevel = (level: { id: string; name: string }) => {
    setEditingLevel(level);
    setEditingLevelName(level.name);
  };

  const handleCancelEditLevel = () => {
    setEditingLevel(null);
    setEditingLevelName("");
  };

  const handleSaveEditLevel = async () => {
    if (!editingLevel || !editingLevelName.trim()) {
      return;
    }
    
    setUpdatingLevel(true);
    try {
      const { updateLevelFirestore } = await import("@/lib/data/firestore/levels");
      const success = await updateLevelFirestore(editingLevel.id, editingLevelName.trim());
      if (success) {
        toast({
          title: "Level Updated",
          description: "Level has been updated.",
        });
        setEditingLevel(null);
        setEditingLevelName("");
        await fetchLevels();
      } else {
        throw new Error("Another level with this name already exists.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update level.",
        variant: "destructive",
      });
    } finally {
      setUpdatingLevel(false);
    }
  };

  const handleDeleteLevel = async (levelId: string) => {
    if (!window.confirm("Are you sure you want to delete this level? This may affect existing runs.")) {
      return;
    }
    try {
      const { deleteLevelFirestore } = await import("@/lib/data/firestore/levels");
      const success = await deleteLevelFirestore(levelId);
      if (success) {
        toast({
          title: "Level Deleted",
          description: "Level has been removed.",
        });
        await fetchLevels();
      } else {
        throw new Error("Failed to delete level. It may not exist or you may not have permission.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete level.",
        variant: "destructive",
      });
    }
  };

  const handleMoveLevelUp = async (levelId: string) => {
    setReorderingLevel(levelId);
    try {
      const { moveLevelUpFirestore } = await import("@/lib/data/firestore/levels");
      const success = await moveLevelUpFirestore(levelId);
      if (success) {
        await fetchLevels();
      } else {
        toast({
          title: "Cannot Move",
          description: "Level is already at the top.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move level.",
        variant: "destructive",
      });
    } finally {
      setReorderingLevel(null);
    }
  };

  const handleMoveLevelDown = async (levelId: string) => {
    setReorderingLevel(levelId);
    try {
      const { moveLevelDownFirestore } = await import("@/lib/data/firestore/levels");
      const success = await moveLevelDownFirestore(levelId);
      if (success) {
        await fetchLevels();
      } else {
        toast({
          title: "Cannot Move",
          description: "Level is already at the bottom.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move level.",
        variant: "destructive",
      });
    } finally {
      setReorderingLevel(null);
    }
  };

  const handleToggleLevelCategoryDisabled = async (levelId: string, categoryId: string, disabled: boolean, levelName: string, categoryName: string) => {
    try {
      const { updateLevelCategoryDisabledFirestore } = await import("@/lib/data/firestore/levels");
      const success = await updateLevelCategoryDisabledFirestore(levelId, categoryId, disabled);
      if (success) {
        setAvailableLevels(prev => 
          prev.map(l => {
            if (l.id === levelId) {
              const disabledCategories = l.disabledCategories || {};
              if (disabled) {
                disabledCategories[categoryId] = true;
              } else {
                delete disabledCategories[categoryId];
              }
              return { ...l, disabledCategories };
            }
            return l;
          })
        );
        toast({
          title: disabled ? "Level Disabled" : "Level Enabled",
          description: `${levelName} is now ${disabled ? 'disabled' : 'enabled'} for ${categoryName}.`,
        });
      } else {
        throw new Error("Failed to update level category state");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update level category state.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    availableLevels,
    setAvailableLevels,
    firestoreCategories,
    newLevelName,
    setNewLevelName,
    editingLevel,
    editingLevelName,
    setEditingLevelName,
    addingLevel,
    updatingLevel,
    reorderingLevel,
    handleAddLevel,
    handleStartEditLevel,
    handleCancelEditLevel,
    handleSaveEditLevel,
    handleDeleteLevel,
    handleMoveLevelUp,
    handleMoveLevelDown,
    handleToggleLevelCategoryDisabled,
    fetchLevels,
  };
}

