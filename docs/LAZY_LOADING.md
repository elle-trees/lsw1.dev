# Lazy Loading Strategy

## Overview

This document describes the lazy loading patterns used in the lsw1.dev codebase.

## Database Functions (`src/lib/db.ts`)

All database functions use dynamic imports (`await import()`) for code splitting. This pattern:

- **Reduces initial bundle size** - Database modules are only loaded when needed
- **Improves initial page load** - Core app loads faster
- **Enables better code splitting** - Each database module can be split into separate chunks

### Pattern

```typescript
export const getLeaderboardEntries = async (
  categoryId?: string,
  // ... other params
) => {
  const module = await import("./db/runs");
  return module.getLeaderboardEntries(categoryId, /* ... */);
};
```

### When to Use

- ✅ **Use for database functions** - These are called on-demand and benefit from code splitting
- ✅ **Use for large utility modules** - Modules that aren't needed on initial load
- ❌ **Don't use for small utilities** - Overhead isn't worth it for tiny modules
- ❌ **Don't use for frequently called functions** - The import overhead adds up

## React Component Lazy Loading

React components use `React.lazy()` for route-based code splitting:

```typescript
const WRProgressionChart = lazy(() => 
  import("@/components/WRProgressionChart").then(m => ({ default: m.WRProgressionChart }))
);
```

### When to Use

- ✅ **Large components** - Charts, admin panels, complex forms
- ✅ **Route-specific components** - Components only used on specific pages
- ✅ **Heavy dependencies** - Components that import large libraries (e.g., Recharts)

## Benefits

1. **Faster Initial Load** - Core app loads quickly
2. **Better Caching** - Split chunks can be cached independently
3. **Progressive Loading** - Users only download what they need
4. **Improved Performance** - Smaller initial bundle = faster parse/execute time

## Trade-offs

1. **Slight Delay** - First call to lazy-loaded function has import overhead (~1-5ms)
2. **Code Complexity** - Async imports add complexity to function signatures
3. **Error Handling** - Need to handle import failures gracefully

## Future Improvements

- Consider using React.lazy() for more components
- Evaluate if all database functions need lazy loading
- Add loading states for lazy-loaded components
- Consider preloading critical database functions

