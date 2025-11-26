/**
 * Users Management Tab Component
 * Handles user listing, search, edit, and deletion
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Edit2, Trash2, RefreshCw, ArrowUp, ArrowDown, Save } from "lucide-react";
import { useUsersManagement } from "../hooks/useUsersManagement";
import { Pagination } from "@/components/Pagination";
import { FadeIn } from "@/components/ui/fade-in";
import { TableSkeleton } from "@/components/admin/TableSkeleton";

export function UsersTab() {
  const {
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
  } = useUsersManagement();

  return (
    <FadeIn className="space-y-4">
      <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] via-[hsl(240,21%,14%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)]">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl text-[#f2cdcd]">
              <Users className="h-5 w-5" />
              <span>User Management</span>
            </CardTitle>
            <Button
              onClick={fetchPlayers}
              disabled={loadingPlayers}
              variant="outline"
              size="sm"
              className="border-[hsl(235,13%,30%)] bg-gradient-to-r from-transparent via-[hsl(237,16%,24%)]/50 to-transparent hover:from-[hsl(237,16%,24%)] hover:via-[hsl(237,16%,28%)] hover:to-[hsl(237,16%,24%)] hover:border-[#cba6f7]/50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {loadingPlayers ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ctp-overlay0" />
                <Input
                  placeholder="Search by name, email, UID, Twitch, or SRC username..."
                  value={playersSearchQuery}
                  onChange={(e) => {
                    setPlayersSearchQuery(e.target.value);
                    setPlayersPage(1);
                  }}
                  className="pl-10 bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] text-ctp-text"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={playersSortBy}
                  onValueChange={(value: 'joinDate' | 'displayName' | 'totalPoints' | 'totalRuns') => {
                    setPlayersSortBy(value);
                    setPlayersPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px] bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] text-ctp-text">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="joinDate">Join Date</SelectItem>
                    <SelectItem value="displayName">Display Name</SelectItem>
                    <SelectItem value="totalPoints">Total Points</SelectItem>
                    <SelectItem value="totalRuns">Total Runs</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPlayersSortOrder(playersSortOrder === 'asc' ? 'desc' : 'asc');
                    setPlayersPage(1);
                  }}
                  className="border-[hsl(235,13%,30%)] bg-[hsl(240,21%,15%)] text-ctp-text"
                >
                  {playersSortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Players Table */}
          {loadingPlayers ? (
            <FadeIn>
              <TableSkeleton rows={5} columns={6} />
            </FadeIn>
          ) : filteredPlayers.length === 0 ? (
            <p className="text-sm text-ctp-subtext1 text-center py-8 animate-fade-in">
              {playersSearchQuery ? "No users found matching your search." : "No users found."}
            </p>
          ) : (
            <FadeIn>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[hsl(235,13%,30%)]">
                      <TableHead className="text-ctp-text">Display Name</TableHead>
                      <TableHead className="text-ctp-text">Email</TableHead>
                      <TableHead className="text-ctp-text">Join Date</TableHead>
                      <TableHead className="text-ctp-text">Stats</TableHead>
                      <TableHead className="text-ctp-text">Admin</TableHead>
                      <TableHead className="text-ctp-text">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPlayers.map((player) => (
                      <TableRow key={player.id} className="border-[hsl(235,13%,30%)]">
                        <TableCell className="text-ctp-text">
                          <div className="flex items-center gap-2">
                            <span style={{ color: player.nameColor || '#cba6f7' }}>
                              {player.displayName || "Unknown"}
                            </span>
                            {player.isAdmin && (
                              <Badge variant="outline" className="border-yellow-600/50 bg-yellow-600/10 text-yellow-400 text-xs">
                                Admin
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-ctp-text">{player.email || "—"}</TableCell>
                        <TableCell className="text-ctp-text">{player.joinDate || "—"}</TableCell>
                        <TableCell className="text-ctp-text">
                          <div className="flex flex-col gap-1 text-xs">
                            <span>Points: {player.totalPoints || 0}</span>
                            <span>Runs: {player.totalRuns || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-ctp-text">
                          {player.isAdmin ? (
                            <Badge variant="outline" className="border-green-600/50 bg-green-600/10 text-green-400">
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-[hsl(235,13%,30%)]">
                              No
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleEditPlayer(player)}
                              variant="outline"
                              size="sm"
                              className="border-[hsl(235,13%,30%)] bg-[hsl(240,21%,15%)] text-ctp-text hover:bg-[hsl(240,21%,18%)]"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeletePlayerClick(player)}
                              variant="destructive"
                              size="sm"
                              className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-600/50"
                              disabled={player.uid === currentUser?.uid}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredPlayers.length > itemsPerPage && (
                <FadeIn delay={0.2}>
                  <div className="mt-4">
                    <Pagination
                      currentPage={playersPage}
                      totalPages={Math.ceil(filteredPlayers.length / itemsPerPage)}
                      onPageChange={setPlayersPage}
                      itemsPerPage={itemsPerPage}
                      totalItems={filteredPlayers.length}
                    />
                  </div>
                </FadeIn>
              )}
            </FadeIn>
          )}
        </CardContent>
      </Card>

      {/* Edit Player Dialog */}
      {editingPlayer && (
        <Dialog open={!!editingPlayer} onOpenChange={(open) => !open && setEditingPlayer(null)}>
          <DialogContent className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] text-ctp-text max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-scale">
            <DialogHeader>
              <DialogTitle className="text-[#f2cdcd]">Edit User: {editingPlayer.displayName || "Unknown"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-displayName">Display Name</Label>
                <Input
                  id="edit-displayName"
                  value={editingPlayerForm.displayName || ""}
                  onChange={(e) => setEditingPlayerForm({ ...editingPlayerForm, displayName: e.target.value })}
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] text-ctp-text"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingPlayerForm.email || ""}
                  onChange={(e) => setEditingPlayerForm({ ...editingPlayerForm, email: e.target.value })}
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] text-ctp-text"
                />
              </div>
              <div>
                <Label htmlFor="edit-nameColor">Name Color</Label>
                <Input
                  id="edit-nameColor"
                  type="color"
                  value={editingPlayerForm.nameColor || "#cba6f7"}
                  onChange={(e) => setEditingPlayerForm({ ...editingPlayerForm, nameColor: e.target.value })}
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] text-ctp-text h-10"
                />
              </div>
              <div>
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea
                  id="edit-bio"
                  value={editingPlayerForm.bio || ""}
                  onChange={(e) => setEditingPlayerForm({ ...editingPlayerForm, bio: e.target.value })}
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] text-ctp-text"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-pronouns">Pronouns</Label>
                <Input
                  id="edit-pronouns"
                  value={editingPlayerForm.pronouns || ""}
                  onChange={(e) => setEditingPlayerForm({ ...editingPlayerForm, pronouns: e.target.value })}
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] text-ctp-text"
                />
              </div>
              <div>
                <Label htmlFor="edit-twitchUsername">Twitch Username</Label>
                <Input
                  id="edit-twitchUsername"
                  value={editingPlayerForm.twitchUsername || ""}
                  onChange={(e) => setEditingPlayerForm({ ...editingPlayerForm, twitchUsername: e.target.value })}
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] text-ctp-text"
                />
              </div>
              <div>
                <Label htmlFor="edit-srcUsername">Speedrun.com Username</Label>
                <Input
                  id="edit-srcUsername"
                  value={editingPlayerForm.srcUsername || ""}
                  onChange={(e) => setEditingPlayerForm({ ...editingPlayerForm, srcUsername: e.target.value })}
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] text-ctp-text"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-isAdmin"
                  checked={editingPlayerForm.isAdmin || false}
                  onChange={(e) => setEditingPlayerForm({ ...editingPlayerForm, isAdmin: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="edit-isAdmin">Admin Status</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingPlayer(null);
                  setEditingPlayerForm({});
                }}
                className="border-[hsl(235,13%,30%)] bg-[hsl(240,21%,15%)] text-ctp-text"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePlayer}
                disabled={savingPlayer}
                className="bg-[#cba6f7] hover:bg-[#b4a0e2] text-[hsl(240,21%,15%)] font-bold"
              >
                {savingPlayer ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Player Dialog */}
      <Dialog open={showDeletePlayerDialog} onOpenChange={setShowDeletePlayerDialog}>
        <DialogContent className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] text-ctp-text animate-fade-in-scale">
          <DialogHeader>
            <DialogTitle className="text-[#f2cdcd]">Delete User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-ctp-text">
              Are you sure you want to delete <strong>{playerToDelete?.displayName}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="delete-runs"
                checked={deletePlayerRuns}
                onChange={(e) => setDeletePlayerRuns(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="delete-runs">Also delete all runs associated with this user</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeletePlayerDialog(false);
                setPlayerToDelete(null);
                setDeletePlayerRuns(false);
              }}
              className="border-[hsl(235,13%,30%)] bg-[hsl(240,21%,15%)] text-ctp-text"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeletePlayer}
              disabled={deletingPlayerId === playerToDelete?.id}
              variant="destructive"
              className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-600/50"
            >
              {deletingPlayerId === playerToDelete?.id ? (
                <>Deleting...</>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}

