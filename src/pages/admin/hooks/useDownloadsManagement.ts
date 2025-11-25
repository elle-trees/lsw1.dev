/**
 * Hook for managing downloads in the admin panel
 */

import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useUploadThing } from "@/lib/uploadthing";
import { DownloadEntry } from "@/types/database";

export function useDownloadsManagement() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { startUpload, isUploading } = useUploadThing("downloadFile");
  const { startUpload: startImageUpload, isUploading: isUploadingImage } = useUploadThing("profilePicture");

  // Download entries state
  const [downloadEntries, setDownloadEntries] = useState<DownloadEntry[]>([]);
  const [newDownload, setNewDownload] = useState({
    name: "",
    description: "",
    url: "",
    fileUrl: "",
    fileName: "",
    category: "",
    useFileUpload: false,
  });
  const [addingDownload, setAddingDownload] = useState(false);
  const [reorderingDownload, setReorderingDownload] = useState<string | null>(null);
  const [editingDownload, setEditingDownload] = useState<DownloadEntry | null>(null);
  const [editingDownloadForm, setEditingDownloadForm] = useState<{ description: string; imageUrl?: string }>({ description: "" });
  const [savingDownload, setSavingDownload] = useState(false);

  // Download categories state
  const [downloadCategories, setDownloadCategories] = useState<{ id: string; name: string }[]>([]);
  const [newDownloadCategoryName, setNewDownloadCategoryName] = useState("");
  const [editingDownloadCategory, setEditingDownloadCategory] = useState<{ id: string; name: string } | null>(null);
  const [editingDownloadCategoryName, setEditingDownloadCategoryName] = useState("");
  const [addingDownloadCategory, setAddingDownloadCategory] = useState(false);
  const [updatingDownloadCategory, setUpdatingDownloadCategory] = useState(false);

  const fetchDownloadEntries = useCallback(async () => {
    try {
      const { getDownloadEntriesFirestore } = await import("@/lib/data/firestore/downloads");
      const data = await getDownloadEntriesFirestore();
      setDownloadEntries(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load download entries.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchDownloadCategories = useCallback(async () => {
    try {
      const { getDownloadCategoriesFirestore } = await import("@/lib/data/firestore/downloads");
      const categoriesData = await getDownloadCategoriesFirestore();
      setDownloadCategories(categoriesData);
      // Update newDownload category if empty
      setNewDownload(prev => {
        if (categoriesData.length > 0 && !prev.category) {
          return { ...prev, category: categoriesData[0].id };
        }
        return prev;
      });
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to load download categories.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchDownloadEntries();
    fetchDownloadCategories();
  }, [fetchDownloadEntries, fetchDownloadCategories]);

  const handleAddDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in as an admin to add downloads.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newDownload.name || !newDownload.description || !newDownload.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in name, description, and category.",
        variant: "destructive",
      });
      return;
    }
    
    if (newDownload.useFileUpload && !newDownload.fileUrl) {
      toast({
        title: "Missing File",
        description: "Please upload a file or provide a URL.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newDownload.useFileUpload && !newDownload.url) {
      toast({
        title: "Missing URL",
        description: "Please provide a URL or upload a file.",
        variant: "destructive",
      });
      return;
    }

    setAddingDownload(true);
    try {
      const downloadEntry: Omit<DownloadEntry, 'id' | 'dateAdded' | 'order'> = {
        name: newDownload.name,
        description: newDownload.description,
        category: newDownload.category,
        addedBy: currentUser.uid,
        ...(newDownload.useFileUpload && newDownload.fileUrl
          ? { fileUrl: newDownload.fileUrl } 
          : newDownload.url
          ? { url: newDownload.url }
          : {}
        ),
      };
      
      const { addDownloadEntryFirestore } = await import("@/lib/data/firestore/downloads");
      const success = await addDownloadEntryFirestore(downloadEntry);
      if (success) {
        toast({
          title: "Download Added",
          description: "New download entry has been added.",
        });
        setNewDownload({ 
          name: "", 
          description: "", 
          url: "", 
          fileUrl: "",
          fileName: "",
          category: downloadCategories[0]?.id || "",
          useFileUpload: false,
        });
        await fetchDownloadEntries();
      } else {
        throw new Error("Failed to add download entry.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add download.",
        variant: "destructive",
      });
    } finally {
      setAddingDownload(false);
    }
  };

  const handleEditDownload = (download: DownloadEntry) => {
    setEditingDownload(download);
    setEditingDownloadForm({
      description: download.description,
      imageUrl: download.imageUrl || "",
    });
  };

  const handleSaveDownload = async () => {
    if (!editingDownload) return;
    if (!editingDownloadForm.description.trim()) {
      toast({
        title: "Missing Description",
        description: "Please provide a description.",
        variant: "destructive",
      });
      return;
    }

    setSavingDownload(true);
    try {
      const { updateDownloadEntryFirestore } = await import("@/lib/data/firestore/downloads");
      const updates: Partial<DownloadEntry> & { imageUrl?: string | undefined } = {
        description: editingDownloadForm.description,
      };
      if (editingDownloadForm.imageUrl && editingDownloadForm.imageUrl.trim()) {
        updates.imageUrl = editingDownloadForm.imageUrl;
      } else if (editingDownload.imageUrl) {
        updates.imageUrl = undefined;
      }
      const success = await updateDownloadEntryFirestore(editingDownload.id, updates);
      if (success) {
        toast({
          title: "Download Updated",
          description: "The download entry has been updated.",
        });
        setEditingDownload(null);
        setEditingDownloadForm({ description: "" });
        await fetchDownloadEntries();
      } else {
        throw new Error("Failed to update download entry.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update download.",
        variant: "destructive",
      });
    } finally {
      setSavingDownload(false);
    }
  };

  const handleDeleteDownload = async (downloadId: string) => {
    if (!window.confirm("Are you sure you want to delete this download entry?")) {
      return;
    }
    try {
      const { deleteDownloadEntryFirestore } = await import("@/lib/data/firestore/downloads");
      const success = await deleteDownloadEntryFirestore(downloadId);
      if (success) {
        toast({
          title: "Download Deleted",
          description: "The download entry has been removed.",
        });
        await fetchDownloadEntries();
      } else {
        throw new Error("Failed to delete download entry.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete download.",
        variant: "destructive",
      });
    }
  };

  const handleMoveDownloadUp = async (downloadId: string) => {
    if (reorderingDownload) return;
    setReorderingDownload(downloadId);
    try {
      const { moveDownloadUpFirestore } = await import("@/lib/data/firestore/downloads");
      const success = await moveDownloadUpFirestore(downloadId);
      if (success) {
        await fetchDownloadEntries();
      } else {
        toast({
          title: "Error",
          description: "Failed to move download up. It may already be at the top.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reorder download.",
        variant: "destructive",
      });
    } finally {
      setReorderingDownload(null);
    }
  };

  const handleMoveDownloadDown = async (downloadId: string) => {
    if (reorderingDownload) return;
    setReorderingDownload(downloadId);
    try {
      const { moveDownloadDownFirestore } = await import("@/lib/data/firestore/downloads");
      const success = await moveDownloadDownFirestore(downloadId);
      if (success) {
        await fetchDownloadEntries();
      } else {
        toast({
          title: "Error",
          description: "Failed to move download down. It may already be at the bottom.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reorder download.",
        variant: "destructive",
      });
    } finally {
      setReorderingDownload(null);
    }
  };

  const handleAddDownloadCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDownloadCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    setAddingDownloadCategory(true);
    try {
      const { addDownloadCategoryFirestore } = await import("@/lib/data/firestore/downloads");
      const result = await addDownloadCategoryFirestore(newDownloadCategoryName.trim());
      if (result) {
        toast({
          title: "Category Added",
          description: "New download category has been added.",
        });
        setNewDownloadCategoryName("");
        await fetchDownloadCategories();
      } else {
        throw new Error("Failed to add category.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add download category.",
        variant: "destructive",
      });
    } finally {
      setAddingDownloadCategory(false);
    }
  };

  const handleStartEditDownloadCategory = (category: { id: string; name: string }) => {
    setEditingDownloadCategory(category);
    setEditingDownloadCategoryName(category.name);
  };

  const handleCancelEditDownloadCategory = () => {
    setEditingDownloadCategory(null);
    setEditingDownloadCategoryName("");
  };

  const handleSaveEditDownloadCategory = async () => {
    if (!editingDownloadCategory || !editingDownloadCategoryName.trim()) {
      return;
    }
    
    setUpdatingDownloadCategory(true);
    try {
      const { updateDownloadCategoryFirestore } = await import("@/lib/data/firestore/downloads");
      const success = await updateDownloadCategoryFirestore(editingDownloadCategory.id, editingDownloadCategoryName.trim());
      if (success) {
        toast({
          title: "Category Updated",
          description: "Download category has been updated.",
        });
        setEditingDownloadCategory(null);
        setEditingDownloadCategoryName("");
        await fetchDownloadCategories();
      } else {
        throw new Error("Failed to update category.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update download category.",
        variant: "destructive",
      });
    } finally {
      setUpdatingDownloadCategory(false);
    }
  };

  const handleDeleteDownloadCategory = async (categoryId: string) => {
    const downloadsUsingCategory = downloadEntries.filter(d => d.category === categoryId);
    if (downloadsUsingCategory.length > 0) {
      toast({
        title: "Cannot Delete Category",
        description: `This category is being used by ${downloadsUsingCategory.length} download(s). Please reassign or delete those downloads first.`,
        variant: "destructive",
      });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this download category?")) {
      return;
    }
    try {
      const { deleteDownloadCategoryFirestore } = await import("@/lib/data/firestore/downloads");
      const success = await deleteDownloadCategoryFirestore(categoryId);
      if (success) {
        toast({
          title: "Category Deleted",
          description: "Download category has been removed.",
        });
        await fetchDownloadCategories();
      } else {
        throw new Error("Failed to delete category.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete download category.",
        variant: "destructive",
      });
    }
  };

  return {
    // Download entries
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
    // Download categories
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
    // File upload
    startUpload,
    isUploading,
    startImageUpload,
    isUploadingImage,
    // Refresh functions
    fetchDownloadEntries,
    fetchDownloadCategories,
  };
}

