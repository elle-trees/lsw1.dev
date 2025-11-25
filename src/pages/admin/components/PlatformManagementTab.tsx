/**
 * Platform Management Tab Component
 * Handles CRUD operations for platforms
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, ArrowUp, ArrowDown, Edit2, Languages, Trash2 } from "lucide-react";
import { usePlatformManagement } from "../hooks/usePlatformManagement";
import { getPlatformTranslation } from "@/lib/i18n/entity-translations";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { FadeIn } from "@/components/ui/fade-in";
import { TableSkeleton } from "@/components/admin/TableSkeleton";

interface PlatformManagementTabProps {
  selectedTranslationLanguage: string;
  onTranslationLanguageChange: (lang: string) => void;
  onStartEditTranslation: (type: 'platform', id: string, originalName: string) => void;
}

export function PlatformManagementTab({ 
  selectedTranslationLanguage, 
  onTranslationLanguageChange,
  onStartEditTranslation 
}: PlatformManagementTabProps) {
  const {
    firestorePlatforms,
    newPlatformName,
    setNewPlatformName,
    editingPlatform,
    editingPlatformName,
    setEditingPlatformName,
    addingPlatform,
    updatingPlatform,
    reorderingPlatform,
    handleAddPlatform,
    handleStartEditPlatform,
    handleCancelEditPlatform,
    handleSaveEditPlatform,
    handleDeletePlatform,
    handleMovePlatformUp,
    handleMovePlatformDown,
  } = usePlatformManagement();

  return (
    <FadeIn className="space-y-4">
      <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] via-[hsl(240,21%,14%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)]">
          <CardTitle className="flex items-center gap-2 text-xl text-[#f2cdcd]">
            <span>Manage Platforms</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-[hsl(222,15%,60%)]" />
              <Label htmlFor="translation-language-platforms" className="text-sm">Translation Language:</Label>
              <Select
                value={selectedTranslationLanguage}
                onValueChange={onTranslationLanguageChange}
              >
                <SelectTrigger id="translation-language-platforms" className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-8 text-sm w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="pt-BR">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h3 className="text-base font-semibold mb-3">Add New Platform</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleAddPlatform(); }} className="space-y-3">
                <div>
                  <Label htmlFor="platformName" className="text-sm">Platform Name</Label>
                  <Input
                    id="platformName"
                    type="text"
                    value={newPlatformName}
                    onChange={(e) => setNewPlatformName(e.target.value)}
                    placeholder="e.g., Nintendo Switch"
                    required
                    className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-9 text-sm"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={addingPlatform}
                  size="sm"
                  className="bg-gradient-to-r from-[#cba6f7] to-[#b4a0e2] hover:from-[#b4a0e2] hover:to-[#cba6f7] text-[hsl(240,21%,15%)] font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <PlusCircle className="h-3 w-3" />
                  {addingPlatform ? "Adding..." : "Add Platform"}
                </Button>
              </form>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-3">Existing Platforms</h3>
              {firestorePlatforms.length === 0 ? (
                <p className="text-[hsl(222,15%,60%)] text-center py-4 text-sm">No platforms found.</p>
              ) : (
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[hsl(235,13%,30%)] hover:bg-transparent">
                        <TableHead className="py-2 px-3 text-left text-xs">Name</TableHead>
                        <TableHead className="py-2 px-3 text-center text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {firestorePlatforms.map((platform, index) => {
                        const translatedName = getPlatformTranslation(platform.id, platform.name);
                        const hasTranslation = translatedName !== platform.name;
                        return (
                          <TableRow key={platform.id} className="border-b border-[hsl(235,13%,30%)] hover:bg-[hsl(235,19%,13%)] transition-all duration-200 hover:shadow-sm">
                            <TableCell className="py-2 px-3 font-medium text-sm">
                              {editingPlatform?.id === platform.id ? (
                                <Input
                                  value={editingPlatformName}
                                  onChange={(e) => setEditingPlatformName(e.target.value)}
                                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-8 text-sm"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveEditPlatform();
                                    } else if (e.key === 'Escape') {
                                      handleCancelEditPlatform();
                                    }
                                  }}
                                />
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <span>{translatedName}</span>
                                  {hasTranslation && (
                                    <span className="text-xs text-[hsl(222,15%,60%)]">Original: {platform.name}</span>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="py-2 px-3 text-center space-x-1">
                              {editingPlatform?.id === platform.id ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleSaveEditPlatform}
                                    disabled={updatingPlatform}
                                    className="text-green-500 hover:bg-green-900/20 h-7"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelEditPlatform}
                                    disabled={updatingPlatform}
                                    className="text-gray-500 hover:bg-gray-900/20 h-7"
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMovePlatformUp(platform.id)}
                                    disabled={reorderingPlatform === platform.id || index === 0}
                                    className="text-purple-500 hover:bg-purple-900/20 disabled:opacity-50 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                    title="Move up"
                                  >
                                    <ArrowUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMovePlatformDown(platform.id)}
                                    disabled={reorderingPlatform === platform.id || index === firestorePlatforms.length - 1}
                                    className="text-purple-500 hover:bg-purple-900/20 disabled:opacity-50 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                    title="Move down"
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStartEditPlatform(platform)}
                                    className="text-blue-500 hover:bg-blue-900/20 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onStartEditTranslation('platform', platform.id, platform.name)}
                                    className="text-[#94e2d5] hover:bg-teal-900/20 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                    title="Manage translations"
                                  >
                                    <Languages className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeletePlatform(platform.id)}
                                    className="text-red-500 hover:bg-red-900/20 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

