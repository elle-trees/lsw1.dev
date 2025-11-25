/**
 * Tools Tab Component
 * Handles manual run submission and admin status management
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, AnimatedTabsList, AnimatedTabsTrigger } from "@/components/ui/animated-tabs";
import { PlusCircle, Trophy, Star, Gem, CheckCircle, UserPlus, UserMinus } from "lucide-react";
import { useToolsManagement } from "../hooks/useToolsManagement";
import { Category } from "@/types/database";

interface ToolsTabProps {
  firestorePlatforms: { id: string; name: string }[];
  firestoreCategories: Category[];
  availableLevels: { id: string; name: string }[];
  fetchUnverifiedRuns: () => Promise<void>;
}

export function ToolsTab({ 
  firestorePlatforms, 
  firestoreCategories, 
  availableLevels,
  fetchUnverifiedRuns 
}: ToolsTabProps) {
  const {
    manualRunLeaderboardType,
    setManualRunLeaderboardType,
    manualRun,
    setManualRun,
    addingManualRun,
    handleAddManualRun,
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
  } = useToolsManagement();

  // Filter categories by leaderboard type
  const filteredCategories = firestoreCategories.filter(cat => {
    const catType = cat.leaderboardType || 'regular';
    return catType === manualRunLeaderboardType;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Manual Run Input Section */}
      <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] via-[hsl(240,21%,14%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)]">
          <CardTitle className="flex items-center gap-2 text-xl text-[#f2cdcd]">
            <span>Manually Add Run</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={(e) => handleAddManualRun(e, firestorePlatforms, fetchUnverifiedRuns)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manualPlayerName">Player 1 Name *</Label>
                <Input
                  id="manualPlayerName"
                  type="text"
                  value={manualRun.playerName}
                  onChange={(e) => setManualRun({ ...manualRun, playerName: e.target.value })}
                  placeholder="Player name"
                  required
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                />
              </div>
              <div>
                <Label htmlFor="manualPlayerUsername">Player Username (Optional)</Label>
                <Input
                  id="manualPlayerUsername"
                  type="text"
                  value={manualRun.playerUsername}
                  onChange={(e) => setManualRun({ ...manualRun, playerUsername: e.target.value })}
                  placeholder="Enter username to link run to account"
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                />
                <p className="text-sm text-[hsl(222,15%,60%)] mt-1">
                  If provided, the run will be linked to this player's account. If not found, the run will still be added with the provided player name.
                </p>
              </div>
            </div>
            {manualRun.runType === 'co-op' && (
              <div>
                <Label htmlFor="manualPlayer2Name">Player 2 Name *</Label>
                <Input
                  id="manualPlayer2Name"
                  type="text"
                  value={manualRun.player2Name}
                  onChange={(e) => setManualRun({ ...manualRun, player2Name: e.target.value })}
                  placeholder="Second player name"
                  required={manualRun.runType === 'co-op'}
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manualTime">Completion Time *</Label>
                <Input
                  id="manualTime"
                  type="text"
                  value={manualRun.time}
                  onChange={(e) => setManualRun({ ...manualRun, time: e.target.value })}
                  placeholder="HH:MM:SS"
                  required
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                />
              </div>
              <div>
                <Label htmlFor="manualDate">Date *</Label>
                <Input
                  id="manualDate"
                  type="date"
                  value={manualRun.date}
                  onChange={(e) => setManualRun({ ...manualRun, date: e.target.value })}
                  required
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                />
              </div>
            </div>

            {/* Leaderboard Type Buttons */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Leaderboard Type *</Label>
              <Tabs 
                value={manualRunLeaderboardType} 
                onValueChange={(value) => {
                  setManualRunLeaderboardType(value as 'regular' | 'individual-level' | 'community-golds');
                  setManualRun(prev => ({ ...prev, category: "", level: "" }));
                }}
                className="w-full"
              >
                <AnimatedTabsList 
                  className="grid w-full grid-cols-3 p-1 gap-2 h-auto"
                  indicatorClassName="h-0.5 bg-[#f9e2af]"
                >
                  <AnimatedTabsTrigger 
                    value="regular"
                    className="h-auto py-1.5 sm:py-2 px-2 sm:px-3 transition-all duration-300 font-medium text-xs sm:text-sm whitespace-nowrap data-[state=active]:text-[#f9e2af]"
                  >
                    <Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                    <span className="hidden min-[375px]:inline">Full Game</span>
                    <span className="min-[375px]:hidden">Game</span>
                  </AnimatedTabsTrigger>
                  <AnimatedTabsTrigger 
                    value="individual-level"
                    className="h-auto py-1.5 sm:py-2 px-2 sm:px-3 transition-all duration-300 font-medium text-xs sm:text-sm whitespace-nowrap data-[state=active]:text-[#f9e2af]"
                  >
                    <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                    <span className="hidden sm:inline">Individual Levels</span>
                    <span className="sm:hidden">ILs</span>
                  </AnimatedTabsTrigger>
                  <AnimatedTabsTrigger 
                    value="community-golds"
                    className="h-auto py-1.5 sm:py-2 px-2 sm:px-3 transition-all duration-300 font-medium text-xs sm:text-sm whitespace-nowrap data-[state=active]:text-[#f9e2af]"
                  >
                    <Gem className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                    <span className="hidden sm:inline">Community Golds</span>
                    <span className="sm:hidden">Golds</span>
                  </AnimatedTabsTrigger>
                </AnimatedTabsList>
              </Tabs>
            </div>

            {/* Category Selection - Tabs */}
            {filteredCategories.length > 0 && (
              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  {manualRunLeaderboardType === 'individual-level' ? 'Category Type *' : 
                   manualRunLeaderboardType === 'community-golds' ? 'Full Game Category *' : 
                   'Category *'}
                </Label>
                <Tabs value={manualRun.category} onValueChange={(value) => setManualRun({ ...manualRun, category: value })} className="w-full">
                  <AnimatedTabsList className="flex w-full p-0.5 gap-1 overflow-x-auto overflow-y-visible scrollbar-hide relative" style={{ minWidth: 'max-content' }} indicatorClassName="h-0.5 bg-[#94e2d5]">
                    {filteredCategories.map((category, index) => (
                      <AnimatedTabsTrigger
                        key={category.id}
                        value={category.id}
                        className="py-2 px-3 text-sm transition-all duration-300 font-medium data-[state=active]:text-[#94e2d5]"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {category.name}
                      </AnimatedTabsTrigger>
                    ))}
                  </AnimatedTabsList>
                </Tabs>
              </div>
            )}

            {/* Level Selection for ILs and Community Golds */}
            {(manualRunLeaderboardType === 'individual-level' || manualRunLeaderboardType === 'community-golds') && (
              <div>
                <Label htmlFor="manualLevel">Level *</Label>
                <Select
                  value={manualRun.level}
                  onValueChange={(value) => setManualRun({ ...manualRun, level: value })}
                >
                  <SelectTrigger className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manualPlatform">Platform *</Label>
                <Select
                  value={manualRun.platform}
                  onValueChange={(value) => setManualRun({ ...manualRun, platform: value })}
                >
                  <SelectTrigger className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {firestorePlatforms.map((platform) => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="manualRunType">Run Type *</Label>
                <Select
                  value={manualRun.runType}
                  onValueChange={(value) => setManualRun({ ...manualRun, runType: value as 'solo' | 'co-op' })}
                >
                  <SelectTrigger className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
                    <SelectValue placeholder="Select run type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo</SelectItem>
                    <SelectItem value="co-op">Co-op</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="manualVideoUrl">Video URL (Optional)</Label>
              <Input
                id="manualVideoUrl"
                type="url"
                value={manualRun.videoUrl}
                onChange={(e) => setManualRun({ ...manualRun, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
              />
            </div>

            <div>
              <Label htmlFor="manualComment">Comment (Optional)</Label>
              <Textarea
                id="manualComment"
                value={manualRun.comment}
                onChange={(e) => setManualRun({ ...manualRun, comment: e.target.value })}
                placeholder="Add a comment about the run..."
                className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="manualVerified"
                checked={manualRun.verified}
                onChange={(e) => setManualRun({ ...manualRun, verified: e.target.checked })}
                className="w-4 h-4 rounded-none border-[hsl(235,13%,30%)] bg-[hsl(240,21%,15%)]"
              />
              <Label htmlFor="manualVerified" className="cursor-pointer">
                Mark as verified
              </Label>
            </div>

            {manualRun.verified && (
              <div>
                <Label htmlFor="manualVerifiedBy">Verifier (Optional)</Label>
                <Input
                  id="manualVerifiedBy"
                  type="text"
                  value={manualRun.verifiedBy}
                  onChange={(e) => setManualRun({ ...manualRun, verifiedBy: e.target.value })}
                  placeholder="Enter verifier name or UID (defaults to current admin if empty)"
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                />
                <p className="text-sm text-[hsl(222,15%,60%)] mt-1">
                  Leave empty to use your admin account as the verifier. Enter a name or UID to specify a different verifier.
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={addingManualRun}
              className="w-full bg-gradient-to-r from-[#cba6f7] via-[#f5c2e7] to-[#cba6f7] hover:from-[#f5c2e7] hover:via-[#cba6f7] hover:to-[#f5c2e7] text-[hsl(240,21%,15%)] font-bold flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#cba6f7]/50 animate-gradient bg-[length:200%_auto]"
            >
              <PlusCircle className="h-4 w-4" />
              {addingManualRun ? "Adding..." : "Add Run"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Admin Management Section */}
      <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] via-[hsl(240,21%,14%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)]">
          <CardTitle className="flex items-center gap-2 text-xl text-[#f2cdcd]">
            <span>Manage Admin Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="adminSearchType">Search By</Label>
                <Select value={adminSearchType} onValueChange={(value: "displayName" | "uid") => {
                  setAdminSearchType(value);
                  setFoundPlayer(null);
                  setAdminUserInput("");
                }}>
                  <SelectTrigger className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="displayName">Display Name</SelectItem>
                    <SelectItem value="uid">UID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="adminUserInput">{adminSearchType === "displayName" ? "Display Name" : "UID"}</Label>
                <Input
                  id="adminUserInput"
                  value={adminUserInput}
                  onChange={(e) => setAdminUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchPlayer();
                    }
                  }}
                  placeholder={adminSearchType === "displayName" ? "Enter display name" : "Enter UID"}
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                />
              </div>
              <Button
                onClick={handleSearchPlayer}
                disabled={searchingPlayer || !adminUserInput.trim()}
                className="bg-gradient-to-r from-[#cba6f7] to-[#b4a0e2] hover:from-[#b4a0e2] hover:to-[#cba6f7] text-[hsl(240,21%,15%)] font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                {searchingPlayer ? "Searching..." : "Search"}
              </Button>
            </div>

            {foundPlayer && (
              <div className="bg-gradient-to-br from-[hsl(235,19%,13%)] to-[hsl(235,19%,11%)] border border-[hsl(235,13%,30%)] rounded-none p-5 space-y-4 shadow-lg transition-all duration-300 animate-fade-in hover:border-[#cba6f7]/50 hover:shadow-xl hover:shadow-[#cba6f7]/10">
                <div>
                  <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                    <div className="p-1 rounded-none bg-gradient-to-br from-[#cba6f7] to-[#b4a0e2]">
                      <CheckCircle className="h-4 w-4 text-[hsl(240,21%,15%)]" />
                    </div>
                    <span className="bg-gradient-to-r from-[#cba6f7] to-[#f38ba8] bg-clip-text text-transparent">
                      Player Found
                    </span>
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-[hsl(222,15%,60%)]">UID:</span> <code className="text-[#cba6f7]">{foundPlayer.uid}</code></p>
                    <p><span className="text-[hsl(222,15%,60%)]">Display Name:</span> {foundPlayer.displayName || "Not set"}</p>
                    <p><span className="text-[hsl(222,15%,60%)]">Email:</span> {foundPlayer.email || "Not set"}</p>
                    <p>
                      <span className="text-[hsl(222,15%,60%)]">Admin Status:</span>{" "}
                      <Badge variant={foundPlayer.isAdmin ? "default" : "secondary"}>
                        {foundPlayer.isAdmin ? "Admin" : "Not Admin"}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSetAdminStatus(foundPlayer.uid, true)}
                    disabled={settingAdmin || foundPlayer.isAdmin}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-600 text-white flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <UserPlus className="h-4 w-4" />
                    Grant Admin
                  </Button>
                  <Button
                    onClick={() => handleSetAdminStatus(foundPlayer.uid, false)}
                    disabled={settingAdmin || !foundPlayer.isAdmin}
                    variant="destructive"
                    className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <UserMinus className="h-4 w-4" />
                    Revoke Admin
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

