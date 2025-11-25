/**
 * Categories Tab Component
 * Handles CRUD operations for categories and subcategories
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, ArrowUp, ArrowDown, Edit2, Languages, Trash2, Trophy, Star, Gem, Upload } from "lucide-react";
import { useCategoriesManagement } from "../hooks/useCategoriesManagement";
import { getCategoryTranslation, getSubcategoryTranslation } from "@/lib/i18n/entity-translations";
import { Category } from "@/types/database";
import { AnimatedTabs, AnimatedTabsContent, AnimatedTabsList, AnimatedTabsTrigger } from "@/components/ui/animated-tabs";
import { Tabs } from "@/components/ui/tabs";
import { FadeIn } from "@/components/ui/fade-in";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoriesTabProps {
  selectedTranslationLanguage: string;
  onTranslationLanguageChange: (lang: string) => void;
  onStartEditTranslation: (type: 'category' | 'subcategory', id: string, originalName: string) => void;
}

export function CategoriesTab({ 
  selectedTranslationLanguage, 
  onTranslationLanguageChange,
  onStartEditTranslation 
}: CategoriesTabProps) {
  const {
    firestoreCategories,
    loadingCategories,
    categoryLeaderboardType,
    setCategoryLeaderboardType,
    newCategoryName,
    setNewCategoryName,
    editingCategory,
    editingCategoryName,
    setEditingCategoryName,
    editingCategorySrcId,
    setEditingCategorySrcId,
    addingCategory,
    updatingCategory,
    reorderingCategory,
    categoryManagementTab,
    setCategoryManagementTab,
    selectedCategoryForSubcategories,
    setSelectedCategoryForSubcategories,
    srcVariables,
    loadingSRCVariables,
    editingSubcategory,
    newSubcategoryName,
    setNewSubcategoryName,
    editingSubcategoryName,
    setEditingSubcategoryName,
    addingSubcategory,
    updatingSubcategory,
    reorderingSubcategory,
    handleAddCategory,
    handleStartEditCategory,
    handleCancelEditCategory,
    handleSaveEditCategory,
    handleDeleteCategory,
    handleMoveCategoryUp,
    handleMoveCategoryDown,
    handleAddSubcategory,
    handleStartEditSubcategory,
    handleCancelEditSubcategory,
    handleSaveEditSubcategory,
    handleDeleteSubcategory,
    handleMoveSubcategoryUp,
    handleMoveSubcategoryDown,
    handleSetSubcategoryVariable,
    handleImportSubcategoriesFromSRC,
    fetchCategories,
  } = useCategoriesManagement();

  return (
    <FadeIn className="space-y-4">
      <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] via-[hsl(240,21%,14%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)]">
          <CardTitle className="flex items-center gap-2 text-xl text-[#f2cdcd]">
            <span>Manage Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs 
            value={categoryLeaderboardType} 
            onValueChange={(value) => {
              const type = value as 'regular' | 'individual-level' | 'community-golds';
              setCategoryLeaderboardType(type);
              fetchCategories(type);
              if (type !== 'regular') {
                setSelectedCategoryForSubcategories(null);
                setCategoryManagementTab('categories');
              }
            }}
            className="w-full mb-4"
          >
            <AnimatedTabsList 
              className="grid w-full grid-cols-3 p-1 gap-2 h-auto"
              indicatorClassName="h-0.5 bg-[#94e2d5]"
            >
              <AnimatedTabsTrigger 
                value="regular"
                className="py-2 px-3 text-sm transition-all duration-300 font-medium data-[state=active]:text-[#94e2d5]"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Full Game
              </AnimatedTabsTrigger>
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

          <div className="mt-0">
            {/* Inner tabs for Categories vs Subcategories (only show subcategories for regular) */}
            {categoryLeaderboardType === 'regular' ? (
              <Tabs value={categoryManagementTab} onValueChange={(value) => setCategoryManagementTab(value as 'categories' | 'subcategories')} className="mb-4">
                <AnimatedTabsList className="grid w-full grid-cols-2 rounded-none p-0.5 gap-1 mb-4" indicatorClassName="h-0.5 bg-[#cba6f7]">
                  <AnimatedTabsTrigger 
                    value="categories" 
                    className="transition-all duration-300 font-medium py-2 px-3 text-sm data-[state=active]:text-[#cba6f7]"
                  >
                    Categories
                  </AnimatedTabsTrigger>
                  <AnimatedTabsTrigger 
                    value="subcategories" 
                    className="transition-all duration-300 font-medium py-2 px-3 text-sm data-[state=active]:text-[#cba6f7]"
                  >
                    Subcategories
                  </AnimatedTabsTrigger>
                </AnimatedTabsList>

                <AnimatedTabsContent value="categories" className="mt-0">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-[hsl(222,15%,60%)]" />
                      <Label htmlFor="translation-language" className="text-sm">Translation Language:</Label>
                      <Select
                        value={selectedTranslationLanguage}
                        onValueChange={onTranslationLanguageChange}
                      >
                        <SelectTrigger id="translation-language" className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-8 text-sm w-32">
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
                      <h3 className="text-base font-semibold mb-3">Add New Category</h3>
                      <form onSubmit={handleAddCategory} className="space-y-3">
                        <div>
                          <Label htmlFor="categoryName" className="text-sm">Category Name</Label>
                          <Input
                            id="categoryName"
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="e.g., 100% Glitchless"
                            required
                            className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-9 text-sm"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          disabled={addingCategory}
                          size="sm"
                          className="bg-gradient-to-r from-[#cba6f7] to-[#b4a0e2] hover:from-[#b4a0e2] hover:to-[#cba6f7] text-[hsl(240,21%,15%)] font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                          <PlusCircle className="h-3 w-3" />
                          {addingCategory ? "Adding..." : "Add Category"}
                        </Button>
                      </form>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold mb-3">Existing Categories</h3>
                      {loadingCategories ? (
                        <FadeIn>
                          <TableSkeleton rows={5} columns={3} />
                        </FadeIn>
                      ) : firestoreCategories.length === 0 ? (
                        <p className="text-[hsl(222,15%,60%)] text-center py-4 text-sm animate-fade-in">No categories found. Add your first category!</p>
                      ) : (
                        <FadeIn>
                          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                            <Table>
                            <TableHeader>
                              <TableRow className="border-b border-[hsl(235,13%,30%)] hover:bg-transparent">
                                <TableHead className="py-2 px-3 text-left text-xs">Name</TableHead>
                                <TableHead className="py-2 px-3 text-left text-xs">SRC Category ID</TableHead>
                                <TableHead className="py-2 px-3 text-center text-xs">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {firestoreCategories.map((category, index) => {
                                const translatedName = getCategoryTranslation(category.id, category.name);
                                const hasTranslation = translatedName !== category.name;
                                return (
                                  <TableRow key={category.id} className="border-b border-[hsl(235,13%,30%)] hover:bg-[hsl(235,19%,13%)] transition-all duration-200 hover:shadow-sm">
                                    <TableCell className="py-2 px-3 font-medium text-sm">
                                      {editingCategory?.id === category.id ? (
                                        <Input
                                          value={editingCategoryName}
                                          onChange={(e) => setEditingCategoryName(e.target.value)}
                                          className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-8 text-sm"
                                          autoFocus
                                        />
                                      ) : (
                                        <div className="flex flex-col gap-1">
                                          <span>{translatedName}</span>
                                          {hasTranslation && (
                                            <span className="text-xs text-[hsl(222,15%,60%)]">Original: {category.name}</span>
                                          )}
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell className="py-2 px-3 text-sm">
                                      {editingCategory?.id === category.id ? (
                                        <Input
                                          value={editingCategorySrcId}
                                          onChange={(e) => setEditingCategorySrcId(e.target.value)}
                                          placeholder="e.g., 9kj3k0x8"
                                          className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-8 text-sm"
                                        />
                                      ) : (
                                        <span className="text-[hsl(222,15%,60%)]">
                                          {(category as Category).srcCategoryId || "—"}
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="py-2 px-3 text-center space-x-1">
                                      {editingCategory?.id === category.id ? (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSaveEditCategory}
                                            disabled={updatingCategory}
                                            className="text-green-500 hover:bg-green-900/20"
                                          >
                                            Save
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCancelEditCategory}
                                            disabled={updatingCategory}
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
                                            onClick={() => handleMoveCategoryUp(category.id)}
                                            disabled={reorderingCategory === category.id || index === 0}
                                            className="text-purple-500 hover:bg-purple-900/20 disabled:opacity-50 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                            title="Move up"
                                          >
                                            <ArrowUp className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleMoveCategoryDown(category.id)}
                                            disabled={reorderingCategory === category.id || index === firestoreCategories.length - 1}
                                            className="text-purple-500 hover:bg-purple-900/20 disabled:opacity-50 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                            title="Move down"
                                          >
                                            <ArrowDown className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleStartEditCategory(category)}
                                            className="text-blue-500 hover:bg-blue-900/20 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                          >
                                            <Edit2 className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onStartEditTranslation('category', category.id, category.name)}
                                            className="text-[#94e2d5] hover:bg-teal-900/20 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                            title="Manage translations"
                                          >
                                            <Languages className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteCategory(category.id)}
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
                        </FadeIn>
                      )}
                    </div>
                  </div>
                </AnimatedTabsContent>

                <AnimatedTabsContent value="subcategories" className="mt-0">
                  <div className="space-y-6">
                    {/* Category Selection */}
                    <div>
                      <Label htmlFor="subcategory-category-select" className="text-sm mb-2 block">Select Category</Label>
                      <Select
                        value={selectedCategoryForSubcategories?.id || ""}
                        onValueChange={(value) => {
                          const category = firestoreCategories.find(c => c.id === value) as Category | undefined;
                          setSelectedCategoryForSubcategories(category || null);
                        }}
                      >
                        <SelectTrigger id="subcategory-category-select" className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
                          <SelectValue placeholder="Select a category to manage subcategories" />
                        </SelectTrigger>
                        <SelectContent>
                          {firestoreCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedCategoryForSubcategories && !selectedCategoryForSubcategories.srcCategoryId && (
                        <p className="text-xs text-yellow-400 mt-2">
                          Note: This category doesn't have a linked SRC category ID. SRC variable import will not be available. You can set the SRC Category ID in the Categories tab by editing this category.
                        </p>
                      )}
                    </div>

                    {selectedCategoryForSubcategories && (
                      <>
                        {/* SRC Variables Section */}
                        {selectedCategoryForSubcategories.srcCategoryId && (
                          <div className="bg-[hsl(240,21%,15%)] rounded-none p-4 border border-[hsl(235,13%,30%)]">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-[#f2cdcd]">Speedrun.com Variables</h4>
                              {srcVariables.length > 0 && (
                                <Button
                                  onClick={handleImportSubcategoriesFromSRC}
                                  disabled={updatingSubcategory || loadingSRCVariables}
                                  size="sm"
                                  className="bg-gradient-to-r from-[#94e2d5] to-[#74c7b0] hover:from-[#74c7b0] hover:to-[#94e2d5] text-[hsl(240,21%,15%)] font-bold text-xs"
                                >
                                  <Upload className="h-3 w-3 mr-1" />
                                  Import from SRC
                                </Button>
                              )}
                            </div>
                            {loadingSRCVariables ? (
                              <p className="text-xs text-[hsl(222,15%,60%)]">Loading SRC variables...</p>
                            ) : srcVariables.length > 0 ? (
                              <div className="space-y-3">
                                {/* Variable Selection Dropdown (only show if multiple variables) */}
                                {srcVariables.length > 1 && (
                                  <div>
                                    <Label htmlFor="subcategory-variable-select" className="text-xs mb-2 block text-[#f2cdcd]">
                                      Select Variable for Subcategories
                                    </Label>
                                    <Select
                                      value={selectedCategoryForSubcategories.srcSubcategoryVariableName || "__default__"}
                                      onValueChange={(value) => handleSetSubcategoryVariable(value === "__default__" ? null : value)}
                                      disabled={updatingSubcategory}
                                    >
                                      <SelectTrigger 
                                        id="subcategory-variable-select"
                                        className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-9 text-sm"
                                      >
                                        <SelectValue placeholder="Select variable (defaults to first)" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="__default__">Use First Variable (Default)</SelectItem>
                                        {srcVariables.map((variable) => (
                                          <SelectItem key={variable.id} value={variable.name}>
                                            {variable.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <p className="text-xs text-[hsl(222,15%,60%)] mt-1">
                                      {selectedCategoryForSubcategories.srcSubcategoryVariableName 
                                        ? `Using "${selectedCategoryForSubcategories.srcSubcategoryVariableName}" for subcategories.`
                                        : "Using first variable for subcategories."}
                                    </p>
                                  </div>
                                )}
                                <div className="space-y-2">
                                  {srcVariables.map((variable) => {
                                    const isSelected = selectedCategoryForSubcategories.srcSubcategoryVariableName 
                                      ? variable.name.toLowerCase().trim() === selectedCategoryForSubcategories.srcSubcategoryVariableName.toLowerCase().trim()
                                      : srcVariables.indexOf(variable) === 0;
                                    return (
                                      <div 
                                        key={variable.id} 
                                        className={`text-xs p-2 rounded-none border ${
                                          isSelected 
                                            ? 'bg-[hsl(240,21%,18%)] border-[#94e2d5]' 
                                            : 'bg-[hsl(240,21%,12%)] border-[hsl(235,13%,30%)]'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 mb-1">
                                          <div className={`font-medium ${isSelected ? 'text-[#94e2d5]' : 'text-[#cba6f7]'}`}>
                                            {variable.name}
                                          </div>
                                          {isSelected && (
                                            <Badge variant="outline" className="text-xs border-[#94e2d5] text-[#94e2d5]">
                                              Selected
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="text-[hsl(222,15%,60%)] space-y-1">
                                          {Object.entries(variable.values.values).slice(0, 5).map(([valueId, valueData]) => (
                                            <div key={valueId}>• {valueData.label}</div>
                                          ))}
                                          {Object.keys(variable.values.values).length > 5 && (
                                            <div className="text-[hsl(222,15%,50%)]">
                                              ... and {Object.keys(variable.values.values).length - 5} more
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-[hsl(222,15%,60%)]">No variables found for this category on Speedrun.com.</p>
                            )}
                          </div>
                        )}

                        {/* Add Subcategory */}
                        <div className="bg-[hsl(240,21%,15%)] rounded-none p-4 border border-[hsl(235,13%,30%)]">
                          <h4 className="text-sm font-semibold mb-3 text-[#f2cdcd]">Add New Subcategory</h4>
                          <form onSubmit={(e) => { e.preventDefault(); handleAddSubcategory(); }} className="space-y-3">
                            <div>
                              <Label htmlFor="new-subcategory-name" className="text-xs">Subcategory Name</Label>
                              <Input
                                id="new-subcategory-name"
                                type="text"
                                value={newSubcategoryName}
                                onChange={(e) => setNewSubcategoryName(e.target.value)}
                                placeholder="e.g., Glitchless"
                                required
                                className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-9 text-sm"
                              />
                            </div>
                            <Button
                              type="submit"
                              disabled={addingSubcategory}
                              size="sm"
                              className="bg-gradient-to-r from-[#cba6f7] to-[#b4a0e2] hover:from-[#b4a0e2] hover:to-[#cba6f7] text-[hsl(240,21%,15%)] font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            >
                              <PlusCircle className="h-3 w-3" />
                              {addingSubcategory ? "Adding..." : "Add Subcategory"}
                            </Button>
                          </form>
                        </div>

                        {/* Existing Subcategories */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 text-[#f2cdcd]">Existing Subcategories</h4>
                          {(() => {
                            const currentCategory = firestoreCategories.find(c => c.id === selectedCategoryForSubcategories.id) as Category | undefined;
                            const subcategories = currentCategory?.subcategories || [];
                            const sortedSubcategories = [...subcategories].sort((a, b) => {
                              const orderA = a.order ?? Infinity;
                              const orderB = b.order ?? Infinity;
                              return orderA - orderB;
                            });

                            if (sortedSubcategories.length === 0) {
                              return (
                                <p className="text-[hsl(222,15%,60%)] text-center py-4 text-sm">
                                  No subcategories found. Add your first subcategory!
                                </p>
                              );
                            }

                            return (
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-b border-[hsl(235,13%,30%)] hover:bg-transparent">
                                      <TableHead className="py-2 px-3 text-left text-xs">Name</TableHead>
                                      <TableHead className="py-2 px-3 text-left text-xs">SRC Link</TableHead>
                                      <TableHead className="py-2 px-3 text-center text-xs">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {sortedSubcategories.map((subcategory, index) => (
                                      <TableRow key={subcategory.id} className="border-b border-[hsl(235,13%,30%)] hover:bg-[hsl(235,19%,13%)] transition-all duration-200 hover:shadow-sm">
                                        <TableCell className="py-2 px-3 font-medium text-sm">
                                          {editingSubcategory?.id === subcategory.id ? (
                                            <Input
                                              value={editingSubcategoryName}
                                              onChange={(e) => setEditingSubcategoryName(e.target.value)}
                                              className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-8 text-sm"
                                              autoFocus
                                            />
                                          ) : (
                                            subcategory.name
                                          )}
                                        </TableCell>
                                        <TableCell className="py-2 px-3 text-xs text-[hsl(222,15%,60%)]">
                                          {subcategory.srcVariableId && subcategory.srcValueId ? (
                                            <span className="text-green-400">Linked to SRC</span>
                                          ) : (
                                            <span className="text-[hsl(222,15%,50%)]">—</span>
                                          )}
                                        </TableCell>
                                        <TableCell className="py-2 px-3 text-center space-x-1">
                                          {editingSubcategory?.id === subcategory.id ? (
                                            <>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleSaveEditSubcategory}
                                                disabled={updatingSubcategory}
                                                className="text-green-500 hover:bg-green-900/20 h-7"
                                              >
                                                Save
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleCancelEditSubcategory}
                                                disabled={updatingSubcategory}
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
                                                onClick={() => handleMoveSubcategoryUp(subcategory.id)}
                                                disabled={reorderingSubcategory === subcategory.id || index === 0}
                                                className="text-purple-500 hover:bg-purple-900/20 disabled:opacity-50 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                                title="Move up"
                                              >
                                                <ArrowUp className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMoveSubcategoryDown(subcategory.id)}
                                                disabled={reorderingSubcategory === subcategory.id || index === sortedSubcategories.length - 1}
                                                className="text-purple-500 hover:bg-purple-900/20 disabled:opacity-50 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                                title="Move down"
                                              >
                                                <ArrowDown className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleStartEditSubcategory(subcategory)}
                                                className="text-blue-500 hover:bg-blue-900/20 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                              >
                                                <Edit2 className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onStartEditTranslation('subcategory', subcategory.id, subcategory.name)}
                                                className="text-[#94e2d5] hover:bg-teal-900/20 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                                title="Manage translations"
                                              >
                                                <Languages className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteSubcategory(subcategory.id)}
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
                            );
                          })()}
                        </div>
                      </>
                    )}

                    {!selectedCategoryForSubcategories && (
                      <div className="text-center py-8">
                        <p className="text-[hsl(222,15%,60%)] text-sm">
                          Select a category above to manage its subcategories.
                        </p>
                      </div>
                    )}
                  </div>
                </AnimatedTabsContent>
              </Tabs>
            ) : (
              // For non-regular categories, just show the regular category management
              <>
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-[hsl(222,15%,60%)]" />
                    <Label htmlFor="translation-language-2" className="text-sm">Translation Language:</Label>
                    <Select
                      value={selectedTranslationLanguage}
                      onValueChange={onTranslationLanguageChange}
                    >
                      <SelectTrigger id="translation-language-2" className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-8 text-sm w-32">
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
                    <h3 className="text-base font-semibold mb-3">Add New Category</h3>
                    <form onSubmit={handleAddCategory} className="space-y-3">
                      <div>
                        <Label htmlFor="categoryName" className="text-sm">Category Name</Label>
                        <Input
                          id="categoryName"
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="e.g., 100% Glitchless"
                          required
                          className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-9 text-sm"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={addingCategory}
                        size="sm"
                        className="bg-gradient-to-r from-[#cba6f7] to-[#b4a0e2] hover:from-[#b4a0e2] hover:to-[#cba6f7] text-[hsl(240,21%,15%)] font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        <PlusCircle className="h-3 w-3" />
                        {addingCategory ? "Adding..." : "Add Category"}
                      </Button>
                    </form>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-3">Existing Categories</h3>
                    {loadingCategories ? (
                      <FadeIn>
                        <TableSkeleton rows={5} columns={3} />
                      </FadeIn>
                    ) : firestoreCategories.length === 0 ? (
                      <p className="text-[hsl(222,15%,60%)] text-center py-4 text-sm animate-fade-in">No categories found. Add your first category!</p>
                    ) : (
                      <FadeIn>
                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                          <Table>
                          <TableHeader>
                            <TableRow className="border-b border-[hsl(235,13%,30%)] hover:bg-transparent">
                              <TableHead className="py-2 px-3 text-left text-xs">Name</TableHead>
                              <TableHead className="py-2 px-3 text-left text-xs">SRC Category ID</TableHead>
                              <TableHead className="py-2 px-3 text-center text-xs">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {firestoreCategories.map((category, index) => {
                              const translatedName = getCategoryTranslation(category.id, category.name);
                              const hasTranslation = translatedName !== category.name;
                              return (
                                <TableRow key={category.id} className="border-b border-[hsl(235,13%,30%)] hover:bg-[hsl(235,19%,13%)] transition-all duration-200 hover:shadow-sm">
                                  <TableCell className="py-2 px-3 font-medium text-sm">
                                    {editingCategory?.id === category.id ? (
                                      <Input
                                        value={editingCategoryName}
                                        onChange={(e) => setEditingCategoryName(e.target.value)}
                                        className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-8 text-sm"
                                        autoFocus
                                      />
                                    ) : (
                                      <div className="flex flex-col gap-1">
                                        <span>{translatedName}</span>
                                        {hasTranslation && (
                                          <span className="text-xs text-[hsl(222,15%,60%)]">Original: {category.name}</span>
                                        )}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2 px-3 text-sm">
                                    {editingCategory?.id === category.id ? (
                                      <Input
                                        value={editingCategorySrcId}
                                        onChange={(e) => setEditingCategorySrcId(e.target.value)}
                                        placeholder="e.g., 9kj3k0x8"
                                        className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-8 text-sm"
                                      />
                                    ) : (
                                      <span className="text-[hsl(222,15%,60%)]">
                                        {(category as Category).srcCategoryId || "—"}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2 px-3 text-center space-x-1">
                                    {editingCategory?.id === category.id ? (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={handleSaveEditCategory}
                                          disabled={updatingCategory}
                                          className="text-green-500 hover:bg-green-900/20"
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={handleCancelEditCategory}
                                          disabled={updatingCategory}
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
                                          onClick={() => handleMoveCategoryUp(category.id)}
                                          disabled={reorderingCategory === category.id || index === 0}
                                          className="text-purple-500 hover:bg-purple-900/20 disabled:opacity-50 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                          title="Move up"
                                        >
                                          <ArrowUp className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleMoveCategoryDown(category.id)}
                                          disabled={reorderingCategory === category.id || index === firestoreCategories.length - 1}
                                          className="text-purple-500 hover:bg-purple-900/20 disabled:opacity-50 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                          title="Move down"
                                        >
                                          <ArrowDown className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleStartEditCategory(category)}
                                          className="text-blue-500 hover:bg-blue-900/20 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                        >
                                          <Edit2 className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => onStartEditTranslation('category', category.id, category.name)}
                                          className="text-[#94e2d5] hover:bg-teal-900/20 h-7 w-7 p-0 transition-all duration-200 hover:scale-110"
                                          title="Manage translations"
                                        >
                                          <Languages className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteCategory(category.id)}
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
                      </FadeIn>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

