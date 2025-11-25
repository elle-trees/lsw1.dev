/**
 * Points Configuration Tab Component
 * Handles points configuration and recalculation
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Coins, Save, RefreshCw } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { usePointsConfig } from "../hooks/usePointsConfig";

export function PointsConfigTab() {
  const {
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
  } = usePointsConfig();

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Points Configuration Card */}
      <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] via-[hsl(240,21%,14%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)]">
          <CardTitle className="flex items-center gap-2 text-xl text-[#fab387]">
            <Coins className="h-5 w-5" />
            Points Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {loadingPointsConfig ? (
            <div className="py-12">
              <LoadingSpinner size="sm" />
            </div>
          ) : pointsConfig ? (
            <div className="space-y-6">
              {/* Base Points */}
              <div className="space-y-2">
                <Label htmlFor="basePoints" className="text-base font-semibold">
                  Base Points
                </Label>
                <Input
                  id="basePoints"
                  type="number"
                  min="0"
                  value={pointsConfigForm.basePoints ?? pointsConfig.basePoints ?? 10}
                  onChange={(e) => setPointsConfigForm({ ...pointsConfigForm, basePoints: parseInt(e.target.value) || 0 })}
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                />
                <p className="text-sm text-[hsl(222,15%,60%)]">
                  Base points awarded for all verified runs.
                </p>
              </div>

              {/* Rank Bonuses */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Rank Bonuses</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rank1Bonus">Rank 1 Bonus</Label>
                    <Input
                      id="rank1Bonus"
                      type="number"
                      min="0"
                      value={pointsConfigForm.rank1Bonus ?? pointsConfig.rank1Bonus ?? 50}
                      onChange={(e) => setPointsConfigForm({ ...pointsConfigForm, rank1Bonus: parseInt(e.target.value) || 0 })}
                      className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rank2Bonus">Rank 2 Bonus</Label>
                    <Input
                      id="rank2Bonus"
                      type="number"
                      min="0"
                      value={pointsConfigForm.rank2Bonus ?? pointsConfig.rank2Bonus ?? 30}
                      onChange={(e) => setPointsConfigForm({ ...pointsConfigForm, rank2Bonus: parseInt(e.target.value) || 0 })}
                      className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rank3Bonus">Rank 3 Bonus</Label>
                    <Input
                      id="rank3Bonus"
                      type="number"
                      min="0"
                      value={pointsConfigForm.rank3Bonus ?? pointsConfig.rank3Bonus ?? 20}
                      onChange={(e) => setPointsConfigForm({ ...pointsConfigForm, rank3Bonus: parseInt(e.target.value) || 0 })}
                      className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                    />
                  </div>
                </div>
                <p className="text-sm text-[hsl(222,15%,60%)]">
                  Additional bonus points for top 3 ranks (only applies to Full Game runs unless enabled below).
                </p>
              </div>

              {/* Multipliers */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Multipliers</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coOpMultiplier">Co-op Multiplier</Label>
                    <Input
                      id="coOpMultiplier"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={pointsConfigForm.coOpMultiplier ?? pointsConfig.coOpMultiplier ?? 0.5}
                      onChange={(e) => setPointsConfigForm({ ...pointsConfigForm, coOpMultiplier: parseFloat(e.target.value) || 0 })}
                      className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                    />
                    <p className="text-xs text-[hsl(222,15%,60%)]">
                      Typically 0.5 to split points between players.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="obsoleteMultiplier">Obsolete Multiplier</Label>
                    <Input
                      id="obsoleteMultiplier"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={pointsConfigForm.obsoleteMultiplier ?? pointsConfig.obsoleteMultiplier ?? 0.5}
                      onChange={(e) => setPointsConfigForm({ ...pointsConfigForm, obsoleteMultiplier: parseFloat(e.target.value) || 0 })}
                      className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                    />
                    <p className="text-xs text-[hsl(222,15%,60%)]">
                      Multiplier for obsolete runs (typically 0.5 for half points).
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ilMultiplier">Individual Level Multiplier</Label>
                    <Input
                      id="ilMultiplier"
                      type="number"
                      step="0.1"
                      min="0"
                      value={pointsConfigForm.ilMultiplier ?? pointsConfig.ilMultiplier ?? 1.0}
                      onChange={(e) => setPointsConfigForm({ ...pointsConfigForm, ilMultiplier: parseFloat(e.target.value) || 0 })}
                      className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                    />
                    <p className="text-xs text-[hsl(222,15%,60%)]">
                      Multiplier for Individual Level runs (typically 1.0).
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="communityGoldsMultiplier">Community Golds Multiplier</Label>
                    <Input
                      id="communityGoldsMultiplier"
                      type="number"
                      step="0.1"
                      min="0"
                      value={pointsConfigForm.communityGoldsMultiplier ?? pointsConfig.communityGoldsMultiplier ?? 1.0}
                      onChange={(e) => setPointsConfigForm({ ...pointsConfigForm, communityGoldsMultiplier: parseFloat(e.target.value) || 0 })}
                      className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                    />
                    <p className="text-xs text-[hsl(222,15%,60%)]">
                      Multiplier for Community Golds runs (typically 1.0).
                    </p>
                  </div>
                </div>
              </div>

              {/* Rank Bonus Options */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Rank Bonus Options</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-[hsl(240,21%,15%)] border border-[hsl(235,13%,30%)] rounded-none">
                    <div className="space-y-0.5">
                      <Label htmlFor="applyRankBonusesToIL" className="text-base">
                        Apply Rank Bonuses to Individual Levels
                      </Label>
                      <p className="text-sm text-[hsl(222,15%,60%)]">
                        Enable rank bonuses for Individual Level runs.
                      </p>
                    </div>
                    <Switch
                      id="applyRankBonusesToIL"
                      checked={pointsConfigForm.applyRankBonusesToIL ?? pointsConfig.applyRankBonusesToIL ?? false}
                      onCheckedChange={(checked) => setPointsConfigForm({ ...pointsConfigForm, applyRankBonusesToIL: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[hsl(240,21%,15%)] border border-[hsl(235,13%,30%)] rounded-none">
                    <div className="space-y-0.5">
                      <Label htmlFor="applyRankBonusesToCommunityGolds" className="text-base">
                        Apply Rank Bonuses to Community Golds
                      </Label>
                      <p className="text-sm text-[hsl(222,15%,60%)]">
                        Enable rank bonuses for Community Golds runs.
                      </p>
                    </div>
                    <Switch
                      id="applyRankBonusesToCommunityGolds"
                      checked={pointsConfigForm.applyRankBonusesToCommunityGolds ?? pointsConfig.applyRankBonusesToCommunityGolds ?? false}
                      onCheckedChange={(checked) => setPointsConfigForm({ ...pointsConfigForm, applyRankBonusesToCommunityGolds: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-[hsl(235,13%,30%)]">
                <Button
                  onClick={handleSavePointsConfig}
                  disabled={savingPointsConfig}
                  className="bg-gradient-to-r from-[#fab387] to-[#f9e2af] hover:from-[#f9e2af] hover:to-[#fab387] text-[hsl(240,21%,15%)] font-bold"
                >
                  {savingPointsConfig ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[hsl(222,15%,60%)]">
              Failed to load points configuration.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recalculate Points Card */}
      <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] via-[hsl(240,21%,14%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)]">
          <CardTitle className="flex items-center gap-2 text-xl text-[#fab387]">
            <RefreshCw className="h-5 w-5" />
            <span>Recalculate All Points</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-ctp-subtext1 leading-relaxed mb-4">
            Recalculate and update points for all verified runs using the current points configuration. This will also recalculate all players' total points based on their verified runs. Includes all run types (Full Game, Individual Levels, Community Golds). The operation runs in the background so you can continue using the admin panel.
          </p>
          {backfillingPoints && (
            <p className="text-xs text-ctp-overlay0 mb-4 italic flex items-center gap-2">
              <span className="animate-pulse">●</span>
              Recalculation in progress... This may take a while depending on the number of runs. You can continue using the admin panel.
            </p>
          )}
          <Button
            onClick={handleRecalculateAllPoints}
            disabled={backfillingPoints}
            className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFD700] text-black font-semibold w-full sm:w-auto transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#FFD700]/50"
          >
            {backfillingPoints ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Recalculating Points...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Recalculate All Points
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recalculate Total Runs Card */}
      <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] via-[hsl(240,21%,14%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)]">
          <CardTitle className="flex items-center gap-2 text-xl text-[#fab387]">
            <RefreshCw className="h-5 w-5" />
            <span>Recalculate All Total Runs</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-ctp-subtext1 leading-relaxed mb-4">
            Recalculate and update the total verified runs count for all players. This fixes players who have incorrect totalRuns counts (e.g., showing 0 despite having verified runs). The operation runs in the background so you can continue using the admin panel.
          </p>
          {recalculatingTotalRuns && (
            <p className="text-xs text-ctp-overlay0 mb-4 italic flex items-center gap-2">
              <span className="animate-pulse">●</span>
              Recalculation in progress... This may take a while depending on the number of players. You can continue using the admin panel.
            </p>
          )}
          <Button
            onClick={handleRecalculateTotalRuns}
            disabled={recalculatingTotalRuns}
            className="bg-gradient-to-r from-[#a6e3a1] to-[#86c77a] hover:from-[#86c77a] hover:to-[#a6e3a1] text-black font-semibold w-full sm:w-auto transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#a6e3a1]/50"
          >
            {recalculatingTotalRuns ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Recalculating Total Runs...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Recalculate All Total Runs
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

