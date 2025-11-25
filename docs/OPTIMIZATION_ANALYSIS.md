# Codebase Optimization Analysis

This document identifies opportunities to reduce redundancy, decrease codebase size, improve performance, and reduce build times.

## Executive Summary

**Key Findings:**
- **200+ console.log/error calls** that should use the logger utility
- **Duplicate query building logic** in leaderboard functions (~70 lines duplicated)
- **Repeated import aliases** across 8+ files (e.g., `getCategoriesFirestore as getCategories`)
- **Inconsistent error handling** - some files use utilities, others use try-catch directly
- **Unused function parameters** kept "for compatibility" in `calculatePoints`
- **Duplicate prefetch imports** for categories/platforms/levels
- **Missing lazy loading** for several large pages
- **Bundle size opportunities** with better code splitting

## 1. Reduce Redundancy

### 1.1 Duplicate Query Building Logic (HIGH PRIORITY)

**Location:** `src/lib/data/firestore/leaderboards.ts`

**Issue:** The `getLeaderboardEntriesFirestore` and `subscribeToLeaderboardEntriesFirestore` functions have nearly identical query constraint building logic (~40 lines duplicated).

**Lines 35-64** and **Lines 406-435** contain the same logic:
- Normalization of IDs
- Building query constraints array
- Adding where clauses
- Setting fetch limit

**Solution:**
```typescript
// Extract to a shared function
function buildLeaderboardQueryConstraints(
  categoryId?: string,
  platformId?: string,
  runType?: 'solo' | 'co-op',
  leaderboardType?: 'regular' | 'individual-level' | 'community-golds',
  levelId?: string
): QueryConstraint[] {
  const normalizedCategoryId = categoryId && categoryId !== "all" ? normalizeCategoryId(categoryId) : undefined;
  const normalizedPlatformId = platformId && platformId !== "all" ? normalizePlatformId(platformId) : undefined;
  const normalizedLevelId = levelId && levelId !== "all" ? normalizeLevelId(levelId) : undefined;
  
  const constraints: QueryConstraint[] = [
    where("verified", "==", true),
  ];

  if (leaderboardType) {
    constraints.push(where("leaderboardType", "==", leaderboardType));
  }

  if (normalizedLevelId && (leaderboardType === 'individual-level' || leaderboardType === 'community-golds')) {
    constraints.push(where("level", "==", normalizedLevelId));
  }

  if (normalizedCategoryId) {
    constraints.push(where("category", "==", normalizedCategoryId));
  }

  if (normalizedPlatformId) {
    constraints.push(where("platform", "==", normalizedPlatformId));
  }

  if (runType && (runType === "solo" || runType === "co-op")) {
    constraints.push(where("runType", "==", runType));
  }
  
  constraints.push(firestoreLimit(500));
  return constraints;
}
```

**Impact:** Reduces ~40 lines of duplicate code, improves maintainability.

### 1.2 Duplicate Import Aliases (MEDIUM PRIORITY)

**Issue:** 8+ files import Firestore functions with the same aliases:
- `getCategoriesFirestore as getCategories` (8 files)
- `getPlatformsFirestore as getPlatforms` (8 files)
- `getLevelsFirestore as getLevels` (4 files)

**Files affected:**
- `src/pages/RunDetails.tsx`
- `src/pages/UserSettings.tsx`
- `src/pages/PlayerDetails.tsx`
- `src/pages/Stats.tsx`
- `src/pages/PointsLeaderboard.tsx`
- `src/pages/Leaderboards.tsx`
- `src/components/RecentRuns.tsx`
- `src/pages/SubmitRun.tsx`

**Solution:** Create a barrel export file `src/lib/data/firestore/index.ts`:
```typescript
// Re-export with shorter names
export { getCategoriesFirestore as getCategories } from './categories';
export { getPlatformsFirestore as getPlatforms } from './platforms';
export { getLevelsFirestore as getLevels } from './levels';
// ... etc
```

Then files can import: `import { getCategories, getPlatforms, getLevels } from '@/lib/data/firestore'`

**Impact:** Reduces import verbosity, centralizes naming.

### 1.3 Duplicate Prefetch Imports (LOW PRIORITY)

**Location:** `src/lib/prefetch.ts`

**Issue:** Lines 191-195 and 205-209 have identical imports for categories, platforms, and levels.

