import { db } from "@/lib/firebase";
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, limit as firestoreLimit } from "firebase/firestore";
import { Player, LeaderboardEntry, DownloadEntry, Category, Platform } from "@/types/database";

export const getLeaderboardEntriesFirestore = async (
  categoryId?: string,
  platformId?: string,
  runType?: 'solo' | 'co-op',
  includeObsolete?: boolean
): Promise<LeaderboardEntry[]> => {
  if (!db) return [];
  
  try {
    const initialLimit = 60;
    let q = query(
      collection(db, "leaderboardEntries"),
      where("verified", "==", true),
      firestoreLimit(initialLimit)
    );
    
    const querySnapshot = await getDocs(q);
    
    let entries: LeaderboardEntry[] = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as LeaderboardEntry))
      .filter(entry => {
        if (!includeObsolete && entry.isObsolete) return false;
        if (categoryId && categoryId !== "all" && entry.category !== categoryId) return false;
        if (platformId && platformId !== "all" && entry.platform !== platformId) return false;
        if (runType && (runType === "solo" || runType === "co-op") && entry.runType !== runType) return false;
        return true;
      });

    if (entries.length < 15 && querySnapshot.docs.length === initialLimit) {
      const q2 = query(
        collection(db, "leaderboardEntries"),
        where("verified", "==", true),
        firestoreLimit(120)
      );
      const querySnapshot2 = await getDocs(q2);
      entries = querySnapshot2.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as LeaderboardEntry))
        .filter(entry => {
          if (!includeObsolete && entry.isObsolete) return false;
          if (categoryId && categoryId !== "all" && entry.category !== categoryId) return false;
          if (platformId && platformId !== "all" && entry.platform !== platformId) return false;
          if (runType && (runType === "solo" || runType === "co-op") && entry.runType !== runType) return false;
          return true;
        });
    }

    const entriesWithTime = entries.map(entry => {
      const parts = entry.time.split(':').map(Number);
      const totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      return { entry, totalSeconds };
    });
    entriesWithTime.sort((a, b) => a.totalSeconds - b.totalSeconds);
    entries = entriesWithTime.map(item => item.entry);
    entries = entries.slice(0, 100);

    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Enrich entries with player name colors
    const enrichedEntries = await Promise.all(entries.map(async (entry) => {
      try {
        const player = await getPlayerByUidFirestore(entry.playerId);
        if (player?.nameColor) {
          entry.nameColor = player.nameColor;
        }
        // For co-op runs, also fetch player2 color if player2Id exists
        if (entry.player2Name && entry.runType === 'co-op') {
          // Try to find player2 by name (since we don't have player2Id in entry)
          // This is a best-effort approach
          const player2 = await getPlayerByUsernameFirestore(entry.player2Name);
          if (player2?.nameColor) {
            entry.player2Color = player2.nameColor;
          }
        }
      } catch (error) {
        // Silent fail - continue without name color
      }
      return entry;
    }));

    return enrichedEntries;
  } catch (error) {
    return [];
  }
};

export const addLeaderboardEntryFirestore = async (entry: Omit<LeaderboardEntry, 'id' | 'rank' | 'isObsolete'> & { verified?: boolean }): Promise<string | null> => {
  if (!db) return null;
  try {
    const newDocRef = doc(collection(db, "leaderboardEntries"));
    const newEntry: any = { 
      id: newDocRef.id, 
      playerId: entry.playerId,
      playerName: entry.playerName,
      category: entry.category,
      platform: entry.platform,
      runType: entry.runType,
      time: entry.time,
      date: entry.date || new Date().toISOString().split('T')[0],
      verified: entry.verified ?? false, 
      isObsolete: false,
    };
    
    // Only include optional fields if they have values
    if (entry.player2Name) {
      newEntry.player2Name = entry.player2Name;
    }
    if (entry.videoUrl) {
      newEntry.videoUrl = entry.videoUrl;
    }
    if (entry.comment) {
      newEntry.comment = entry.comment;
    }
    
    await setDoc(newDocRef, newEntry);
    return newDocRef.id;
  } catch (error: any) {
    console.error("Error adding leaderboard entry:", error);
    // Re-throw the error so the caller can see what went wrong
    throw error;
  }
};

