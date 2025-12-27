import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
} from "firebase/firestore";
import { GameDetailsConfig } from "@/types/database";
import { gameDetailsConfigConverter } from "./converters";
import { DEFAULT_GAME_CONFIG } from "@/config";

export const getGameDetailsConfigFirestore = async (
  gameId: string,
): Promise<GameDetailsConfig | null> => {
  if (!db) return null;
  try {
    const docRef = doc(db, `games/${gameId}/config`, gameId).withConverter(
      gameDetailsConfigConverter,
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }

    // Return default config if none exists
    return DEFAULT_GAME_CONFIG;
  } catch (error) {
    console.error("Error fetching game details config:", error);
    return null;
  }
};

export const getAllGameDetailsConfigsFirestore = async (): Promise<
  GameDetailsConfig[]
> => {
  if (!db) return [];
  try {
    const gamesCollection = collection(db, "games");
    const gamesSnapshot = await getDocs(gamesCollection);
    const configs: GameDetailsConfig[] = [];

    for (const gameDoc of gamesSnapshot.docs) {
      const configCollection = collection(
        db,
        `games/${gameDoc.id}/config`,
      ).withConverter(gameDetailsConfigConverter);
      const configSnapshot = await getDocs(query(configCollection));
      if (!configSnapshot.empty) {
        configs.push(configSnapshot.docs[0].data());
      }
    }

    return configs;
  } catch (error) {
    console.error("Error fetching all game details configs:", error);
    return [];
  }
};

export const updateGameDetailsConfigFirestore = async (
  gameId: string,
  config: GameDetailsConfig,
): Promise<boolean> => {
  if (!db) return false;
  try {
    const docRef = doc(db, `games/${gameId}/config`, gameId).withConverter(
      gameDetailsConfigConverter,
    );
    await setDoc(docRef, config);
    return true;
  } catch (error) {
    console.error("Error updating game details config:", error);
    return false;
  }
};
