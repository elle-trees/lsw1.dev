/**
 * Hook for managing SRC Tools tab state in the admin panel
 */

import { useState } from "react";
import { LeaderboardEntry } from "@/types/database";

export function useSRCToolsManagement() {
  const [importedPage, setImportedPage] = useState(1);
  const [importedRunsLeaderboardType, setImportedRunsLeaderboardType] = useState<'regular' | 'individual-level'>('regular');
  const [importedRunsCategory, setImportedRunsCategory] = useState("__all__");
  const [importedRunsPlatform, setImportedRunsPlatform] = useState("__all__");
  const [importedRunsLevel, setImportedRunsLevel] = useState("__all__");
  const [importedRunsRunType, setImportedRunsRunType] = useState<"__all__" | "solo" | "co-op">("__all__");
  const [editingImportedRun, setEditingImportedRun] = useState<LeaderboardEntry | null>(null);
  const [editingImportedRunForm, setEditingImportedRunForm] = useState<Partial<LeaderboardEntry>>({});
  const [verifyingRun, setVerifyingRun] = useState<LeaderboardEntry | null>(null);
  const [verifyingRunCategory, setVerifyingRunCategory] = useState<string>("");
  const [verifyingRunPlatform, setVerifyingRunPlatform] = useState<string>("");
  const [verifyingRunLevel, setVerifyingRunLevel] = useState<string>("");
  const itemsPerPage = 25;

  return {
    importedPage,
    setImportedPage,
    importedRunsLeaderboardType,
    setImportedRunsLeaderboardType,
    importedRunsCategory,
    setImportedRunsCategory,
    importedRunsPlatform,
    setImportedRunsPlatform,
    importedRunsLevel,
    setImportedRunsLevel,
    importedRunsRunType,
    setImportedRunsRunType,
    editingImportedRun,
    setEditingImportedRun,
    editingImportedRunForm,
    setEditingImportedRunForm,
    verifyingRun,
    setVerifyingRun,
    verifyingRunCategory,
    setVerifyingRunCategory,
    verifyingRunPlatform,
    setVerifyingRunPlatform,
    verifyingRunLevel,
    setVerifyingRunLevel,
    itemsPerPage,
  };
}