export const getPlayerByUidFirestore = async (uid: string): Promise<Player | null> => {
  if (!db) return null;
  try {
    const playerDocRef = doc(db, "players", uid);
    const playerDocSnap = await getDoc(playerDocRef);
    if (playerDocSnap.exists()) {
      return { id: playerDocSnap.id, ...playerDocSnap.data() } as Player;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getPlayerByUsernameFirestore = async (username: string): Promise<Player | null> => {
  if (!db) return null;
  try {
    const q = query(collection(db, "players"));
    const querySnapshot = await getDocs(q);
    
    const normalizedUsername = username.trim().toLowerCase();
    const player = querySnapshot.docs.find(doc => {
      const data = doc.data();
      const displayName = (data.displayName || "").toLowerCase();
      const email = (data.email || "").toLowerCase();
      return displayName === normalizedUsername || email.split('@')[0] === normalizedUsername;
    });
    
    if (player) {
      return { id: player.id, ...player.data() } as Player;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const createPlayerFirestore = async (player: Omit<Player, 'id'>): Promise<string | null> => {
  if (!db) return null;
  try {
    const playerDocRef = doc(db, "players", player.uid);
    await setDoc(playerDocRef, player);
    return player.uid;
  } catch (error: any) {
    console.error("createPlayerFirestore error:", error);
    return null;
  }
};

export const updatePlayerProfileFirestore = async (uid: string, data: Partial<Player>): Promise<boolean> => {
  if (!db) return false;
  try {
    const playerDocRef = doc(db, "players", uid);
    const docSnap = await getDoc(playerDocRef);
    if (docSnap.exists()) {
      await updateDoc(playerDocRef, data);
      return true;
    } else {
      await setDoc(playerDocRef, { uid, ...data }, { merge: true });
      return true;
    }
  } catch (error: any) {
    console.error("updatePlayerProfileFirestore error:", error?.code, error?.message);
    return false;
  }
};

export const getRecentRunsFirestore = async (limitCount: number = 10): Promise<LeaderboardEntry[]> => {
  if (!db) return [];
  try {
    const fetchLimit = Math.min(limitCount + 20, 50);
    const q = query(
      collection(db, "leaderboardEntries"),
      where("verified", "==", true),
      firestoreLimit(fetchLimit)
    );
    
    const querySnapshot = await getDocs(q);
    
    let entries: LeaderboardEntry[] = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as LeaderboardEntry))
      .filter(entry => !entry.isObsolete);
    
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    entries = entries.slice(0, limitCount);

    // Enrich entries with player name colors
    const enrichedEntries = await Promise.all(entries.map(async (entry) => {
      try {
        const player = await getPlayerByUidFirestore(entry.playerId);
        if (player?.nameColor) {
          entry.nameColor = player.nameColor;
        }
        // For co-op runs, also fetch player2 color
        if (entry.player2Name && entry.runType === 'co-op') {
          const player2 = await getPlayerByUsernameFirestore(entry.player2Name);
          if (player2?.nameColor) {
            entry.player2Color = player2.nameColor;
          }
        }
      } catch (error) {
        // Silent fail - continue without name color
      }
      return entry;
    }));

    return enrichedEntries;
  } catch (error) {
    return [];
  }
};

export const getPlayerRunsFirestore = async (playerId: string): Promise<LeaderboardEntry[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "leaderboardEntries"),
      where("playerId", "==", playerId),
      where("verified", "==", true),
      firestoreLimit(200)
    );
    
    const querySnapshot = await getDocs(q);
    
    const entries = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as LeaderboardEntry))
      .filter(entry => !entry.isObsolete);

    // Enrich with player name color
    const player = await getPlayerByUidFirestore(playerId);
    return entries.map(entry => {
      if (player?.nameColor) {
        entry.nameColor = player.nameColor;
      }
      return entry;
    });
  } catch (error) {
    return [];
  }
};

export const getUnverifiedLeaderboardEntriesFirestore = async (): Promise<LeaderboardEntry[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "leaderboardEntries"),
      where("verified", "==", false),
      firestoreLimit(100)
    );
    const querySnapshot = await getDocs(q);
    const entries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaderboardEntry));
    
    // Enrich entries with player name colors
    const enrichedEntries = await Promise.all(entries.map(async (entry) => {
      try {
        const player = await getPlayerByUidFirestore(entry.playerId);
        if (player?.nameColor) {
          entry.nameColor = player.nameColor;
        }
        // For co-op runs, also fetch player2 color
        if (entry.player2Name && entry.runType === 'co-op') {
          const player2 = await getPlayerByUsernameFirestore(entry.player2Name);
          if (player2?.nameColor) {
            entry.player2Color = player2.nameColor;
          }
        }
      } catch (error) {
        // Silent fail - continue without name color
      }
      return entry;
    }));

    return enrichedEntries;
  } catch (error) {
    return [];
  }
};

