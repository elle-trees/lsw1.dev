/**
 * Centralized default configuration values
 * This is the single source of truth for all default configuration in the application.
 * Update values here instead of scattered throughout the codebase.
 */

import { GameDetailsConfig, PointsConfig } from "@/types/database";

/**
 * Default game details configuration
 * Used when no configuration exists in Firestore
 */
export const DEFAULT_GAME_CONFIG: GameDetailsConfig = {
  id: "default",
  title: "LEGO Star Wars: The Video Game",
  subtitle: "2005",
  categories: ["LEGO Series", "Star Wars Series"],
  platforms: [
    { id: "gcn", label: "GCN", order: 1 },
    { id: "ps2", label: "PS2", order: 2 },
    { id: "xbox", label: "Xbox", order: 3 },
    { id: "pc", label: "PC", order: 4 },
  ],
  discordUrl: "https://discord.gg/6A5MNqaK49",
  headerLinks: [
    { id: "leaderboards", label: "Leaderboards", route: "/leaderboards", icon: "Trophy", color: "#a6e3a1", order: 1 },
    { id: "points", label: "Studs", route: "/points", icon: "LegoStud", color: "#fab387", order: 2 },
    { id: "submit", label: "Submit Run", route: "/submit", icon: "Upload", color: "#eba0ac", order: 3 },
    { id: "live", label: "Live", route: "/live", icon: "Radio", color: "#f38ba8", order: 4 },
    { id: "downloads", label: "Downloads", route: "/downloads", icon: "Download", color: "#cba6f7", order: 5 },
    { id: "stats", label: "Stats", route: "/stats", icon: "BarChart3", color: "#89b4fa", order: 6 },
    { id: "admin", label: "Admin", route: "/admin", icon: "ShieldAlert", color: "#f2cdcd", order: 7, adminOnly: true },
  ],
  navItems: [],
  visibleOnPages: ["/", "/leaderboards"],
  enabled: true,
};

/**
 * Default points configuration
 * Used when no configuration exists in Firestore
 * Note: Using the values from points.ts as the source of truth (basePoints: 100)
 */
export const DEFAULT_POINTS_CONFIG: PointsConfig = {
  id: "default",
  basePoints: 100,
  rank1Bonus: 50,
  rank2Bonus: 30,
  rank3Bonus: 15,
  coOpMultiplier: 0.5,
  ilMultiplier: 1.0,
  communityGoldsMultiplier: 1.0,
  obsoleteMultiplier: 0.5,
  applyRankBonusesToIL: false,
  applyRankBonusesToCommunityGolds: false,
};

/**
 * UI Configuration defaults
 */
export const DEFAULT_UI_CONFIG = {
  theme: "dark" as const,
  defaultLanguage: "en",
  supportedLanguages: ["en", "es", "pt-BR"] as const,
};

/**
 * Feature flags
 */
export const DEFAULT_FEATURE_FLAGS = {
  enableSRCImport: true,
  enableAutoClaim: true,
  enableRealtimeUpdates: true,
};

