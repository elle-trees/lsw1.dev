/**
 * Configuration type definitions
 */

import { GameDetailsConfig, PointsConfig } from "@/types/database";

/**
 * Application-wide configuration structure
 */
export interface AppConfig {
  game: GameDetailsConfig;
  points: PointsConfig;
  ui: UIConfig;
  features: FeatureFlags;
}

/**
 * UI Configuration
 */
export interface UIConfig {
  theme: "light" | "dark" | "auto";
  defaultLanguage: string;
  supportedLanguages: readonly string[];
}

/**
 * Feature flags for enabling/disabling features
 */
export interface FeatureFlags {
  enableSRCImport: boolean;
  enableAutoClaim: boolean;
  enableRealtimeUpdates: boolean;
}

