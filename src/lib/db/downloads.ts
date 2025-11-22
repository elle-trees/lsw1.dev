// Download operations
import {
  getDownloadEntriesFirestore,
  addDownloadEntryFirestore,
  deleteDownloadEntryFirestore,
  updateDownloadOrderFirestore,
  moveDownloadUpFirestore,
  moveDownloadDownFirestore,
  getDownloadCategoriesFirestore,
  addDownloadCategoryFirestore,
  updateDownloadCategoryFirestore,
  deleteDownloadCategoryFirestore
} from "../data/firestore/downloads";

export const getDownloadEntries = getDownloadEntriesFirestore;
export const addDownloadEntry = addDownloadEntryFirestore;
export const deleteDownloadEntry = deleteDownloadEntryFirestore;
export const updateDownloadOrder = updateDownloadOrderFirestore;
export const moveDownloadUp = moveDownloadUpFirestore;
export const moveDownloadDown = moveDownloadDownFirestore;

// Download Categories (managed in Firestore)
export const getDownloadCategories = getDownloadCategoriesFirestore;
export const addDownloadCategory = addDownloadCategoryFirestore;
export const updateDownloadCategory = updateDownloadCategoryFirestore;
export const deleteDownloadCategory = deleteDownloadCategoryFirestore;

