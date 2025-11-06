/**
 * Speedrun.com Import Service
 * Handles importing runs from speedrun.com API with proper data mapping and validation
 */

import { 
  getLSWGameId, 
  fetchRunsNotOnLeaderboards,
  mapSRCRunToLeaderboardEntry,
  fetchCategories as fetchSRCCategories,
  fetchLevels as fetchSRCLevels,
  fetchPlatforms as fetchSRCPlatforms,
  extractIdAndName,
  type SRCRun,
} from "../speedruncom";
import { 
  getCategoriesFromFirestore,
  getPlatformsFromFirestore,
  getLevels,
  getAllRunsForDuplicateCheck,
  addLeaderboardEntry,
  getPlayerByDisplayName,
} from "../db";
import { LeaderboardEntry } from "@/types/database";

export interface ImportResult {
  imported: number;
  skipped: number;
  unmatchedPlayers: Map<string, { player1?: string; player2?: string }>;
  errors: string[];
}

export interface ImportProgress {
  total: number;
  imported: number;
  skipped: number;
}

/**
 * Create mapping between SRC IDs and our IDs for categories, platforms, and levels
 */
export async function createSRCMappings() {
  const gameId = await getLSWGameId();
  if (!gameId) {
    throw new Error("Could not find LEGO Star Wars game on speedrun.com");
  }

  // Fetch all data in parallel
  const [ourCategories, ourPlatforms, ourLevels, srcCategories, srcPlatforms, srcLevels] = await Promise.all([
    getCategoriesFromFirestore(),
    getPlatformsFromFirestore(),
    getLevels(),
    fetchSRCCategories(gameId),
    fetchSRCPlatforms(),
    fetchSRCLevels(gameId),
  ]);

  // Generic mapping helper
  const createMapping = <T extends { id: string; name: string }>(
    srcItems: T[],
    ourItems: Array<{ id: string; name: string }>,
    createNameMapping: boolean = true
  ): { idMapping: Map<string, string>; nameMapping: Map<string, string> } => {
    const idMapping = new Map<string, string>();
    const nameMapping = new Map<string, string>();
    
    for (const srcItem of srcItems) {
      const ourItem = ourItems.find(item => 
        item.name.toLowerCase().trim() === srcItem.name.toLowerCase().trim()
      );
      if (ourItem) {
        idMapping.set(srcItem.id, ourItem.id);
        if (createNameMapping) {
          nameMapping.set(srcItem.name.toLowerCase().trim(), ourItem.id);
        }
      }
    }
    
    return { idMapping, nameMapping };
  };

  // Create mappings for categories, platforms, and levels
  const categoryMaps = createMapping(srcCategories, ourCategories, true);
  const platformMaps = createMapping(srcPlatforms, ourPlatforms, true);
  const levelMaps = createMapping(srcLevels, ourLevels, false);

  const categoryMapping = categoryMaps.idMapping;
  const platformMapping = platformMaps.idMapping;
  const levelMapping = levelMaps.idMapping;
  const categoryNameMapping = categoryMaps.nameMapping;
  const platformNameMapping = platformMaps.nameMapping;

  return {
    categoryMapping,
    platformMapping,
    levelMapping,
    categoryNameMapping,
    platformNameMapping,
    ourCategories,
    ourPlatforms,
    ourLevels,
  };
}

/**
 * Extract SRC data from embedded API response
 * Uses the unified extraction from speedruncom.ts
 */
export function extractSRCData(srcRun: SRCRun) {
  const categoryData = extractIdAndName(srcRun.category);
  const platformData = extractIdAndName(srcRun.system?.platform);
  const levelData = extractIdAndName(srcRun.level);

  return {
    srcCategoryId: categoryData.id,
    srcCategoryName: categoryData.name,
    srcPlatformId: platformData.id,
    srcPlatformName: platformData.name,
    srcLevelId: levelData.id,
    srcLevelName: levelData.name,
  };
}

/**
 * Check if a run is a duplicate
 */
export function isDuplicateRun(
  run: Partial<LeaderboardEntry>,
  existingRunKeys: Set<string>
): boolean {
  const normalizeName = (name: string) => name.trim().toLowerCase();
  const player1Name = normalizeName(run.playerName || '');
  const player2Name = run.player2Name ? normalizeName(run.player2Name) : '';
  const runKey = `${player1Name}|${run.category}|${run.platform}|${run.runType}|${run.time}|${run.leaderboardType || 'regular'}|${run.level || ''}`;
  
  // Check for exact duplicate
  if (existingRunKeys.has(runKey)) {
    return true;
  }

  // Check for co-op runs with swapped players
  if (run.runType === 'co-op' && player2Name) {
    const swappedKey = `${player2Name}|${run.category}|${run.platform}|${run.runType}|${run.time}|${run.leaderboardType || 'regular'}|${run.level || ''}`;
    if (existingRunKeys.has(swappedKey)) {
      return true;
    }
  }

  return false;
}

/**
 * Import runs from speedrun.com
 * Simple import - maps SRC data to leaderboard entries and adds them
 */
