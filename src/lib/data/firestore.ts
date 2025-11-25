// Re-export everything from the modular files (original exports with Firestore suffix)
// These are kept for backward compatibility with files that import directly
export * from "./firestore/converters";
export * from "./firestore/players";
export * from "./firestore/runs";
export * from "./firestore/leaderboards";
export * from "./firestore/categories";
export * from "./firestore/platforms";
export * from "./firestore/levels";
export * from "./firestore/downloads";
export * from "./firestore/points";
export * from "./firestore/src-imports";
export * from "./firestore/notifications";
export * from "./firestore/stats";
export * from "./firestore/game-details";
export * from "./firestore/translations";
export * from "./firestore/utils";

// Re-export shorter names from barrel exports (aliases without Firestore suffix)
// These are the preferred imports for new code
export * from "./firestore/index";
