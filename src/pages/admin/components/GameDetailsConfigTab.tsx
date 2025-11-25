/**
 * Game Details Configuration Tab Component
 * Handles game details configuration including header links management
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gamepad2, PlusCircle, Save, Edit2, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useGameDetailsConfig } from "../hooks/useGameDetailsConfig";
import { GameDetailsHeaderLink } from "@/types/database";

interface GameDetailsConfigTabProps {
  activeTab: string;
}

export function GameDetailsConfigTab({ activeTab }: GameDetailsConfigTabProps) {
  const {
    gameDetailsConfig,
    loadingGameDetailsConfig,
    savingGameDetailsConfig,
    gameDetailsConfigForm,
    setGameDetailsConfigForm,
    newHeaderLink,
    setNewHeaderLink,
    editingHeaderLink,
    editingHeaderLinkForm,
    setEditingHeaderLinkForm,
    addingHeaderLink,
    updatingHeaderLink,
    reorderingHeaderLink,
    handleSaveGameDetailsConfig,
    handleAddHeaderLink,
    handleStartEditHeaderLink,
    handleCancelEditHeaderLink,
    handleSaveEditHeaderLink,
    handleDeleteHeaderLink,
    handleMoveHeaderLinkUp,
    handleMoveHeaderLinkDown,
  } = useGameDetailsConfig(activeTab);

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] via-[hsl(240,21%,14%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)]">
          <CardTitle className="flex items-center gap-2 text-xl text-[#94e2d5]">
            <Gamepad2 className="h-5 w-5" />
            Game Details Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {loadingGameDetailsConfig ? (
            <div className="py-12">
              <LoadingSpinner size="sm" />
            </div>
          ) : gameDetailsConfig ? (
            <div className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between p-4 bg-[hsl(240,21%,15%)] border border-[hsl(235,13%,30%)] rounded-none">
                <div className="space-y-0.5">
                  <Label htmlFor="enabled" className="text-base">
                    Enable Game Details Component
                  </Label>
                  <p className="text-sm text-[hsl(222,15%,60%)]">
                    Show or hide the game details component on configured pages.
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={gameDetailsConfigForm.enabled ?? gameDetailsConfig.enabled ?? true}
                  onCheckedChange={(checked) => setGameDetailsConfigForm({ ...gameDetailsConfigForm, enabled: checked })}
                />
              </div>

              {/* Title and Subtitle */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-semibold">
                    Game Title
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={gameDetailsConfigForm.title ?? gameDetailsConfig.title ?? ""}
                    onChange={(e) => setGameDetailsConfigForm({ ...gameDetailsConfigForm, title: e.target.value })}
                    className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle" className="text-base font-semibold">
                    Subtitle (Optional)
                  </Label>
                  <Input
                    id="subtitle"
                    type="text"
                    placeholder="e.g., 2005"
                    value={gameDetailsConfigForm.subtitle ?? gameDetailsConfig.subtitle ?? ""}
                    onChange={(e) => setGameDetailsConfigForm({ ...gameDetailsConfigForm, subtitle: e.target.value })}
                    className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverImageUrl" className="text-base font-semibold">
                    Cover Image URL (Optional)
                  </Label>
                  <Input
                    id="coverImageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={gameDetailsConfigForm.coverImageUrl ?? gameDetailsConfig.coverImageUrl ?? ""}
                    onChange={(e) => setGameDetailsConfigForm({ ...gameDetailsConfigForm, coverImageUrl: e.target.value })}
                    className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Categories</Label>
                <p className="text-sm text-[hsl(222,15%,60%)] mb-2">
                  Enter categories separated by commas (e.g., "LEGO Series, Star Wars Series")
                </p>
                <Input
                  type="text"
                  placeholder="LEGO Series, Star Wars Series"
                  value={(gameDetailsConfigForm.categories ?? gameDetailsConfig.categories ?? []).join(", ")}
                  onChange={(e) => {
                    const categories = e.target.value.split(",").map(c => c.trim()).filter(c => c.length > 0);
                    setGameDetailsConfigForm({ ...gameDetailsConfigForm, categories });
                  }}
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                />
              </div>

              {/* Platforms */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Platforms</Label>
                <p className="text-sm text-[hsl(222,15%,60%)] mb-2">
                  Configure platform buttons. Enter platform labels separated by commas (e.g., "GCN, PS2, Xbox, PC")
                </p>
                <Input
                  type="text"
                  placeholder="GCN, PS2, Xbox, PC"
                  value={(gameDetailsConfigForm.platforms ?? gameDetailsConfig.platforms ?? []).map(p => p.label).join(", ")}
                  onChange={(e) => {
                    const labels = e.target.value.split(",").map(l => l.trim()).filter(l => l.length > 0);
                    const platforms = labels.map((label, index) => ({
                      id: label.toLowerCase().replace(/\s+/g, "-"),
                      label,
                      order: index + 1,
                    }));
                    setGameDetailsConfigForm({ ...gameDetailsConfigForm, platforms });
                  }}
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                />
              </div>

              {/* Discord URL */}
              <div className="space-y-2">
                <Label htmlFor="discordUrl" className="text-base font-semibold">
                  Discord URL (Optional)
                </Label>
                <Input
                  id="discordUrl"
                  type="url"
                  placeholder="https://discord.gg/..."
                  value={gameDetailsConfigForm.discordUrl ?? gameDetailsConfig.discordUrl ?? ""}
                  onChange={(e) => setGameDetailsConfigForm({ ...gameDetailsConfigForm, discordUrl: e.target.value })}
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                />
              </div>

              {/* Speedrun.com URL */}
              <div className="space-y-2">
                <Label htmlFor="speedrunComUrl" className="text-base font-semibold">
                  Speedrun.com URL (Optional)
                </Label>
                <Input
                  id="speedrunComUrl"
                  type="url"
                  placeholder="https://www.speedrun.com/..."
                  value={gameDetailsConfigForm.speedrunComUrl ?? gameDetailsConfig.speedrunComUrl ?? ""}
                  onChange={(e) => setGameDetailsConfigForm({ ...gameDetailsConfigForm, speedrunComUrl: e.target.value })}
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                />
              </div>

              {/* Header Links */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Header Navigation Links</Label>
                <p className="text-sm text-[hsl(222,15%,60%)] mb-4">
                  Configure header navigation links shown in the game details card below platforms and Discord.
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Add New Header Link Form */}
                  <div>
                    <h3 className="text-base font-semibold mb-3">Add New Header Link</h3>
                    <form onSubmit={handleAddHeaderLink} className="space-y-3">
                      <div>
                        <Label htmlFor="headerLinkLabel" className="text-sm">Label</Label>
                        <Input
                          id="headerLinkLabel"
                          type="text"
                          value={newHeaderLink.label}
                          onChange={(e) => setNewHeaderLink({ ...newHeaderLink, label: e.target.value })}
                          placeholder="e.g., Leaderboards"
                          required
                          className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="headerLinkRoute" className="text-sm">Route</Label>
                        <Input
                          id="headerLinkRoute"
                          type="text"
                          value={newHeaderLink.route}
                          onChange={(e) => setNewHeaderLink({ ...newHeaderLink, route: e.target.value })}
                          placeholder="e.g., /leaderboards"
                          required
                          className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="headerLinkIcon" className="text-sm">Icon (Optional)</Label>
                        <Select
                          value={newHeaderLink.icon || "none"}
                          onValueChange={(value) => setNewHeaderLink({ ...newHeaderLink, icon: value === "none" ? "" : value })}
                        >
                          <SelectTrigger className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-9 text-sm">
                            <SelectValue placeholder="Select icon" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="Trophy">Trophy</SelectItem>
                            <SelectItem value="LegoStud">LegoStud</SelectItem>
                            <SelectItem value="Upload">Upload</SelectItem>
                            <SelectItem value="Radio">Radio</SelectItem>
                            <SelectItem value="Download">Download</SelectItem>
                            <SelectItem value="BarChart3">BarChart3</SelectItem>
                            <SelectItem value="ShieldAlert">ShieldAlert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="headerLinkColor" className="text-sm">Color (Optional)</Label>
                        <Input
                          id="headerLinkColor"
                          type="text"
                          value={newHeaderLink.color}
                          onChange={(e) => setNewHeaderLink({ ...newHeaderLink, color: e.target.value })}
                          placeholder="#cdd6f4"
                          className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-9 text-sm"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="headerLinkAdminOnly"
                          checked={newHeaderLink.adminOnly}
                          onChange={(e) => setNewHeaderLink({ ...newHeaderLink, adminOnly: e.target.checked })}
                          className="rounded-none"
                        />
                        <Label htmlFor="headerLinkAdminOnly" className="text-sm cursor-pointer">
                          Admin Only
                        </Label>
                      </div>
                      <Button
                        type="submit"
                        disabled={addingHeaderLink}
                        size="sm"
                        className="bg-gradient-to-r from-[#94e2d5] to-[#7dd3c7] hover:from-[#7dd3c7] hover:to-[#94e2d5] text-[hsl(240,21%,15%)] font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        <PlusCircle className="h-3 w-3" />
                        {addingHeaderLink ? "Adding..." : "Add Header Link"}
                      </Button>
                    </form>
                  </div>
                  
                  {/* Existing Header Links */}
                  <div>
                    <h3 className="text-base font-semibold mb-3">Existing Header Links</h3>
                    {(!gameDetailsConfigForm.headerLinks && !gameDetailsConfig?.headerLinks) || 
                     (gameDetailsConfigForm.headerLinks ?? gameDetailsConfig?.headerLinks ?? []).length === 0 ? (
                      <p className="text-[hsl(222,15%,60%)] text-center py-4 text-sm">No header links found. Add your first link!</p>
                    ) : (
                      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b border-[hsl(235,13%,30%)] hover:bg-transparent">
                              <TableHead className="py-2 px-3 text-left text-xs">Order</TableHead>
                              <TableHead className="py-2 px-3 text-left text-xs">Label</TableHead>
                              <TableHead className="py-2 px-3 text-left text-xs">Route</TableHead>
                              <TableHead className="py-2 px-3 text-left text-xs">Icon</TableHead>
                              <TableHead className="py-2 px-3 text-left text-xs">Color</TableHead>
                              <TableHead className="py-2 px-3 text-center text-xs">Admin</TableHead>
                              <TableHead className="py-2 px-3 text-center text-xs">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...(gameDetailsConfigForm.headerLinks ?? gameDetailsConfig?.headerLinks ?? [])]
                              .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
                              .map((link, index) => (
                              <TableRow key={link.id} className="border-b border-[hsl(235,13%,30%)] hover:bg-[hsl(235,19%,13%)] transition-all duration-200 hover:shadow-sm">
                                <TableCell className="py-2 px-3 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMoveHeaderLinkUp(link.id)}
                                      disabled={reorderingHeaderLink === link.id || index === 0}
                                      className="text-purple-500 hover:bg-purple-900/20 disabled:opacity-50 h-6 w-6 p-0 transition-all duration-200 hover:scale-110"
                                      title="Move up"
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMoveHeaderLinkDown(link.id)}
                                      disabled={reorderingHeaderLink === link.id || index === (gameDetailsConfigForm.headerLinks ?? gameDetailsConfig?.headerLinks ?? []).length - 1}
                                      className="text-purple-500 hover:bg-purple-900/20 disabled:opacity-50 h-6 w-6 p-0 transition-all duration-200 hover:scale-110"
                                      title="Move down"
                                    >
                                      <ArrowDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell className="py-2 px-3 font-medium text-sm">
                                  {editingHeaderLink?.id === link.id ? (
                                    <Input
                                      value={editingHeaderLinkForm.label}
                                      onChange={(e) => setEditingHeaderLinkForm({ ...editingHeaderLinkForm, label: e.target.value })}
                                      className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-8 text-sm w-24"
                                      autoFocus
                                    />
                                  ) : (
                                    link.label
                                  )}
                                </TableCell>
                                <TableCell className="py-2 px-3 text-sm">
                                  {editingHeaderLink?.id === link.id ? (
                                    <Input
                                      value={editingHeaderLinkForm.route}
                                      onChange={(e) => setEditingHeaderLinkForm({ ...editingHeaderLinkForm, route: e.target.value })}
                                      className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-8 text-sm w-24"
                                    />
                                  ) : (
                                    <span className="text-[hsl(222,15%,60%)]">{link.route}</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-2 px-3 text-sm">
                                  {editingHeaderLink?.id === link.id ? (
                                    <Select
                                      value={editingHeaderLinkForm.icon || "none"}
                                      onValueChange={(value) => setEditingHeaderLinkForm({ ...editingHeaderLinkForm, icon: value === "none" ? "" : value })}
                                    >
                                      <SelectTrigger className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-8 text-xs w-28">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="Trophy">Trophy</SelectItem>
                                        <SelectItem value="LegoStud">LegoStud</SelectItem>
                                        <SelectItem value="Upload">Upload</SelectItem>
                                        <SelectItem value="Radio">Radio</SelectItem>
                                        <SelectItem value="Download">Download</SelectItem>
                                        <SelectItem value="BarChart3">BarChart3</SelectItem>
                                        <SelectItem value="ShieldAlert">ShieldAlert</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <span className="text-[hsl(222,15%,60%)]">{link.icon || "—"}</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-2 px-3 text-sm">
                                  {editingHeaderLink?.id === link.id ? (
                                    <Input
                                      value={editingHeaderLinkForm.color}
                                      onChange={(e) => setEditingHeaderLinkForm({ ...editingHeaderLinkForm, color: e.target.value })}
                                      className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-8 text-sm w-24"
                                    />
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className="text-[hsl(222,15%,60%)]">{link.color || "—"}</span>
                                      {link.color && (
                                        <div className="w-4 h-4 rounded-none border border-ctp-surface1" style={{ backgroundColor: link.color }}></div>
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="py-2 px-3 text-center text-sm">
                                  {editingHeaderLink?.id === link.id ? (
                                    <input
                                      type="checkbox"
                                      checked={editingHeaderLinkForm.adminOnly}
                                      onChange={(e) => setEditingHeaderLinkForm({ ...editingHeaderLinkForm, adminOnly: e.target.checked })}
                                      className="rounded-none"
                                    />
                                  ) : (
                                    <span className="text-[hsl(222,15%,60%)]">{link.adminOnly ? "Yes" : "No"}</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-2 px-3 text-center space-x-1">
                                  {editingHeaderLink?.id === link.id ? (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSaveEditHeaderLink}
                                        disabled={updatingHeaderLink}
                                        className="text-green-500 hover:bg-green-900/20"
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancelEditHeaderLink}
                                        disabled={updatingHeaderLink}
                                        className="text-gray-500 hover:bg-gray-900/20"
                                      >
                                        Cancel
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleStartEditHeaderLink(link)}
                                        className="text-blue-500 hover:bg-blue-900/20 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteHeaderLink(link.id)}
                                        className="text-red-500 hover:bg-red-900/20 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Visible Pages */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Visible On Pages</Label>
                <p className="text-sm text-[hsl(222,15%,60%)] mb-2">
                  Enter page routes separated by commas where the component should be visible (e.g., "/, /leaderboards, /stats")
                </p>
                <Input
                  type="text"
                  placeholder="/, /leaderboards, /stats"
                  value={(gameDetailsConfigForm.visibleOnPages ?? gameDetailsConfig.visibleOnPages ?? []).join(", ")}
                  onChange={(e) => {
                    const pages = e.target.value.split(",").map(p => p.trim()).filter(p => p.length > 0);
                    setGameDetailsConfigForm({ ...gameDetailsConfigForm, visibleOnPages: pages });
                  }}
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-[hsl(235,13%,30%)]">
                <Button
                  onClick={handleSaveGameDetailsConfig}
                  disabled={savingGameDetailsConfig}
                  className="bg-gradient-to-r from-[#94e2d5] to-[#7dd3c7] hover:from-[#7dd3c7] hover:to-[#94e2d5] text-[hsl(240,21%,15%)] font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  {savingGameDetailsConfig ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[hsl(222,15%,60%)]">
              Failed to load game details configuration.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