export async function importSRCRuns(
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  const result: ImportResult = {
    imported: 0,
    skipped: 0,
    unmatchedPlayers: new Map(),
    errors: [],
  };

  try {
    // Get game ID
    const gameId = await getLSWGameId();
    if (!gameId) {
      throw new Error("Could not find LEGO Star Wars game on speedrun.com");
    }

    // Fetch runs from SRC
    const srcRuns = await fetchRunsNotOnLeaderboards(gameId);
    if (srcRuns.length === 0) {
      return result;
    }

    // Create mappings
    const mappings = await createSRCMappings();

    // Get existing runs for duplicate checking
    const existingRuns = await getAllRunsForDuplicateCheck();
    const existingSRCRunIds = new Set(
      existingRuns.filter(r => r.srcRunId).map(r => r.srcRunId!)
    );

    // Create duplicate check keys (only for verified runs)
    const normalizeName = (name: string) => name.trim().toLowerCase();
    const existingRunKeys = new Set<string>();
    for (const run of existingRuns.filter(r => r.verified)) {
      const key = `${normalizeName(run.playerName)}|${run.category}|${run.platform}|${run.runType}|${run.time}|${run.leaderboardType || 'regular'}|${run.level || ''}`;
      existingRunKeys.add(key);
      if (run.runType === 'co-op' && run.player2Name) {
        const swappedKey = `${normalizeName(run.player2Name)}|${run.category}|${run.platform}|${run.runType}|${run.time}|${run.leaderboardType || 'regular'}|${run.level || ''}`;
        existingRunKeys.add(swappedKey);
      }
    }

    onProgress?.({ total: srcRuns.length, imported: 0, skipped: 0 });

    // Import each run
    for (const srcRun of srcRuns) {
      try {
        // Skip if already imported
        if (existingSRCRunIds.has(srcRun.id)) {
          result.skipped++;
          onProgress?.({ total: srcRuns.length, imported: result.imported, skipped: result.skipped });
          continue;
        }

        // Map the run using the utility function (it already handles all mapping)
        const mappedRun = mapSRCRunToLeaderboardEntry(
          srcRun,
          undefined,
          mappings.categoryMapping,
          mappings.platformMapping,
          mappings.levelMapping,
          "imported",
          mappings.categoryNameMapping,
          mappings.platformNameMapping
        );

        // Extract SRC data for validation (mapping already done in mapSRCRunToLeaderboardEntry)
        const srcData = extractSRCData(srcRun);

        // Basic validation - must have category and platform (either mapped or SRC name)
        if (!mappedRun.category && !srcData.srcCategoryName) {
          result.skipped++;
          result.errors.push(`Run ${srcRun.id}: missing category`);
          onProgress?.({ total: srcRuns.length, imported: result.imported, skipped: result.skipped });
          continue;
        }
        if (!mappedRun.platform && !srcData.srcPlatformName) {
          result.skipped++;
          result.errors.push(`Run ${srcRun.id}: missing platform`);
          onProgress?.({ total: srcRuns.length, imported: result.imported, skipped: result.skipped });
          continue;
        }
        
        // If mapping failed, ensure we have at least empty strings (not undefined)
        if (!mappedRun.category) mappedRun.category = '';
        if (!mappedRun.platform) mappedRun.platform = '';

        // Normalize player names
        mappedRun.playerName = (mappedRun.playerName || 'Unknown').trim();
        if (mappedRun.player2Name) {
          mappedRun.player2Name = mappedRun.player2Name.trim() || undefined;
        }

        // Check for duplicates
        if (isDuplicateRun(mappedRun, existingRunKeys)) {
          result.skipped++;
          onProgress?.({ total: srcRuns.length, imported: result.imported, skipped: result.skipped });
          continue;
        }

        // Check player matching
        const player1Matched = await getPlayerByDisplayName(mappedRun.playerName);
        const player2Matched = mappedRun.player2Name ? await getPlayerByDisplayName(mappedRun.player2Name) : null;

        const unmatched: { player1?: string; player2?: string } = {};
        if (!player1Matched) unmatched.player1 = mappedRun.playerName;
        if (mappedRun.player2Name && !player2Matched) unmatched.player2 = mappedRun.player2Name;

        // Set import flags
        mappedRun.importedFromSRC = true;
        mappedRun.srcRunId = srcRun.id;
        mappedRun.verified = false;

        // Add the run
        const addedRunId = await addLeaderboardEntry(mappedRun as LeaderboardEntry);

        if (!addedRunId) {
          result.skipped++;
          result.errors.push(`Run ${srcRun.id}: failed to add`);
          onProgress?.({ total: srcRuns.length, imported: result.imported, skipped: result.skipped });
          continue;
        }

        // Store unmatched players
        if ((unmatched.player1 || unmatched.player2)) {
          result.unmatchedPlayers.set(addedRunId, unmatched);
        }

        // Add to existing keys to prevent batch duplicates
        const player1Name = normalizeName(mappedRun.playerName);
        const player2Name = mappedRun.player2Name ? normalizeName(mappedRun.player2Name) : '';
        const runKey = `${player1Name}|${mappedRun.category}|${mappedRun.platform}|${mappedRun.runType}|${mappedRun.time}|${mappedRun.leaderboardType || 'regular'}|${mappedRun.level || ''}`;
        existingRunKeys.add(runKey);

        result.imported++;
        onProgress?.({ total: srcRuns.length, imported: result.imported, skipped: result.skipped });

      } catch (error) {
        result.skipped++;
        result.errors.push(`Run ${srcRun.id}: ${error instanceof Error ? error.message : String(error)}`);
        onProgress?.({ total: srcRuns.length, imported: result.imported, skipped: result.skipped });
      }
    }

    return result;
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error));
    throw error;
  }
}

