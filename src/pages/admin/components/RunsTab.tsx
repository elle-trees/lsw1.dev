/**
 * Runs Tab Component
 * Handles display and management of unverified runs
 */

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Trash2, ExternalLink } from "lucide-react";
import { LeaderboardEntry, Category, Platform } from "@/types/database";
import { formatTime } from "@/lib/utils";
import { getCategoryName, getPlatformName } from "@/lib/dataValidation";
import { Pagination } from "@/components/Pagination";
import { useRunsManagement } from "../hooks/useRunsManagement";
import { FadeIn } from "@/components/ui/fade-in";
import { TableSkeleton } from "@/components/admin/TableSkeleton";

interface RunsTabProps {
  firestoreCategories: Category[];
  firestorePlatforms: Platform[];
  onVerify: (runId: string) => Promise<void>;
  onReject: (runId: string) => Promise<void>;
}

export function RunsTab({
  firestoreCategories,
  firestorePlatforms,
  onVerify,
  onReject,
}: RunsTabProps) {
  const {
    unverifiedRuns,
    unverifiedPage,
    setUnverifiedPage,
    loadingUnverifiedRuns,
    clearingUnverifiedRuns,
    showConfirmClearUnverifiedDialog,
    setShowConfirmClearUnverifiedDialog,
    itemsPerPage,
    fetchUnverifiedRuns,
    handleClearAll,
  } = useRunsManagement();

  // Fetch runs on mount
  useEffect(() => {
    fetchUnverifiedRuns();
  }, [fetchUnverifiedRuns]);

  return (
    <FadeIn className="space-y-4">
      <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] via-[hsl(240,21%,14%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)]">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl text-[#f2cdcd]">
              <span>Unverified Runs</span>
              {!loadingUnverifiedRuns && unverifiedRuns.length > 0 && (
                <Badge variant="secondary" className="ml-2 animate-fade-in">
                  {unverifiedRuns.length}
                </Badge>
              )}
            </CardTitle>
            {!loadingUnverifiedRuns && unverifiedRuns.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmClearUnverifiedDialog(true)}
                disabled={clearingUnverifiedRuns}
                className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {clearingUnverifiedRuns ? "Clearing..." : "Clear All"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingUnverifiedRuns ? (
            <FadeIn>
              <TableSkeleton rows={5} columns={7} />
            </FadeIn>
          ) : unverifiedRuns.length === 0 ? (
            <p className="text-[hsl(222,15%,60%)] text-center py-8 animate-fade-in">No runs awaiting verification.</p>
          ) : (
            <FadeIn>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[hsl(235,13%,30%)] hover:bg-transparent">
                      <TableHead className="py-3 px-4 text-left">Player(s)</TableHead>
                      <TableHead className="py-3 px-4 text-left">Category</TableHead>
                      <TableHead className="py-3 px-4 text-left">Time</TableHead>
                      <TableHead className="py-3 px-4 text-left">Platform</TableHead>
                      <TableHead className="py-3 px-4 text-left">Type</TableHead>
                      <TableHead className="py-3 px-4 text-left">Video</TableHead>
                      <TableHead className="py-3 px-4 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unverifiedRuns.slice((unverifiedPage - 1) * itemsPerPage, unverifiedPage * itemsPerPage).map((run, index) => (
                      <TableRow 
                        key={run.id} 
                        className="border-b border-[hsl(235,13%,30%)] hover:bg-[hsl(235,19%,13%)] transition-all duration-200 hover:shadow-md"
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
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
                          {getCategoryName(run.category, firestoreCategories)}
                        </TableCell>
                        <TableCell className="py-3 px-4 font-mono">{formatTime(run.time || '00:00:00')}</TableCell>
                        <TableCell className="py-3 px-4">
                          {getPlatformName(run.platform, firestorePlatforms)}
                        </TableCell>
                        <TableCell className="py-3 px-4">{run.runType.charAt(0).toUpperCase() + run.runType.slice(1)}</TableCell>
                        <TableCell className="py-3 px-4">
                          {run.videoUrl && (
                            <a href={run.videoUrl} target="_blank" rel="noopener noreferrer" className="text-[#cba6f7] hover:underline flex items-center gap-1">
                              Watch <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onVerify(run.id)}
                            className="text-green-500 hover:bg-green-900/20 transition-all duration-300 hover:scale-110 hover:shadow-md"
                          >
                            <CheckCircle className="h-4 w-4" />
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
                    ))}
                  </TableBody>
                </Table>
              </div>
              {unverifiedRuns.length > itemsPerPage && (
                <FadeIn delay={0.2}>
                  <Pagination
                    currentPage={unverifiedPage}
                    totalPages={Math.ceil(unverifiedRuns.length / itemsPerPage)}
                    onPageChange={setUnverifiedPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={unverifiedRuns.length}
                  />
                </FadeIn>
              )}
            </FadeIn>
          )}
        </CardContent>
      </Card>

      {/* Clear All Confirmation Dialog */}
      {showConfirmClearUnverifiedDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <FadeIn className="bg-[hsl(240,21%,15%)] border border-[hsl(235,13%,30%)] rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-[#f2cdcd] mb-2">Clear All Unverified Runs?</h3>
            <p className="text-sm text-[hsl(222,15%,60%)] mb-4">
              This will permanently delete all {unverifiedRuns.length} unverified run(s). This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowConfirmClearUnverifiedDialog(false)}
                disabled={clearingUnverifiedRuns}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearAll}
                disabled={clearingUnverifiedRuns}
              >
                {clearingUnverifiedRuns ? "Clearing..." : "Clear All"}
              </Button>
            </div>
          </FadeIn>
        </div>
      )}
    </FadeIn>
  );
}

