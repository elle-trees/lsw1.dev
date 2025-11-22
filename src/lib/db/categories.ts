// Categories, Platforms, and Levels operations
import {
  getCategoriesFirestore,
  addCategoryFirestore,
  updateCategoryFirestore,
  deleteCategoryFirestore,
  moveCategoryUpFirestore,
  moveCategoryDownFirestore
} from "../data/firestore/categories";

import {
  getPlatformsFirestore,
  addPlatformFirestore,
  updatePlatformFirestore,
  deletePlatformFirestore,
  movePlatformUpFirestore,
  movePlatformDownFirestore
} from "../data/firestore/platforms";

import {
  getLevelsFirestore,
  addLevelFirestore,
  updateLevelFirestore,
  deleteLevelFirestore,
  moveLevelUpFirestore,
  moveLevelDownFirestore,
  updateLevelCategoryDisabledFirestore
} from "../data/firestore/levels";

import { Category, Platform } from "@/types/database";

const defaultCategories = [
  { name: "Any%" },
  { name: "Free Play" },
  { name: "All Minikits" },
  { name: "100%" },
];

export const initializeDefaultCategories = async (): Promise<void> => {
  try {
    const existingCategories = await getCategoriesFirestore();
    if (existingCategories.length === 0) {
      for (let i = 0; i < defaultCategories.length; i++) {
        await addCategoryFirestore(defaultCategories[i].name);
      }
    }
  } catch (_error) {
    // Silent fail
  }
};

export const getCategories = async (leaderboardType?: 'regular' | 'individual-level' | 'community-golds'): Promise<Category[]> => {
  try {
    const type = leaderboardType || 'regular';
    let firestoreCategories = await getCategoriesFirestore(type);
    
    // Only initialize default categories for regular leaderboard type
    if (firestoreCategories.length === 0 && type === 'regular') {
      await initializeDefaultCategories();
      firestoreCategories = await getCategoriesFirestore(type);
    }
    
    return firestoreCategories;
  } catch (_error) {
    return [];
  }
};

const defaultPlatforms = [
  { name: "PC" },
  { name: "PS2" },
  { name: "Xbox" },
  { name: "GameCube" },
];

export const initializeDefaultPlatforms = async (): Promise<void> => {
  try {
    const existingPlatforms = await getPlatformsFirestore();
    if (existingPlatforms.length === 0) {
      for (let i = 0; i < defaultPlatforms.length; i++) {
        await addPlatformFirestore(defaultPlatforms[i].name);
      }
    }
  } catch (_error) {
    // Silent fail
  }
};

export const getPlatforms = async (): Promise<Platform[]> => {
  try {
    let firestorePlatforms = await getPlatformsFirestore();
    
    if (firestorePlatforms.length === 0) {
      await initializeDefaultPlatforms();
      firestorePlatforms = await getPlatformsFirestore();
    }
    
    return firestorePlatforms;
  } catch (_error) {
    return [];
  }
};

export const getCategoriesFromFirestore = async (leaderboardType?: 'regular' | 'individual-level' | 'community-golds'): Promise<Category[]> => {
  return getCategoriesFirestore(leaderboardType);
};

export const addCategory = async (name: string, leaderboardType?: 'regular' | 'individual-level' | 'community-golds', srcCategoryId?: string): Promise<string | null> => {
  return addCategoryFirestore(name, leaderboardType, srcCategoryId);
};

export const updateCategory = async (id: string, name: string, subcategories?: Array<{ id: string; name: string; order?: number; srcVariableId?: string; srcValueId?: string }>, srcCategoryId?: string | null, srcSubcategoryVariableName?: string | null): Promise<boolean> => {
  return updateCategoryFirestore(id, name, subcategories, srcCategoryId, srcSubcategoryVariableName);
};

export const deleteCategory = deleteCategoryFirestore;
export const moveCategoryUp = moveCategoryUpFirestore;
export const moveCategoryDown = moveCategoryDownFirestore;

export const getPlatformsFromFirestore = getPlatformsFirestore;
export const addPlatform = addPlatformFirestore;
export const updatePlatform = updatePlatformFirestore;
export const deletePlatform = deletePlatformFirestore;
export const movePlatformUp = movePlatformUpFirestore;
export const movePlatformDown = movePlatformDownFirestore;

export const getLevels = getLevelsFirestore;
export const addLevel = addLevelFirestore;
export const updateLevel = updateLevelFirestore;
export const deleteLevel = deleteLevelFirestore;
export const moveLevelUp = moveLevelUpFirestore;
export const moveLevelDown = moveLevelDownFirestore;
export const updateLevelCategoryDisabled = updateLevelCategoryDisabledFirestore;

