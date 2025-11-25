/**
 * Hook for managing points configuration in the admin panel
 */

import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { PointsConfig } from "@/types/database";

export function usePointsConfig() {
  const { toast } = useToast();
  const [pointsConfig, setPointsConfig] = useState<PointsConfig | null>(null);
  const [loadingPointsConfig, setLoadingPointsConfig] = useState(false);
  const [savingPointsConfig, setSavingPointsConfig] = useState(false);
  const [pointsConfigForm, setPointsConfigForm] = useState<Partial<PointsConfig>>({});
  const [backfillingPoints, setBackfillingPoints] = useState(false);
  const [recalculatingTotalRuns, setRecalculatingTotalRuns] = useState(false);

  const fetchPointsConfig = useCallback(async () => {
    setLoadingPointsConfig(true);
    try {
      const { getPointsConfigFirestore } = await import("@/lib/data/firestore/points");
      const config = await getPointsConfigFirestore();
      setPointsConfig(config);
      setPointsConfigForm(config);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load points configuration.",
        variant: "destructive",
      });
    } finally {
      setLoadingPointsConfig(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPointsConfig();
  }, [fetchPointsConfig]);

  const handleSavePointsConfig = async () => {
    if (!pointsConfig) return;
    
    setSavingPointsConfig(true);
    try {
      const { updatePointsConfigFirestore } = await import("@/lib/data/firestore/points");
      const success = await updatePointsConfigFirestore(pointsConfigForm as PointsConfig);
      if (success) {
        // Reload config to get updated values
        const { getPointsConfigFirestore } = await import("@/lib/data/firestore/points");
        const updatedConfig = await getPointsConfigFirestore();
        setPointsConfig(updatedConfig);
        setPointsConfigForm(updatedConfig);
        
        // Clear cache so new config is used immediately
        const { clearPointsConfigCache } = await import("@/lib/points-config");
        clearPointsConfigCache();
        
        toast({
          title: "Success",
          description: "Points configuration saved successfully.",
        });
      } else {
        throw new Error("Failed to save configuration");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save points configuration.",
        variant: "destructive",
      });
    } finally {
      setSavingPointsConfig(false);
    }
  };

  const handleRecalculateAllPoints = async () => {
    if (!window.confirm(
      "This will recalculate points for ALL verified runs and update all player totals using the current points configuration. " +
      "This operation cannot be undone and may take several minutes. Continue?"
    )) {
      return;
    }
    
    setBackfillingPoints(true);
    
    // Run in background - don't block UI
    setTimeout(async () => {
      try {
        const { backfillPointsForAllRunsFirestore } = await import("@/lib/data/firestore/points");
        const result = await backfillPointsForAllRunsFirestore();
        if (result.errors.length > 0) {
          toast({
            title: "Recalculation Complete with Errors",
            description: `Updated ${result.runsUpdated} runs and ${result.playersUpdated} players. ${result.errors.length} error(s) occurred.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Recalculation Complete",
            description: `Successfully recalculated points for ${result.runsUpdated} runs and updated ${result.playersUpdated} players.`,
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to recalculate points.",
          variant: "destructive",
        });
      } finally {
        setBackfillingPoints(false);
      }
    }, 0);
  };

  const handleRecalculateTotalRuns = async () => {
    if (!window.confirm(
      "This will recalculate the total verified runs count for ALL players. " +
      "This operation cannot be undone and may take several minutes. Continue?"
    )) {
      return;
    }

    setRecalculatingTotalRuns(true);
    try {
      const { recalculateAllPlayerTotalRunsFirestore } = await import("@/lib/data/firestore/players-realtime");
      const result = await recalculateAllPlayerTotalRunsFirestore();
      if (result.errors.length > 0) {
        toast({
          title: "Recalculation Complete with Errors",
          description: `Updated ${result.playersUpdated} player(s). Some errors occurred.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Recalculation Complete",
          description: `Successfully updated ${result.playersUpdated} player(s).`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to recalculate total runs.",
        variant: "destructive",
      });
    } finally {
      setRecalculatingTotalRuns(false);
    }
  };

  return {
    pointsConfig,
    loadingPointsConfig,
    savingPointsConfig,
    pointsConfigForm,
    setPointsConfigForm,
    backfillingPoints,
    recalculatingTotalRuns,
    handleSavePointsConfig,
    handleRecalculateAllPoints,
    handleRecalculateTotalRuns,
    fetchPointsConfig,
  };
}