export const getLeaderboardEntryByIdFirestore = async (runId: string): Promise<LeaderboardEntry | null> => {
  if (!db) return null;
  try {
    const runDocRef = doc(db, "leaderboardEntries", runId);
    const runDocSnap = await getDoc(runDocRef);
    if (runDocSnap.exists()) {
      const entry = { id: runDocSnap.id, ...runDocSnap.data() } as LeaderboardEntry;
      
      // Enrich with player name colors
      try {
        const player = await getPlayerByUidFirestore(entry.playerId);
        if (player?.nameColor) {
          entry.nameColor = player.nameColor;
        }
        // For co-op runs, also fetch player2 color
        if (entry.player2Name && entry.runType === 'co-op') {
          const player2 = await getPlayerByUsernameFirestore(entry.player2Name);
          if (player2?.nameColor) {
            entry.player2Color = player2.nameColor;
          }
        }
      } catch (error) {
        // Silent fail - continue without name color
      }
      
      return entry;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const updateRunVerificationStatusFirestore = async (runId: string, verified: boolean, verifiedBy?: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const runDocRef = doc(db, "leaderboardEntries", runId);
    const updateData: { verified: boolean; verifiedBy?: string } = { verified };
    if (verified && verifiedBy) {
      updateData.verifiedBy = verifiedBy;
    }
    await updateDoc(runDocRef, updateData);
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteLeaderboardEntryFirestore = async (runId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const runDocRef = doc(db, "leaderboardEntries", runId);
    await deleteDoc(runDocRef);
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteAllLeaderboardEntriesFirestore = async (): Promise<{ deleted: number; errors: string[] }> => {
  if (!db) return { deleted: 0, errors: ["Firestore not initialized"] };
  
  const result = { deleted: 0, errors: [] as string[] };
  
  try {
    let hasMore = true;
    let batchCount = 0;
    const batchSize = 500;
    
    while (hasMore) {
      const q = query(collection(db, "leaderboardEntries"), firestoreLimit(batchSize));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        hasMore = false;
        break;
      }
      
      const deletePromises = querySnapshot.docs.map(async (docSnapshot) => {
        try {
          await deleteDoc(docSnapshot.ref);
          return true;
        } catch (error) {
          result.errors.push(`Failed to delete ${docSnapshot.id}: ${error instanceof Error ? error.message : String(error)}`);
          return false;
        }
      });
      
      const deleteResults = await Promise.all(deletePromises);
      result.deleted += deleteResults.filter(r => r).length;
      
      if (querySnapshot.docs.length < batchSize) {
        hasMore = false;
      }
      
      batchCount++;
      if (batchCount > 100) {
        result.errors.push("Stopped after 100 batches to prevent infinite loop");
        break;
      }
    }
    
    return result;
  } catch (error) {
    result.errors.push(`Delete all error: ${error instanceof Error ? error.message : String(error)}`);
    return result;
  }
};

export const updateRunObsoleteStatusFirestore = async (runId: string, isObsolete: boolean): Promise<boolean> => {
  if (!db) return false;
  try {
    const runDocRef = doc(db, "leaderboardEntries", runId);
    await updateDoc(runDocRef, { isObsolete });
    return true;
  } catch (error) {
    return false;
  }
};

export const getDownloadEntriesFirestore = async (): Promise<DownloadEntry[]> => {
  if (!db) return [];
  try {
    const q = query(collection(db, "downloads"), firestoreLimit(200));
    const querySnapshot = await getDocs(q);
    const entries: DownloadEntry[] = [];
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() } as DownloadEntry);
    });
    // Sort by order (if present), then by name
    entries.sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.name.localeCompare(b.name);
    });
    return entries;
  } catch (error) {
    return [];
  }
};

