/**
 * Level Management Tab Component
 * Handles CRUD operations for levels and category disable/enable
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, AnimatedTabsList, AnimatedTabsTrigger } from "@/components/ui/animated-tabs";
import { PlusCircle, ArrowUp, ArrowDown, Edit2, Languages, Trash2, Star, Gem } from "lucide-react";
import { useLevelManagement } from "../hooks/useLevelManagement";
import { getLevelTranslation } from "@/lib/i18n/entity-translations";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { Category, Level } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { FadeIn } from "@/components/ui/fade-in";
import { TableSkeleton } from "@/components/admin/TableSkeleton";

interface LevelManagementTabProps {
  selectedTranslationLanguage: string;
  onTranslationLanguageChange: (lang: string) => void;
  onStartEditTranslation: (type: 'level', id: string, originalName: string) => void;
}

export function LevelManagementTab({ 
  selectedTranslationLanguage, 
  onTranslationLanguageChange,
  onStartEditTranslation 
}: LevelManagementTabProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [levelLeaderboardType, setLevelLeaderboardType] = useState<'individual-level' | 'community-golds'>('individual-level');
  
  const {
    availableLevels,
    setAvailableLevels,
    firestoreCategories,
    newLevelName,
    setNewLevelName,
    editingLevel,
    editingLevelName,
    setEditingLevelName,
    addingLevel,
    updatingLevel,
    reorderingLevel,
    handleAddLevel,
    handleStartEditLevel,
    handleCancelEditLevel,
    handleSaveEditLevel,
    handleDeleteLevel,
    handleMoveLevelUp,
    handleMoveLevelDown,
    handleToggleLevelCategoryDisabled,
  } = useLevelManagement(levelLeaderboardType);

  return (
    <FadeIn className="space-y-4">
      <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] via-[hsl(240,21%,14%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)]">
          <CardTitle className="flex items-center gap-2 text-xl text-[#f2cdcd]">
            <span>Manage Levels</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs 
            value={levelLeaderboardType} 
            onValueChange={(value) => setLevelLeaderboardType(value as 'individual-level' | 'community-golds')}
            className="w-full mb-4"
          >
            <AnimatedTabsList 
              className="grid w-full grid-cols-2 p-1 gap-2 h-auto"
              indicatorClassName="h-0.5 bg-[#94e2d5]"
            >
              <AnimatedTabsTrigger 
                value="individual-level"
                className="py-2 px-3 text-sm transition-all duration-300 font-medium data-[state=active]:text-[#94e2d5]"
              >
                <Star className="h-4 w-4 mr-2" />
                Individual Level
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger 
                value="community-golds"
                className="py-2 px-3 text-sm transition-all duration-300 font-medium data-[state=active]:text-[#94e2d5]"
              >
                <Gem className="h-4 w-4 mr-2" />
                Community Golds
              </AnimatedTabsTrigger>
            </AnimatedTabsList>
          </Tabs>

          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-[hsl(222,15%,60%)]" />
              <Label htmlFor="translation-language-levels" className="text-sm">Translation Language:</Label>
              <Select
                value={selectedTranslationLanguage}
                onValueChange={onTranslationLanguageChange}
              >
                <SelectTrigger id="translation-language-levels" className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-8 text-sm w-32">
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
          <div className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h3 className="text-base font-semibold mb-3">Add New Level</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleAddLevel(); }} className="space-y-3">
                  <div>
                    <Label htmlFor="levelName" className="text-sm">Level Name</Label>
                    <Input
                      id="levelName"
                      type="text"
                      value={newLevelName}
                      onChange={(e) => setNewLevelName(e.target.value)}
                      placeholder="e.g., Level 1"
                      required
                      className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-9 text-sm"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={addingLevel}
                    size="sm"
                    className="bg-gradient-to-r from-[#cba6f7] to-[#b4a0e2] hover:from-[#b4a0e2] hover:to-[#cba6f7] text-[hsl(240,21%,15%)] font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <PlusCircle className="h-3 w-3" />
                    {addingLevel ? "Adding..." : "Add Level"}
                  </Button>
                </form>
              </div>
              <div>
                <h3 className="text-base font-semibold mb-3">Existing Levels</h3>
                {availableLevels.length === 0 ? (
                  <p className="text-[hsl(222,15%,60%)] text-center py-4 text-sm">No levels found.</p>
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
                        {availableLevels.map((level, index) => {
                          const translatedName = getLevelTranslation(level.id, level.name);
                          const hasTranslation = translatedName !== level.name;
                          return (
                            <TableRow key={level.id} className="border-b border-[hsl(235,13%,30%)] hover:bg-[hsl(235,19%,13%)] transition-all duration-200 hover:shadow-sm">
                              <TableCell className="py-2 px-3 font-medium text-sm">
                                {editingLevel?.id === level.id ? (
                                  <Input
                                    value={editingLevelName}
                                    onChange={(e) => setEditingLevelName(e.target.value)}
                                    className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-8 text-sm"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSaveEditLevel();
                                      } else if (e.key === 'Escape') {
                                        handleCancelEditLevel();
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="flex flex-col gap-1">
                                    <span>{translatedName}</span>
                                    {hasTranslation && (
                                      <span className="text-xs text-[hsl(222,15%,60%)]">Original: {level.name}</span>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="py-2 px-3 text-center space-x-1">
                                {editingLevel?.id === level.id ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={handleSaveEditLevel}
                                      disabled={updatingLevel}
                                      className="text-green-500 hover:bg-green-900/20 h-7"
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={handleCancelEditLevel}
                                      disabled={updatingLevel}
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
                                      onClick={() => handleMoveLevelUp(level.id)}
                                      disabled={reorderingLevel === level.id || index === 0}
                                      className="text-purple-500 hover:bg-purple-900/20 disabled:opacity-50 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                      title="Move up"
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMoveLevelDown(level.id)}
                                      disabled={reorderingLevel === level.id || index === availableLevels.length - 1}
                                      className="text-purple-500 hover:bg-purple-900/20 disabled:opacity-50 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                      title="Move down"
                                    >
                                      <ArrowDown className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleStartEditLevel(level)}
                                      className="text-blue-500 hover:bg-blue-900/20 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onStartEditTranslation('level', level.id, level.name)}
                                      className="text-[#94e2d5] hover:bg-teal-900/20 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                      title="Manage translations"
                                    >
                                      <Languages className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteLevel(level.id)}
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
          </div>
          
          {/* Category Management for Levels */}
          {availableLevels.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[hsl(235,13%,30%)]">
              <h3 className="text-base font-semibold mb-4">Disable Levels by Category</h3>
              <p className="text-sm text-[hsl(222,15%,60%)] mb-4">
                Disable specific levels from appearing in certain categories for {levelLeaderboardType === 'individual-level' ? 'Individual Level' : 'Community Golds'} runs.
              </p>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {availableLevels.map((level) => {
                  const relevantCategories = firestoreCategories;
                  
                  if (relevantCategories.length === 0) {
                    return (
                      <div key={level.id} className="bg-[hsl(240,21%,15%)] rounded-none p-4 border border-[hsl(235,13%,30%)]">
                        <div className="font-medium text-sm mb-3 text-[#f2cdcd]">{level.name}</div>
                        <p className="text-xs text-[hsl(222,15%,60%)]">
                          No categories available for {levelLeaderboardType === 'community-golds' ? 'Community Golds' : 'Individual Level'} runs.
                        </p>
                      </div>
                    );
                  }
                  
                  const isDisabled = (categoryId: string) => {
                    return level.disabledCategories?.[categoryId] === true;
                  };
                  
                  return (
                    <div key={level.id} className="bg-[hsl(240,21%,15%)] rounded-none p-4 border border-[hsl(235,13%,30%)]">
                      <div className="font-medium text-sm mb-3 text-[#f2cdcd]">{level.name}</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {relevantCategories.map((category) => (
                          <label
                            key={category.id}
                            className="flex items-center gap-2 p-2 rounded-none hover:bg-[hsl(235,19%,13%)] cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={!isDisabled(category.id)}
                              onChange={async (e) => {
                                const disabled = !e.target.checked;
                                try {
                                  await handleToggleLevelCategoryDisabled(level.id, category.id, disabled, level.name, category.name);
                                } catch (error) {
                                  // Error already handled in hook
                                }
                              }}
                              className="w-4 h-4 rounded-none border-[hsl(235,13%,30%)] bg-[hsl(240,21%,15%)] text-[#cba6f7] focus:ring-2 focus:ring-[#cba6f7] cursor-pointer"
                            />
                            <span className={`text-xs ${isDisabled(category.id) ? 'text-[hsl(222,15%,50%)] line-through' : 'text-[hsl(222,15%,70%)]'}`}>
                              {category.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
}

