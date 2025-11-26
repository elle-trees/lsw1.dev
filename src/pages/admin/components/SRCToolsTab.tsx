/**
 * SRC Tools Tab Component
 * Handles importing runs from Speedrun.com, batch verification, and SRC category management
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, RefreshCw, CheckCircle, X, UserCheck, FolderTree, 
  Edit2, XCircle, ExternalLink, AlertTriangle 
} from "lucide-react";
import { Tabs, AnimatedTabsList, AnimatedTabsTrigger } from "@/components/ui/animated-tabs";
import { LeaderboardEntry, Category, Level, Platform } from "@/types/database";
import { formatTime } from "@/lib/utils";
import { getCategoryName, getPlatformName, getLevelName, normalizeCategoryId, normalizePlatformId, normalizeLevelId } from "@/lib/dataValidation";
import { Pagination } from "@/components/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useSRCToolsManagement } from "../hooks/useSRCToolsManagement";
import { SRCCategory } from "@/lib/speedruncom";
import { useToast } from "@/hooks/use-toast";

interface SRCToolsTabProps {
  // Data
  importedSRCRuns: LeaderboardEntry[];
  firestoreCategories: Category[];
  firestorePlatforms: Platform[];
  availableLevels: Level[];
  importedRunsCategories: { id: string; name: string }[];
  srcCategoriesWithVars: Array<SRCCategory & { variablesData?: Array<{ id: string; name: string; values: { values: Record<string, { label: string }> } }> }>;
  allCategoriesForSRCLinking: Category[];
  
  // Loading states
  importingRuns: boolean;
  loadingImportedRuns: boolean;
  clearingImportedRuns: boolean;
  batchVerifying: boolean;
  batchVerifyingAll: boolean;
  autoclaiming: boolean;
  backfillingSrcPlayerName: boolean;
  loadingSRCCategories: boolean;
  updatingCategory: boolean;
  
  // Progress
  importProgress: { total: number; imported: number; skipped: number };
  
  // Handlers
  onImportFromSRC: () => Promise<void>;
  onClearImportedRuns: () => Promise<void>;
  onBatchVerify: () => Promise<void>;
  onBatchVerifyAll: () => Promise<void>;
  onAutoclaimRuns: () => Promise<void>;
  onBackfillSrcPlayerName: () => Promise<void>;
  onFetchSRCCategoriesWithVariables: () => Promise<void>;
  onEditRun: (run: LeaderboardEntry) => void;
  onReject: (runId: string) => Promise<void>;
  onLinkCategory: (categoryId: string, srcCategoryId: string) => Promise<void>;
  onUnlinkCategory: (categoryId: string) => Promise<void>;
  onFetchCategories: (type: 'regular' | 'individual-level' | 'community-golds') => Promise<void>;
  categoryLeaderboardType: 'regular' | 'individual-level' | 'community-golds';
}

export function SRCToolsTab({
  importedSRCRuns,
  firestoreCategories,
  firestorePlatforms,
  availableLevels,
  importedRunsCategories,
  srcCategoriesWithVars,
  allCategoriesForSRCLinking,
  importingRuns,
  loadingImportedRuns,
  clearingImportedRuns,
  batchVerifying,
  batchVerifyingAll,
  autoclaiming,
  backfillingSrcPlayerName,
  loadingSRCCategories,
  updatingCategory,
  importProgress,
  onImportFromSRC,
  onClearImportedRuns,
  onBatchVerify,
  onBatchVerifyAll,
  onAutoclaimRuns,
  onBackfillSrcPlayerName,
  onFetchSRCCategoriesWithVariables,
  onEditRun,
  onReject,
  onLinkCategory,
  onUnlinkCategory,
  onFetchCategories,
  categoryLeaderboardType,
}: SRCToolsTabProps) {
  const { toast } = useToast();
  const {
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
    itemsPerPage,
  } = useSRCToolsManagement();

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Import Runs from SRC */}
      <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] via-[hsl(240,21%,14%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)]">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl text-[#f2cdcd]">
              <Upload className="h-5 w-5" />
              <span>Import Runs from Speedrun.com</span>
            </CardTitle>
            {importedSRCRuns.filter(r => !r.verified).length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearImportedRuns}
                disabled={clearingImportedRuns}
                className="bg-red-900/20 border-red-700/50 text-red-400 hover:bg-red-900/30 hover:border-red-600 transition-all duration-300"
              >
                {clearingImportedRuns ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Clear All Imported
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Import Section */}
          <div className="space-y-4 pb-6 pt-2 border-b border-[hsl(235,13%,30%)]">
            <p className="text-[hsl(222,15%,60%)]">
              Import runs from speedrun.com that aren't on the leaderboards. 
              Runs will be added as unverified and can be edited or rejected.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={onImportFromSRC}
                disabled={importingRuns}
                className="bg-gradient-to-r from-[#cba6f7] to-[#b4a0e2] hover:from-[#b4a0e2] hover:to-[#cba6f7] text-[hsl(240,21%,15%)] font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                {importingRuns ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Runs
                  </>
                )}
              </Button>
              {importedSRCRuns.filter(r => r.verified !== true).length > 0 && (
                <>
                  <Button
                    onClick={onBatchVerify}
                    disabled={batchVerifying || batchVerifyingAll || importingRuns}
                    className="bg-gradient-to-r from-[#94e2d5] to-[#74c7b0] hover:from-[#74c7b0] hover:to-[#94e2d5] text-[hsl(240,21%,15%)] font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    {batchVerifying ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Batch Verify 10 Most Recent
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={onBatchVerifyAll}
                    disabled={batchVerifying || batchVerifyingAll || importingRuns}
                    className="bg-gradient-to-r from-[#a6e3a1] to-[#86c77a] hover:from-[#86c77a] hover:to-[#a6e3a1] text-[hsl(240,21%,15%)] font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    {batchVerifyingAll ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Verifying All...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Batch Verify All in Tab
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
            {importingRuns && importProgress.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-[hsl(222,15%,60%)]">
                  <span>Progress: {importProgress.imported + importProgress.skipped} / {importProgress.total}</span>
                  <span>Imported: {importProgress.imported} | Skipped: {importProgress.skipped}</span>
                </div>
                <div className="w-full bg-[hsl(235,19%,13%)] rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#cba6f7] to-[#b4a0e2] h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((importProgress.imported + importProgress.skipped) / importProgress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Backfill srcPlayerName Section */}
          <div className="space-y-4 pb-6 pt-2 border-b border-[hsl(235,13%,30%)]">
            <p className="text-[hsl(222,15%,60%)]">
              Backfill the srcPlayerName field for older imported runs that don't have it set. 
              This uses the playerName field as a fallback and normalizes it for autoclaiming. 
              Run this before autoclaiming if you have older imports.
            </p>
            <Button
              onClick={onBackfillSrcPlayerName}
              disabled={backfillingSrcPlayerName || importingRuns}
              className="bg-gradient-to-r from-[#89b4fa] to-[#74c7ec] hover:from-[#74c7ec] hover:to-[#89b4fa] text-[hsl(240,21%,15%)] font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              {backfillingSrcPlayerName ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Backfilling...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Backfill srcPlayerName for All Runs
                </>
              )}
            </Button>
          </div>

          {/* Autoclaiming Section */}
          <div className="space-y-4 pb-6 pt-2 border-b border-[hsl(235,13%,30%)]">
            <p className="text-[hsl(222,15%,60%)]">
              Automatically claim imported runs (both verified and unverified) for players who have set their SRC username. 
              This will match runs based on the player name from speedrun.com. Make sure to run the backfill above first if you have older imports.
            </p>
            <Button
              onClick={onAutoclaimRuns}
              disabled={autoclaiming || importingRuns || backfillingSrcPlayerName}
              className="bg-gradient-to-r from-[#f9e2af] to-[#e6d19a] hover:from-[#e6d19a] hover:to-[#f9e2af] text-[hsl(240,21%,15%)] font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              {autoclaiming ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Autoclaiming...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Trigger Autoclaiming for All Players
                </>
              )}
            </Button>
          </div>

          {/* Imported Runs List */}
          {(() => {
            // Filter unverified imported runs
            let unverifiedImported = importedSRCRuns.filter(r => r.verified !== true);
            
            // Apply leaderboardType filter
            unverifiedImported = unverifiedImported.filter(run => {
              const runLeaderboardType = run.leaderboardType || 'regular';
              return runLeaderboardType === importedRunsLeaderboardType;
            });
            
            // Apply category filter (only if a category is selected)
            if (importedRunsCategory && importedRunsCategory !== '__all__') {
              unverifiedImported = unverifiedImported.filter(run => {
                const runCategory = normalizeCategoryId(run.category);
                return runCategory === importedRunsCategory;
              });
            }
            
            // Apply platform filter (only if a platform is selected)
            if (importedRunsPlatform && importedRunsPlatform !== '__all__') {
              unverifiedImported = unverifiedImported.filter(run => {
                const runPlatform = normalizePlatformId(run.platform);
                return runPlatform === importedRunsPlatform;
              });
            }
            
            // Apply level filter for ILs (only if a level is selected)
            if (importedRunsLeaderboardType === 'individual-level' && importedRunsLevel && importedRunsLevel !== '__all__') {
              unverifiedImported = unverifiedImported.filter(run => {
                const runLevel = normalizeLevelId(run.level);
                return runLevel === importedRunsLevel;
              });
            }
            
            // Apply run type filter (solo/co-op)
            if (importedRunsRunType && importedRunsRunType !== '__all__') {
              unverifiedImported = unverifiedImported.filter(run => {
                const runRunType = run.runType || 'solo';
                return runRunType === importedRunsRunType;
              });
            }
            
            // Sort by date (most recent first)
            unverifiedImported.sort((a, b) => {
              if (!a.date && !b.date) return 0;
              if (!a.date) return 1;
              if (!b.date) return -1;
              return b.date.localeCompare(a.date);
            });
            
            // Calculate counts for tabs
            const baseUnverified = importedSRCRuns.filter(r => r.verified !== true);
            const fullGameCount = baseUnverified.filter(r => (r.leaderboardType || 'regular') === 'regular').length;
            const ilCount = baseUnverified.filter(r => r.leaderboardType === 'individual-level').length;
            
            return (
              <>
                {/* Buttons for Full Game vs Individual Level */}
                <Tabs 
                  value={importedRunsLeaderboardType} 
                  onValueChange={(value) => setImportedRunsLeaderboardType(value as 'regular' | 'individual-level')}
                  className="w-full max-w-md mb-6"
                >
                  <AnimatedTabsList 
                    className="grid w-full grid-cols-2 p-0.5 gap-1 bg-[hsl(240,21%,15%)] rounded-none border border-[hsl(235,13%,30%)] h-auto"
                    indicatorColor="hsl(240,21%,20%)"
                  >
                    <AnimatedTabsTrigger 
                      value="regular"
                      className="transition-all duration-200 data-[state=active]:bg-[hsl(240,21%,20%)] data-[state=active]:text-[hsl(220,17%,92%)] data-[state=active]:hover:bg-[hsl(240,21%,25%)] data-[state=inactive]:bg-[hsl(240,21%,15%)] data-[state=inactive]:text-[hsl(222,15%,60%)] data-[state=inactive]:hover:bg-[hsl(240,21%,18%)]"
                    >
                      Full Game ({fullGameCount})
                    </AnimatedTabsTrigger>
                    <AnimatedTabsTrigger 
                      value="individual-level"
                      className="transition-all duration-200 data-[state=active]:bg-[hsl(240,21%,20%)] data-[state=active]:text-[hsl(220,17%,92%)] data-[state=active]:hover:bg-[hsl(240,21%,25%)] data-[state=inactive]:bg-[hsl(240,21%,15%)] data-[state=inactive]:text-[hsl(222,15%,60%)] data-[state=inactive]:hover:bg-[hsl(240,21%,18%)]"
                    >
                      Individual Levels ({ilCount})
                    </AnimatedTabsTrigger>
                  </AnimatedTabsList>
                </Tabs>
                
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <Label htmlFor="imported-category-filter" className="text-[hsl(222,15%,60%)] mb-2 block">Category</Label>
                    <Select
                      value={importedRunsCategory}
                      onValueChange={(value) => {
                        setImportedRunsCategory(value);
                        setImportedPage(1);
                      }}
                    >
                      <SelectTrigger id="imported-category-filter" className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All Categories</SelectItem>
                        {importedRunsCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="imported-platform-filter" className="text-[hsl(222,15%,60%)] mb-2 block">Platform</Label>
                    <Select
                      value={importedRunsPlatform}
                      onValueChange={(value) => {
                        setImportedRunsPlatform(value);
                        setImportedPage(1);
                      }}
                    >
                      <SelectTrigger id="imported-platform-filter" className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
                        <SelectValue placeholder="All Platforms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All Platforms</SelectItem>
                        {firestorePlatforms.map((platform) => (
                          <SelectItem key={platform.id} value={platform.id}>
                            {platform.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {importedRunsLeaderboardType === 'individual-level' && (
                    <div>
                      <Label htmlFor="imported-level-filter" className="text-[hsl(222,15%,60%)] mb-2 block">Level</Label>
                      <Select
                        value={importedRunsLevel}
                        onValueChange={(value) => {
                          setImportedRunsLevel(value);
                          setImportedPage(1);
                        }}
                      >
                        <SelectTrigger id="imported-level-filter" className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All Levels</SelectItem>
                          {availableLevels.map((level) => (
                            <SelectItem key={level.id} value={level.id}>
                              {level.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="imported-runtype-filter" className="text-[hsl(222,15%,60%)] mb-2 block">Run Type</Label>
                    <Select
                      value={importedRunsRunType}
                      onValueChange={(value) => {
                        setImportedRunsRunType(value as "__all__" | "solo" | "co-op");
                        setImportedPage(1);
                      }}
                    >
                      <SelectTrigger id="imported-runtype-filter" className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
                        <SelectValue placeholder="All Run Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All Run Types</SelectItem>
                        <SelectItem value="solo">Solo</SelectItem>
                        <SelectItem value="co-op">Co-op</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Imported Runs Table */}
                {loadingImportedRuns ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-[hsl(235,13%,30%)] hover:bg-transparent">
                          <TableHead className="py-3 px-4 text-left">Player(s)</TableHead>
                          <TableHead className="py-3 px-4 text-left">Category</TableHead>
                          <TableHead className="py-3 px-4 text-left">Platform</TableHead>
                          <TableHead className="py-3 px-4 text-left">Level</TableHead>
                          <TableHead className="py-3 px-4 text-left">Time</TableHead>
                          <TableHead className="py-3 px-4 text-left">Date</TableHead>
                          <TableHead className="py-3 px-4 text-left">Type</TableHead>
                          <TableHead className="py-3 px-4 text-left">SRC Link</TableHead>
                          <TableHead className="py-3 px-4 text-left">Issues</TableHead>
                          <TableHead className="py-3 px-4 text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index} className="border-b border-[hsl(235,13%,30%)]">
                            <TableCell className="py-3 px-4">
                              <div className="h-4 bg-[hsl(240,21%,18%)] rounded-none animate-pulse w-24"></div>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <div className="h-4 bg-[hsl(240,21%,18%)] rounded-none animate-pulse w-32"></div>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <div className="h-4 bg-[hsl(240,21%,18%)] rounded-none animate-pulse w-20"></div>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <div className="h-4 bg-[hsl(240,21%,18%)] rounded-none animate-pulse w-28"></div>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <div className="h-4 bg-[hsl(240,21%,18%)] rounded-none animate-pulse w-16"></div>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <div className="h-4 bg-[hsl(240,21%,18%)] rounded-none animate-pulse w-20"></div>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <div className="h-4 bg-[hsl(240,21%,18%)] rounded-none animate-pulse w-12"></div>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <div className="h-4 bg-[hsl(240,21%,18%)] rounded-none animate-pulse w-20"></div>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <div className="h-4 bg-[hsl(240,21%,18%)] rounded-none animate-pulse w-16"></div>
                            </TableCell>
                            <TableCell className="py-3 px-4 text-center">
                              <div className="h-8 bg-[hsl(240,21%,18%)] rounded-none animate-pulse w-20 mx-auto"></div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : unverifiedImported.length === 0 ? (
                  <p className="text-[hsl(222,15%,60%)] text-center py-8">No unverified imported runs found for the selected filters.</p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-[hsl(235,13%,30%)] hover:bg-transparent">
                            <TableHead className="py-3 px-4 text-left">Player(s)</TableHead>
                            <TableHead className="py-3 px-4 text-left">Category</TableHead>
                            <TableHead className="py-3 px-4 text-left">Platform</TableHead>
                            <TableHead className="py-3 px-4 text-left">Level</TableHead>
                            <TableHead className="py-3 px-4 text-left">Time</TableHead>
                            <TableHead className="py-3 px-4 text-left">Date</TableHead>
                            <TableHead className="py-3 px-4 text-left">Type</TableHead>
                            <TableHead className="py-3 px-4 text-left">SRC Link</TableHead>
                            <TableHead className="py-3 px-4 text-left">Issues</TableHead>
                            <TableHead className="py-3 px-4 text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {unverifiedImported.slice((importedPage - 1) * itemsPerPage, importedPage * itemsPerPage).map((run) => {
                            const categoryExists = firestoreCategories.some(c => c.id === run.category);
                            const platformExists = firestorePlatforms.some(p => p.id === run.platform);
                            const levelExists = run.level ? availableLevels.some(l => l.id === run.level) : true;
                            const isImportedWithSRCFallback = run.importedFromSRC && (run.srcCategoryName || run.srcPlatformName || run.srcLevelName);
                            const issues: string[] = [];
                            
                            // Check for issues
                            if (!run.category || (!categoryExists && run.category && run.category.trim() !== "")) {
                              if (!isImportedWithSRCFallback || !run.srcCategoryName) {
                                issues.push("Invalid/Missing Category");
                              }
                            }
                            if (!run.platform || (!platformExists && run.platform && run.platform.trim() !== "")) {
                              if (!isImportedWithSRCFallback || !run.srcPlatformName) {
                                issues.push("Invalid/Missing Platform");
                              }
                            }
                            if ((run.leaderboardType === 'individual-level' || run.leaderboardType === 'community-golds') && (!run.level || !levelExists)) {
                              if (!isImportedWithSRCFallback || !run.srcLevelName) {
                                issues.push("Invalid/Missing Level");
                              }
                            }
                            
                            // Check subcategory validity (only for regular leaderboard type)
                            if (run.leaderboardType === 'regular' && run.category && categoryExists) {
                              const selectedCategory = firestoreCategories.find(c => c.id === run.category);
                              if (selectedCategory) {
                                const subcategories = selectedCategory.subcategories || [];
                                if (run.subcategory && run.subcategory.trim() !== '') {
                                  const subcategoryExists = subcategories.some(s => s.id === run.subcategory);
                                  if (!subcategoryExists) {
                                    issues.push("Invalid Subcategory");
                                  }
                                } else if (run.srcSubcategory && run.srcSubcategory.trim() !== '') {
                                  const matchingSubcategory = subcategories.find(s => 
                                    s.name.toLowerCase().trim() === run.srcSubcategory.toLowerCase().trim()
                                  );
                                  if (!matchingSubcategory && subcategories.length > 0) {
                                    issues.push("Subcategory Mismatch");
                                  }
                                }
                              }
                            }
                            
                            return (
                              <TableRow key={run.id} className="border-b border-[hsl(235,13%,30%)] hover:bg-[hsl(235,19%,13%)] transition-all duration-200 hover:shadow-md">
                                <TableCell className="py-3 px-4 font-medium">
                                  <span style={{ color: run.nameColor || 'inherit' }}>{run.playerName}</span>
                                  {run.player2Name && (
                                    <>
                                      <span className="text-muted-foreground"> & </span>
                                      <span style={{ color: run.player2Color || 'inherit' }}>{run.player2Name}</span>
                                    </>
                                  )}
                                </TableCell>
                                <TableCell className="py-3 px-4">
                                  {getCategoryName(run.category, firestoreCategories, run.srcCategoryName)}
                                </TableCell>
                                <TableCell className="py-3 px-4">
                                  {getPlatformName(run.platform, firestorePlatforms, run.srcPlatformName)}
                                </TableCell>
                                <TableCell className="py-3 px-4">
                                  {run.level ? getLevelName(run.level, availableLevels, run.srcLevelName) : "—"}
                                </TableCell>
                                <TableCell className="py-3 px-4 font-mono">{formatTime(run.time || '00:00:00')}</TableCell>
                                <TableCell className="py-3 px-4">{run.date}</TableCell>
                                <TableCell className="py-3 px-4">{run.runType.charAt(0).toUpperCase() + run.runType.slice(1)}</TableCell>
                                <TableCell className="py-3 px-4">
                                  {run.srcRunId ? (
                                    <a 
                                      href={`https://www.speedrun.com/run/${run.srcRunId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#cba6f7] hover:underline flex items-center gap-1"
                                    >
                                      View on SRC <ExternalLink className="h-4 w-4" />
                                    </a>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-3 px-4">
                                  {issues.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {issues.map((issue, idx) => (
                                        <Badge 
                                          key={idx} 
                                          variant="destructive" 
                                          className="text-xs bg-yellow-600/20 text-yellow-400 border-yellow-600/50 hover:bg-yellow-600/30"
                                        >
                                          <AlertTriangle className="h-3 w-3 mr-1" />
                                          {issue}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-3 px-4 text-center space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => onEditRun(run)}
                                    className="text-blue-500 hover:bg-blue-900/20 transition-all duration-300 hover:scale-110 hover:shadow-md"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => onReject(run.id)}
                                    className="text-red-500 hover:bg-red-900/20 transition-all duration-300 hover:scale-110 hover:shadow-md"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    {unverifiedImported.length > itemsPerPage && (
                      <Pagination
                        currentPage={importedPage}
                        totalPages={Math.ceil(unverifiedImported.length / itemsPerPage)}
                        onPageChange={setImportedPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={unverifiedImported.length}
                      />
                    )}
                  </>
                )}
              </>
            );
          })()}
        </CardContent>
      </Card>

      {/* SRC Categories Reference Card */}
      <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] via-[hsl(240,21%,14%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)]">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl text-[#f2cdcd]">
              <FolderTree className="h-5 w-5" />
              <span>SRC Categories Reference</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onFetchSRCCategoriesWithVariables}
              disabled={loadingSRCCategories}
              className="border-[hsl(235,13%,30%)] hover:bg-[hsl(235,19%,13%)]"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingSRCCategories ? 'animate-spin' : ''}`} />
              {loadingSRCCategories ? 'Loading...' : 'Load Categories'}
            </Button>
          </div>
          <p className="text-sm text-[hsl(222,15%,60%)] mt-2">
            View all Speedrun.com categories with their IDs and variables for reference.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {loadingSRCCategories ? (
            <div className="py-8 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-none" />
              ))}
            </div>
          ) : srcCategoriesWithVars.length === 0 ? (
            <p className="text-[hsl(222,15%,60%)] text-center py-8">
              Click "Load Categories" to fetch SRC categories and their variables.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[hsl(235,13%,30%)] hover:bg-transparent">
                    <TableHead className="py-3 px-4 text-left">Category Name</TableHead>
                    <TableHead className="py-3 px-4 text-left">Category ID</TableHead>
                    <TableHead className="py-3 px-4 text-left">Type</TableHead>
                    <TableHead className="py-3 px-4 text-left">Variables</TableHead>
                    <TableHead className="py-3 px-4 text-left">Link to Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {srcCategoriesWithVars.map((category) => {
                    const linkedCategory = allCategoriesForSRCLinking.find(c => c.srcCategoryId === category.id);
                    const expectedLeaderboardType = category.type === 'per-game' ? 'regular' : 'individual-level';
                    const matchingCategories = allCategoriesForSRCLinking.filter(c => {
                      const catType = c.leaderboardType || 'regular';
                      return catType === expectedLeaderboardType;
                    });
                    
                    return (
                      <TableRow key={category.id} className="border-b border-[hsl(235,13%,30%)] hover:bg-[hsl(235,19%,13%)] transition-all duration-200">
                        <TableCell className="py-3 px-4 font-medium">{category.name}</TableCell>
                        <TableCell className="py-3 px-4">
                          <code className="text-[#cba6f7] text-sm">{category.id}</code>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">
                            {category.type === 'per-game' ? 'Full Game' : 'Per Level'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          {category.variablesData && category.variablesData.length > 0 ? (
                            <div className="space-y-2">
                              {category.variablesData.map((variable) => (
                                <div key={variable.id} className="bg-[hsl(240,21%,15%)] rounded-none p-2 border border-[hsl(235,13%,30%)]">
                                  <div className="font-medium text-sm mb-1">{variable.name}</div>
                                  <div className="text-xs text-[hsl(222,15%,60%)] mb-1">
                                    Variable ID: <code className="text-[#cba6f7]">{variable.id}</code>
                                  </div>
                                  {variable.values?.values && Object.keys(variable.values.values).length > 0 && (
                                    <div className="mt-2">
                                      <div className="text-xs font-medium text-[hsl(222,15%,60%)] mb-1">Values:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {Object.entries(variable.values.values).map(([valueId, valueData]) => (
                                          <Badge key={valueId} variant="secondary" className="text-xs">
                                            <span className="font-medium">{valueData.label}</span>
                                            <span className="ml-1 text-[hsl(222,15%,60%)]">({valueId})</span>
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No variables</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          {linkedCategory ? (
                            <div className="flex flex-col gap-2">
                              <Badge variant="default" className="bg-green-600/20 text-green-400 border-green-600/50 text-xs w-fit">
                                Linked to: {linkedCategory.name}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  if (!window.confirm(`Unlink "${linkedCategory.name}" from this SRC category?`)) return;
                                  await onUnlinkCategory(linkedCategory.id);
                                }}
                                disabled={updatingCategory}
                                className="text-red-500 hover:bg-red-900/20 text-xs h-6"
                              >
                                Unlink
                              </Button>
                            </div>
                          ) : (
                            <Select
                              value=""
                              onValueChange={async (categoryId) => {
                                if (!categoryId) return;
                                await onLinkCategory(categoryId, category.id);
                              }}
                              disabled={updatingCategory || matchingCategories.length === 0}
                            >
                              <SelectTrigger className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-8 text-xs">
                                <SelectValue placeholder="Link to category..." />
                              </SelectTrigger>
                              <SelectContent>
                                {matchingCategories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

