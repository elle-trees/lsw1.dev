/**
 * Barrel exports for Firestore functions
 * Provides shorter, cleaner import names for commonly used functions
 */

// Categories
export { getCategoriesFirestore as getCategories } from './categories';
export { addCategoryFirestore as addCategory } from './categories';
export { updateCategoryFirestore as updateCategory } from './categories';
export { deleteCategoryFirestore as deleteCategory } from './categories';

// Platforms
export { getPlatformsFirestore as getPlatforms } from './platforms';
export { addPlatformFirestore as addPlatform } from './platforms';
export { updatePlatformFirestore as updatePlatform } from './platforms';
export { deletePlatformFirestore as deletePlatform } from './platforms';

// Levels
export { getLevelsFirestore as getLevels } from './levels';
export { addLevelFirestore as addLevel } from './levels';
export { updateLevelFirestore as updateLevel } from './levels';
export { deleteLevelFirestore as deleteLevel } from './levels';

// Leaderboards
export { getLeaderboardEntriesFirestore as getLeaderboardEntries } from './leaderboards';
export { getLeaderboardEntryByIdFirestore as getLeaderboardEntryById } from './leaderboards';
export { subscribeToLeaderboardEntriesFirestore as subscribeToLeaderboardEntries } from './leaderboards';

// Players
export { getPlayerByUidFirestore as getPlayerByUid } from './players';
export { getPlayerByDisplayNameFirestore as getPlayerByDisplayName } from './players';
export { createPlayerFirestore as createPlayer } from './players';
export { updatePlayerProfileFirestore as updatePlayerProfile } from './players';
export { getPlayersByPointsFirestore as getPlayersByPoints } from './players';
export { subscribeToPlayerFirestore as subscribeToPlayer } from './players';
export { subscribeToPlayersByPointsFirestore as subscribeToPlayersByPoints } from './players';

// Runs
export { addLeaderboardEntryFirestore as addLeaderboardEntry } from './runs';
export { updateLeaderboardEntryFirestore as updateLeaderboardEntry } from './runs';
export { deleteLeaderboardEntryFirestore as deleteLeaderboardEntry } from './runs';
export { getRecentRunsFirestore as getRecentRuns } from './runs';
export { getPlayerRunsFirestore as getPlayerRuns } from './runs';
export { getPlayerPendingRunsFirestore as getPlayerPendingRuns } from './runs';
export { subscribeToPlayerRunsFirestore as subscribeToPlayerRuns } from './runs';
export { subscribeToPlayerPendingRunsFirestore as subscribeToPlayerPendingRuns } from './runs';
export { subscribeToAllVerifiedRunsFirestore as subscribeToAllVerifiedRuns } from './runs';

// Points
export { getPointsConfigFirestore as getPointsConfig } from './points';
export { updatePointsConfigFirestore as updatePointsConfig } from './points';
export { subscribeToPointsConfigFirestore as subscribeToPointsConfig } from './points';

// SRC Imports
export { getUnclaimedRunsBySRCUsernameFirestore as getUnclaimedRunsBySRCUsername } from './src-imports';
export { claimRunFirestore as claimRun } from './src-imports';
export { getAllVerifiedRunsFirestore as getAllVerifiedRuns } from './src-imports';

// Downloads
export { getDownloadEntriesFirestore as getDownloadEntries } from './downloads';
export { addDownloadEntryFirestore as addDownloadEntry } from './downloads';
export { updateDownloadEntryFirestore as updateDownloadEntry } from './downloads';
export { deleteDownloadEntryFirestore as deleteDownloadEntry } from './downloads';

// Notifications
export { getUserNotificationsFirestore as getUserNotifications } from './notifications';
export { getUnreadUserNotificationsFirestore as getUnreadUserNotifications } from './notifications';
export { markNotificationAsReadFirestore as markNotificationAsRead } from './notifications';
export { markAllNotificationsAsReadFirestore as markAllNotificationsAsRead } from './notifications';
export { subscribeToUserNotificationsFirestore as subscribeToUserNotifications } from './notifications';
export { subscribeToUnreadUserNotificationsFirestore as subscribeToUnreadUserNotifications } from './notifications';

// Stats
export { getVerifiedRunsCountFirestore as getVerifiedRunsCount } from './stats';
export { getTotalVerifiedRunsTimeFirestore as getTotalVerifiedRunsTime } from './stats';
export { getVerifiedRunsStatsFirestore as getVerifiedRunsStats } from './stats';

// Game Details
export { getGameDetailsConfigFirestore as getGameDetailsConfig } from './game-details';
export { updateGameDetailsConfigFirestore as updateGameDetailsConfig } from './game-details';

// Translations (these don't have Firestore suffix)
export { getAdminTranslations } from './translations';
export { getAllAdminTranslations } from './translations';
export { setAdminTranslation } from './translations';
export { deleteAdminTranslation } from './translations';
export { subscribeToAdminTranslations } from './translations';

// Utilities
export { withErrorHandling, withBooleanErrorHandling, withArrayErrorHandling } from './utils';