**Solution:** Extract to a shared helper:
```typescript
async function prefetchStaticData() {
  const [{ getCategoriesFirestore: getCategories }, { getPlatformsFirestore: getPlatforms }, { getLevelsFirestore: getLevels }] = await Promise.all([
    import("@/lib/data/firestore/categories"),
    import("@/lib/data/firestore/platforms"),
    import("@/lib/data/firestore/levels")
  ]);
  return { getCategories, getPlatforms, getLevels };
}
```

**Impact:** Reduces ~10 lines of duplicate code.

### 1.4 Inconsistent Error Handling (MEDIUM PRIORITY)

**Issue:** Some files use `withErrorHandling` from `utils.ts`, others use try-catch with `console.error` directly.

**Files using direct try-catch:**
- `src/lib/data/firestore/downloads.ts`
- `src/lib/data/firestore/leaderboards.ts` (partially)
- `src/lib/data/firestore/runs.ts` (partially)

**Solution:** Standardize on `withErrorHandling` utility or migrate to `errorHandler.ts` utilities.

**Impact:** Consistent error handling, better maintainability.

## 2. Reduce Codebase Size

### 2.1 Replace Console Calls with Logger (HIGH PRIORITY)

**Issue:** 200+ direct `console.log/error/warn/info` calls found across 37 files.

**Solution:** Replace all with `logger` utility from `src/lib/logger.ts`:
- `console.log` → `logger.debug` (dev only)
- `console.error` → `logger.error`
- `console.warn` → `logger.warn`
- `console.info` → `logger.info` (dev only)

**Files with most console calls:**
- `src/lib/data/firestore/src-imports.ts` (26)
- `src/lib/data/firestore/points-realtime.ts` (16)
- `src/lib/data/firestore/players.ts` (14)
- `src/lib/data/firestore/notifications.ts` (10)
- `src/components/TranslationManager.tsx` (7)

**Impact:** 
- Smaller production bundle (logger calls are no-ops in production)
- Consistent logging behavior
- Better debugging experience

### 2.2 Remove Unused Function Parameters (LOW PRIORITY)

**Location:** `src/lib/utils.ts` - `calculatePoints` function

**Issue:** Lines 161-165 document parameters as "not used but kept for compatibility":
- `timeString` (not used)
- `categoryName` (not used)
- `platformName` (not used)
- `categoryId` (not used)
- `platformId` (not used)

**Solution:** 
1. Check all call sites to see if these parameters are actually needed
2. If not needed, remove them and update call sites
3. If needed for future use, document why they're kept

**Impact:** Cleaner API, reduced confusion.

### 2.3 Consolidate Error Handling Utilities (MEDIUM PRIORITY)

**Issue:** Two error handling systems exist:
1. `src/lib/data/firestore/utils.ts` - `withErrorHandling`, `withBooleanErrorHandling`, `withArrayErrorHandling`
2. `src/lib/errorHandler.ts` - `handleError`, `executeSafely`, etc.

**Solution:** Consolidate into one system. The `errorHandler.ts` system is more comprehensive and uses the logger.

**Impact:** Reduces code duplication, standardizes error handling.

## 3. Increase Performance

### 3.1 Add Lazy Loading for More Routes (MEDIUM PRIORITY)

**Currently lazy loaded:**
- `/stats` (contains Recharts)
- `/admin` (large admin interface)

**Not lazy loaded but could benefit:**
- `/submit` - Large form with validation libraries
- `/settings` - User settings page
- `/downloads` - Downloads page
- `/points` - Points leaderboard (could be large)

**Solution:** Add lazy loading to route files:
```typescript
// src/routes/submit.tsx
const SubmitRun = lazy(() => import('@/pages/SubmitRun').then(m => ({ default: m.default })))
```

**Impact:** 
- Smaller initial bundle
- Faster initial page load
- Better code splitting

### 3.2 Optimize Firestore Query Field Selection (LOW PRIORITY)

**Location:** `src/lib/data/firestore/runs.ts` - `getRecentRunsFirestore`

**Issue:** Line 147 comment notes: "Firestore select() doesn't work well with converters, so we fetch full documents"

**Solution:** Consider creating a lightweight query without converter for minimal fields, or use Firestore's `select()` with a custom converter that only includes needed fields.