export const addDownloadEntryFirestore = async (entry: Omit<DownloadEntry, 'id' | 'dateAdded' | 'order'>, addedByUid: string): Promise<string | null> => {
  if (!db) return null;
  try {
    // Get existing downloads to determine next order
    const existingDownloads = await getDownloadEntriesFirestore();
    const maxOrder = existingDownloads.length > 0 
      ? Math.max(...existingDownloads.map(d => d.order ?? 0), 0)
      : -1;
    
    const newDocRef = doc(collection(db, "downloads"));
    const newEntry: DownloadEntry = { 
      ...entry, 
      id: newDocRef.id, 
      addedBy: addedByUid, 
      dateAdded: new Date().toISOString().split('T')[0],
      order: maxOrder + 1
    };
    await setDoc(newDocRef, newEntry);
    return newDocRef.id;
  } catch (error: any) {
    console.error("Error adding download entry:", error);
    throw error; // Re-throw so the caller can see what went wrong
  }
};

export const deleteDownloadEntryFirestore = async (id: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const downloadDocRef = doc(db, "downloads", id);
    const downloadDoc = await getDoc(downloadDocRef);
    if (!downloadDoc.exists()) {
      return false;
    }
    await deleteDoc(downloadDocRef);
    return true;
  } catch (error) {
    return false;
  }
};

export const updateDownloadOrderFirestore = async (id: string, order: number): Promise<boolean> => {
  if (!db) return false;
  try {
    const downloadDocRef = doc(db, "downloads", id);
    await updateDoc(downloadDocRef, { order });
    return true;
  } catch (error) {
    return false;
  }
};

export const moveDownloadUpFirestore = async (downloadId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const downloads = await getDownloadEntriesFirestore();
    const currentIndex = downloads.findIndex(d => d.id === downloadId);
    if (currentIndex <= 0) return false;
    
    const currentDownload = downloads[currentIndex];
    const previousDownload = downloads[currentIndex - 1];
    
    const tempOrder = currentDownload.order ?? currentIndex;
    currentDownload.order = previousDownload.order ?? currentIndex - 1;
    previousDownload.order = tempOrder;
    
    await Promise.all([
      updateDownloadOrderFirestore(currentDownload.id, currentDownload.order),
      updateDownloadOrderFirestore(previousDownload.id, previousDownload.order)
    ]);
    
    return true;
  } catch (error) {
    return false;
  }
};

export const moveDownloadDownFirestore = async (downloadId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const downloads = await getDownloadEntriesFirestore();
    const currentIndex = downloads.findIndex(d => d.id === downloadId);
    if (currentIndex < 0 || currentIndex >= downloads.length - 1) return false;
    
    const currentDownload = downloads[currentIndex];
    const nextDownload = downloads[currentIndex + 1];
    
    const tempOrder = currentDownload.order ?? currentIndex;
    currentDownload.order = nextDownload.order ?? currentIndex + 1;
    nextDownload.order = tempOrder;
    
    await Promise.all([
      updateDownloadOrderFirestore(currentDownload.id, currentDownload.order),
      updateDownloadOrderFirestore(nextDownload.id, nextDownload.order)
    ]);
    
    return true;
  } catch (error) {
    return false;
  }
};

export const getCategoriesFirestore = async (): Promise<Category[]> => {
  try {
    let q = query(collection(db, "categories"));
    const querySnapshot = await getDocs(q);
    const categories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    
    categories.sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : Infinity;
      const orderB = b.order !== undefined ? b.order : Infinity;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return (a.name || "").localeCompare(b.name || "");
    });
    
    return categories;
  } catch (error) {
    return [];
  }
};

export const addCategoryFirestore = async (name: string): Promise<string | null> => {
  if (!db) return null;
  try {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return null;
    }
    
    const q = query(collection(db, "categories"));
    const existingSnapshot = await getDocs(q);
    const existingCategory = existingSnapshot.docs.find(
      doc => doc.data().name?.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingCategory) {
      return null;
    }
    
    const existingCategories = existingSnapshot.docs.map(doc => doc.data());
    const maxOrder = existingCategories.reduce((max, cat) => {
      const order = cat.order !== undefined ? cat.order : -1;
      return Math.max(max, order);
    }, -1);
    const nextOrder = maxOrder + 1;
    
    const newDocRef = doc(collection(db, "categories"));
    await setDoc(newDocRef, { name: trimmedName, order: nextOrder });
    return newDocRef.id;
  } catch (error) {
    return null;
  }
};

