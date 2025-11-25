// Speedrun.com import operations
import {
  checkSRCRunExistsFirestore,
  getImportedSRCRunsFirestore,
  getAllRunsForDuplicateCheckFirestore,
  deleteAllImportedSRCRunsFirestore,
  wipeAllImportedSRCRunsFirestore,
  getVerifiedRunsWithInvalidDataFirestore,
  getIlRunsToFixFirestore,
  getExistingSRCRunIdsFirestore,
  getUnclaimedImportedRunsFirestore,
  deleteAllUnclaimedImportedRunsFirestore,
  findDuplicateRunsFirestore,
  removeDuplicateRunsFirestore,
  autoClaimRunsBySRCUsernameFirestore,
  runAutoclaimingForAllUsersFirestore,
  getUnclaimedRunsBySRCUsernameFirestore,
  getUnassignedRunsFirestore,
  claimRunFirestore,
  getAllVerifiedRunsFirestore,
  normalizeSRCPlayerNamesInRunsFirestore
} from "../data/firestore/src-imports";

export const checkSRCRunExists = checkSRCRunExistsFirestore;
export const getImportedSRCRuns = getImportedSRCRunsFirestore;
export const getAllRunsForDuplicateCheck = getAllRunsForDuplicateCheckFirestore;
export const deleteAllImportedSRCRuns = deleteAllImportedSRCRunsFirestore;
export const wipeAllImportedSRCRuns = wipeAllImportedSRCRunsFirestore;
export const getVerifiedRunsWithInvalidData = getVerifiedRunsWithInvalidDataFirestore;
export const getIlRunsToFix = getIlRunsToFixFirestore;
export const getExistingSRCRunIds = getExistingSRCRunIdsFirestore;
export const getUnclaimedImportedRuns = getUnclaimedImportedRunsFirestore;
export const deleteAllUnclaimedImportedRuns = deleteAllUnclaimedImportedRunsFirestore;
export const findDuplicateRuns = findDuplicateRunsFirestore;
export const removeDuplicateRuns = removeDuplicateRunsFirestore;
export const autoClaimRunsBySRCUsername = autoClaimRunsBySRCUsernameFirestore;
export const getUnclaimedRunsBySRCUsername = getUnclaimedRunsBySRCUsernameFirestore;
export const getUnassignedRuns = getUnassignedRunsFirestore;
export const claimRun = claimRunFirestore;
export const getAllVerifiedRuns = getAllVerifiedRunsFirestore;
export const runAutoclaimingForAllUsers = runAutoclaimingForAllUsersFirestore;
export const normalizeSRCPlayerNamesInRuns = normalizeSRCPlayerNamesInRunsFirestore;

// Export debug function
export { debugAutoclaimingForUser } from "../data/firestore/autoclaim-debug";

