/**
 * Translation Management Tab
 * Handles entity translations for categories, levels, platforms, and subcategories
 */

import { TranslationManager } from "@/components/TranslationManager";

export function TranslationTab() {
  return (
    <div className="space-y-4 animate-fade-in">
      <TranslationManager />
    </div>
  );
}

