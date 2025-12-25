/**
 * Speedrun.com Import Service
 * Simplified, robust import system based on SRC API best practices
 */

import {
  getGameId,
  fetchRunsNotOnLeaderboards,
  mapSRCRunToLeaderboardEntry,
  type SRCRun,
} from "../speedruncom";
// Import directly from firestore files to avoid circular dependency with @/lib/db
import {
  getCategoriesFirestore,
  addCategoryFirestore,
} from "../data/firestore/categories";
import {
  getExistingSRCRunIdsFirestore,
  runAutoclaimingForAllUsersFirestore,
} from "../data/firestore/src-imports";
import { addLeaderboardEntryFirestore } from "../data/firestore/runs";
import { getPlayerByDisplayNameFirestore } from "../data/firestore/players";
import { LeaderboardEntry, Category } from "@/types/database";
import { GameConfig } from "./types";

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

export interface SRCMappings {
  // ID mappings: SRC ID -> Local ID
  categoryMapping: Map<string, string>;
  platformMapping: Map<string, string>;
  levelMapping: Map<string, string>;

  // Name mappings: SRC name (lowercase) -> Local ID
  categoryNameMapping: Map<string, string>;
  platformNameMapping: Map<string, string>;

  // SRC ID -> SRC name (for fallback when embedded data is missing)
  srcPlatformIdToName: Map<string, string>;
  srcCategoryIdToName: Map<string, string>;
  srcLevelIdToName: Map<string, string>;
}

// Cache for player and platform names fetched from API during import (prevents duplicate API calls)
const playerIdToNameCache = new Map<string, string>();
const platformIdToNameCache = new Map<string, string>();

/**
 * Validate a mapped run before importing
 * Returns validation errors if any
 */
function validateMappedRun(
  run: Partial<LeaderboardEntry> & { srcRunId: string },
  _srcRunId: string,
): string[] {
  const errors: string[] = [];

  // Essential fields
  if (!run.playerName || run.playerName.trim() === "") {
    errors.push("missing player name");
  }

  if (!run.time || run.time.trim() === "") {
    errors.push("missing time");
  } else if (!/^\d{1,2}:\d{2}:\d{2}$/.test(run.time)) {
    errors.push(`invalid time format "${run.time}" (expected HH:MM:SS)`);
  }

  if (!run.date || run.date.trim() === "") {
    errors.push("missing date");
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(run.date)) {
    errors.push(`invalid date format "${run.date}" (expected YYYY-MM-DD)`);
  }

  // Category and platform are optional - we'll import runs even if they don't match local categories/platforms
  // Admin can assign them during verification
  // No validation errors for missing category/platform - just warnings

  // Run type must be valid
  if (run.runType && run.runType !== "solo" && run.runType !== "co-op") {
    errors.push(`invalid run type "${run.runType}"`);
  }

  // Leaderboard type must be valid
  if (
    run.leaderboardType &&
    run.leaderboardType !== "regular" &&
    run.leaderboardType !== "individual-level" &&
    run.leaderboardType !== "community-golds"
  ) {
    errors.push(`invalid leaderboard type "${run.leaderboardType}"`);
  }

  // For IL/Community Golds, level is optional - admin can assign during verification
  // No validation error for missing level - just a warning

  // For co-op, player2Name should be present
  // Allow "Unknown" as a placeholder (admin can fix later)
  if (run.runType === "co-op") {
    if (
      !run.player2Name ||
      (run.player2Name.trim() === "" && run.player2Name !== "Unknown")
    ) {
      errors.push("missing player 2 name for co-op run");
    }
  }

  return errors;
}

/**
 * Import runs from speedrun.com
 * Simplified, robust implementation with clear error handling
 */