export const updateCategoryFirestore = async (id: string, name: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return false;
    }
    
    const categoryDocRef = doc(db, "categories", id);
    const categoryDoc = await getDoc(categoryDocRef);
    
    if (!categoryDoc.exists()) {
      return false;
    }
    
    const currentData = categoryDoc.data();
    const currentName = currentData?.name?.trim() || "";
    
    if (currentName.toLowerCase() === trimmedName.toLowerCase()) {
      return true;
    }
    
    const q = query(collection(db, "categories"));
    const existingSnapshot = await getDocs(q);
    const conflictingCategory = existingSnapshot.docs.find(
      d => {
        const otherId = d.id;
        const otherName = d.data().name?.trim() || "";
        return otherId !== id && otherName.toLowerCase() === trimmedName.toLowerCase();
      }
    );
    
    if (conflictingCategory) {
      return false;
    }
    
    await updateDoc(categoryDocRef, { name: trimmedName });
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteCategoryFirestore = async (id: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const categoryDocRef = doc(db, "categories", id);
    const categoryDoc = await getDoc(categoryDocRef);
    if (!categoryDoc.exists()) {
      return false;
    }
    await deleteDoc(categoryDocRef);
    return true;
  } catch (error) {
    return false;
  }
};

export const updateCategoryOrderFirestore = async (id: string, order: number): Promise<boolean> => {
  if (!db) return false;
  try {
    const categoryDocRef = doc(db, "categories", id);
    await updateDoc(categoryDocRef, { order });
    return true;
  } catch (error) {
    return false;
  }
};

export const moveCategoryUpFirestore = async (categoryId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const categories = await getCategoriesFirestore();
    const currentIndex = categories.findIndex(c => c.id === categoryId);
    if (currentIndex <= 0) return false;
    
    const currentCategory = categories[currentIndex];
    const previousCategory = categories[currentIndex - 1];
    
    // Swap orders
    const tempOrder = currentCategory.order ?? currentIndex;
    currentCategory.order = previousCategory.order ?? currentIndex - 1;
    previousCategory.order = tempOrder;
    
    // Update both categories
    await Promise.all([
      updateCategoryOrderFirestore(currentCategory.id, currentCategory.order),
      updateCategoryOrderFirestore(previousCategory.id, previousCategory.order)
    ]);
    
    return true;
  } catch (error) {
    return false;
  }
};

export const moveCategoryDownFirestore = async (categoryId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const categories = await getCategoriesFirestore();
    const currentIndex = categories.findIndex(c => c.id === categoryId);
    if (currentIndex < 0 || currentIndex >= categories.length - 1) return false;
    
    const currentCategory = categories[currentIndex];
    const nextCategory = categories[currentIndex + 1];
    
    const tempOrder = currentCategory.order ?? currentIndex;
    currentCategory.order = nextCategory.order ?? currentIndex + 1;
    nextCategory.order = tempOrder;
    
    await Promise.all([
      updateCategoryOrderFirestore(currentCategory.id, currentCategory.order),
      updateCategoryOrderFirestore(nextCategory.id, nextCategory.order)
    ]);
    
    return true;
  } catch (error) {
    return false;
  }
};

export const getPlatformsFirestore = async (): Promise<Platform[]> => {
  if (!db) return [];
  try {
    let q = query(collection(db, "platforms"));
    const querySnapshot = await getDocs(q);
    const platforms = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Platform));
    
    platforms.sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : Infinity;
      const orderB = b.order !== undefined ? b.order : Infinity;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return (a.name || "").localeCompare(b.name || "");
    });
    
    return platforms;
  } catch (error) {
    return [];
  }
};

export const addPlatformFirestore = async (name: string): Promise<string | null> => {
  if (!db) return null;
  try {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return null;
    }
    
    const q = query(collection(db, "platforms"));
    const existingSnapshot = await getDocs(q);
    const existingPlatform = existingSnapshot.docs.find(
      doc => doc.data().name?.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingPlatform) {
      return null;
    }
    
    const existingPlatforms = existingSnapshot.docs.map(doc => doc.data());
    const maxOrder = existingPlatforms.reduce((max, plat) => {
      const order = plat.order !== undefined ? plat.order : -1;
      return Math.max(max, order);
    }, -1);
    const nextOrder = maxOrder + 1;
    
    const newDocRef = doc(collection(db, "platforms"));
    await setDoc(newDocRef, { name: trimmedName, order: nextOrder });
    return newDocRef.id;
  } catch (error) {
    return null;
  }
};