**Impact:** Reduced data transfer, faster queries.

### 3.3 Bundle Size Optimization

**Current optimizations:**
- ✅ Recharts excluded from pre-bundling
- ✅ Manual chunk splitting configured
- ✅ Lazy loading for Stats and Admin pages

**Additional opportunities:**
1. **Framer Motion** - Used selectively, could be lazy loaded per component
2. **React Hook Form + Zod** - Only needed on submit/settings pages, already chunked
3. **Uploadthing** - Only on submit page, already chunked
4. **Radix UI** - Large library, already chunked but could be tree-shaken better

**Solution:** Review bundle analyzer output (when `ANALYZE=true`) to identify large dependencies.

## 4. Reduce Build Times

### 4.1 TypeScript Configuration (LOW PRIORITY)

**Location:** `tsconfig.json`

**Current settings:**
- `noImplicitAny: false`
- `noUnusedParameters: false`
- `noUnusedLocals: false`
- `strictNullChecks: false`

**Issue:** These loose settings allow dead code and unused variables to remain, increasing build size.

**Solution:** Gradually enable stricter checks:
1. Enable `noUnusedLocals: true` and `noUnusedParameters: true` to catch dead code
2. Run `tsc --noEmit` to find issues
3. Fix issues incrementally

**Impact:** 
- Smaller bundles (dead code elimination)
- Better type safety
- Slightly longer type checking (but catches issues earlier)

### 4.2 Vite Build Optimizations

**Current optimizations:**
- ✅ Sourcemaps disabled in production
- ✅ CSS code splitting enabled
- ✅ Minification with esbuild
- ✅ Compressed size reporting disabled

**Additional opportunities:**
1. **Enable `reportCompressedSize: true`** only when needed (currently disabled for speed)
2. **Review `chunkSizeWarningLimit`** - Currently 600KB, could be adjusted
3. **Consider `terser` minification** - Comment notes it produces smaller bundles but slower builds

### 4.3 Dependency Pre-bundling

**Current:** Many dependencies are pre-bundled in `optimizeDeps.include`

**Optimization:** Review if all are necessary. Some might be better code-split:
- `framer-motion` - Large, used selectively
- `date-fns` - Could be tree-shaken better
- `i18next` and related - Core functionality, keep pre-bundled

## 5. Code Quality Improvements

### 5.1 Remove Commented Code

**Found in:**
- `src/lib/data/firestore/leaderboards.ts` lines 66-71 (commented out level fetching logic)
- `vite.config.ts` lines 88-93 (commented out checker plugin)

**Solution:** Remove or implement commented code.

### 5.2 Standardize Import Patterns

**Issue:** Inconsistent import styles:
- Some use default imports: `import Index from '@/pages/Index'`
- Some use named imports: `import { getCategories } from '@/lib/data/firestore/categories'`
- Some use aliases: `import { getCategoriesFirestore as getCategories }`

**Solution:** Establish and document import conventions.

## Priority Recommendations

### High Priority (Do First)
1. ✅ Extract duplicate query building logic in `leaderboards.ts`
2. ✅ Replace 200+ console calls with logger utility
3. ✅ Create barrel exports for Firestore functions

### Medium Priority (Do Next)
1. ✅ Add lazy loading for submit, settings, downloads, points routes
2. ✅ Consolidate error handling utilities
3. ✅ Standardize error handling across Firestore files

### Low Priority (Nice to Have)
1. ✅ Remove unused parameters from `calculatePoints`
2. ✅ Extract duplicate prefetch imports
3. ✅ Remove commented code
4. ✅ Enable stricter TypeScript checks incrementally

## Implementation Notes

1. **Breaking Changes:** Some optimizations (like removing unused parameters) may require updating call sites
2. **Testing:** After each optimization, verify:
   - Build still succeeds
   - Bundle size decreases (or at least doesn't increase)
   - Runtime behavior unchanged
3. **Incremental:** Implement changes incrementally and test after each

## Metrics to Track

- **Bundle size:** Run `npm run build` with `ANALYZE=true` to see bundle breakdown
- **Build time:** Measure before/after with `time npm run build`
- **Code size:** Use `cloc` or similar to track LOC reduction
- **Console calls:** Count before/after with `grep -r "console\." src/ | wc -l`