export async function importSRCRuns(
  gameConfig: GameConfig,
  onProgress?: (progress: ImportProgress) => void,
): Promise<ImportResult> {
  const result: ImportResult = {
    imported: 0,
    skipped: 0,
    unmatchedPlayers: new Map(),
    errors: [],
  };

  try {
    // Step 1: Get game ID (use cache if available)
    const gameId = await getGameId(gameConfig.name, gameConfig.abbreviation);
    if (!gameId) {
      result.errors.push(
        `Could not find ${gameConfig.name} game on speedrun.com`,
      );
      return result;
    }

    // Step 2: Get existing SRC run IDs first (optimized - only fetch IDs, not full runs)
    // This allows us to filter out already-linked runs before processing
    let existingSRCRunIds: Set<string>;
    try {
      existingSRCRunIds = await getExistingSRCRunIdsFirestore();
    } catch (error) {
      result.errors.push(
        `Failed to fetch existing run IDs: ${error instanceof Error ? error.message : String(error)}`,
      );
      return result;
    }

    // Step 3: Fetch runs from SRC progressively until we find 400 unlinked runs
    // We'll fetch in batches of 200, filtering out already-linked ones, and continue
    // fetching until we have 400 unlinked runs or exhaust all available runs
    const TARGET_UNLINKED_COUNT = 400; // Doubled from 200 to 400
    const BATCH_SIZE = 200;
    const MAX_TOTAL_FETCH = 10000; // Increased safety limit to support larger imports

    let srcRuns: SRCRun[] = [];
    let unlinkedRuns: SRCRun[] = [];
    let currentOffset = 0;
    let totalFetched = 0;

    try {
      // Keep fetching batches until we have enough unlinked runs or hit limits
      while (
        unlinkedRuns.length < TARGET_UNLINKED_COUNT &&
        totalFetched < MAX_TOTAL_FETCH
      ) {
        // Fetch the next batch of 200 runs
        const batchRuns = await fetchRunsNotOnLeaderboards(
          gameId,
          BATCH_SIZE,
          currentOffset,
        );

        if (batchRuns.length === 0) {
          // No more runs available from SRC
          break;
        }

        totalFetched += batchRuns.length;

        // Filter out already-linked runs from this batch
        const unlinkedInBatch = batchRuns.filter(
          (run) => !existingSRCRunIds.has(run.id),
        );
        unlinkedRuns.push(...unlinkedInBatch);

        // Update offset for next batch
        currentOffset += batchRuns.length;

        // If we got fewer runs than requested, we've reached the end
        if (batchRuns.length < BATCH_SIZE) {
          break;
        }
      }

      if (totalFetched === 0) {
        result.errors.push("No runs found to import");
        return result;
      }

      // Take only the first 400 unlinked runs (most recent ones)
      srcRuns = unlinkedRuns.slice(0, TARGET_UNLINKED_COUNT);

      if (srcRuns.length === 0) {
        result.errors.push(
          `No new runs to import - checked ${totalFetched} recent runs and all are already linked on the boards`,
        );
        return result;
      }
    } catch (error) {
      result.errors.push(
        `Failed to fetch runs: ${error instanceof Error ? error.message : String(error)}`,
      );
      return result;
    }

    // Step 4: Create mappings (only for platforms used in these runs) - pass gameId to avoid redundant API call
    let mappings: SRCMappings;
    try {
      mappings = await gameConfig.createSRCMappings(srcRuns, gameId);
    } catch (error) {
      result.errors.push(
        `Failed to create mappings: ${error instanceof Error ? error.message : String(error)}`,
      );
      return result;
    }

    // Step 4.5: Fetch local categories with subcategories for subcategory mapping
    // This ensures we can map SRC variable values to local subcategory IDs
    let localCategories: Category[] = [];
    try {
      localCategories = await getCategoriesFirestore();
    } catch (_error) {
      // Continue without subcategory mapping - runs will still import with srcSubcategory
    }

    onProgress?.({ total: srcRuns.length, imported: 0, skipped: 0 });

    // Step 5: Pre-fetch all unique player names to batch lookups
    const uniquePlayerNames = new Set<string>();
    for (const srcRun of srcRuns) {
      if (srcRun.players && Array.isArray(srcRun.players)) {
        for (const player of srcRun.players) {
          if (player && typeof player === "object") {
            const playerData =
              "data" in player && Array.isArray(player.data)
                ? player.data[0]
                : "data" in player
                  ? player.data
                  : player;
            if (playerData?.names?.international) {
              uniquePlayerNames.add(playerData.names.international.trim());
            }
          }
        }
      }
    }

    // Batch lookup all players at once
    const playerNameCache = new Map<string, any>();
    const playerLookupPromises = Array.from(uniquePlayerNames).map(
      async (name) => {
        try {
          const player = await getPlayerByDisplayNameFirestore(name);
          if (player) {
            playerNameCache.set(name.toLowerCase(), player);
          }
        } catch (_error) {
          // Silently fail - player doesn't exist
        }
      },
    );
    await Promise.all(playerLookupPromises);

    // Step 6: Process runs in parallel batches for better performance
    // Process in batches of 20 to balance speed and API rate limits
    const PROCESS_BATCH_SIZE = 20;
    const runBatches: SRCRun[][] = [];
    for (let i = 0; i < srcRuns.length; i += PROCESS_BATCH_SIZE) {
      runBatches.push(srcRuns.slice(i, i + PROCESS_BATCH_SIZE));
    }

    // Process each batch in parallel
    for (const batch of runBatches) {
      await Promise.all(
        batch.map(async (srcRun) => {
          try {
            // Double-check: Skip if already exists in database (safety check)
            if (existingSRCRunIds.has(srcRun.id)) {
              result.skipped++;
              onProgress?.({
                total: srcRuns.length,
                imported: result.imported,
                skipped: result.skipped,
              });
              return;
            }

            // Map SRC run to our format
            let mappedRun: Partial<LeaderboardEntry> & {
              srcRunId: string;
              importedFromSRC: boolean;
            };
            try {
              mappedRun = await mapSRCRunToLeaderboardEntry(
                srcRun,
                mappings.categoryMapping,
                mappings.platformMapping,
                mappings.levelMapping,
                "", // CRITICAL: Use empty string for unclaimed imported runs - never create temporary profiles
                undefined, // embeddedData
                mappings.categoryNameMapping,
                mappings.platformNameMapping,
                mappings.srcPlatformIdToName,
                mappings.srcCategoryIdToName,
                mappings.srcLevelIdToName,
                playerIdToNameCache,
                platformIdToNameCache,
                localCategories, // Pass local categories with subcategories for mapping
              );
            } catch (mapError: any) {
              result.skipped++;
              const errorMessage =
                mapError instanceof Error ? mapError.message : String(mapError);
              result.errors.push(
                `Run ${srcRun?.id || "unknown"}: ${errorMessage}`,
              );
              onProgress?.({
                total: srcRuns.length,
                imported: result.imported,
                skipped: result.skipped,
              });
              return;
            }

            // Set import metadata
            mappedRun.importedFromSRC = true;
            mappedRun.srcRunId = srcRun.id;
            mappedRun.verified = false;

            // Ensure required fields have defaults
            if (!mappedRun.runType) mappedRun.runType = "solo";
            // CRITICAL: Don't override leaderboardType - mapSRCRunToLeaderboardEntry already sets it correctly
            // Only set default if it's truly undefined/null (shouldn't happen, but safety check)
            if (
              mappedRun.leaderboardType === undefined ||
              mappedRun.leaderboardType === null
            ) {
              // If leaderboardType is missing, infer from level field
              mappedRun.leaderboardType = mappedRun.level
                ? "individual-level"
                : "regular";
            }
            if (!mappedRun.playerName || mappedRun.playerName.trim() === "") {
              mappedRun.playerName = "Unknown";
            }

            // Validate time - check if time is missing or 00:00:00 when it shouldn't be
            if (
              !mappedRun.time ||
              mappedRun.time.trim() === "" ||
              mappedRun.time === "00:00:00"
            ) {
              // Check if the source run actually has a time
              if (srcRun.times?.primary_t && srcRun.times.primary_t > 0) {
                // Time exists in source but was lost during conversion - try to fix it
                const fixedTime = secondsToTime(srcRun.times.primary_t);
                if (fixedTime && fixedTime !== "00:00:00") {
                  mappedRun.time = fixedTime;
                } else {
                  result.errors.push(
                    `Run ${srcRun.id}: time conversion failed`,
                  );
                }
              } else if (
                srcRun.times?.primary &&
                srcRun.times.primary.trim() !== ""
              ) {
                // Try ISO duration conversion
                const fixedTime = isoDurationToTime(srcRun.times.primary);
                if (fixedTime && fixedTime !== "00:00:00") {
                  mappedRun.time = fixedTime;
                } else {
                  result.errors.push(
                    `Run ${srcRun.id}: time conversion failed`,
                  );
                }
              } else {
                result.errors.push(
                  `Run ${srcRun.id}: missing time data in source run`,
                );
              }
            }

            // Validate the mapped run - only skip if essential fields are missing
            const validationErrors = validateMappedRun(mappedRun, srcRun.id);
            const criticalErrors = validationErrors.filter(
              (err) =>
                err.includes("missing player name") ||
                err.includes("missing time") ||
                err.includes("invalid time format") ||
                err.includes("missing date") ||
                err.includes("invalid date format"),
            );

            if (criticalErrors.length > 0) {
              result.skipped++;
              result.errors.push(
                `Run ${srcRun.id}: ${criticalErrors.join(", ")}`,
              );
              onProgress?.({
                total: srcRuns.length,
                imported: result.imported,
                skipped: result.skipped,
              });
              return;
            }

            // Log non-critical validation issues as warnings
            // Note: warnings variable was declared but never used - removed for now
            // const warnings = validationErrors.filter(err =>
            //   !err.includes('missing player name') &&
            //   !err.includes('missing time') &&
            //   !err.includes('invalid time format') &&
            //   !err.includes('missing date') &&
            //   !err.includes('invalid date format')
            // );

            // Handle platform - allow empty if SRC name exists
            if (!mappedRun.platform || mappedRun.platform.trim() === "") {
              if (!mappedRun.srcPlatformName) {
                mappedRun.platform = "";
                mappedRun.srcPlatformName = "Unknown Platform (from SRC)";
                result.errors.push(
                  `Run ${srcRun.id}: missing platform (using placeholder)`,
                );
              } else {
                mappedRun.platform = "";
              }
            }

            // Normalize player names
            mappedRun.playerName = mappedRun.playerName.trim();

            // For co-op runs, preserve player2Name even if it's "Unknown"
            if (mappedRun.runType === "co-op") {
              if (mappedRun.player2Name) {
                mappedRun.player2Name =
                  mappedRun.player2Name.trim() || "Unknown";
              } else {
                mappedRun.player2Name = "Unknown";
              }
            } else {
              // For solo runs, clear player2Name
              mappedRun.player2Name = undefined;
            }

            // Check player matching (for warnings only, doesn't block import) - use cached lookups
            const player1Matched = playerNameCache.get(
              mappedRun.playerName.toLowerCase(),
            );
            const player2Matched = mappedRun.player2Name
              ? playerNameCache.get(mappedRun.player2Name.toLowerCase())
              : null;

            const unmatched: { player1?: string; player2?: string } = {};
            if (!player1Matched) unmatched.player1 = mappedRun.playerName;
            if (mappedRun.player2Name && !player2Matched)
              unmatched.player2 = mappedRun.player2Name;

            // Save to database
            try {
              const addedRunId = await addLeaderboardEntryFirestore(
                mappedRun as LeaderboardEntry,
              );
              if (!addedRunId) {
                result.skipped++;
                result.errors.push(
                  `Run ${srcRun.id}: failed to save to database`,
                );
                onProgress?.({
                  total: srcRuns.length,
                  imported: result.imported,
                  skipped: result.skipped,
                });
                return;
              }

              // Track unmatched players
              if (unmatched.player1 || unmatched.player2) {
                result.unmatchedPlayers.set(addedRunId, unmatched);
              }

              result.imported++;
              onProgress?.({
                total: srcRuns.length,
                imported: result.imported,
                skipped: result.skipped,
              });
            } catch (addError: any) {
              result.skipped++;
              const errorMsg = addError?.message || String(addError);
              // Check if this is a duplicate error - don't add to errors array for duplicates
              // Duplicates are expected and handled gracefully
              const isDuplicateError =
                errorMsg.includes("already exists") ||
                errorMsg.includes("srcRunId") ||
                errorMsg.includes("duplicate");
              if (!isDuplicateError) {
                result.errors.push(`Run ${srcRun.id}: ${errorMsg}`);
              }
              onProgress?.({
                total: srcRuns.length,
                imported: result.imported,
                skipped: result.skipped,
              });
            }
          } catch (_error) {
            // Catch any unexpected errors processing this run
            result.skipped++;
            result.errors.push(
              `Run ${srcRun.id}: ${error instanceof Error ? error.message : String(error)}`,
            );
            onProgress?.({
              total: srcRuns.length,
              imported: result.imported,
              skipped: result.skipped,
            });
          }
        }),
      );
    }

    // After importing runs, run autoclaiming for all users with SRC usernames
    // This ensures newly imported runs are automatically claimed
    try {
      const autoclaimResult = await runAutoclaimingForAllUsersFirestore();
      if (autoclaimResult.runsUpdated > 0) {
        // Runs were automatically claimed
      }
      if (autoclaimResult.errors.length > 0) {
        // Log errors but don't fail the import
        console.warn("Autoclaiming errors:", autoclaimResult.errors);
      }
    } catch (_autoclaimError) {
      // Don't fail the import if autoclaiming fails
    }

    return result;
  } catch (error) {
    // Catch any unexpected top-level errors
    result.errors.push(
      `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    );
    return result;
  }
}

/**
 * Sync categories from Speedrun.com
 * Fetches all categories from SRC and creates them locally if they don't exist
 */
export async function syncCategoriesFromSRC(gameConfig: GameConfig): Promise<{
  created: number;
  errors: string[];
}> {
  const result = { created: 0, errors: [] as string[] };

  try {
    const gameId = await getGameId(gameConfig.name, gameConfig.abbreviation);
    if (!gameId) {
      result.errors.push("Could not find LEGO Star Wars game on speedrun.com");
      return result;
    }

    const [srcCategories, localCategories] = await Promise.all([
      fetchSRCCategories(gameId),
      getCategoriesFirestore(),
    ]);

    if (!Array.isArray(srcCategories)) {
      result.errors.push("Failed to fetch categories from Speedrun.com");
      return result;
    }

    for (const srcCat of srcCategories) {
      if (!srcCat.id || !srcCat.name) continue;

      // Check if category exists locally (by srcCategoryId or name)
      const exists = localCategories.some(
        (c) =>
          (c as any).srcCategoryId === srcCat.id ||
          c.name.toLowerCase().trim() === srcCat.name.toLowerCase().trim(),
      );

      if (!exists) {
        try {
          // Determine leaderboard type
          const leaderboardType =
            srcCat.type === "per-level" ? "individual-level" : "regular";

          // Create category - use firestore function directly to avoid circular dependency
          await addCategoryFirestore(srcCat.name, leaderboardType, srcCat.id);
          result.created++;
        } catch (error) {
          result.errors.push(
            `Failed to create category "${srcCat.name}": ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    }

    return result;
  } catch (error) {
    result.errors.push(
      `Unexpected error syncing categories: ${error instanceof Error ? error.message : String(error)}`,
    );
    return result;
  }
}