export const updatePlatformFirestore = async (id: string, name: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return false;
    }
    
    const platformDocRef = doc(db, "platforms", id);
    const platformDoc = await getDoc(platformDocRef);
    
    if (!platformDoc.exists()) {
      return false;
    }
    
    const currentData = platformDoc.data();
    const currentName = currentData?.name?.trim() || "";
    
    // If the name hasn't changed (case-insensitive), allow the update
    if (currentName.toLowerCase() === trimmedName.toLowerCase()) {
      return true;
    }
    
    // Check for conflicts
    const q = query(collection(db, "platforms"));
    const existingSnapshot = await getDocs(q);
    const conflictingPlatform = existingSnapshot.docs.find(
      d => d.id !== id && d.data().name?.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (conflictingPlatform) {
      return false; // Another platform with this name exists
    }
    
    await updateDoc(platformDocRef, { name: trimmedName });
    return true;
  } catch (error) {
    return false;
  }
};

export const deletePlatformFirestore = async (id: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const platformDocRef = doc(db, "platforms", id);
    const platformDoc = await getDoc(platformDocRef);
    if (!platformDoc.exists()) {
      return false;
    }
    await deleteDoc(platformDocRef);
    return true;
  } catch (error) {
    return false;
  }
};

export const updatePlatformOrderFirestore = async (id: string, order: number): Promise<boolean> => {
  if (!db) return false;
  try {
    const platformDocRef = doc(db, "platforms", id);
    await updateDoc(platformDocRef, { order });
    return true;
  } catch (error) {
    return false;
  }
};

export const movePlatformUpFirestore = async (platformId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const platforms = await getPlatformsFirestore();
    const currentIndex = platforms.findIndex(p => p.id === platformId);
    if (currentIndex <= 0) return false;
    
    const currentPlatform = platforms[currentIndex];
    const previousPlatform = platforms[currentIndex - 1];
    
    const tempOrder = currentPlatform.order ?? currentIndex;
    currentPlatform.order = previousPlatform.order ?? currentIndex - 1;
    previousPlatform.order = tempOrder;
    
    await Promise.all([
      updatePlatformOrderFirestore(currentPlatform.id, currentPlatform.order),
      updatePlatformOrderFirestore(previousPlatform.id, previousPlatform.order)
    ]);
    
    return true;
  } catch (error) {
    return false;
  }
};

export const movePlatformDownFirestore = async (platformId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const platforms = await getPlatformsFirestore();
    const currentIndex = platforms.findIndex(p => p.id === platformId);
    if (currentIndex < 0 || currentIndex >= platforms.length - 1) return false;
    
    const currentPlatform = platforms[currentIndex];
    const nextPlatform = platforms[currentIndex + 1];
    
    const tempOrder = currentPlatform.order ?? currentIndex;
    currentPlatform.order = nextPlatform.order ?? currentIndex + 1;
    nextPlatform.order = tempOrder;
    
    await Promise.all([
      updatePlatformOrderFirestore(currentPlatform.id, currentPlatform.order),
      updatePlatformOrderFirestore(nextPlatform.id, nextPlatform.order)
    ]);
    
    return true;
  } catch (error) {
    return false;
  }
};

export const getAllVerifiedRunsFirestore = async (): Promise<LeaderboardEntry[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "leaderboardEntries"),
      where("verified", "==", true),
      firestoreLimit(1000)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaderboardEntry));
  } catch (error) {
    return [];
  }
};

export const getUnclaimedRunsByUsernameFirestore = async (username: string): Promise<LeaderboardEntry[]> => {
  if (!db) return [];
  try {
    // Get all verified runs
    const q = query(
      collection(db, "leaderboardEntries"),
      where("verified", "==", true),
      firestoreLimit(500)
    );
    const querySnapshot = await getDocs(q);
    
    const normalizedUsername = username.trim().toLowerCase();
    
    const unclaimedRuns = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as LeaderboardEntry))
      .filter(entry => {
        const entryPlayerName = (entry.playerName || "").trim().toLowerCase();
        return entryPlayerName === normalizedUsername;
      });
    
    return unclaimedRuns;
  } catch (error) {
    return [];
  }
};

export const claimRunFirestore = async (runId: string, userId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const runDocRef = doc(db, "leaderboardEntries", runId);
    const runDoc = await getDoc(runDocRef);
    
    if (!runDoc.exists()) {
      return false;
    }
    
    await updateDoc(runDocRef, { playerId: userId });
    return true;
  } catch (error) {
    return false;
  }
};
