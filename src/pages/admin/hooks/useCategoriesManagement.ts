/**
 * Hook for managing categories and subcategories in the admin panel
 */

import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { Category, Subcategory } from "@/types/database";
import { fetchCategoryVariables } from "@/lib/speedruncom";
import { setAdminTranslation } from "@/lib/data/firestore/translations";
import i18n from "@/lib/i18n";

export function useCategoriesManagement() {
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const [firestoreCategories, setFirestoreCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryLeaderboardType, setCategoryLeaderboardType] = useState<'regular' | 'individual-level' | 'community-golds'>('regular');
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCategorySrcId, setEditingCategorySrcId] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [updatingCategory, setUpdatingCategory] = useState(false);
  const [reorderingCategory, setReorderingCategory] = useState<string | null>(null);
  
  // Subcategory management state
  const [categoryManagementTab, setCategoryManagementTab] = useState<'categories' | 'subcategories'>('categories');
  const [selectedCategoryForSubcategories, setSelectedCategoryForSubcategories] = useState<Category | null>(null);
  const [srcVariables, setSrcVariables] = useState<Array<{ id: string; name: string; values: { values: Record<string, { label: string }> } }>>([]);
  const [loadingSRCVariables, setLoadingSRCVariables] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [editingSubcategoryName, setEditingSubcategoryName] = useState("");
  const [addingSubcategory, setAddingSubcategory] = useState(false);
  const [updatingSubcategory, setUpdatingSubcategory] = useState(false);
  const [reorderingSubcategory, setReorderingSubcategory] = useState<string | null>(null);

  const fetchCategories = useCallback(async (type: 'regular' | 'individual-level' | 'community-golds') => {
    setLoadingCategories(true);
    try {
      const { getCategoriesFirestore } = await import("@/lib/data/firestore/categories");
      const categoriesData = await getCategoriesFirestore(type);
      setFirestoreCategories(categoriesData);
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to load categories.",
        variant: "destructive",
      });
    } finally {
      setLoadingCategories(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories(categoryLeaderboardType);
  }, [categoryLeaderboardType, fetchCategories]);

  const fetchSRCVariablesForCategory = useCallback(async (category: Category) => {
    if (!category.srcCategoryId) {
      setSrcVariables([]);
      return;
    }
    
    setLoadingSRCVariables(true);
    try {
      const variables = await fetchCategoryVariables(category.srcCategoryId);
      if (variables?.data) {
        setSrcVariables(variables.data);
      } else {
        setSrcVariables([]);
      }
    } catch (_error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch SRC variables. Make sure the category has a linked SRC category ID.",
        variant: "destructive",
      });
      setSrcVariables([]);
    } finally {
      setLoadingSRCVariables(false);
    }
  }, [toast]);

  // Fetch SRC variables when category is selected or categories are refreshed (only for regular categories)
  useEffect(() => {
    if (selectedCategoryForSubcategories && categoryLeaderboardType === 'regular') {
      const latestCategory = firestoreCategories.find(c => c.id === selectedCategoryForSubcategories.id) as Category | undefined;
      if (latestCategory) {
        if (latestCategory.srcCategoryId !== selectedCategoryForSubcategories.srcCategoryId) {
          setSelectedCategoryForSubcategories(latestCategory);
        }
        fetchSRCVariablesForCategory(latestCategory);
      } else {
        fetchSRCVariablesForCategory(selectedCategoryForSubcategories);
      }
    } else {
      setSrcVariables([]);
    }
  }, [selectedCategoryForSubcategories, categoryLeaderboardType, firestoreCategories, fetchSRCVariablesForCategory]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    setAddingCategory(true);
    try {
      const { addCategoryFirestore } = await import("@/lib/data/firestore/categories");
      const result = await addCategoryFirestore(newCategoryName.trim(), categoryLeaderboardType);
      if (result) {
        toast({
          title: "Category Added",
          description: "New category has been added.",
        });
        setNewCategoryName("");
        await fetchCategories(categoryLeaderboardType);
      } else {
        throw new Error("Category with this name already exists.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add category.",
        variant: "destructive",
      });
    } finally {
      setAddingCategory(false);
    }
  };
  
  const handleStartEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditingCategoryName(category.name);
    setEditingCategorySrcId(category.srcCategoryId || "");
  };
  
  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditingCategoryName("");
    setEditingCategorySrcId("");
  };
  
  const handleSaveEditCategory = async () => {
    if (!editingCategory || !editingCategoryName.trim()) {
      return;
    }
    
    setUpdatingCategory(true);
    try {
      const currentCategory = firestoreCategories.find(c => c.id === editingCategory.id) as Category | undefined;
      const subcategories = currentCategory?.subcategories || [];
      const srcCategoryId = editingCategorySrcId.trim() || null;
      
      const { updateCategoryFirestore } = await import("@/lib/data/firestore/categories");
      const success = await updateCategoryFirestore(editingCategory.id, editingCategoryName.trim(), subcategories, srcCategoryId);
      if (success) {
        toast({
          title: "Category Updated",
          description: "Category has been updated.",
        });
        
        if (srcCategoryId && selectedCategoryForSubcategories?.id === editingCategory.id) {
          const updatedCategory = { ...editingCategory, srcCategoryId };
          await fetchSRCVariablesForCategory(updatedCategory);
        }
        
        setEditingCategory(null);
        setEditingCategoryName("");
        setEditingCategorySrcId("");
        await fetchCategories(categoryLeaderboardType);
      } else {
        throw new Error("Another category with this name already exists.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update category.",
        variant: "destructive",
      });
    } finally {
      setUpdatingCategory(false);
    }
  };
  
  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this category? This may affect existing runs.")) {
      return;
    }
    try {
      const { deleteCategoryFirestore } = await import("@/lib/data/firestore/categories");
      const success = await deleteCategoryFirestore(categoryId);
      if (success) {
        toast({
          title: "Category Deleted",
          description: "Category has been removed.",
        });
        await fetchCategories(categoryLeaderboardType);
      } else {
        throw new Error("Failed to delete category. It may not exist or you may not have permission.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category.",
        variant: "destructive",
      });
    }
  };

  const handleMoveCategoryUp = async (categoryId: string) => {
    setReorderingCategory(categoryId);
    try {
      const { moveCategoryUpFirestore } = await import("@/lib/data/firestore/categories");
      const success = await moveCategoryUpFirestore(categoryId);
      if (success) {
        await fetchCategories(categoryLeaderboardType);
      } else {
        toast({
          title: "Cannot Move",
          description: "Category is already at the top.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move category.",
        variant: "destructive",
      });
    } finally {
      setReorderingCategory(null);
    }
  };

  const handleMoveCategoryDown = async (categoryId: string) => {
    setReorderingCategory(categoryId);
    try {
      const { moveCategoryDownFirestore } = await import("@/lib/data/firestore/categories");
      const success = await moveCategoryDownFirestore(categoryId);
      if (success) {
        await fetchCategories(categoryLeaderboardType);
      } else {
        toast({
          title: "Cannot Move",
          description: "Category is already at the bottom.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move category.",
        variant: "destructive",
      });
    } finally {
      setReorderingCategory(null);
    }
  };

  const handleAddSubcategory = async () => {
    if (!selectedCategoryForSubcategories || !newSubcategoryName.trim()) {
      toast({
        title: "Error",
        description: "Please select a category and enter a subcategory name.",
        variant: "destructive",
      });
      return;
    }
    
    setAddingSubcategory(true);
    try {
      const currentCategory = firestoreCategories.find(c => c.id === selectedCategoryForSubcategories.id) as Category | undefined;
      const existingSubcategories = currentCategory?.subcategories || [];
      
      if (existingSubcategories.some(s => s.name.toLowerCase().trim() === newSubcategoryName.toLowerCase().trim())) {
        throw new Error("A subcategory with this name already exists.");
      }
      
      const newId = `subcat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const maxOrder = existingSubcategories.reduce((max, s) => Math.max(max, s.order || 0), 0);
      
      const newSubcategory: Subcategory = {
        id: newId,
        name: newSubcategoryName.trim(),
        order: maxOrder + 1,
      };
      
      const updatedSubcategories = [...existingSubcategories, newSubcategory];
      const { updateCategoryFirestore } = await import("@/lib/data/firestore/categories");
      const success = await updateCategoryFirestore(selectedCategoryForSubcategories.id, selectedCategoryForSubcategories.name, updatedSubcategories);
      
      if (success) {
        toast({
          title: "Subcategory Added",
          description: "New subcategory has been added.",
        });
        setNewSubcategoryName("");
        await fetchCategories(categoryLeaderboardType);
        const { getCategoriesFirestore } = await import("@/lib/data/firestore/categories");
        const updated = await getCategoriesFirestore(categoryLeaderboardType);
        const refreshed = updated.find(c => c.id === selectedCategoryForSubcategories.id) as Category | undefined;
        if (refreshed) {
          setSelectedCategoryForSubcategories(refreshed);
        }
      } else {
        throw new Error("Failed to add subcategory.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add subcategory.",
        variant: "destructive",
      });
    } finally {
      setAddingSubcategory(false);
    }
  };

  const handleStartEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setEditingSubcategoryName(subcategory.name);
  };

  const handleCancelEditSubcategory = () => {
    setEditingSubcategory(null);
    setEditingSubcategoryName("");
  };

  const handleSaveEditSubcategory = async () => {
    if (!selectedCategoryForSubcategories || !editingSubcategory || !editingSubcategoryName.trim()) {
      return;
    }
    
    setUpdatingSubcategory(true);
    try {
      const currentCategory = firestoreCategories.find(c => c.id === selectedCategoryForSubcategories.id) as Category | undefined;
      const existingSubcategories = currentCategory?.subcategories || [];
      
      if (existingSubcategories.some(s => s.id !== editingSubcategory.id && s.name.toLowerCase().trim() === editingSubcategoryName.toLowerCase().trim())) {
        throw new Error("Another subcategory with this name already exists.");
      }
      
      const updatedSubcategories = existingSubcategories.map(s =>
        s.id === editingSubcategory.id
          ? { ...s, name: editingSubcategoryName.trim() }
          : s
      );
      
      const { updateCategoryFirestore } = await import("@/lib/data/firestore/categories");
      const success = await updateCategoryFirestore(selectedCategoryForSubcategories.id, selectedCategoryForSubcategories.name, updatedSubcategories);
      
      if (success) {
        toast({
          title: "Subcategory Updated",
          description: "Subcategory has been updated.",
        });
        setEditingSubcategory(null);
        setEditingSubcategoryName("");
        await fetchCategories(categoryLeaderboardType);
        const { getCategoriesFirestore } = await import("@/lib/data/firestore/categories");
        const updated = await getCategoriesFirestore(categoryLeaderboardType);
        const refreshed = updated.find(c => c.id === selectedCategoryForSubcategories.id) as Category | undefined;
        if (refreshed) {
          setSelectedCategoryForSubcategories(refreshed);
        }
      } else {
        throw new Error("Failed to update subcategory.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update subcategory.",
        variant: "destructive",
      });
    } finally {
      setUpdatingSubcategory(false);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (!selectedCategoryForSubcategories) return;
    
    if (!window.confirm("Are you sure you want to delete this subcategory? This may affect existing runs.")) {
      return;
    }
    
    try {
      const currentCategory = firestoreCategories.find(c => c.id === selectedCategoryForSubcategories.id) as Category | undefined;
      const existingSubcategories = currentCategory?.subcategories || [];
      const updatedSubcategories = existingSubcategories.filter(s => s.id !== subcategoryId);
      
      const { updateCategoryFirestore } = await import("@/lib/data/firestore/categories");
      const success = await updateCategoryFirestore(selectedCategoryForSubcategories.id, selectedCategoryForSubcategories.name, updatedSubcategories);
      
      if (success) {
        toast({
          title: "Subcategory Deleted",
          description: "Subcategory has been removed.",
        });
        await fetchCategories(categoryLeaderboardType);
        const { getCategoriesFirestore } = await import("@/lib/data/firestore/categories");
        const updated = await getCategoriesFirestore(categoryLeaderboardType);
        const refreshed = updated.find(c => c.id === selectedCategoryForSubcategories.id) as Category | undefined;
        if (refreshed) {
          setSelectedCategoryForSubcategories(refreshed);
        }
      } else {
        throw new Error("Failed to delete subcategory.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subcategory.",
        variant: "destructive",
      });
    }
  };

  const handleMoveSubcategoryUp = async (subcategoryId: string) => {
    if (!selectedCategoryForSubcategories) return;
    
    setReorderingSubcategory(subcategoryId);
    try {
      const currentCategory = firestoreCategories.find(c => c.id === selectedCategoryForSubcategories.id) as Category | undefined;
      const existingSubcategories = currentCategory?.subcategories || [];
      const index = existingSubcategories.findIndex(s => s.id === subcategoryId);
      
      if (index <= 0) {
        throw new Error("Subcategory is already at the top.");
      }
      
      const updatedSubcategories = [...existingSubcategories];
      const currentOrder = updatedSubcategories[index].order ?? index;
      const prevOrder = updatedSubcategories[index - 1].order ?? index - 1;
      
      updatedSubcategories[index].order = prevOrder;
      updatedSubcategories[index - 1].order = currentOrder;
      
      const { updateCategoryFirestore } = await import("@/lib/data/firestore/categories");
      const success = await updateCategoryFirestore(selectedCategoryForSubcategories.id, selectedCategoryForSubcategories.name, updatedSubcategories);
      
      if (success) {
        await fetchCategories(categoryLeaderboardType);
        const { getCategoriesFirestore } = await import("@/lib/data/firestore/categories");
        const updated = await getCategoriesFirestore(categoryLeaderboardType);
        const refreshed = updated.find(c => c.id === selectedCategoryForSubcategories.id) as Category | undefined;
        if (refreshed) {
          setSelectedCategoryForSubcategories(refreshed);
        }
      } else {
        throw new Error("Failed to reorder subcategory.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to move subcategory.",
        variant: "destructive",
      });
    } finally {
      setReorderingSubcategory(null);
    }
  };

  const handleMoveSubcategoryDown = async (subcategoryId: string) => {
    if (!selectedCategoryForSubcategories) return;
    
    setReorderingSubcategory(subcategoryId);
    try {
      const currentCategory = firestoreCategories.find(c => c.id === selectedCategoryForSubcategories.id) as Category | undefined;
      const existingSubcategories = currentCategory?.subcategories || [];
      const index = existingSubcategories.findIndex(s => s.id === subcategoryId);
      
      if (index < 0 || index >= existingSubcategories.length - 1) {
        throw new Error("Subcategory is already at the bottom.");
      }
      
      const updatedSubcategories = [...existingSubcategories];
      const currentOrder = updatedSubcategories[index].order ?? index;
      const nextOrder = updatedSubcategories[index + 1].order ?? index + 1;
      
      updatedSubcategories[index].order = nextOrder;
      updatedSubcategories[index + 1].order = currentOrder;
      
      const { updateCategoryFirestore } = await import("@/lib/data/firestore/categories");
      const success = await updateCategoryFirestore(selectedCategoryForSubcategories.id, selectedCategoryForSubcategories.name, updatedSubcategories);
      
      if (success) {
        await fetchCategories(categoryLeaderboardType);
        const { getCategoriesFirestore } = await import("@/lib/data/firestore/categories");
        const updated = await getCategoriesFirestore(categoryLeaderboardType);
        const refreshed = updated.find(c => c.id === selectedCategoryForSubcategories.id) as Category | undefined;
        if (refreshed) {
          setSelectedCategoryForSubcategories(refreshed);
        }
      } else {
        throw new Error("Failed to reorder subcategory.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to move subcategory.",
        variant: "destructive",
      });
    } finally {
      setReorderingSubcategory(null);
    }
  };

  const handleSetSubcategoryVariable = async (variableName: string | null) => {
    if (!selectedCategoryForSubcategories) return;
    
    setUpdatingSubcategory(true);
    try {
      const { updateCategoryFirestore } = await import("@/lib/data/firestore/categories");
      const success = await updateCategoryFirestore(
        selectedCategoryForSubcategories.id,
        selectedCategoryForSubcategories.name,
        selectedCategoryForSubcategories.subcategories,
        selectedCategoryForSubcategories.srcCategoryId,
        variableName
      );
      
      if (success) {
        toast({
          title: "Variable Selected",
          description: variableName ? `Using "${variableName}" for subcategories.` : "Using first variable for subcategories.",
        });
        await fetchCategories(categoryLeaderboardType);
        const { getCategoriesFirestore } = await import("@/lib/data/firestore/categories");
        const updated = await getCategoriesFirestore(categoryLeaderboardType);
        const refreshed = updated.find(c => c.id === selectedCategoryForSubcategories.id) as Category | undefined;
        if (refreshed) {
          setSelectedCategoryForSubcategories(refreshed);
        }
      } else {
        throw new Error("Failed to update category.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set subcategory variable.",
        variant: "destructive",
      });
    } finally {
      setUpdatingSubcategory(false);
    }
  };

  const handleImportSubcategoriesFromSRC = async () => {
    if (!selectedCategoryForSubcategories || !srcVariables.length) {
      toast({
        title: "Error",
        description: "Please select a category with SRC variables available.",
        variant: "destructive",
      });
      return;
    }
    
    setUpdatingSubcategory(true);
    try {
      const currentCategory = firestoreCategories.find(c => c.id === selectedCategoryForSubcategories.id) as Category | undefined;
      const existingSubcategories = currentCategory?.subcategories || [];
      const existingNames = new Set(existingSubcategories.map(s => s.name.toLowerCase().trim()));
      
      let variable = srcVariables[0];
      const preferredVariableName = currentCategory?.srcSubcategoryVariableName;
      if (preferredVariableName && srcVariables.length > 1) {
        const preferredVariable = srcVariables.find(v => 
          v.name.toLowerCase().trim() === preferredVariableName.toLowerCase().trim()
        );
        if (preferredVariable) {
          variable = preferredVariable;
        }
      }
      const newSubcategories: Subcategory[] = [];
      let maxOrder = existingSubcategories.reduce((max, s) => Math.max(max, s.order || 0), 0);
      
      for (const [valueId, valueData] of Object.entries(variable.values.values)) {
        const valueLabel = valueData.label;
        if (!existingNames.has(valueLabel.toLowerCase().trim())) {
          maxOrder++;
          newSubcategories.push({
            id: `subcat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: valueLabel,
            order: maxOrder,
            srcVariableId: variable.id,
            srcValueId: valueId,
          });
        }
      }
      
      if (newSubcategories.length === 0) {
        toast({
          title: "No New Subcategories",
          description: "All SRC variable values already exist as subcategories.",
        });
        return;
      }
      
      const updatedSubcategories = [...existingSubcategories, ...newSubcategories];
      const { updateCategoryFirestore } = await import("@/lib/data/firestore/categories");
      const success = await updateCategoryFirestore(selectedCategoryForSubcategories.id, selectedCategoryForSubcategories.name, updatedSubcategories);
      
      if (success) {
        toast({
          title: "Subcategories Imported",
          description: `Successfully imported ${newSubcategories.length} subcategory(ies) from SRC.`,
        });
        await fetchCategories(categoryLeaderboardType);
        const { getCategoriesFirestore } = await import("@/lib/data/firestore/categories");
        const updated = await getCategoriesFirestore(categoryLeaderboardType);
        const refreshed = updated.find(c => c.id === selectedCategoryForSubcategories.id) as Category | undefined;
        if (refreshed) {
          setSelectedCategoryForSubcategories(refreshed);
        }
      } else {
        throw new Error("Failed to import subcategories.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to import subcategories from SRC.",
        variant: "destructive",
      });
    } finally {
      setUpdatingSubcategory(false);
    }
  };

  return {
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
  };
}

