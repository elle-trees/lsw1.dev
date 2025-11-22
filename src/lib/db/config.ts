// Points and Game Details configuration
import {
  getPointsConfigFirestore,
  updatePointsConfigFirestore,
  backfillPointsForAllRunsFirestore,
  wipeLeaderboardsFirestore
} from "../data/firestore/points";

import {
  getGameDetailsConfigFirestore,
  updateGameDetailsConfigFirestore
} from "../data/firestore/game-details";

export const getPointsConfig = getPointsConfigFirestore;
export const updatePointsConfig = updatePointsConfigFirestore;

export const getGameDetailsConfig = getGameDetailsConfigFirestore;
export const updateGameDetailsConfig = updateGameDetailsConfigFirestore;

export const backfillPointsForAllRuns = async () => {
  return backfillPointsForAllRunsFirestore();
};

export const wipeLeaderboards = async () => {
  return wipeLeaderboardsFirestore();
};

