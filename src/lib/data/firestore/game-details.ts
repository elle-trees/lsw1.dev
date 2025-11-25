import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  limit as firestoreLimit
} from "firebase/firestore";
import { GameDetailsConfig } from "@/types/database";
import { gameDetailsConfigConverter } from "./converters";
import { DEFAULT_GAME_CONFIG } from "@/config";

export const getGameDetailsConfigFirestore = async (): Promise<GameDetailsConfig | null> => {
  if (!db) return null;
  try {
    // There should be only one config document, but we query the collection
    const q = query(collection(db, "gameDetailsConfig").withConverter(gameDetailsConfigConverter), firestoreLimit(1));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }
    
    // Return default config if none exists
    return DEFAULT_GAME_CONFIG;
  } catch (error) {
    console.error("Error fetching game details config:", error);
    return null;
  }
};

export const updateGameDetailsConfigFirestore = async (config: GameDetailsConfig): Promise<boolean> => {
  if (!db) return false;
  try {
    // Check if config exists
    const q = query(collection(db, "gameDetailsConfig").withConverter(gameDetailsConfigConverter), firestoreLimit(1));
    const snapshot = await getDocs(q);
    
    let docRef;
    if (!snapshot.empty) {
      docRef = snapshot.docs[0].ref;
    } else {
      docRef = doc(collection(db, "gameDetailsConfig")).withConverter(gameDetailsConfigConverter);
    }
    
    // Ensure we don't save the ID as part of the data if using setDoc with merge or similar
    // The converter handles stripping ID on toFirestore
    await setDoc(docRef, config);
    return true;
  } catch (error) {
    console.error("Error updating game details config:", error);
    return false;
  }
};

