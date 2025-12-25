// src/lib/speedruncom/gameConfigs.ts
import { GameConfig } from "./types";
import { getCategoriesFirestore } from "../data/firestore/categories";
import { getPlatformsFirestore } from "../data/firestore/platforms";
import { getLevelsFirestore } from "../data/firestore/levels";
import {
  fetchCategories as fetchSRCCategories,
  fetchLevels as fetchSRCLevels,
  SRCRun,
} from "../speedruncom";
import { SRCMappings } from "./importService";

function extractPlatformFromRun(
  run: SRCRun,
): { id: string; name: string } | null {
  const platform = run.system?.platform;
  if (!platform) return null;

  // If it's a string ID, we'll need to fetch it later
  if (typeof platform === "string") {
    return { id: platform, name: "" };
  }

  // If it's embedded data
  if (platform.data) {
    const platformData = platform.data;
    const id = platformData.id || "";
    const name = platformData.names?.international || platformData.name || "";
    return { id, name };
  }

  return null;
}

export async function createSRCMappings(
  srcRuns: SRCRun[],
  gameId: string,
): Promise<SRCMappings> {
  if (!Array.isArray(srcRuns)) {
    throw new Error("srcRuns must be an array");
  }

  if (!gameId) {
    throw new Error("gameId is required");
  }

  // Fetch our local data and SRC game-specific data in parallel
  // Note: getLevelsFirestore() fetches ALL levels across the site (both individual-level and community-golds)
  // to ensure level matching works for all leaderboard types
  const [ourCategories, ourPlatforms, ourLevels, srcCategories, srcLevels] =
    await Promise.all([
      getCategoriesFirestore(),
      getPlatformsFirestore(),
      getLevelsFirestore(), // Fetches all levels - no filtering by leaderboard type
      fetchSRCCategories(gameId),
      fetchSRCLevels(gameId),
    ]);

  // Ensure all results are arrays
  const safeSrcCategories = Array.isArray(srcCategories) ? srcCategories : [];
  const safeSrcLevels = Array.isArray(srcLevels) ? srcLevels : [];
  const safeOurCategories = Array.isArray(ourCategories) ? ourCategories : [];
  const safeOurPlatforms = Array.isArray(ourPlatforms) ? ourPlatforms : [];
  const safeOurLevels = Array.isArray(ourLevels) ? ourLevels : [];

  // Extract unique platform IDs/names from runs (only LSW1 platforms)
  const uniquePlatforms = new Map<string, { id: string; name: string }>();

  for (const run of srcRuns) {
    if (!run || typeof run !== "object") continue;
    const platformData = extractPlatformFromRun(run);
    if (platformData && platformData.id) {
      // If we already have this platform ID, skip
      if (uniquePlatforms.has(platformData.id)) {
        continue;
      }

      // If we have a name from embedded data, use it
      if (platformData.name) {
        uniquePlatforms.set(platformData.id, platformData);
      } else {
        // Store ID only, we'll fetch the name later
        uniquePlatforms.set(platformData.id, { id: platformData.id, name: "" });
      }
    }
  }

  // Fetch platform names for any platforms we only have IDs for
  // Optimize: Fetch all platforms once and cache, then look up names
  const platformsToFetch = Array.from(uniquePlatforms.values()).filter(
    (p) => !p.name && p.id,
  );
  if (platformsToFetch.length > 0) {
    try {
      // Fetch all platforms once and create a lookup map
      const { fetchPlatforms } = await import("../speedruncom");
      const allPlatforms = await fetchPlatforms();
      const platformLookup = new Map<string, string>();

      for (const platform of allPlatforms) {
        const name = platform.names?.international || platform.name || "";
        if (name && platform.id) {
          platformLookup.set(platform.id, name);
        }
      }

      // Update uniquePlatforms with names from the lookup
      for (const platform of platformsToFetch) {
        const name = platformLookup.get(platform.id);
        if (name) {
          uniquePlatforms.set(platform.id, { id: platform.id, name });
        }
      }
    } catch (_error) {
      // Fallback: Fetch platforms individually if bulk fetch fails
      const platformFetchPromises = platformsToFetch.map(async (platform) => {
        try {
          const { fetchPlatformById } = await import("../speedruncom");
          const name = await fetchPlatformById(platform.id);
          if (name) {
            uniquePlatforms.set(platform.id, { id: platform.id, name });
          }
        } catch (_error) {
          // Platform fetch failed, skip this platform
        }
      });
      await Promise.all(platformFetchPromises);
    }
  }

  // Initialize mappings
  const categoryMapping = new Map<string, string>();
  const platformMapping = new Map<string, string>();
  const levelMapping = new Map<string, string>();
  const categoryNameMapping = new Map<string, string>();
  const platformNameMapping = new Map<string, string>();
  const srcPlatformIdToName = new Map<string, string>();
  const srcCategoryIdToName = new Map<string, string>();
  const srcLevelIdToName = new Map<string, string>();

  // Helper: normalize for comparison
  const normalize = (str: string) => str.toLowerCase().trim();

  // Helper: fuzzy match - removes special chars and spaces for better matching
  const fuzzyNormalize = (str: string) =>
    normalize(str).replace(/[^a-z0-9]/g, "");

  // Helper: calculate similarity between two strings (simple Levenshtein-like)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 1.0;
    const distance = longer
      .split("")
      .filter((char, i) => char !== shorter[i]).length;
    return (longer.length - distance) / longer.length;
  };

  // Map categories - match by srcCategoryId first, then by name with improved fuzzy matching
  for (const srcCat of safeSrcCategories) {
    if (!srcCat || !srcCat.name || !srcCat.id) continue;

    // Store SRC ID -> name mapping
    srcCategoryIdToName.set(srcCat.id, srcCat.name);

    // Determine leaderboardType for this SRC category
    // SRC categories have type: "per-game" or "per-level"
    const srcCategoryType = srcCat.type || "per-game";
    const expectedLeaderboardType: "regular" | "individual-level" =
      srcCategoryType === "per-level" ? "individual-level" : "regular";

    const normalizedSrcName = normalize(srcCat.name);
    const fuzzySrcName = fuzzyNormalize(srcCat.name);

    // FIRST: Try to find category by srcCategoryId (most reliable)
    let ourCat = safeOurCategories.find((c) => {
      if (!c) return false;
      return (c as any).srcCategoryId === srcCat.id;
    });

    // SECOND: If no srcCategoryId match, try name matching with improved fuzzy matching
    if (!ourCat) {
      // Find matching local category - try exact match first, then fuzzy match
      ourCat = safeOurCategories.find((c) => {
        if (!c) return false;
        const nameMatch = normalize(c.name) === normalizedSrcName;
        if (!nameMatch) return false;

        // Prefer match with same leaderboardType, but allow fallback
        const catType = c.leaderboardType || "regular";
        return catType === expectedLeaderboardType;
      });
    }

    // Fallback 1: if no match with correct type, try any category with exact matching name
    if (!ourCat) {
      ourCat = safeOurCategories.find(
        (c) => c && normalize(c.name) === normalizedSrcName,
      );
    }

    // Fallback 2: try fuzzy match (without special chars)
    if (!ourCat) {
      ourCat = safeOurCategories.find((c) => {
        if (!c) return false;
        return fuzzyNormalize(c.name) === fuzzySrcName;
      });
    }

    // Fallback 3: try similarity-based matching (for typos/variations)
    if (!ourCat && fuzzySrcName.length > 3) {
      let bestMatch: (typeof safeOurCategories)[0] | undefined;
      let bestSimilarity = 0.8; // Minimum 80% similarity

      for (const c of safeOurCategories) {
        if (!c) continue;
        const similarity = calculateSimilarity(
          fuzzyNormalize(c.name),
          fuzzySrcName,
        );
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = c;
        }
      }
      ourCat = bestMatch;
    }

    if (ourCat) {
      categoryMapping.set(srcCat.id, ourCat.id);
      // Store name mapping with normalized name (for all name variations)
      categoryNameMapping.set(normalizedSrcName, ourCat.id);

      // Also store fuzzy variations for better matching
      if (fuzzySrcName !== normalizedSrcName) {
        categoryNameMapping.set(fuzzySrcName, ourCat.id);
      }
    } else {
      // Category not found in local categories
    }
  }

  // Map platforms (only those used in LSW1 runs) with improved fuzzy matching
  for (const [platformId, platformData] of uniquePlatforms) {
    const platformName = platformData?.name;
    if (!platformName) continue;

    srcPlatformIdToName.set(platformId, platformName);

    const normalizedPlatformName = normalize(platformName);
    const fuzzyPlatformName = fuzzyNormalize(platformName);

    // Try exact match first
    let ourPlatform = safeOurPlatforms.find(
      (p) => p && normalize(p.name) === normalizedPlatformName,
    );

    // Fallback to fuzzy match
    if (!ourPlatform) {
      ourPlatform = safeOurPlatforms.find((p) => {
        if (!p) return false;
        return fuzzyNormalize(p.name) === fuzzyPlatformName;
      });
    }

    // Fallback to similarity-based matching
    if (!ourPlatform && fuzzyPlatformName.length > 2) {
      let bestMatch: (typeof safeOurPlatforms)[0] | undefined;
      let bestSimilarity = 0.85; // Minimum 85% similarity for platforms

      for (const p of safeOurPlatforms) {
        if (!p) continue;
        const similarity = calculateSimilarity(
          fuzzyNormalize(p.name),
          fuzzyPlatformName,
        );
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = p;
        }
      }
      ourPlatform = bestMatch;
    }

    if (ourPlatform) {
      platformMapping.set(platformId, ourPlatform.id);
      platformNameMapping.set(normalizedPlatformName, ourPlatform.id);
      if (fuzzyPlatformName !== normalizedPlatformName) {
        platformNameMapping.set(fuzzyPlatformName, ourPlatform.id);
      }
    } else {
      // Platform not found in local platforms
    }
  }

  // Map levels - check against ALL levels configured across the site
  // (both individual-level and community-golds leaderboard types) with improved fuzzy matching
  for (const srcLevel of safeSrcLevels) {
    if (!srcLevel || !srcLevel.id) continue;

    const levelName = srcLevel.name || srcLevel.names?.international || "";
    if (!levelName) continue;

    // Store SRC ID -> name mapping
    srcLevelIdToName.set(srcLevel.id, levelName);

    const normalizedLevelName = normalize(levelName);
    const fuzzyLevelName = fuzzyNormalize(levelName);

    // Find matching local level - try exact match first
    let ourLevel = safeOurLevels.find(
      (l) => l && normalize(l.name) === normalizedLevelName,
    );

    // Fallback to fuzzy match
    if (!ourLevel) {
      ourLevel = safeOurLevels.find((l) => {
        if (!l) return false;
        return fuzzyNormalize(l.name) === fuzzyLevelName;
      });
    }

    // Fallback to similarity-based matching
    if (!ourLevel && fuzzyLevelName.length > 3) {
      let bestMatch: (typeof safeOurLevels)[0] | undefined;
      let bestSimilarity = 0.8; // Minimum 80% similarity for levels

      for (const l of safeOurLevels) {
        if (!l) continue;
        const similarity = calculateSimilarity(
          fuzzyNormalize(l.name),
          fuzzyLevelName,
        );
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = l;
        }
      }
      ourLevel = bestMatch;
    }

    if (ourLevel) {
      levelMapping.set(srcLevel.id, ourLevel.id);
    } else {
      // Level not found in local levels
    }
  }

  return {
    categoryMapping,
    platformMapping,
    levelMapping,
    categoryNameMapping,
    platformNameMapping,
    srcPlatformIdToName,
    srcCategoryIdToName,
    srcLevelIdToName,
  };
}

export const lswConfig: GameConfig = {
  name: "LEGO Star Wars: The Video Game",
  abbreviation: "lsw",
  userAgent: "lsw1.dev/1.0",
  createSRCMappings,
};

export const lsw2Config: GameConfig = {
  name: "Lego Star Wars II: The Original Trilogy",
  abbreviation: "lsw2",
  userAgent: "lsw1.dev/1.0",
  createSRCMappings,
};

export const lswTcsConfig: GameConfig = {
  name: "Lego Star Wars: The Complete Saga",
  abbreviation: "lsw_tcs",
  userAgent: "lsw1.dev/1.0",
  createSRCMappings,
};

export const gameConfigs: { [key: string]: GameConfig } = {
  lsw: lswConfig,
  lsw2: lsw2Config,
  lsw_tcs: lswTcsConfig,
};
