/**
 * Hook for managing unverified runs in the admin panel
 */

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { LeaderboardEntry } from "@/types/database";

export function useRunsManagement() {
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const [unverifiedRuns, setUnverifiedRuns] = useState<LeaderboardEntry[]>([]);
  const [unverifiedPage, setUnverifiedPage] = useState(1);
  const [loadingUnverifiedRuns, setLoadingUnverifiedRuns] = useState(true);
  const [clearingUnverifiedRuns, setClearingUnverifiedRuns] = useState(false);
  const [showConfirmClearUnverifiedDialog, setShowConfirmClearUnverifiedDialog] = useState(false);
  const itemsPerPage = 25;

  const fetchUnverifiedRuns = useCallback(async () => {
    setLoadingUnverifiedRuns(true);
    try {
      const { getUnverifiedLeaderboardEntriesFirestore: getUnverifiedLeaderboardEntries } = await import("@/lib/data/firestore/runs");
      const data = await getUnverifiedLeaderboardEntries();
      // Only include manually submitted runs in unverified runs tab
      // Imported runs stay in their own tab
      setUnverifiedRuns(data.filter(run => !run.importedFromSRC));
      setUnverifiedPage(1); // Reset to first page when data changes
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load unverified runs.",
        variant: "destructive",
      });
    } finally {
      setLoadingUnverifiedRuns(false);
    }
  }, [toast]);

  const handleClearAll = useCallback(async () => {
    if (!currentUser?.isAdmin) {
      toast({
        title: "Permission Denied",
        description: "You must be an admin to clear unverified runs.",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmClearUnverifiedDialog(false);
    setClearingUnverifiedRuns(true);
    
    try {
      // Delete all unverified runs (non-imported)
      const runsToDelete = unverifiedRuns.filter(run => !run.importedFromSRC);
      
      if (runsToDelete.length === 0) {
        toast({
          title: "No Runs to Delete",
          description: "No unverified runs found to delete.",
        });
        setClearingUnverifiedRuns(false);
        return;
      }

      let deletedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const run of runsToDelete) {
        try {
          const { deleteLeaderboardEntryFirestore: deleteLeaderboardEntry } = await import("@/lib/data/firestore/runs");
          const success = await deleteLeaderboardEntry(run.id);
          if (success) {
            deletedCount++;
          } else {
            errorCount++;
            errors.push(`Failed to delete run ${run.id}`);
          }
        } catch (error: any) {
          errorCount++;
          errors.push(`Error deleting run ${run.id}: ${error.message || String(error)}`);
        }
      }

      if (deletedCount > 0) {
        toast({
          title: "Runs Cleared",
          description: `Successfully deleted ${deletedCount} unverified run(s).${errorCount > 0 ? ` ${errorCount} error(s) occurred.` : ''}`,
          variant: errorCount > 0 ? "destructive" : "default",
        });
        
        // Refresh the runs list
        await fetchUnverifiedRuns();
      } else if (errorCount > 0) {
        toast({
          title: "Clear Failed",
          description: `Failed to delete any runs. ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? ` and ${errors.length - 3} more.` : ''}`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      const isPermissionError = errorMsg.toLowerCase().includes('permission') || 
                                errorMsg.toLowerCase().includes('insufficient') ||
                                errorMsg.toLowerCase().includes('missing');
      
      toast({
        title: isPermissionError ? "Permission Error" : "Error",
        description: isPermissionError 
          ? "You don't have permission to delete unverified runs. Please ensure you are logged in as an admin."
          : (errorMsg || "Failed to clear unverified runs."),
        variant: "destructive",
      });
    } finally {
      setClearingUnverifiedRuns(false);
    }
  }, [currentUser, unverifiedRuns, fetchUnverifiedRuns, toast]);

  return {
    unverifiedRuns,
    setUnverifiedRuns,
    unverifiedPage,
    setUnverifiedPage,
    loadingUnverifiedRuns,
    clearingUnverifiedRuns,
    showConfirmClearUnverifiedDialog,
    setShowConfirmClearUnverifiedDialog,
    itemsPerPage,
    fetchUnverifiedRuns,
    handleClearAll,
  };
}

