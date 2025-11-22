// Main db module - re-exports from smaller modules
// This allows backward compatibility while reducing initialization complexity

// Re-export from smaller modules
export * from "./db/runs";
export * from "./db/players";
export * from "./db/categories";
export * from "./db/downloads";
export * from "./db/config";
export * from "./db/src-imports";
export * from "./db/notifications";

// Note: syncCategoriesFromSRC is exported directly from ./speedruncom/importService
// to avoid circular dependency. Import it directly from there if needed.
