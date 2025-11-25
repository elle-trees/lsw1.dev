/**
 * Downloads Management Tab Component
 * Handles download categories and entries with file upload support
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FolderTree, PlusCircle, Edit2, Trash2, Languages, Save, X, Download, ExternalLink, ArrowUp, ArrowDown, Upload, CheckCircle } from "lucide-react";
import { useDownloadsManagement } from "../hooks/useDownloadsManagement";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

interface DownloadsTabProps {
  selectedTranslationLanguage: string;
  onTranslationLanguageChange: (lang: string) => void;
  adminTranslations: Record<string, Record<string, string>>;
  onStartEditTranslation: (type: 'category', id: string, originalName: string, language: string, value: string) => void;
}

export function DownloadsTab({ 
  selectedTranslationLanguage, 
  onTranslationLanguageChange,
  adminTranslations,
  onStartEditTranslation 
}: DownloadsTabProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const {
    downloadEntries,
    newDownload,
    setNewDownload,
    addingDownload,
    reorderingDownload,
    editingDownload,
    setEditingDownload,
    editingDownloadForm,
    setEditingDownloadForm,
    savingDownload,
    handleAddDownload,
    handleEditDownload,
    handleSaveDownload,
    handleDeleteDownload,
    handleMoveDownloadUp,
    handleMoveDownloadDown,
    downloadCategories,
    newDownloadCategoryName,
    setNewDownloadCategoryName,
    editingDownloadCategory,
    editingDownloadCategoryName,
    setEditingDownloadCategoryName,
    addingDownloadCategory,
    updatingDownloadCategory,
    handleAddDownloadCategory,
    handleStartEditDownloadCategory,
    handleCancelEditDownloadCategory,
    handleSaveEditDownloadCategory,
    handleDeleteDownloadCategory,
    startUpload,
    isUploading,
    startImageUpload,
    isUploadingImage,
  } = useDownloadsManagement();

  const handleFileUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      setNewDownload((prev) => ({
        ...prev,
        fileName: file.name,
        useFileUpload: true,
      }));
      
      try {
        const uploadedFiles = await startUpload([file]);
        let fileUrl: string | null = null;
        
        if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
          const firstFile = uploadedFiles[0] as any;
          fileUrl = firstFile?.url || firstFile?.serverData?.url || null;
        } else if (uploadedFiles && typeof uploadedFiles === 'object') {
          fileUrl = (uploadedFiles as any).url || 
                   (uploadedFiles as any).fileUrl || 
                   (uploadedFiles as any)[0]?.url ||
                   null;
        }
        
        if (fileUrl) {
          setNewDownload((prev) => ({
            ...prev, 
            fileUrl: fileUrl!,
            fileName: file.name,
            useFileUpload: true
          }));
          toast({
            title: "File Uploaded",
            description: "File uploaded successfully. You can now click 'Add Download' to save it.",
          });
        } else {
          throw new Error("Upload completed but no file URL found in response.");
        }
      } catch (error: any) {
        toast({
          title: "Upload Failed",
          description: error.message || "Failed to upload file.",
          variant: "destructive",
        });
      }
    };
    input.click();
  };

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const uploadedFiles = await startImageUpload([file]);
        if (uploadedFiles && uploadedFiles.length > 0) {
          const fileUrl = uploadedFiles[0]?.url;
          if (fileUrl) {
            setEditingDownloadForm({ ...editingDownloadForm, imageUrl: fileUrl });
            toast({
              title: "Image Uploaded",
              description: "Image uploaded successfully.",
            });
          }
        }
      } catch (error: any) {
        toast({
          title: "Upload Failed",
          description: error.message || "Failed to upload image.",
          variant: "destructive",
        });
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Download Categories Management */}
      <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] via-[hsl(240,21%,14%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)]">
          <CardTitle className="flex items-center gap-2 text-xl text-[#f2cdcd]">
            <FolderTree className="h-5 w-5" />
            <span>Download Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-[hsl(222,15%,60%)]" />
              <Label htmlFor="translation-language-downloads" className="text-sm">Translation Language:</Label>
              <Select
                value={selectedTranslationLanguage}
                onValueChange={onTranslationLanguageChange}
              >
                <SelectTrigger id="translation-language-downloads" className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] h-8 text-sm w-32">
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
          <h3 className="text-xl font-semibold mb-4">Add New Category</h3>
          <form onSubmit={handleAddDownloadCategory} className="space-y-4 mb-8">
            <div className="flex gap-4">
              <Input
                type="text"
                value={newDownloadCategoryName}
                onChange={(e) => setNewDownloadCategoryName(e.target.value)}
                placeholder="Category name"
                required
                className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
              />
              <Button 
                type="submit" 
                disabled={addingDownloadCategory}
                className="bg-gradient-to-r from-[#cba6f7] to-[#b4a0e2] hover:from-[#b4a0e2] hover:to-[#cba6f7] text-[hsl(240,21%,15%)] font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <PlusCircle className="h-4 w-4" />
                {addingDownloadCategory ? "Adding..." : "Add Category"}
              </Button>
            </div>
          </form>

          <h3 className="text-xl font-semibold mb-4">Existing Categories</h3>
          {downloadCategories.length === 0 ? (
            <p className="text-[hsl(222,15%,60%)] text-center py-4">No categories added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[hsl(235,13%,30%)] hover:bg-transparent">
                    <TableHead className="py-3 px-4 text-left">Name</TableHead>
                    <TableHead className="py-3 px-4 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {downloadCategories.map((category) => {
                    const translationKey = `entities.downloadCategory.${category.id}`;
                    const translatedName = adminTranslations[selectedTranslationLanguage]?.[translationKey] || 
                                           i18n.t(translationKey, { lng: selectedTranslationLanguage });
                    const displayName = translatedName && translatedName !== translationKey ? translatedName : category.name;
                    const hasTranslation = translatedName && translatedName !== translationKey;
                    return (
                      <TableRow key={category.id} className="border-b border-[hsl(235,13%,30%)] hover:bg-[hsl(235,19%,13%)] transition-all duration-200 hover:shadow-sm">
                        <TableCell className="py-3 px-4">
                          {editingDownloadCategory?.id === category.id ? (
                            <Input
                              type="text"
                              value={editingDownloadCategoryName}
                              onChange={(e) => setEditingDownloadCategoryName(e.target.value)}
                              className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveEditDownloadCategory();
                                } else if (e.key === 'Escape') {
                                  handleCancelEditDownloadCategory();
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">{displayName}</span>
                              {hasTranslation && (
                                <span className="text-xs text-[hsl(222,15%,60%)]">Original: {category.name}</span>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {editingDownloadCategory?.id === category.id ? (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={handleSaveEditDownloadCategory}
                                  disabled={updatingDownloadCategory}
                                  className="text-green-500 hover:bg-green-900/20 transition-all duration-200 hover:scale-110"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={handleCancelEditDownloadCategory}
                                  disabled={updatingDownloadCategory}
                                  className="text-[hsl(222,15%,60%)] hover:bg-[hsl(235,19%,13%)] transition-all duration-200 hover:scale-110"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleStartEditDownloadCategory(category)}
                                  className="text-[#cba6f7] hover:bg-purple-900/20 transition-all duration-200 hover:scale-110"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => {
                                    const translationKey = `entities.downloadCategory.${category.id}`;
                                    const currentTranslation = adminTranslations[selectedTranslationLanguage]?.[translationKey] || 
                                                               i18n.t(translationKey, { lng: selectedTranslationLanguage });
                                    const value = currentTranslation && currentTranslation !== translationKey ? currentTranslation : '';
                                    onStartEditTranslation('category', `downloadCategory.${category.id}`, category.name, selectedTranslationLanguage, value);
                                  }}
                                  className="text-[#94e2d5] hover:bg-teal-900/20 transition-all duration-200 hover:scale-110"
                                  title="Manage translations"
                                >
                                  <Languages className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteDownloadCategory(category.id)}
                                  className="text-red-500 hover:bg-red-900/20 transition-all duration-200 hover:scale-110"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
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

      {/* Downloads Management */}
      <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] via-[hsl(240,21%,14%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)]">
          <CardTitle className="flex items-center gap-2 text-xl text-[#f2cdcd]">
            <span>Manage Downloads</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-4">Add New Download</h3>
          <form onSubmit={handleAddDownload} className="space-y-4 mb-8">
            <div>
              <Label htmlFor="downloadName">Name</Label>
              <Input
                id="downloadName"
                type="text"
                value={newDownload.name}
                onChange={(e) => setNewDownload({ ...newDownload, name: e.target.value })}
                required
                className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
              />
            </div>
            <div>
              <Label htmlFor="downloadDescription">Description</Label>
              <Textarea
                id="downloadDescription"
                value={newDownload.description}
                onChange={(e) => setNewDownload({ ...newDownload, description: e.target.value })}
                required
                className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                rows={3}
              />
            </div>
            <div>
              <Label>Upload Type</Label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!newDownload.useFileUpload}
                    onChange={() => setNewDownload((prev) => ({ ...prev, useFileUpload: false, fileUrl: "", fileName: "" }))}
                    className="w-4 h-4"
                  />
                  <span>External URL</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={newDownload.useFileUpload}
                    onChange={() => setNewDownload((prev) => ({ ...prev, useFileUpload: true, url: "" }))}
                    className="w-4 h-4"
                  />
                  <span>Upload File</span>
                </label>
              </div>
              {newDownload.useFileUpload ? (
                <div className="space-y-2">
                  <Label htmlFor="fileUpload">File</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        onClick={handleFileUpload}
                        disabled={isUploading}
                        className="bg-[#cba6f7] hover:bg-[#b4a0e2] text-[hsl(240,21%,15%)] font-bold flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {isUploading ? "Uploading..." : "Choose File"}
                      </Button>
                      {newDownload.fileName && (
                        <span className="text-sm text-[hsl(222,15%,70%)] flex items-center gap-2">
                          {newDownload.fileUrl ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="font-medium">{newDownload.fileName}</span>
                              <span className="text-xs text-[hsl(222,15%,60%)]">(uploaded)</span>
                            </>
                          ) : (
                            <>
                              <span className="font-medium">{newDownload.fileName}</span>
                              <span className="text-xs text-[hsl(222,15%,60%)]">(selected)</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  {newDownload.fileUrl && (
                    <p className="text-xs text-[hsl(222,15%,60%)] mt-2 break-all">
                      File URL: {newDownload.fileUrl}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <Label htmlFor="downloadUrl">URL</Label>
                  <Input
                    id="downloadUrl"
                    type="url"
                    value={newDownload.url}
                    onChange={(e) => setNewDownload({ ...newDownload, url: e.target.value })}
                    required={!newDownload.useFileUpload}
                    className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="downloadCategory">Category</Label>
              <Select value={newDownload.category} onValueChange={(value) => setNewDownload({ ...newDownload, category: value })}>
                <SelectTrigger className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {downloadCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="submit" 
              disabled={addingDownload}
              className="bg-gradient-to-r from-[#cba6f7] to-[#b4a0e2] hover:from-[#b4a0e2] hover:to-[#cba6f7] text-[hsl(240,21%,15%)] font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <PlusCircle className="h-4 w-4" />
              {addingDownload ? "Adding..." : "Add Download"}
            </Button>
          </form>

          <h3 className="text-xl font-semibold mb-4">Existing Downloads</h3>
          {downloadEntries.length === 0 ? (
            <p className="text-[hsl(222,15%,60%)] text-center py-4">No download entries added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[hsl(235,13%,30%)] hover:bg-transparent">
                    <TableHead className="py-3 px-4 text-left">Order</TableHead>
                    <TableHead className="py-3 px-4 text-left">Name</TableHead>
                    <TableHead className="py-3 px-4 text-left">Category</TableHead>
                    <TableHead className="py-3 px-4 text-left">URL</TableHead>
                    <TableHead className="py-3 px-4 text-left">Added By</TableHead>
                    <TableHead className="py-3 px-4 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {downloadEntries.map((entry, index) => (
                    <TableRow key={entry.id} className="border-b border-[hsl(235,13%,30%)] hover:bg-[hsl(235,19%,13%)] transition-all duration-200 hover:shadow-sm">
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveDownloadUp(entry.id)}
                            disabled={reorderingDownload !== null || index === 0}
                            className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110 hover:bg-purple-900/20 text-purple-500"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveDownloadDown(entry.id)}
                            disabled={reorderingDownload !== null || index === downloadEntries.length - 1}
                            className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110 hover:bg-purple-900/20 text-purple-500"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 font-medium">{entry.name}</TableCell>
                      <TableCell className="py-3 px-4">{downloadCategories.find(c => c.id === entry.category)?.name || entry.category}</TableCell>
                      <TableCell className="py-3 px-4">
                        {entry.fileUrl ? (
                          <a href={entry.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[#cba6f7] hover:underline flex items-center gap-1">
                            File <Download className="h-4 w-4" />
                          </a>
                        ) : entry.url ? (
                          <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-[#cba6f7] hover:underline flex items-center gap-1">
                            Link <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-[hsl(222,15%,60%)]">No link</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-[hsl(222,15%,60%)]">{entry.addedBy}</TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditDownload(entry)}
                            className="text-[#cba6f7] hover:bg-purple-900/20 transition-all duration-200 hover:scale-110"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteDownload(entry.id)}
                            className="text-red-500 hover:bg-red-900/20 transition-all duration-200 hover:scale-110"
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
          )}
        </CardContent>
      </Card>

      {/* Edit Download Dialog */}
      <Dialog open={!!editingDownload} onOpenChange={(open) => {
        if (!open) {
          if (!savingDownload) {
            setEditingDownload(null);
            setEditingDownloadForm({ description: "" });
          }
        }
      }}>
        <DialogContent className="bg-[hsl(240,21%,16%)] border-[hsl(235,13%,30%)] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#f2cdcd]">
              Edit Download: {editingDownload?.name}
            </DialogTitle>
          </DialogHeader>
          {editingDownload && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-downloadDescription">Description</Label>
                <Textarea
                  id="edit-downloadDescription"
                  value={editingDownloadForm.description}
                  onChange={(e) => setEditingDownloadForm({ ...editingDownloadForm, description: e.target.value })}
                  required
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="edit-downloadImage">Image</Label>
                <div className="space-y-2">
                  {editingDownloadForm.imageUrl && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[hsl(235,13%,30%)]">
                      <img 
                        src={editingDownloadForm.imageUrl} 
                        alt={editingDownload.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleImageUpload}
                      disabled={isUploadingImage}
                      className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] hover:bg-[hsl(234,14%,29%)]"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploadingImage ? "Uploading..." : editingDownloadForm.imageUrl ? "Change Image" : "Upload Image"}
                    </Button>
                    {editingDownloadForm.imageUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingDownloadForm({ ...editingDownloadForm, imageUrl: "" })}
                        className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] hover:bg-[hsl(234,14%,29%)] text-red-500"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove Image
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingDownload(null);
                setEditingDownloadForm({ description: "" });
              }}
              disabled={savingDownload}
              className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] hover:bg-[hsl(234,14%,29%)]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDownload}
              disabled={savingDownload}
              className="bg-gradient-to-r from-[#cba6f7] to-[#b4a0e2] hover:from-[#b4a0e2] hover:to-[#cba6f7] text-[hsl(240,21%,15%)] font-bold"
            >
              {savingDownload ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

