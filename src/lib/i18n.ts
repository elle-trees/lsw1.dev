import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initAutoTranslate } from "./i18n/auto-translate";
import type { Unsubscribe } from "firebase/firestore";
import enTranslations from "../locales/en";

// Store the current subscription unsubscribe function
let currentUnsubscribe: Unsubscribe | null = null;
let isInitialized = false;

// Initialize i18n with admin translations and auto-translate
const plugins: any[] = [initReactI18next, LanguageDetector];

// Apply plugins
plugins.forEach((plugin) => i18n.use(plugin));

// Initialize i18n (only once, even with hot module reloading)
if (!isInitialized) {
  isInitialized = true;

  // Load translations dynamically to improve code splitting
  const loadInitialTranslations = async () => {
    const [esTranslations, ptBRTranslations] = await Promise.all([
      import("../locales/es").then((m) => m.default),
      import("../locales/pt-BR").then((m) => m.default),
    ]);

    return {
      es: {
        translation: esTranslations,
      },
      "pt-BR": {
        translation: ptBRTranslations,
      },
    };
  };

  // Initialize i18n with empty resources first, then load translations
  i18n
    .init({
      // Initial resources (will be loaded dynamically)
      resources: {
        en: {
          translation: enTranslations,
        },
      },

      fallbackLng: "en",
      supportedLngs: ["en", "es", "pt-BR"],
      defaultNS: "translation",
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      react: {
        useSuspense: false, // Disable suspense to avoid issues
      },
      detection: {
        // Order and from where user language should be detected
        order: ["localStorage", "navigator", "htmlTag"],
        // Keys or params to lookup language from
        lookupLocalStorage: "i18nextLng",
        // Cache user language on
        caches: ["localStorage"],
      },
    })
    .then(async () => {
      // Load initial translations dynamically
      const resources = await loadInitialTranslations();
      Object.keys(resources).forEach((lang) => {
        i18n.addResourceBundle(
          lang,
          "translation",
          resources[lang as keyof typeof resources].translation,
          true,
          true,
        );
      });

      // Initialize auto-translate service
      if (typeof window !== "undefined") {
        initAutoTranslate(i18n);
      }

      // Load and merge admin translations for the current language
      const currentLang = i18n.language || "en";
      await loadAndMergeAdminTranslations(currentLang);

      // Set up real-time subscription for admin translations
      if (typeof window !== "undefined") {
        // Dynamically import translation-service to avoid static import
        const { initAdminTranslationSubscription } =
          await import("./i18n/translation-service");

        // Unsubscribe from previous subscription if it exists
        if (currentUnsubscribe) {
          currentUnsubscribe();
          currentUnsubscribe = null;
        }

        currentUnsubscribe = initAdminTranslationSubscription(currentLang);

        // Listen for language changes to update admin translations
        i18n.on("languageChanged", async (lng) => {
          // Unsubscribe from previous subscription before creating a new one
          if (currentUnsubscribe) {
            currentUnsubscribe();
            currentUnsubscribe = null;
          }

          await loadAndMergeAdminTranslations(lng);
          const { initAdminTranslationSubscription: initSubscription } =
            await import("./i18n/translation-service");
          currentUnsubscribe = initSubscription(lng);
        });
      }

      // Explicitly ensure the i18n instance is set in react-i18next
      if (typeof window !== "undefined") {
        try {
          const reactI18nextModule = await import("react-i18next");
          // @ts-ignore - setI18n exists but may not be in types
          if (reactI18nextModule.setI18n) {
            reactI18nextModule.setI18n(i18n);
          }
        } catch (error) {
          // Non-critical: i18n instance may not need explicit setting
        }
      }
    })
    .catch((error) => {
      console.error("Failed to initialize i18n:", error);
      isInitialized = false; // Allow retry on error
    });
}

/**
 * Load and merge admin translations for a language
 */
const loadAndMergeAdminTranslations = async (language: string) => {
  try {
    // Dynamically import to avoid static import warning
    const { loadLanguageTranslations, updateI18nResources } =
      await import("./i18n/translation-service");
    const resource = await loadLanguageTranslations(language);
    if (resource.translation) {
      updateI18nResources(language, resource.translation);
    }
  } catch (error) {
    // Error loading admin translations - non-critical, will use static translations
  }
};

export default i18n;
