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
    return {
      id: "default",
      title: "LEGO Star Wars: The Video Game",
      subtitle: "2005",
      categories: ["LEGO Series", "Star Wars Series"],
      platforms: [
        { id: "gcn", label: "GCN", order: 1 },
        { id: "ps2", label: "PS2", order: 2 },
        { id: "xbox", label: "Xbox", order: 3 },
        { id: "pc", label: "PC", order: 4 },
      ],
      discordUrl: "https://discord.gg/6A5MNqaK49",
      navItems: [
        { id: "levels", label: "Levels", route: "/leaderboards", badgeCount: 18, order: 1 },
        { id: "news", label: "News", route: "/", order: 2 },
        { id: "guides", label: "Guides", route: "/downloads", badgeCount: 8, order: 3 },
        { id: "resources", label: "Resources", route: "/downloads", badgeCount: 12, order: 4 },
        { id: "forums", label: "Forums", route: "/", badgeCount: 20, order: 5 },
        { id: "streams", label: "Streams", route: "/live", badgeCount: 1, order: 6 },
        { id: "stats", label: "Stats", route: "/stats", order: 7 },
        { id: "leaderboards", label: "Leaderboards", route: "/leaderboards", order: 8 },
      ],
      visibleOnPages: ["/", "/leaderboards"],
      enabled: true,
    };
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

