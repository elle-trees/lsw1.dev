import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy 
} from "firebase/firestore";
import { Platform } from "@/types/database";
import { platformConverter } from "./converters";
import { withArrayErrorHandling, withBooleanErrorHandling } from "./utils";
import { logger } from "@/lib/logger";

export const getPlatformsFirestore = async (): Promise<Platform[]> => {
  return withArrayErrorHandling(
    async () => {
      const q = query(collection(db!, "platforms").withConverter(platformConverter), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    },
    "Error fetching platforms:"
  );
};

export const addPlatformFirestore = async (name: string): Promise<string | null> => {
  if (!db) return null;
  try {
    const newDocRef = doc(collection(db, "platforms")).withConverter(platformConverter);
    const platforms = await getPlatformsFirestore();
    const order = platforms.length;
    
    const newPlatform: Platform = {
      id: newDocRef.id,
      name,
      order
    };
    
    await setDoc(newDocRef, newPlatform);
    return newDocRef.id;
  } catch (error) {
    logger.error("Error adding platform:", error);
    return null;
  }
};

export const updatePlatformFirestore = async (id: string, name: string): Promise<boolean> => {
  return withBooleanErrorHandling(
    async () => {
      const docRef = doc(db!, "platforms", id).withConverter(platformConverter);
      await updateDoc(docRef, { name });
    },
    "Error updating platform:"
  );
};

export const deletePlatformFirestore = async (id: string): Promise<boolean> => {
  return withBooleanErrorHandling(
    async () => {
      await deleteDoc(doc(db!, "platforms", id));
    },
    "Error deleting platform:"
  );
};

export const movePlatformUpFirestore = async (_id: string): Promise<boolean> => {
    return false;
};

export const movePlatformDownFirestore = async (_id: string): Promise<boolean> => {
    return false;
};
