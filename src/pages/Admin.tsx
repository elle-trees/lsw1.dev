import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  ShieldAlert,
  ExternalLink,
  Download,
  PlusCircle,
  Trash2,
  Wrench,
  Edit2,
  FolderTree,
  Play,
  ArrowUp,
  ArrowDown,
  Gamepad2,
  UserPlus,
  UserMinus,
  Trophy,
  Upload,
  Star,
  Gem,
  RefreshCw,
  X,
  AlertTriangle,
  Users,
  Search,
  Save,
  Coins,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import {
  Tabs,
  AnimatedTabsList,
  AnimatedTabsTrigger,
  AnimatedTabsContent,
} from "@/components/ui/animated-tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Pagination } from "@/components/Pagination";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

type ImportResult = {
  imported: number;
  skipped: number;
  unmatchedPlayers: Map<string, { player1?: string; player2?: string }>;
  errors: string[];
};
import {
  fetchCategoryVariables,
  getGameId,
  fetchCategories as fetchSRCCategories,
  type SRCCategory,
} from "@/lib/speedruncom";
import { useUploadThing } from "@/lib/uploadthing";
import {
  LeaderboardEntry,
  Category,
  Level,
  Subcategory,
  PointsConfig,
  GameDetailsConfig,
  GameDetailsHeaderLink,
  Player,
} from "@/types/database";
import { useNavigate } from "@tanstack/react-router";
import { formatTime } from "@/lib/utils";
import { FadeIn } from "@/components/ui/fade-in";
import { CardSkeleton } from "@/components/admin/CardSkeleton";
import {
  getCategoryName,
  getPlatformName,
  getLevelName,
  normalizeCategoryId,
  normalizePlatformId,
  normalizeLevelId,
} from "@/lib/dataValidation";
import { TranslationTab } from "./admin/components/TranslationTab";
import { PlatformManagementTab } from "./admin/components/PlatformManagementTab";
import { LevelManagementTab } from "./admin/components/LevelManagementTab";
import { PointsConfigTab } from "./admin/components/PointsConfigTab";
import { DownloadsTab } from "./admin/components/DownloadsTab";
import { UsersTab } from "./admin/components/UsersTab";
import { ToolsTab } from "./admin/components/ToolsTab";
import { GameDetailsConfigTab } from "./admin/components/GameDetailsConfigTab";
import { CategoriesTab } from "./admin/components/CategoriesTab";
import { RunsTab } from "./admin/components/RunsTab";
import { SRCToolsTab } from "./admin/components/SRCToolsTab";
import {
  getCategoryTranslation,
  getLevelTranslation,
  getPlatformTranslation,
  getSubcategoryTranslation,
} from "@/lib/i18n/entity-translations";
import { gameConfigs } from "@/lib/speedruncom/gameConfigs";
import { useGame } from "@/contexts/GameContext";
import {
  setAdminTranslation,
  getAllAdminTranslations,
} from "@/lib/data/firestore/translations";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { Languages, Wand2 } from "lucide-react";

const Admin = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentGame, switchGame, availableGames } = useGame();

  const [unverifiedRuns, setUnverifiedRuns] = useState<LeaderboardEntry[]>([]);
  const [importedSRCRuns, setImportedSRCRuns] = useState<LeaderboardEntry[]>(
    [],
  );
  const [importingRuns, setImportingRuns] = useState(false);
  const [loadingImportedRuns, setLoadingImportedRuns] = useState(false);
  const [importProgress, setImportProgress] = useState({
    total: 0,
    imported: 0,
    skipped: 0,
  });
  const [editingImportedRun, setEditingImportedRun] =
    useState<LeaderboardEntry | null>(null);
  const [editingImportedRunForm, setEditingImportedRunForm] = useState<
    Partial<LeaderboardEntry>
  >({});
  const [savingImportedRun, setSavingImportedRun] = useState(false);
  const [verifyingRun, setVerifyingRun] = useState<LeaderboardEntry | null>(
    null,
  );
  const [verifyingRunCategory, setVerifyingRunCategory] = useState<string>("");
  const [verifyingRunPlatform, setVerifyingRunPlatform] = useState<string>("");
  const [verifyingRunLevel, setVerifyingRunLevel] = useState<string>("");
  const [unverifiedPage, setUnverifiedPage] = useState(1);
  const [importedPage, setImportedPage] = useState(1);
  const [clearingImportedRuns, setClearingImportedRuns] = useState(false);
  const [clearingUnverifiedRuns, setClearingUnverifiedRuns] = useState(false);
  const [
    showConfirmClearUnverifiedDialog,
    setShowConfirmClearUnverifiedDialog,
  ] = useState(false);
  const [batchVerifying, setBatchVerifying] = useState(false);
  const [batchVerifyingAll, setBatchVerifyingAll] = useState(false);
  const [autoclaiming, setAutoclaiming] = useState(false);
  const [backfillingSrcPlayerName, setBackfillingSrcPlayerName] =
    useState(false);
  const itemsPerPage = 25;
  // SRC categories with variables
  const [srcCategoriesWithVars, setSrcCategoriesWithVars] = useState<
    Array<
      SRCCategory & {
        variablesData?: Array<{
          id: string;
          name: string;
          values: { values: Record<string, { label: string }> };
        }>;
      }
    >
  >([]);
  const [loadingSRCCategories, setLoadingSRCCategories] = useState(false);
  // All categories (regular and IL) for SRC linking
  const [allCategoriesForSRCLinking, setAllCategoriesForSRCLinking] = useState<
    Category[]
  >([]);
  // Filters for imported runs
  const [importedRunsLeaderboardType, setImportedRunsLeaderboardType] =
    useState<"regular" | "individual-level">("regular");
  const [importedRunsCategory, setImportedRunsCategory] = useState("__all__"); // "__all__" = All Categories
  const [importedRunsPlatform, setImportedRunsPlatform] = useState("__all__"); // "__all__" = All Platforms
  const [importedRunsLevel, setImportedRunsLevel] = useState("__all__"); // "__all__" = All Levels
  const [importedRunsRunType, setImportedRunsRunType] = useState<
    "__all__" | "solo" | "co-op"
  >("__all__"); // "__all__" = All Run Types
  const [importedRunsCategories, setImportedRunsCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [pageLoading, setLoading] = useState(true);

  const [firestoreCategories, setFirestoreCategories] = useState<Category[]>(
    [],
  );
  const [categoryLeaderboardType, setCategoryLeaderboardType] = useState<
    "regular" | "individual-level" | "community-golds"
  >("regular");
  const [levelLeaderboardType, setLevelLeaderboardType] = useState<
    "individual-level" | "community-golds"
  >("individual-level");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCategorySrcId, setEditingCategorySrcId] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [updatingCategory, setUpdatingCategory] = useState(false);
  const [reorderingCategory, setReorderingCategory] = useState<string | null>(
    null,
  );

  // Subcategory management state
  const [categoryManagementTab, setCategoryManagementTab] = useState<
    "categories" | "subcategories"
  >("categories");
  const [
    selectedCategoryForSubcategories,
    setSelectedCategoryForSubcategories,
  ] = useState<Category | null>(null);
  const [srcVariables, setSrcVariables] = useState<
    Array<{
      id: string;
      name: string;
      values: { values: Record<string, { label: string }> };
    }>
  >([]);
  const [loadingSRCVariables, setLoadingSRCVariables] = useState(false);
  const [editingSubcategory, setEditingSubcategory] =
    useState<Subcategory | null>(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [editingSubcategoryName, setEditingSubcategoryName] = useState("");
  const [addingSubcategory, setAddingSubcategory] = useState(false);
  const [updatingSubcategory, setUpdatingSubcategory] = useState(false);
  const [reorderingSubcategory, setReorderingSubcategory] = useState<
    string | null
  >(null);

  const [firestorePlatforms, setFirestorePlatforms] = useState<
    { id: string; name: string }[]
  >([]);
  const [newPlatformName, setNewPlatformName] = useState("");
  const [editingPlatform, setEditingPlatform] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editingPlatformName, setEditingPlatformName] = useState("");
  const [addingPlatform, setAddingPlatform] = useState(false);
  const [updatingPlatform, setUpdatingPlatform] = useState(false);
  const [reorderingPlatform, setReorderingPlatform] = useState<string | null>(
    null,
  );

  const [newLevelName, setNewLevelName] = useState("");
  const [editingLevel, setEditingLevel] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editingLevelName, setEditingLevelName] = useState("");
  const [addingLevel, setAddingLevel] = useState(false);
  const [updatingLevel, setUpdatingLevel] = useState(false);
  const [reorderingLevel, setReorderingLevel] = useState<string | null>(null);

  const [availableLevels, setAvailableLevels] = useState<
    { id: string; name: string }[]
  >([]);
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [backfillingPoints, setBackfillingPoints] = useState(false);
  const [recalculatingTotalRuns, setRecalculatingTotalRuns] = useState(false);
  const [activeTab, setActiveTab] = useState("runs");

  // Points configuration state
  const [pointsConfig, setPointsConfig] = useState<PointsConfig | null>(null);
  const [loadingPointsConfig, setLoadingPointsConfig] = useState(false);
  const [savingPointsConfig, setSavingPointsConfig] = useState(false);
  const [pointsConfigForm, setPointsConfigForm] = useState<
    Partial<PointsConfig>
  >({});

  // Translation management state
  const { t } = useTranslation();
  const [editingEntityTranslation, setEditingEntityTranslation] = useState<{
    type: "category" | "subcategory" | "level" | "platform";
    id: string;
    originalName: string;
    language: string;
  } | null>(null);
  const [editingTranslationValue, setEditingTranslationValue] = useState("");
  const [savingTranslation, setSavingTranslation] = useState(false);
  const [adminTranslations, setAdminTranslations] = useState<
    Record<string, Record<string, string>>
  >({});
  const [selectedTranslationLanguage, setSelectedTranslationLanguage] =
    useState<string>(i18n.language || "en");

  // This useEffect will be moved after function definitions to avoid initialization errors

  // Fetch categories for imported runs filter when leaderboard type changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { getCategoriesFirestore: getCategories } =
          await import("@/lib/data/firestore/categories");
        const categoriesData = await getCategories(importedRunsLeaderboardType);
        setImportedRunsCategories(categoriesData);
        // Reset to "All Categories" when switching types
        setImportedRunsCategory("__all__");
        setImportedRunsLevel("__all__"); // Reset level filter
        setImportedPage(1); // Reset to first page
      } catch (_error) {
        // Silent fail
      }
    };
    fetchData();
  }, [importedRunsLeaderboardType]);

  // Refresh imported runs when switching to SRC Tools tab or switching between Full Game and Individual Level tabs
  useEffect(() => {
    if (activeTab === "src") {
      const fetchImportedRuns = async () => {
        setLoadingImportedRuns(true);
        try {
          const { getImportedSRCRunsFirestore: getImportedSRCRuns } =
            await import("@/lib/data/firestore/src-imports");
          const importedData = await getImportedSRCRuns();
          setImportedSRCRuns(importedData);
        } catch (_error) {
          // Error handled silently
        } finally {
          setLoadingImportedRuns(false);
        }
      };
      fetchImportedRuns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, importedRunsLeaderboardType]);

  // Load points config when switching to points tab
  useEffect(() => {
    if (activeTab === "points") {
      const loadPointsConfig = async () => {
        setLoadingPointsConfig(true);
        try {
          const { getPointsConfigFirestore: getPointsConfig } =
            await import("@/lib/data/firestore");
          const config = await getPointsConfig();
          setPointsConfig(config);
          setPointsConfigForm(config);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load points configuration.",
            variant: "destructive",
          });
        } finally {
          setLoadingPointsConfig(false);
        }
      };
      loadPointsConfig();
    }
  }, [activeTab, toast]);

  const handleSavePointsConfig = async () => {
    if (!pointsConfig) return;

    setSavingPointsConfig(true);
    try {
      const { updatePointsConfigFirestore: updatePointsConfig } =
        await import("@/lib/data/firestore");
      const success = await updatePointsConfig(
        pointsConfigForm as PointsConfig,
      );
      if (success) {
        // Reload config to get updated values
        const { getPointsConfigFirestore: getPointsConfig } =
          await import("@/lib/data/firestore");
        const updatedConfig = await getPointsConfig();
        setPointsConfig(updatedConfig);
        setPointsConfigForm(updatedConfig);

        // Clear cache so new config is used immediately
        const { clearPointsConfigCache } = await import("@/lib/points-config");
        clearPointsConfigCache();

        toast({
          title: "Success",
          description: "Points configuration saved successfully.",
        });
      } else {
        throw new Error("Failed to save configuration");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save points configuration.",
        variant: "destructive",
      });
    } finally {
      setSavingPointsConfig(false);
    }
  };

  // Header links management handlers

  // Fetch categories for level management when levelLeaderboardType changes
  useEffect(() => {
    const fetchLevelCategories = async () => {
      try {
        // For community-golds, use community-golds categories (now configurable)
        // For individual-level, use individual-level categories
        const { getCategoriesFirestore: getCategories } =
          await import("@/lib/data/firestore/categories");
        const categoriesData = await getCategories(levelLeaderboardType);
        setFirestoreCategories(categoriesData);
      } catch (_error) {
        // Silent fail
      }
    };
    fetchLevelCategories();
  }, [levelLeaderboardType]);

  // Initialize editingImportedRunForm when editingImportedRun changes
  useEffect(() => {
    if (editingImportedRun) {
      setEditingImportedRunForm({
        playerName: editingImportedRun.playerName || "",
        player2Name: editingImportedRun.player2Name || "",
        category: editingImportedRun.category || "",
        subcategory: editingImportedRun.subcategory || "",
        platform: editingImportedRun.platform || "",
        level: editingImportedRun.level || "",
        runType: editingImportedRun.runType || "solo",
        leaderboardType: editingImportedRun.leaderboardType || "regular",
        time: editingImportedRun.time || "",
        date: editingImportedRun.date || "",
        videoUrl: editingImportedRun.videoUrl || "",
        comment: editingImportedRun.comment || "",
      });
    } else {
      setEditingImportedRunForm({});
    }
  }, [editingImportedRun]);

  // Fetch subcategories when editing category changes (only for regular leaderboard type)
  const [editingSubcategories, setEditingSubcategories] = useState<
    Array<{ id: string; name: string; order?: number }>
  >([]);
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (
        editingImportedRun &&
        editingImportedRun.leaderboardType === "regular" &&
        editingImportedRunForm.category
      ) {
        try {
          // Dynamic import at call site

          const { getCategoriesFirestore: getCategories } =
            await import("@/lib/data/firestore/categories");
          const categories = await getCategories("regular");
          const category = categories.find(
            (c) => c.id === editingImportedRunForm.category,
          );
          if (
            category &&
            category.subcategories &&
            category.subcategories.length > 0
          ) {
            const sorted = [...category.subcategories].sort((a, b) => {
              const orderA = a.order ?? Infinity;
              const orderB = b.order ?? Infinity;
              return orderA - orderB;
            });
            setEditingSubcategories(sorted);

            // Autofill subcategory if run has srcSubcategory and no subcategory is set
            // This handles both initial load and category changes
            if (
              editingImportedRun.srcSubcategory &&
              !editingImportedRunForm.subcategory
            ) {
              // Try to match by name (case-insensitive)
              const normalizedSrcSubcategory = editingImportedRun.srcSubcategory
                .toLowerCase()
                .trim();
              const matchedSubcategory = sorted.find(
                (sub) =>
                  sub.name.toLowerCase().trim() === normalizedSrcSubcategory,
              );

              if (matchedSubcategory) {
                setEditingImportedRunForm((prev) => ({
                  ...prev,
                  subcategory: matchedSubcategory.id,
                }));
              } else if (sorted.length > 0) {
                // If no match found but subcategories exist, select the first one
                // This ensures a subcategory is always selected when available
                setEditingImportedRunForm((prev) => ({
                  ...prev,
                  subcategory: sorted[0].id,
                }));
              }
            } else if (
              !editingImportedRunForm.subcategory &&
              sorted.length > 0
            ) {
              // If no srcSubcategory but subcategories exist, select the first one
              setEditingImportedRunForm((prev) => ({
                ...prev,
                subcategory: sorted[0].id,
              }));
            }
          } else {
            setEditingSubcategories([]);
          }
        } catch (error) {
          setEditingSubcategories([]);
        }
      } else {
        setEditingSubcategories([]);
      }
    };
    fetchSubcategories();
  }, [
    editingImportedRunForm.category,
    editingImportedRunForm.subcategory,
    editingImportedRun,
  ]);

  // Note: fetchImportedRunsCategories was declared but never used - removed for now
  // const fetchImportedRunsCategories = async (leaderboardType: 'regular' | 'individual-level') => {
  //   try {
  //     const { getCategoriesFirestore: getCategories } = await import("@/lib/data/firestore/categories");
  //     const categoriesData = await getCategories(leaderboardType);
  //     setImportedRunsCategories(categoriesData);
  //   } catch (_error) {
  //     // Silent fail
  //   }
  // };

  const fetchLevels = useCallback(async () => {
    try {
      // Dynamic import at call site

      const { getLevelsFirestore: getLevels } =
        await import("@/lib/data/firestore/categories");
      const levelsData = await getLevels();
      setAvailableLevels(levelsData);
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to load levels.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchCategories = useCallback(
    async (
      leaderboardType?: "regular" | "individual-level" | "community-golds",
    ) => {
      try {
        const type = leaderboardType || categoryLeaderboardType;
        // Dynamic import at call site

        const { getCategoriesFirestore: getCategories } =
          await import("@/lib/data/firestore/categories");
        const categoriesData = await getCategories(type);
        setFirestoreCategories(categoriesData);
      } catch (_error) {
        toast({
          title: "Error",
          description: "Failed to load categories.",
          variant: "destructive",
        });
      }
    },
    [categoryLeaderboardType, toast],
  );

  useEffect(() => {
    if (editingImportedRun) {
      // Initialize form with current values when opening dialog
      // This will only run when editingImportedRun changes (when opening dialog)
      let initialPlatform = editingImportedRun.platform;

      // If platform is empty but we have SRC platform name, try to auto-match
      if (
        (!initialPlatform || initialPlatform.trim() === "") &&
        editingImportedRun.srcPlatformName &&
        firestorePlatforms.length > 0
      ) {
        const matchingPlatform = firestorePlatforms.find(
          (p) =>
            p.name.toLowerCase().trim() ===
            editingImportedRun.srcPlatformName!.toLowerCase().trim(),
        );
        if (matchingPlatform) {
          initialPlatform = matchingPlatform.id;
        }
      }

      // Also try to match category if empty
      let initialCategory = editingImportedRun.category;
      if (
        (!initialCategory || initialCategory.trim() === "") &&
        editingImportedRun.srcCategoryName &&
        firestoreCategories.length > 0
      ) {
        const categoryType = editingImportedRun.leaderboardType || "regular";
        const categoriesForType = firestoreCategories.filter((c) => {
          const catType = (c as Category).leaderboardType || "regular";
          return catType === categoryType;
        });
        const matchingCategory = categoriesForType.find(
          (c) =>
            c.name.toLowerCase().trim() ===
            editingImportedRun.srcCategoryName!.toLowerCase().trim(),
        );
        if (matchingCategory) {
          initialCategory = matchingCategory.id;
        }
      }

      // Also try to match level if empty
      let initialLevel = editingImportedRun.level;
      if (
        (!initialLevel || initialLevel.trim() === "") &&
        editingImportedRun.srcLevelName &&
        availableLevels.length > 0
      ) {
        const matchingLevel = availableLevels.find(
          (l) =>
            l.name.toLowerCase().trim() ===
            editingImportedRun.srcLevelName!.toLowerCase().trim(),
        );
        if (matchingLevel) {
          initialLevel = matchingLevel.id;
        }
      }

      setEditingImportedRunForm({
        playerName: editingImportedRun.playerName,
        player2Name: editingImportedRun.player2Name,
        category: initialCategory,
        platform: initialPlatform,
        runType: editingImportedRun.runType,
        leaderboardType: editingImportedRun.leaderboardType,
        level: initialLevel,
        time: editingImportedRun.time,
        date: editingImportedRun.date,
        videoUrl: editingImportedRun.videoUrl,
        comment: editingImportedRun.comment,
        subcategory: editingImportedRun.subcategory,
      });

      // Fetch categories for the run's leaderboard type
      const categoryType = editingImportedRun.leaderboardType || "regular";
      fetchCategories(categoryType);
    } else {
      // Clear form when dialog is closed
      setEditingImportedRunForm({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingImportedRun]); // Re-initialize when editingImportedRun changes

  useEffect(() => {
    if (verifyingRun) {
      // Start with run's current values
      let initialCategory = verifyingRun.category || "";
      let initialPlatform = verifyingRun.platform || "";
      let initialLevel = verifyingRun.level || "";

      // Validate that the category ID matches the correct leaderboard type
      // If the category ID exists but belongs to the wrong leaderboard type, clear it
      const runLeaderboardType = verifyingRun.leaderboardType || "regular";
      if (initialCategory) {
        const categoryObj = firestoreCategories.find(
          (cat) => cat.id === initialCategory,
        );
        if (categoryObj) {
          const catType =
            (categoryObj as Category).leaderboardType || "regular";
          if (catType !== runLeaderboardType) {
            // Category ID doesn't match the run's leaderboard type - clear it
            initialCategory = "";
          }
        } else {
          // Category ID not found - clear it
          initialCategory = "";
        }
      }

      // Try to match category by SRC name if we don't have a valid category ID
      if (!initialCategory && verifyingRun.srcCategoryName) {
        const matchingCategory = firestoreCategories.find((cat) => {
          const catType = (cat as Category).leaderboardType || "regular";
          return (
            catType === runLeaderboardType &&
            cat.name.toLowerCase().trim() ===
              verifyingRun.srcCategoryName!.toLowerCase().trim()
          );
        });
        if (matchingCategory) {
          initialCategory = matchingCategory.id;
        }
      }

      // Try to match platform by SRC name if we don't have a platform ID
      if (!initialPlatform && verifyingRun.srcPlatformName) {
        const matchingPlatform = firestorePlatforms.find(
          (platform) =>
            platform.name.toLowerCase().trim() ===
            verifyingRun.srcPlatformName!.toLowerCase().trim(),
        );
        if (matchingPlatform) {
          initialPlatform = matchingPlatform.id;
        }
      }

      // Try to match level by SRC name if we don't have a level ID
      if (!initialLevel && verifyingRun.srcLevelName) {
        const matchingLevel = availableLevels.find(
          (level) =>
            level.name.toLowerCase().trim() ===
            verifyingRun.srcLevelName!.toLowerCase().trim(),
        );
        if (matchingLevel) {
          initialLevel = matchingLevel.id;
        }
      }

      setVerifyingRunCategory(initialCategory);
      setVerifyingRunPlatform(initialPlatform);
      setVerifyingRunLevel(initialLevel);

      // Fetch categories for the run's leaderboard type
      const categoryType = verifyingRun.leaderboardType || "regular";
      fetchCategories(categoryType);
    }
  }, [
    verifyingRun,
    firestoreCategories,
    firestorePlatforms,
    availableLevels,
    fetchCategories,
  ]);

  const fetchAllData = useCallback(async () => {
    if (hasFetchedData) return;
    setLoading(true);
    try {
      const [srcImportsModule, downloadsModule, categoriesModule] =
        await Promise.all([
          import("@/lib/data/firestore/src-imports"),
          import("@/lib/data/firestore/downloads"),
          import("@/lib/data/firestore/categories"),
        ]);
      const [importedData, downloadData, categoriesData] = await Promise.all([
        srcImportsModule.getImportedSRCRunsFirestore(),
        downloadsModule.getDownloadEntriesFirestore(),
        categoriesModule.getCategoriesFirestore("regular"),
      ]);
      setImportedSRCRuns(importedData);
      setDownloadEntries(downloadData);
      setFirestoreCategories(categoriesData);
      setHasFetchedData(true);
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to load data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [hasFetchedData, toast]);

  // Helper function to refresh imported runs (unverified runs are now real-time)
  const refreshAllRunData = async () => {
    try {
      const srcImportsModule = await import("@/lib/data/firestore/src-imports");
      const importedData = await srcImportsModule.getImportedSRCRunsFirestore();
      setImportedSRCRuns(importedData);
    } catch (error) {
      // Error handled silently
    }
  };

  // Set up real-time listener for unverified runs
  useEffect(() => {
    if (!currentUser || authLoading) return;

    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    (async () => {
      const { subscribeToUnverifiedRunsFirestore } =
        await import("@/lib/data/firestore/runs");
      if (!isMounted) return;
      unsubscribe = subscribeToUnverifiedRunsFirestore((runs) => {
        if (!isMounted) return;
        // Filter out imported runs that are automatically handled/verified differently
        const manualUnverified = runs.filter((run) => !run.importedFromSRC);
        setUnverifiedRuns(manualUnverified);
        setUnverifiedPage(1); // Reset to first page when data changes
      });
    })();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, authLoading]);

  // Fetch other data on mount
  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchAllData();
    }
  }, [authLoading, currentUser, fetchAllData]);

  const fetchPlatforms = useCallback(async () => {
    try {
      const { getPlatformsFirestore: getPlatforms } =
        await import("@/lib/data/firestore/categories");
      const platformsData = await getPlatforms();
      setFirestorePlatforms(platformsData);
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to load platforms.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Load admin translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translations = await getAllAdminTranslations();
        setAdminTranslations(translations);
      } catch (error) {
        console.error("Error loading admin translations:", error);
      }
    };
    loadTranslations();
  }, []);

  // Initialize data on mount - moved here after function definitions to avoid initialization errors
  useEffect(() => {
    fetchPlatforms();
    fetchCategories("regular"); // Load regular categories by default
    fetchLevels();
    // Load initial categories for imported runs filter
    const initImportedRunsCategories = async () => {
      try {
        const { getCategoriesFirestore: getCategories } =
          await import("@/lib/data/firestore/categories");
        const categoriesData = await getCategories("regular");
        setImportedRunsCategories(categoriesData);
        // Start with "All Categories" selected
        setImportedRunsCategory("__all__");
      } catch (_error) {
        // Silent fail
      }
    };
    initImportedRunsCategories();
    // Load initial categories for level management (should match levelLeaderboardType initial state)
    const initLevelCategories = async () => {
      try {
        const { getCategoriesFirestore: getCategories } =
          await import("@/lib/data/firestore/categories");
        const categoriesData = await getCategories("individual-level");
        setFirestoreCategories(categoriesData);
      } catch (_error) {
        // Silent fail
      }
    };
    initLevelCategories();
  }, [fetchPlatforms, fetchCategories, fetchLevels]);

  const fetchUnverifiedRuns = async () => {
    try {
      // Dynamic import at call site

      const {
        getUnverifiedLeaderboardEntriesFirestore:
          getUnverifiedLeaderboardEntries,
      } = await import("@/lib/data/firestore/runs");
      const data = await getUnverifiedLeaderboardEntries();
      // Only include manually submitted runs in unverified runs tab
      // Imported runs stay in their own tab
      setUnverifiedRuns(data.filter((run) => !run.importedFromSRC));
      setUnverifiedPage(1); // Reset to first page when data changes

      try {
        // Dynamic import at call site

        const { getImportedSRCRunsFirestore: getImportedSRCRuns } =
          await import("@/lib/data/firestore/src-imports");
        const importedData = await getImportedSRCRuns();
        setImportedSRCRuns(importedData);
        setImportedPage(1); // Reset to first page when data changes
      } catch (importError) {
        toast({
          title: "Warning",
          description:
            "Failed to load imported runs. They may still be processing.",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load unverified runs.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        toast({
          title: "Access Denied",
          description: "You must be logged in to view this page.",
          variant: "destructive",
        });
        navigate({ to: "/" });
        return;
      }

      if (!currentUser.isAdmin) {
        toast({
          title: "Access Denied",
          description:
            "You do not have permission to view this page. Admin status required.",
          variant: "destructive",
        });
        navigate({ to: "/" });
        return;
      }

      if (!hasFetchedData) {
        fetchAllData();
      }
    }
  }, [currentUser, authLoading, hasFetchedData, fetchAllData, navigate, toast]);

  const handleVerify = async (runId: string) => {
    // Find the run to verify
    const runToVerify = [...unverifiedRuns, ...importedSRCRuns].find(
      (r) => r.id === runId,
    );
    if (!runToVerify) {
      toast({
        title: "Error",
        description: "Run not found.",
        variant: "destructive",
      });
      return;
    }

    // For imported runs or runs missing category/platform, show dialog to select them
    // For complete manual runs, verify directly
    const needsCategory = !runToVerify.category || !runToVerify.platform;
    const isImported = runToVerify.importedFromSRC === true;

    if (needsCategory || isImported) {
      setVerifyingRun(runToVerify);
      setVerifyingRunCategory(runToVerify.category || "");
      setVerifyingRunPlatform(runToVerify.platform || "");
      setVerifyingRunLevel(runToVerify.level || "");

      // Fetch categories for the run's leaderboard type
      const categoryType = runToVerify.leaderboardType || "regular";
      fetchCategories(categoryType);
    } else {
      // For complete runs, verify directly
      await verifyRunDirectly(runId, runToVerify);
    }
  };

  const verifyRunDirectly = async (runId: string, run?: LeaderboardEntry) => {
    if (!currentUser) return;

    const runToVerify =
      run ||
      [...unverifiedRuns, ...importedSRCRuns].find((r) => r.id === runId);
    if (!runToVerify) return;

    const verifiedBy =
      currentUser.displayName || currentUser.email || currentUser.uid;

    // Optimistic update: Update UI immediately
    const optimisticRun: LeaderboardEntry = {
      ...runToVerify,
      verified: true,
      verifiedBy: verifiedBy,
    };

    // Update local state optimistically
    if (unverifiedRuns.some((r) => r.id === runId)) {
      setUnverifiedRuns((prev) => prev.filter((r) => r.id !== runId));
    }
    if (importedSRCRuns.some((r) => r.id === runId)) {
      setImportedSRCRuns((prev) =>
        prev.map((r) => (r.id === runId ? optimisticRun : r)),
      );
    }

    try {
      // Collect all updates needed (category/platform/level from dialog or existing values)
      const updateData: Partial<LeaderboardEntry> = {};

      // Use dialog values if set, otherwise use existing run values
      const newCategory = verifyingRunCategory || runToVerify.category;
      const newPlatform = verifyingRunPlatform || runToVerify.platform;
      const newLevel = verifyingRunLevel || runToVerify.level;

      // Only update if values changed
      if (newCategory && newCategory !== runToVerify.category) {
        updateData.category = newCategory;
      }
      if (newPlatform && newPlatform !== runToVerify.platform) {
        updateData.platform = newPlatform;
      }
      if (
        (runToVerify.leaderboardType === "individual-level" ||
          runToVerify.leaderboardType === "community-golds") &&
        newLevel &&
        newLevel !== runToVerify.level
      ) {
        updateData.level = newLevel;
      }

      // Don't assign runs to users - they must be claimed first
      // Runs will remain unclaimed until a user claims them

      // Update run data if needed (including player assignment), then verify
      if (Object.keys(updateData).length > 0) {
        const { updateLeaderboardEntryFirestore } =
          await import("@/lib/data/firestore/runs");
        await updateLeaderboardEntry(runId, updateData);
      }

      // Verify the run
      // Dynamic import at call site

      const { updateRunVerificationStatusFirestore } =
        await import("@/lib/data/firestore/runs");
      const result = await updateRunVerificationStatusFirestore(
        runId,
        true,
        verifiedBy,
      );
      if (result.success) {
        toast({
          title: "Run Verified",
          description: "The run has been successfully verified.",
        });
        setVerifyingRun(null);
        setVerifyingRunCategory("");
        setVerifyingRunPlatform("");
        setVerifyingRunLevel("");
        // Refresh to get server state (rank, points, etc.)
        await refreshAllRunData();
      } else {
        // Rollback optimistic update on failure
        if (unverifiedRuns.some((r) => r.id === runId)) {
          setUnverifiedRuns((prev) => [...prev, runToVerify]);
        }
        if (importedSRCRuns.some((r) => r.id === runId)) {
          setImportedSRCRuns((prev) =>
            prev.map((r) => (r.id === runId ? runToVerify : r)),
          );
        }
        throw new Error(
          result.error || "Failed to update verification status.",
        );
      }
    } catch (error: any) {
      // Rollback optimistic update on error
      if (unverifiedRuns.some((r) => r.id === runId)) {
        setUnverifiedRuns((prev) => [...prev, runToVerify]);
      }
      if (importedSRCRuns.some((r) => r.id === runId)) {
        setImportedSRCRuns((prev) =>
          prev.map((r) => (r.id === runId ? runToVerify : r)),
        );
      }
      toast({
        title: "Error",
        description: error.message || "Failed to verify run.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (runId: string) => {
    try {
      // Dynamic import at call site

      const { deleteLeaderboardEntryFirestore } =
        await import("@/lib/data/firestore/runs");
      const success = await deleteLeaderboardEntry(runId);
      if (success) {
        toast({
          title: "Run Rejected and Removed",
          description: "The run has been completely removed.",
        });
        fetchUnverifiedRuns();
      } else {
        throw new Error("Failed to delete run.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject and remove run.",
        variant: "destructive",
      });
    }
  };

  const handleSaveImportedRun = async () => {
    if (!editingImportedRun || savingImportedRun) return;

    // Validate required fields
    const finalForm = {
      playerName:
        editingImportedRunForm.playerName ?? editingImportedRun.playerName,
      player2Name:
        editingImportedRunForm.player2Name ?? editingImportedRun.player2Name,
      category: editingImportedRunForm.category ?? editingImportedRun.category,
      subcategory:
        editingImportedRunForm.subcategory ?? editingImportedRun.subcategory,
      platform: editingImportedRunForm.platform ?? editingImportedRun.platform,
      runType: editingImportedRunForm.runType ?? editingImportedRun.runType,
      leaderboardType:
        editingImportedRunForm.leaderboardType ??
        editingImportedRun.leaderboardType,
      level: editingImportedRunForm.level ?? editingImportedRun.level,
      time: editingImportedRunForm.time ?? editingImportedRun.time,
      date: editingImportedRunForm.date ?? editingImportedRun.date,
      videoUrl: editingImportedRunForm.videoUrl ?? editingImportedRun.videoUrl,
      comment: editingImportedRunForm.comment ?? editingImportedRun.comment,
    };

    if (
      !finalForm.playerName?.trim() ||
      !finalForm.category?.trim() ||
      !finalForm.platform?.trim() ||
      !finalForm.time?.trim() ||
      !finalForm.date?.trim()
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSavingImportedRun(true);
    try {
      const updateData: Partial<LeaderboardEntry> = {
        playerName: finalForm.playerName.trim(),
        category: finalForm.category.trim(),
        platform: finalForm.platform.trim(),
        runType: finalForm.runType,
        leaderboardType: finalForm.leaderboardType,
        time: finalForm.time.trim(),
        date: finalForm.date.trim(),
      };

      // Add optional fields
      if (finalForm.player2Name && finalForm.player2Name.trim()) {
        updateData.player2Name = finalForm.player2Name.trim();
      } else if (finalForm.runType === "co-op") {
        updateData.player2Name = finalForm.player2Name?.trim() || "";
      }

      if (finalForm.level && finalForm.level.trim()) {
        updateData.level = finalForm.level.trim();
      }

      // Add subcategory for regular runs
      if (finalForm.leaderboardType === "regular") {
        if (finalForm.subcategory && finalForm.subcategory.trim()) {
          updateData.subcategory = finalForm.subcategory.trim();
        } else {
          // Clear subcategory if none selected
          updateData.subcategory = undefined;
        }
      }

      if (finalForm.videoUrl && finalForm.videoUrl.trim()) {
        updateData.videoUrl = finalForm.videoUrl.trim();
      }

      if (finalForm.comment && finalForm.comment.trim()) {
        updateData.comment = finalForm.comment.trim();
      }

      // Dynamic import at call site

      const { updateLeaderboardEntryFirestore } =
        await import("@/lib/data/firestore/runs");
      const success = await updateLeaderboardEntry(
        editingImportedRun.id,
        updateData,
      );
      if (success) {
        toast({
          title: "Run Updated",
          description: "The run has been saved successfully.",
        });
        await refreshAllRunData();
        setEditingImportedRun(null);
        setEditingImportedRunForm({});
      } else {
        throw new Error("Failed to update run");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save run.",
        variant: "destructive",
      });
    } finally {
      setSavingImportedRun(false);
    }
  };

  const handleImportFromSRC = async () => {
    if (importingRuns) return;

    // Verify admin status before importing
    if (!currentUser?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin access required to import runs.",
        variant: "destructive",
      });
      return;
    }

    setImportingRuns(true);
    setImportProgress({ total: 0, imported: 0, skipped: 0 });

    try {
      toast({
        title: "Starting Import",
        description: "Fetching runs from speedrun.com...",
      });

      // Dynamic import to avoid circular dependency
      const { importSRCRuns } = await import("@/lib/speedruncom/importService");

      const result: ImportResult = await importSRCRuns(
        gameConfigs[currentGame.id],
        (progress) => {
          setImportProgress(progress);
        },
      );

      // Show summary with unmatched player warnings
      const unmatchedCount = result.unmatchedPlayers.size;
      if (result.errors.length > 0) {
        // Log all errors to console for debugging
        console.error("Import errors:", result.errors);

        // Show first 3 errors in toast, log all errors to console
        const errorPreview = result.errors.slice(0, 3).join("; ");
        const remainingErrors = result.errors.length - 3;

        // Check if errors are permission-related
        const hasPermissionErrors = result.errors.some(
          (err) =>
            err.toLowerCase().includes("permission") ||
            err.toLowerCase().includes("missing") ||
            err.toLowerCase().includes("insufficient"),
        );

        const errorMessage = hasPermissionErrors
          ? `Permission errors detected. Ensure: 1) Your player document has isAdmin: true in Firestore, 2) Firestore rules are deployed (run: firebase deploy --only firestore:rules). First error: ${errorPreview}`
          : `Imported ${result.imported} runs, skipped ${result.skipped} runs. ${result.errors.length} error(s) occurred.${remainingErrors > 0 ? ` (Showing first 3)` : ""} ${errorPreview}`;

        toast({
          title: "Import Complete with Errors",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (unmatchedCount > 0) {
        toast({
          title: "Import Complete",
          description: `Imported ${result.imported} runs, skipped ${result.skipped} duplicates or invalid runs. ${unmatchedCount} run(s) have player names that don't match any players on the site.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Import Complete",
          description: `Imported ${result.imported} runs, skipped ${result.skipped} duplicates or invalid runs.`,
        });
      }

      // Refresh the runs list
      await refreshAllRunData();
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description:
          error.message || "Failed to import runs from speedrun.com.",
        variant: "destructive",
      });
    } finally {
      setImportingRuns(false);
    }
  };

  const fetchSRCCategoriesWithVariables = async () => {
    setLoadingSRCCategories(true);
    try {
      const gameId = await getGameId(currentGame.name, currentGame.id);
      if (!gameId) {
        toast({
          title: "Error",
          description: `Could not find ${currentGame.name} game on speedrun.com`,
          variant: "destructive",
        });
        return;
      }

      const categories = await fetchSRCCategories(gameId);
      const categoriesWithVars = await Promise.all(
        categories.map(async (category) => {
          const variables = await fetchCategoryVariables(category.id);
          return {
            ...category,
            variablesData: variables?.data || undefined,
          };
        }),
      );

      setSrcCategoriesWithVars(categoriesWithVars);

      // Fetch ALL categories (regular and IL) for linking
      const { getCategoriesFirestore: getCategories } =
        await import("@/lib/data/firestore/categories");
      const [regularCats, ilCats] = await Promise.all([
        getCategories("regular"),
        getCategories("individual-level"),
      ]);
      setAllCategoriesForSRCLinking([...regularCats, ...ilCats]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch SRC categories.",
        variant: "destructive",
      });
    } finally {
      setLoadingSRCCategories(false);
    }
  };

  // Handler for linking a category to an SRC category
  const handleLinkCategory = async (
    categoryId: string,
    srcCategoryId: string,
  ) => {
    setUpdatingCategory(true);
    try {
      const targetCategory = allCategoriesForSRCLinking.find(
        (c) => c.id === categoryId,
      );
      if (!targetCategory) return;
      const subcategories = targetCategory.subcategories || [];
      const { updateCategoryFirestore } =
        await import("@/lib/data/firestore/categories");
      await updateCategoryFirestore(
        categoryId,
        targetCategory.name,
        subcategories,
        srcCategoryId,
      );

      // Find the SRC category name for the toast
      const srcCategory = srcCategoriesWithVars.find(
        (c) => c.id === srcCategoryId,
      );
      toast({
        title: "Linked",
        description: `Category "${targetCategory.name}" has been linked to SRC category "${srcCategory?.name || srcCategoryId}".`,
      });

      // Refresh categories for the current leaderboard type
      await fetchCategories(categoryLeaderboardType);
      // Refresh all categories for SRC linking
      await fetchSRCCategoriesWithVariables();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to link category.",
        variant: "destructive",
      });
    } finally {
      setUpdatingCategory(false);
    }
  };

  // Handler for unlinking a category from an SRC category
  const handleUnlinkCategory = async (categoryId: string) => {
    const linkedCategory = allCategoriesForSRCLinking.find(
      (c) => c.id === categoryId,
    );
    if (!linkedCategory) return;

    if (
      !window.confirm(`Unlink "${linkedCategory.name}" from this SRC category?`)
    )
      return;

    setUpdatingCategory(true);
    try {
      const currentCategory = allCategoriesForSRCLinking.find(
        (c) => c.id === categoryId,
      );
      const subcategories = currentCategory?.subcategories || [];
      const { updateCategoryFirestore } =
        await import("@/lib/data/firestore/categories");
      await updateCategoryFirestore(
        categoryId,
        linkedCategory.name,
        subcategories,
        null,
      );
      toast({
        title: "Unlinked",
        description: `Category "${linkedCategory.name}" has been unlinked from SRC category.`,
      });
      // Refresh categories for the current leaderboard type
      await fetchCategories(categoryLeaderboardType);
      // Refresh all categories for SRC linking
      await fetchSRCCategoriesWithVariables();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unlink category.",
        variant: "destructive",
      });
    } finally {
      setUpdatingCategory(false);
    }
  };

  // Handler for editing an imported run
  const handleEditImportedRun = (run: LeaderboardEntry) => {
    setEditingImportedRun(run);
  };

  const handleClearImportedRuns = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all imported runs from speedrun.com? This action cannot be undone.",
      )
    ) {
      return;
    }

    setClearingImportedRuns(true);
    try {
      // Dynamic import at call site

      const { deleteAllImportedSRCRunsFirestore } =
        await import("@/lib/data/firestore/src-imports");
      const result = await deleteAllImportedSRCRuns();

      if (result.errors.length > 0) {
        // Check if there are permission errors
        const hasPermissionError = result.errors.some(
          (err) =>
            err.toLowerCase().includes("permission") ||
            err.toLowerCase().includes("insufficient") ||
            err.toLowerCase().includes("missing"),
        );

        if (hasPermissionError && result.deleted === 0) {
          toast({
            title: "Permission Error",
            description:
              "You don't have permission to delete imported runs. Please check your admin status.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Some Errors Occurred",
            description: `${result.deleted} runs deleted, but some errors occurred: ${result.errors.slice(0, 3).join("; ")}${result.errors.length > 3 ? "..." : ""}`,
            variant: "destructive",
          });
        }
      }

      if (result.deleted > 0) {
        toast({
          title: "Imported Runs Cleared",
          description: `Successfully deleted ${result.deleted} imported runs.`,
        });

        // Refresh the runs list
        await fetchUnverifiedRuns();
      } else if (result.errors.length === 0) {
        toast({
          title: "No Runs to Delete",
          description: "No imported runs were found to delete.",
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      const isPermissionError =
        errorMsg.toLowerCase().includes("permission") ||
        errorMsg.toLowerCase().includes("insufficient") ||
        errorMsg.toLowerCase().includes("missing");

      toast({
        title: isPermissionError ? "Permission Error" : "Error",
        description: isPermissionError
          ? "You don't have permission to delete imported runs. Please ensure you are logged in as an admin."
          : errorMsg || "Failed to clear imported runs.",
        variant: "destructive",
      });
    } finally {
      setClearingImportedRuns(false);
    }
  };

  // Helper function to autofill category, platform, and level for imported runs
  // Uses centralized service to eliminate redundancy
  // Note: autofillRunFields was declared but never used - removed for now
  // const autofillRunFields = async (run: LeaderboardEntry) => {
  //   return await prepareRunForVerification(
  //     run,
  //     db.getCategoriesFromFirestore,
  //     getPlatformsFromFirestore,
  //     getLevels
  //   );
  // };

  const handleBatchVerify = async () => {
    if (!currentUser) return;

    // Get the 10 most recent unverified imported runs for the current tab
    let unverifiedImported = importedSRCRuns.filter((r) => r.verified !== true);

    // Filter by the current tab (Full Game vs Individual Levels)
    unverifiedImported = unverifiedImported.filter((run) => {
      const runLeaderboardType = run.leaderboardType || "regular";
      return runLeaderboardType === importedRunsLeaderboardType;
    });

    // Sort by date (most recent first) and take top 10
    unverifiedImported = unverifiedImported
      .sort((a, b) => {
        // Sort by date (most recent first)
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.localeCompare(a.date);
      })
      .slice(0, 10);

    if (unverifiedImported.length === 0) {
      const tabName =
        importedRunsLeaderboardType === "regular"
          ? "Full Game"
          : "Individual Levels";
      toast({
        title: "No Runs to Verify",
        description: `There are no unverified imported ${tabName} runs to verify.`,
        variant: "default",
      });
      return;
    }

    setBatchVerifying(true);
    const verifiedBy =
      currentUser.displayName || currentUser.email || currentUser.uid;

    try {
      // Dynamic import to avoid circular dependency
      const { batchVerifyRuns } = await import("@/lib/data/runFieldService");
      const [runsModule, categoriesModule, platformsModule, levelsModule] =
        await Promise.all([
          import("@/lib/data/firestore/runs"),
          import("@/lib/data/firestore/categories"),
          import("@/lib/data/firestore/platforms"),
          import("@/lib/data/firestore/levels"),
        ]);
      // Use optimized batch verification service
      const result = await batchVerifyRuns(
        unverifiedImported,
        verifiedBy,
        runsModule.updateRunVerificationStatus,
        runsModule.updateLeaderboardEntry,
        categoriesModule.getCategoriesFirestore,
        platformsModule.getPlatformsFirestore,
        levelsModule.getLevelsFirestore,
        20, // Process 20 runs in parallel
        (_processed, _total) => {
          // Optional: Could show progress here if needed
        },
      );

      // Show summary toast
      if (result.successCount > 0 && result.errorCount === 0) {
        toast({
          title: "Batch Verification Complete",
          description: `Successfully verified ${result.successCount} run(s).`,
        });
      } else if (result.successCount > 0 && result.errorCount > 0) {
        toast({
          title: "Batch Verification Partial Success",
          description: `Verified ${result.successCount} run(s), ${result.errorCount} error(s).`,
          variant: "default",
        });
      } else {
        toast({
          title: "Batch Verification Failed",
          description: `Failed to verify all runs.`,
          variant: "destructive",
        });
      }

      // Refresh the runs list
      await refreshAllRunData();
    } catch (error: any) {
      toast({
        title: "Batch Verification Error",
        description:
          error.message || "An error occurred during batch verification.",
        variant: "destructive",
      });
    } finally {
      setBatchVerifying(false);
    }
  };

  const handleAutoclaimRuns = async () => {
    if (!currentUser?.isAdmin) {
      toast({
        title: "Error",
        description: "You must be an admin to trigger autoclaiming.",
        variant: "destructive",
      });
      return;
    }

    if (autoclaiming) return;

    setAutoclaiming(true);
    try {
      const { runAutoclaimingForAllUsersFirestore } =
        await import("@/lib/data/firestore/src-imports");
      const result = await runAutoclaimingForAllUsersFirestore();

      if (result.errors.length > 0) {
        toast({
          title: "Autoclaiming Complete with Errors",
          description: `Claimed ${result.runsUpdated} run(s) for ${result.playersUpdated} player(s). Some errors occurred.`,
          variant: "destructive",
        });
      } else if (result.runsUpdated > 0) {
        toast({
          title: "Autoclaiming Complete",
          description: `Successfully claimed ${result.runsUpdated} run(s) for ${result.playersUpdated} player(s).`,
        });
        // Refresh imported runs to show updated data
        const fetchImportedRuns = async () => {
          setLoadingImportedRuns(true);
          try {
            const { getImportedSRCRunsFirestore: getImportedSRCRuns } =
              await import("@/lib/data/firestore/src-imports");
            const runs = await getImportedSRCRuns(1000);
            setImportedSRCRuns(runs);
          } catch (error) {
            console.error("Error refreshing imported runs:", error);
          } finally {
            setLoadingImportedRuns(false);
          }
        };
        await fetchImportedRuns();
      } else {
        toast({
          title: "Autoclaiming Complete",
          description:
            "No runs were claimed. All imported runs may already be claimed or no matching players found.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to trigger autoclaiming.",
        variant: "destructive",
      });
    } finally {
      setAutoclaiming(false);
    }
  };

  const handleBackfillSrcPlayerName = async () => {
    if (!currentUser?.isAdmin) {
      toast({
        title: "Error",
        description: "You must be an admin to backfill srcPlayerName.",
        variant: "destructive",
      });
      return;
    }

    if (backfillingSrcPlayerName) return;

    if (
      !window.confirm(
        "This will backfill the srcPlayerName field for all imported runs that are missing it. " +
          "This uses the playerName field as a fallback. Continue?",
      )
    ) {
      return;
    }

    setBackfillingSrcPlayerName(true);
    try {
      const { backfillSrcPlayerNameForRunsFirestore } =
        await import("@/lib/data/firestore/src-imports");
      const result = await backfillSrcPlayerNameForRuns();

      if (result.errors.length > 0) {
        toast({
          title: "Backfill Complete with Errors",
          description: `Processed ${result.processed} runs, updated ${result.updated} with srcPlayerName. ${result.errors.length} runs could not be backfilled.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Backfill Complete",
          description: `Successfully updated ${result.updated} run(s) with srcPlayerName out of ${result.processed} processed.`,
        });
        // Refresh imported runs to show updated data
        const fetchImportedRuns = async () => {
          setLoadingImportedRuns(true);
          try {
            const { getImportedSRCRunsFirestore: getImportedSRCRuns } =
              await import("@/lib/data/firestore/src-imports");
            const runs = await getImportedSRCRuns(1000);
            setImportedSRCRuns(runs);
          } catch (error) {
            console.error("Error refreshing imported runs:", error);
          } finally {
            setLoadingImportedRuns(false);
          }
        };
        await fetchImportedRuns();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to backfill srcPlayerName.",
        variant: "destructive",
      });
    } finally {
      setBackfillingSrcPlayerName(false);
    }
  };

  const handleBatchVerifyAll = async () => {
    if (!currentUser) return;

    // Apply the same filtering logic as the table
    let unverifiedImported = importedSRCRuns.filter((r) => r.verified !== true);

    // Apply leaderboardType filter
    unverifiedImported = unverifiedImported.filter((run) => {
      const runLeaderboardType = run.leaderboardType || "regular";
      return runLeaderboardType === importedRunsLeaderboardType;
    });

    // Apply category filter (only if a category is selected)
    if (importedRunsCategory && importedRunsCategory !== "__all__") {
      unverifiedImported = unverifiedImported.filter((run) => {
        const runCategory = normalizeCategoryId(run.category);
        return runCategory === importedRunsCategory;
      });
    }

    // Apply platform filter (only if a platform is selected)
    if (importedRunsPlatform && importedRunsPlatform !== "__all__") {
      unverifiedImported = unverifiedImported.filter((run) => {
        const runPlatform = normalizePlatformId(run.platform);
        return runPlatform === importedRunsPlatform;
      });
    }

    // Apply level filter for ILs (only if a level is selected)
    if (
      importedRunsLeaderboardType === "individual-level" &&
      importedRunsLevel &&
      importedRunsLevel !== "__all__"
    ) {
      unverifiedImported = unverifiedImported.filter((run) => {
        const runLevel = normalizeLevelId(run.level);
        return runLevel === importedRunsLevel;
      });
    }

    // Apply run type filter (solo/co-op)
    if (importedRunsRunType && importedRunsRunType !== "__all__") {
      unverifiedImported = unverifiedImported.filter((run) => {
        const runRunType = run.runType || "solo";
        return runRunType === importedRunsRunType;
      });
    }

    // Sort by date (most recent first)
    unverifiedImported.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });

    if (unverifiedImported.length === 0) {
      toast({
        title: "No Runs to Verify",
        description:
          "There are no unverified imported runs matching the current filters.",
        variant: "default",
      });
      return;
    }

    setBatchVerifyingAll(true);
    const verifiedBy =
      currentUser.displayName || currentUser.email || currentUser.uid;

    try {
      // Dynamic import to avoid circular dependency
      const { batchVerifyRuns } = await import("@/lib/data/runFieldService");
      const [runsModule, categoriesModule, platformsModule, levelsModule] =
        await Promise.all([
          import("@/lib/data/firestore/runs"),
          import("@/lib/data/firestore/categories"),
          import("@/lib/data/firestore/platforms"),
          import("@/lib/data/firestore/levels"),
        ]);
      // Use optimized batch verification service
      const result = await batchVerifyRuns(
        unverifiedImported,
        verifiedBy,
        runsModule.updateRunVerificationStatus,
        runsModule.updateLeaderboardEntry,
        categoriesModule.getCategoriesFirestore,
        platformsModule.getPlatformsFirestore,
        levelsModule.getLevelsFirestore,
        20, // Process 20 runs in parallel
        (_processed, _total) => {
          // Optional: Could show progress here if needed
        },
      );

      // Show summary toast
      if (result.successCount > 0 && result.errorCount === 0) {
        toast({
          title: "Batch Verification Complete",
          description: `Successfully verified ${result.successCount} run(s).`,
        });
      } else if (result.successCount > 0 && result.errorCount > 0) {
        toast({
          title: "Batch Verification Partial Success",
          description: `Verified ${result.successCount} run(s), ${result.errorCount} error(s).`,
          variant: "default",
        });
      } else {
        toast({
          title: "Batch Verification Failed",
          description: `Failed to verify all runs.`,
          variant: "destructive",
        });
      }

      // Refresh the runs list
      await refreshAllRunData();
    } catch (error: any) {
      toast({
        title: "Batch Verification Error",
        description:
          error.message || "An error occurred during batch verification.",
        variant: "destructive",
      });
    } finally {
      setBatchVerifyingAll(false);
    }
  };

  const handleClearUnverifiedRuns = async () => {
    if (!currentUser?.isAdmin) {
      toast({
        title: "Permission Denied",
        description: "You must be an admin to clear unverified runs.",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmClearUnverifiedDialog(false);
    setClearingUnverifiedRuns(true);

    try {
      // Delete all unverified runs (non-imported)
      const runsToDelete = unverifiedRuns.filter((run) => !run.importedFromSRC);

      if (runsToDelete.length === 0) {
        toast({
          title: "No Runs to Delete",
          description: "No unverified runs found to delete.",
        });
        setClearingUnverifiedRuns(false);
        return;
      }

      let deletedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const run of runsToDelete) {
        try {
          // Dynamic import at call site

          const { deleteLeaderboardEntryFirestore } =
            await import("@/lib/data/firestore/runs");
          const success = await deleteLeaderboardEntry(run.id);
          if (success) {
            deletedCount++;
          } else {
            errorCount++;
            errors.push(`Failed to delete run ${run.id}`);
          }
        } catch (error: any) {
          errorCount++;
          errors.push(
            `Error deleting run ${run.id}: ${error.message || String(error)}`,
          );
        }
      }

      if (deletedCount > 0) {
        toast({
          title: "Runs Cleared",
          description: `Successfully deleted ${deletedCount} unverified run(s).${errorCount > 0 ? ` ${errorCount} error(s) occurred.` : ""}`,
          variant: errorCount > 0 ? "destructive" : "default",
        });

        // Refresh the runs list
        await fetchUnverifiedRuns();
      } else if (errorCount > 0) {
        toast({
          title: "Clear Failed",
          description: `Failed to delete any runs. ${errors.slice(0, 3).join("; ")}${errors.length > 3 ? ` and ${errors.length - 3} more.` : ""}`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      const isPermissionError =
        errorMsg.toLowerCase().includes("permission") ||
        errorMsg.toLowerCase().includes("insufficient") ||
        errorMsg.toLowerCase().includes("missing");

      toast({
        title: isPermissionError ? "Permission Error" : "Error",
        description: isPermissionError
          ? "You don't have permission to delete unverified runs. Please ensure you are logged in as an admin."
          : errorMsg || "Failed to clear unverified runs.",
        variant: "destructive",
      });
    } finally {
      setClearingUnverifiedRuns(false);
    }
  };

  // Category management handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setAddingCategory(true);
    try {
      // Dynamic import at call site

      const { addCategoryFirestore } =
        await import("@/lib/data/firestore/categories");
      const result = await addCategory(
        newCategoryName.trim(),
        categoryLeaderboardType,
      );
      if (result) {
        toast({
          title: "Category Added",
          description: "New category has been added.",
        });
        setNewCategoryName("");
        fetchCategories(categoryLeaderboardType);
      } else {
        throw new Error("Category with this name already exists.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add category.",
        variant: "destructive",
      });
    } finally {
      setAddingCategory(false);
    }
  };

  const handleStartEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditingCategoryName(category.name);
    setEditingCategorySrcId(category.srcCategoryId || "");
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditingCategoryName("");
    setEditingCategorySrcId("");
  };

  // Translation management helpers
  const handleStartEditTranslation = (
    type: "category" | "subcategory" | "level" | "platform",
    id: string,
    originalName: string,
    language?: string,
    value?: string,
  ) => {
    const translationKey =
      type === "category" && id.startsWith("downloadCategory.")
        ? `entities.${id}`
        : `entities.${type}.${id}`;
    const lang = language || selectedTranslationLanguage;
    const currentTranslation =
      value !== undefined
        ? value
        : adminTranslations[lang]?.[translationKey] ||
          i18n.t(translationKey, { lng: lang });
    const translationValue =
      currentTranslation && currentTranslation !== translationKey
        ? currentTranslation
        : "";

    setEditingEntityTranslation({ type, id, originalName, language: lang });
    setEditingTranslationValue(translationValue);
  };

  const handleSaveTranslation = async () => {
    if (!editingEntityTranslation || !editingTranslationValue.trim()) {
      toast({
        title: "Error",
        description: "Translation value cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setSavingTranslation(true);
    try {
      // Handle download categories with composite ID
      const translationKey = editingEntityTranslation.id.startsWith(
        "downloadCategory.",
      )
        ? `entities.${editingEntityTranslation.id}`
        : `entities.${editingEntityTranslation.type}.${editingEntityTranslation.id}`;
      await setAdminTranslation(
        translationKey,
        editingEntityTranslation.language,
        editingTranslationValue.trim(),
        currentUser?.uid,
      );

      // Update local state
      setAdminTranslations((prev) => ({
        ...prev,
        [editingEntityTranslation.language]: {
          ...prev[editingEntityTranslation.language],
          [translationKey]: editingTranslationValue.trim(),
        },
      }));

      // Update i18n resources immediately
      i18n.addResourceBundle(
        editingEntityTranslation.language,
        "translation",
        { [translationKey]: editingTranslationValue.trim() },
        true,
        true,
      );

      toast({
        title: "Translation Saved",
        description: `Translation saved for ${editingEntityTranslation.language}.`,
      });

      setEditingEntityTranslation(null);
      setEditingTranslationValue("");
    } catch (error) {
      console.error("Error saving translation:", error);
      toast({
        title: "Error",
        description: "Failed to save translation.",
        variant: "destructive",
      });
    } finally {
      setSavingTranslation(false);
    }
  };

  const handleCancelEditTranslation = () => {
    setEditingEntityTranslation(null);
    setEditingTranslationValue("");
  };

  const handleSaveEditCategory = async () => {
    if (!editingCategory || !editingCategoryName.trim()) {
      return;
    }

    setUpdatingCategory(true);
    try {
      // Get current category to preserve subcategories
      const currentCategory = firestoreCategories.find(
        (c) => c.id === editingCategory.id,
      ) as Category | undefined;
      const subcategories = currentCategory?.subcategories || [];
      const srcCategoryId = editingCategorySrcId.trim() || null;

      // Dynamic import at call site

      const { updateCategoryFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await updateCategory(
        editingCategory.id,
        editingCategoryName.trim(),
        subcategories,
        srcCategoryId,
      );
      if (success) {
        toast({
          title: "Category Updated",
          description: "Category has been updated.",
        });

        // If srcCategoryId was set and we're in subcategory management with this category selected, check for variables
        if (
          srcCategoryId &&
          selectedCategoryForSubcategories?.id === editingCategory.id
        ) {
          const updatedCategory = { ...editingCategory, srcCategoryId };
          await fetchSRCVariablesForCategory(updatedCategory);
        }

        setEditingCategory(null);
        setEditingCategoryName("");
        setEditingCategorySrcId("");
        fetchCategories(categoryLeaderboardType);
      } else {
        throw new Error("Another category with this name already exists.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update category.",
        variant: "destructive",
      });
    } finally {
      setUpdatingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category? This may affect existing runs.",
      )
    ) {
      return;
    }
    try {
      // Dynamic import at call site

      const { deleteCategoryFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await deleteCategory(categoryId);
      if (success) {
        toast({
          title: "Category Deleted",
          description: "Category has been removed.",
        });
        await fetchCategories(categoryLeaderboardType);
      } else {
        throw new Error(
          "Failed to delete category. It may not exist or you may not have permission.",
        );
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category.",
        variant: "destructive",
      });
    }
  };

  const handleMoveCategoryUp = async (categoryId: string) => {
    setReorderingCategory(categoryId);
    try {
      // Dynamic import at call site

      const { moveCategoryUpFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await moveCategoryUp(categoryId);
      if (success) {
        await fetchCategories(categoryLeaderboardType);
      } else {
        toast({
          title: "Cannot Move",
          description: "Category is already at the top.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move category.",
        variant: "destructive",
      });
    } finally {
      setReorderingCategory(null);
    }
  };

  const handleMoveCategoryDown = async (categoryId: string) => {
    setReorderingCategory(categoryId);
    try {
      // Dynamic import at call site

      const { moveCategoryDownFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await moveCategoryDown(categoryId);
      if (success) {
        await fetchCategories(categoryLeaderboardType);
      } else {
        toast({
          title: "Cannot Move",
          description: "Category is already at the bottom.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move category.",
        variant: "destructive",
      });
    } finally {
      setReorderingCategory(null);
    }
  };

  // Subcategory management handlers
  const fetchSRCVariablesForCategory = useCallback(
    async (category: Category) => {
      if (!category.srcCategoryId) {
        setSrcVariables([]);
        return;
      }

      setLoadingSRCVariables(true);
      try {
        const variables = await fetchCategoryVariables(category.srcCategoryId);
        if (variables?.data) {
          setSrcVariables(variables.data);
        } else {
          setSrcVariables([]);
        }
      } catch (_error: any) {
        toast({
          title: "Error",
          description:
            "Failed to fetch SRC variables. Make sure the category has a linked SRC category ID.",
          variant: "destructive",
        });
        setSrcVariables([]);
      } finally {
        setLoadingSRCVariables(false);
      }
    },
    [toast],
  );

  // Fetch SRC variables when category is selected or categories are refreshed (only for regular categories)
  useEffect(() => {
    if (
      selectedCategoryForSubcategories &&
      categoryLeaderboardType === "regular"
    ) {
      // Get the latest category data from firestoreCategories to ensure we have the most up-to-date srcCategoryId
      const latestCategory = firestoreCategories.find(
        (c) => c.id === selectedCategoryForSubcategories.id,
      ) as Category | undefined;
      if (latestCategory) {
        // Only update if srcCategoryId changed to avoid unnecessary re-renders
        if (
          latestCategory.srcCategoryId !==
          selectedCategoryForSubcategories.srcCategoryId
        ) {
          setSelectedCategoryForSubcategories(latestCategory);
        }
        fetchSRCVariablesForCategory(latestCategory);
      } else {
        fetchSRCVariablesForCategory(selectedCategoryForSubcategories);
      }
    } else {
      setSrcVariables([]);
    }
  }, [
    selectedCategoryForSubcategories,
    categoryLeaderboardType,
    firestoreCategories,
    fetchSRCVariablesForCategory,
  ]);

  const handleAddSubcategory = async () => {
    if (!selectedCategoryForSubcategories || !newSubcategoryName.trim()) {
      toast({
        title: "Error",
        description: "Please select a category and enter a subcategory name.",
        variant: "destructive",
      });
      return;
    }

    setAddingSubcategory(true);
    try {
      const currentCategory = firestoreCategories.find(
        (c) => c.id === selectedCategoryForSubcategories.id,
      ) as Category | undefined;
      const existingSubcategories = currentCategory?.subcategories || [];

      // Check for duplicate names
      if (
        existingSubcategories.some(
          (s) =>
            s.name.toLowerCase().trim() ===
            newSubcategoryName.toLowerCase().trim(),
        )
      ) {
        throw new Error("A subcategory with this name already exists.");
      }

      // Generate a new ID
      const newId = `subcat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const maxOrder = existingSubcategories.reduce(
        (max, s) => Math.max(max, s.order || 0),
        0,
      );

      const newSubcategory: Subcategory = {
        id: newId,
        name: newSubcategoryName.trim(),
        order: maxOrder + 1,
      };

      const updatedSubcategories = [...existingSubcategories, newSubcategory];
      // Dynamic import at call site

      const { updateCategoryFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await updateCategory(
        selectedCategoryForSubcategories.id,
        selectedCategoryForSubcategories.name,
        updatedSubcategories,
      );

      if (success) {
        toast({
          title: "Subcategory Added",
          description: "New subcategory has been added.",
        });
        setNewSubcategoryName("");
        await fetchCategories(categoryLeaderboardType);
        // Refresh selected category
        // Dynamic import at call site

        const { getCategoriesFirestore: getCategories } =
          await import("@/lib/data/firestore/categories");
        const updated = await getCategories(categoryLeaderboardType);
        const refreshed = updated.find(
          (c) => c.id === selectedCategoryForSubcategories.id,
        ) as Category | undefined;
        if (refreshed) {
          setSelectedCategoryForSubcategories(refreshed);
        }
      } else {
        throw new Error("Failed to add subcategory.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add subcategory.",
        variant: "destructive",
      });
    } finally {
      setAddingSubcategory(false);
    }
  };

  const handleStartEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setEditingSubcategoryName(subcategory.name);
  };

  const handleCancelEditSubcategory = () => {
    setEditingSubcategory(null);
    setEditingSubcategoryName("");
  };

  const handleSaveEditSubcategory = async () => {
    if (
      !selectedCategoryForSubcategories ||
      !editingSubcategory ||
      !editingSubcategoryName.trim()
    ) {
      return;
    }

    setUpdatingSubcategory(true);
    try {
      const currentCategory = firestoreCategories.find(
        (c) => c.id === selectedCategoryForSubcategories.id,
      ) as Category | undefined;
      const existingSubcategories = currentCategory?.subcategories || [];

      // Check for duplicate names (excluding current subcategory)
      if (
        existingSubcategories.some(
          (s) =>
            s.id !== editingSubcategory.id &&
            s.name.toLowerCase().trim() ===
              editingSubcategoryName.toLowerCase().trim(),
        )
      ) {
        throw new Error("Another subcategory with this name already exists.");
      }

      const updatedSubcategories = existingSubcategories.map((s) =>
        s.id === editingSubcategory.id
          ? { ...s, name: editingSubcategoryName.trim() }
          : s,
      );

      // Dynamic import at call site

      const { updateCategoryFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await updateCategory(
        selectedCategoryForSubcategories.id,
        selectedCategoryForSubcategories.name,
        updatedSubcategories,
      );

      if (success) {
        toast({
          title: "Subcategory Updated",
          description: "Subcategory has been updated.",
        });
        setEditingSubcategory(null);
        setEditingSubcategoryName("");
        await fetchCategories(categoryLeaderboardType);
        // Refresh selected category
        // Dynamic import at call site

        const { getCategoriesFirestore: getCategories } =
          await import("@/lib/data/firestore/categories");
        const updated = await getCategories(categoryLeaderboardType);
        const refreshed = updated.find(
          (c) => c.id === selectedCategoryForSubcategories.id,
        ) as Category | undefined;
        if (refreshed) {
          setSelectedCategoryForSubcategories(refreshed);
        }
      } else {
        throw new Error("Failed to update subcategory.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update subcategory.",
        variant: "destructive",
      });
    } finally {
      setUpdatingSubcategory(false);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (!selectedCategoryForSubcategories) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this subcategory? This may affect existing runs.",
      )
    ) {
      return;
    }

    try {
      const currentCategory = firestoreCategories.find(
        (c) => c.id === selectedCategoryForSubcategories.id,
      ) as Category | undefined;
      const existingSubcategories = currentCategory?.subcategories || [];
      const updatedSubcategories = existingSubcategories.filter(
        (s) => s.id !== subcategoryId,
      );

      // Dynamic import at call site

      const { updateCategoryFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await updateCategory(
        selectedCategoryForSubcategories.id,
        selectedCategoryForSubcategories.name,
        updatedSubcategories,
      );

      if (success) {
        toast({
          title: "Subcategory Deleted",
          description: "Subcategory has been removed.",
        });
        await fetchCategories(categoryLeaderboardType);
        // Refresh selected category
        // Dynamic import at call site

        const { getCategoriesFirestore: getCategories } =
          await import("@/lib/data/firestore/categories");
        const updated = await getCategories(categoryLeaderboardType);
        const refreshed = updated.find(
          (c) => c.id === selectedCategoryForSubcategories.id,
        ) as Category | undefined;
        if (refreshed) {
          setSelectedCategoryForSubcategories(refreshed);
        }
      } else {
        throw new Error("Failed to delete subcategory.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subcategory.",
        variant: "destructive",
      });
    }
  };

  const handleMoveSubcategoryUp = async (subcategoryId: string) => {
    if (!selectedCategoryForSubcategories) return;

    setReorderingSubcategory(subcategoryId);
    try {
      const currentCategory = firestoreCategories.find(
        (c) => c.id === selectedCategoryForSubcategories.id,
      ) as Category | undefined;
      const existingSubcategories = currentCategory?.subcategories || [];
      const index = existingSubcategories.findIndex(
        (s) => s.id === subcategoryId,
      );

      if (index <= 0) {
        throw new Error("Subcategory is already at the top.");
      }

      const updatedSubcategories = [...existingSubcategories];
      const currentOrder = updatedSubcategories[index].order ?? index;
      const prevOrder = updatedSubcategories[index - 1].order ?? index - 1;

      updatedSubcategories[index].order = prevOrder;
      updatedSubcategories[index - 1].order = currentOrder;

      // Dynamic import at call site

      const { updateCategoryFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await updateCategory(
        selectedCategoryForSubcategories.id,
        selectedCategoryForSubcategories.name,
        updatedSubcategories,
      );

      if (success) {
        await fetchCategories(categoryLeaderboardType);
        // Refresh selected category
        // Dynamic import at call site

        const { getCategoriesFirestore: getCategories } =
          await import("@/lib/data/firestore/categories");
        const updated = await getCategories(categoryLeaderboardType);
        const refreshed = updated.find(
          (c) => c.id === selectedCategoryForSubcategories.id,
        ) as Category | undefined;
        if (refreshed) {
          setSelectedCategoryForSubcategories(refreshed);
        }
      } else {
        throw new Error("Failed to reorder subcategory.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to move subcategory.",
        variant: "destructive",
      });
    } finally {
      setReorderingSubcategory(null);
    }
  };

  const handleMoveSubcategoryDown = async (subcategoryId: string) => {
    if (!selectedCategoryForSubcategories) return;

    setReorderingSubcategory(subcategoryId);
    try {
      const currentCategory = firestoreCategories.find(
        (c) => c.id === selectedCategoryForSubcategories.id,
      ) as Category | undefined;
      const existingSubcategories = currentCategory?.subcategories || [];
      const index = existingSubcategories.findIndex(
        (s) => s.id === subcategoryId,
      );

      if (index < 0 || index >= existingSubcategories.length - 1) {
        throw new Error("Subcategory is already at the bottom.");
      }

      const updatedSubcategories = [...existingSubcategories];
      const currentOrder = updatedSubcategories[index].order ?? index;
      const nextOrder = updatedSubcategories[index + 1].order ?? index + 1;

      updatedSubcategories[index].order = nextOrder;
      updatedSubcategories[index + 1].order = currentOrder;

      // Dynamic import at call site

      const { updateCategoryFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await updateCategory(
        selectedCategoryForSubcategories.id,
        selectedCategoryForSubcategories.name,
        updatedSubcategories,
      );

      if (success) {
        await fetchCategories(categoryLeaderboardType);
        // Refresh selected category
        // Dynamic import at call site

        const { getCategoriesFirestore: getCategories } =
          await import("@/lib/data/firestore/categories");
        const updated = await getCategories(categoryLeaderboardType);
        const refreshed = updated.find(
          (c) => c.id === selectedCategoryForSubcategories.id,
        ) as Category | undefined;
        if (refreshed) {
          setSelectedCategoryForSubcategories(refreshed);
        }
      } else {
        throw new Error("Failed to reorder subcategory.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to move subcategory.",
        variant: "destructive",
      });
    } finally {
      setReorderingSubcategory(null);
    }
  };

  const handleSetSubcategoryVariable = async (variableName: string | null) => {
    if (!selectedCategoryForSubcategories) return;

    setUpdatingSubcategory(true);
    try {
      // Dynamic import at call site

      const { updateCategoryFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await updateCategory(
        selectedCategoryForSubcategories.id,
        selectedCategoryForSubcategories.name,
        selectedCategoryForSubcategories.subcategories,
        selectedCategoryForSubcategories.srcCategoryId,
        variableName,
      );

      if (success) {
        toast({
          title: "Variable Selected",
          description: variableName
            ? `Using "${variableName}" for subcategories.`
            : "Using first variable for subcategories.",
        });
        await fetchCategories(categoryLeaderboardType);
        // Refresh selected category
        // Dynamic import at call site

        const { getCategoriesFirestore: getCategories } =
          await import("@/lib/data/firestore/categories");
        const updated = await getCategories(categoryLeaderboardType);
        const refreshed = updated.find(
          (c) => c.id === selectedCategoryForSubcategories.id,
        ) as Category | undefined;
        if (refreshed) {
          setSelectedCategoryForSubcategories(refreshed);
        }
      } else {
        throw new Error("Failed to update category.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set subcategory variable.",
        variant: "destructive",
      });
    } finally {
      setUpdatingSubcategory(false);
    }
  };

  const handleImportSubcategoriesFromSRC = async () => {
    if (!selectedCategoryForSubcategories || !srcVariables.length) {
      toast({
        title: "Error",
        description: "Please select a category with SRC variables available.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingSubcategory(true);
    try {
      const currentCategory = firestoreCategories.find(
        (c) => c.id === selectedCategoryForSubcategories.id,
      ) as Category | undefined;
      const existingSubcategories = currentCategory?.subcategories || [];
      const existingNames = new Set(
        existingSubcategories.map((s) => s.name.toLowerCase().trim()),
      );

      // Determine which variable to use: prefer the one set in srcSubcategoryVariableName, otherwise use first
      let variable = srcVariables[0];
      const preferredVariableName = currentCategory?.srcSubcategoryVariableName;
      if (preferredVariableName && srcVariables.length > 1) {
        const preferredVariable = srcVariables.find(
          (v) =>
            v.name.toLowerCase().trim() ===
            preferredVariableName.toLowerCase().trim(),
        );
        if (preferredVariable) {
          variable = preferredVariable;
        }
      }
      const newSubcategories: Subcategory[] = [];
      let maxOrder = existingSubcategories.reduce(
        (max, s) => Math.max(max, s.order || 0),
        0,
      );

      for (const [valueId, valueData] of Object.entries(
        variable.values.values,
      )) {
        const valueLabel = valueData.label;
        if (!existingNames.has(valueLabel.toLowerCase().trim())) {
          maxOrder++;
          newSubcategories.push({
            id: `subcat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: valueLabel,
            order: maxOrder,
            srcVariableId: variable.id,
            srcValueId: valueId,
          });
        }
      }

      if (newSubcategories.length === 0) {
        toast({
          title: "No New Subcategories",
          description:
            "All SRC variable values already exist as subcategories.",
        });
        return;
      }

      const updatedSubcategories = [
        ...existingSubcategories,
        ...newSubcategories,
      ];
      // Dynamic import at call site

      const { updateCategoryFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await updateCategory(
        selectedCategoryForSubcategories.id,
        selectedCategoryForSubcategories.name,
        updatedSubcategories,
      );

      if (success) {
        toast({
          title: "Subcategories Imported",
          description: `Successfully imported ${newSubcategories.length} subcategory(ies) from SRC.`,
        });
        await fetchCategories(categoryLeaderboardType);
        // Refresh selected category
        // Dynamic import at call site

        const { getCategoriesFirestore: getCategories } =
          await import("@/lib/data/firestore/categories");
        const updated = await getCategories(categoryLeaderboardType);
        const refreshed = updated.find(
          (c) => c.id === selectedCategoryForSubcategories.id,
        ) as Category | undefined;
        if (refreshed) {
          setSelectedCategoryForSubcategories(refreshed);
        }
      } else {
        throw new Error("Failed to import subcategories.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to import subcategories from SRC.",
        variant: "destructive",
      });
    } finally {
      setUpdatingSubcategory(false);
    }
  };

  // Platform management handlers
  const handleAddPlatform = async () => {
    if (!newPlatformName.trim()) {
      return;
    }
    setAddingPlatform(true);
    try {
      // Dynamic import at call site

      const { addPlatformFirestore } =
        await import("@/lib/data/firestore/categories");
      const platformId = await addPlatform(newPlatformName.trim());
      if (platformId) {
        toast({
          title: "Platform Added",
          description: "Platform has been added.",
        });
        setNewPlatformName("");
        fetchPlatforms();
      } else {
        throw new Error("Another platform with this name already exists.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add platform.",
        variant: "destructive",
      });
    } finally {
      setAddingPlatform(false);
    }
  };

  const handleStartEditPlatform = (platform: { id: string; name: string }) => {
    setEditingPlatform(platform);
    setEditingPlatformName(platform.name);
  };

  const handleCancelEditPlatform = () => {
    setEditingPlatform(null);
    setEditingPlatformName("");
  };

  const handleSaveEditPlatform = async () => {
    if (!editingPlatform || !editingPlatformName.trim()) {
      return;
    }

    setUpdatingPlatform(true);
    try {
      // Dynamic import at call site

      const { updatePlatformFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await updatePlatform(
        editingPlatform.id,
        editingPlatformName.trim(),
      );
      if (success) {
        toast({
          title: "Platform Updated",
          description: "Platform has been updated.",
        });
        setEditingPlatform(null);
        setEditingPlatformName("");
        fetchPlatforms();
      } else {
        throw new Error("Another platform with this name already exists.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update platform.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPlatform(false);
    }
  };

  const handleDeletePlatform = async (platformId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this platform? This may affect existing runs.",
      )
    ) {
      return;
    }
    try {
      // Dynamic import at call site

      const { deletePlatformFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await deletePlatform(platformId);
      if (success) {
        toast({
          title: "Platform Deleted",
          description: "Platform has been removed.",
        });
        await fetchPlatforms();
      } else {
        throw new Error(
          "Failed to delete platform. It may not exist or you may not have permission.",
        );
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete platform.",
        variant: "destructive",
      });
    }
  };

  const handleMovePlatformUp = async (platformId: string) => {
    setReorderingPlatform(platformId);
    try {
      // Dynamic import at call site

      const { movePlatformUpFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await movePlatformUp(platformId);
      if (success) {
        await fetchPlatforms();
      } else {
        toast({
          title: "Cannot Move",
          description: "Platform is already at the top.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move platform.",
        variant: "destructive",
      });
    } finally {
      setReorderingPlatform(null);
    }
  };

  const handleMovePlatformDown = async (platformId: string) => {
    setReorderingPlatform(platformId);
    try {
      // Dynamic import at call site

      const { movePlatformDownFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await movePlatformDown(platformId);
      if (success) {
        await fetchPlatforms();
      } else {
        toast({
          title: "Cannot Move",
          description: "Platform is already at the bottom.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move platform.",
        variant: "destructive",
      });
    } finally {
      setReorderingPlatform(null);
    }
  };

  // Level management handlers
  const handleAddLevel = async () => {
    if (!newLevelName.trim()) {
      return;
    }
    setAddingLevel(true);
    try {
      // Dynamic import at call site

      const { addLevelFirestore } =
        await import("@/lib/data/firestore/categories");
      const levelId = await addLevel(newLevelName.trim());
      if (levelId) {
        toast({
          title: "Level Added",
          description: "Level has been added.",
        });
        setNewLevelName("");
        await fetchLevels();
      } else {
        throw new Error("Another level with this name already exists.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add level.",
        variant: "destructive",
      });
    } finally {
      setAddingLevel(false);
    }
  };

  const handleStartEditLevel = (level: { id: string; name: string }) => {
    setEditingLevel(level);
    setEditingLevelName(level.name);
  };

  const handleCancelEditLevel = () => {
    setEditingLevel(null);
    setEditingLevelName("");
  };

  const handleSaveEditLevel = async () => {
    if (!editingLevel || !editingLevelName.trim()) {
      return;
    }

    setUpdatingLevel(true);
    try {
      // Dynamic import at call site

      const { updateLevelFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await updateLevel(
        editingLevel.id,
        editingLevelName.trim(),
      );
      if (success) {
        toast({
          title: "Level Updated",
          description: "Level has been updated.",
        });
        setEditingLevel(null);
        setEditingLevelName("");
        await fetchLevels();
      } else {
        throw new Error("Another level with this name already exists.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update level.",
        variant: "destructive",
      });
    } finally {
      setUpdatingLevel(false);
    }
  };

  const handleDeleteLevel = async (levelId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this level? This may affect existing runs.",
      )
    ) {
      return;
    }
    try {
      // Dynamic import at call site

      const { deleteLevelFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await deleteLevel(levelId);
      if (success) {
        toast({
          title: "Level Deleted",
          description: "Level has been removed.",
        });
        await fetchLevels();
      } else {
        throw new Error(
          "Failed to delete level. It may not exist or you may not have permission.",
        );
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete level.",
        variant: "destructive",
      });
    }
  };

  const handleMoveLevelUp = async (levelId: string) => {
    setReorderingLevel(levelId);
    try {
      // Dynamic import at call site

      const { moveLevelUpFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await moveLevelUp(levelId);
      if (success) {
        await fetchLevels();
      } else {
        toast({
          title: "Cannot Move",
          description: "Level is already at the top.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move level.",
        variant: "destructive",
      });
    } finally {
      setReorderingLevel(null);
    }
  };

  const handleMoveLevelDown = async (levelId: string) => {
    setReorderingLevel(levelId);
    try {
      // Dynamic import at call site

      const { moveLevelDownFirestore } =
        await import("@/lib/data/firestore/categories");
      const success = await moveLevelDown(levelId);
      if (success) {
        await fetchLevels();
      } else {
        toast({
          title: "Cannot Move",
          description: "Level is already at the bottom.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move level.",
        variant: "destructive",
      });
    } finally {
      setReorderingLevel(null);
    }
  };

  // Manual run input handler

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-[#1e1e2e] text-ctp-text py-4 sm:py-6 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 w-full">
          <FadeIn className="space-y-4">
            {/* Tab skeleton */}
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Array.from({ length: 11 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-32 bg-[hsl(240,21%,15%)] rounded animate-pulse flex-shrink-0"
                  />
                ))}
              </div>
            </div>
            {/* Content skeleton */}
            <CardSkeleton lines={5} />
          </FadeIn>
        </div>
      </div>
    );
  }

  if (!currentUser || !currentUser.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1e1e2e] text-ctp-text py-4 sm:py-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 w-full">
        <FadeIn>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <span>{currentGame.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {availableGames.map((game) => (
                  <DropdownMenuItem
                    key={game.id}
                    onClick={() => switchGame(game.id)}
                    disabled={currentGame.id === game.id}
                  >
                    {game.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <AnimatedTabsList
              className="flex w-full mb-6 p-0.5 gap-1 overflow-x-auto overflow-y-hidden scrollbar-hide relative"
              style={{ minWidth: "max-content" }}
              indicatorClassName="h-0.5 bg-[#f9e2af]"
            >
              <AnimatedTabsTrigger
                value="runs"
                className="transition-all duration-300 font-medium text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:text-[#f9e2af]"
              >
                Unverified Runs
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="categories"
                className="transition-all duration-300 font-medium text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:text-[#f9e2af]"
              >
                Categories
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="levels"
                className="transition-all duration-300 font-medium text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:text-[#f9e2af]"
              >
                Levels
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="platforms"
                className="transition-all duration-300 font-medium text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:text-[#f9e2af]"
              >
                Platforms
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="downloads"
                className="transition-all duration-300 font-medium text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:text-[#f9e2af]"
              >
                Downloads
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="users"
                className="transition-all duration-300 font-medium text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:text-[#f9e2af]"
              >
                Users
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="points"
                className="transition-all duration-300 font-medium text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:text-[#f9e2af]"
              >
                Points
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="game-details"
                className="transition-all duration-300 font-medium text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:text-[#f9e2af]"
              >
                Game Details
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="src"
                className="transition-all duration-300 font-medium text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:text-[#f9e2af]"
              >
                SRC Tools
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="tools"
                className="transition-all duration-300 font-medium text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:text-[#f9e2af]"
              >
                Tools
              </AnimatedTabsTrigger>
              <AnimatedTabsTrigger
                value="translations"
                className="transition-all duration-300 font-medium text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 whitespace-nowrap data-[state=active]:text-[#f9e2af]"
              >
                Translations
              </AnimatedTabsTrigger>
            </AnimatedTabsList>

            {/* Tools Section */}
            <AnimatedTabsContent value="tools" className="space-y-4">
              <FadeIn key="tools" direction="fade">
                <ToolsTab
                  firestorePlatforms={firestorePlatforms}
                  firestoreCategories={firestoreCategories}
                  availableLevels={availableLevels}
                  fetchUnverifiedRuns={fetchUnverifiedRuns}
                />
              </FadeIn>
            </AnimatedTabsContent>

            {/* Game Details Configuration Section */}
            <AnimatedTabsContent value="game-details" className="space-y-4">
              <FadeIn key="game-details" direction="fade">
                <GameDetailsConfigTab activeTab={activeTab} />
              </FadeIn>
            </AnimatedTabsContent>

            {/* SRC Tools Section */}
            <AnimatedTabsContent value="src" className="space-y-4">
              <FadeIn key="src" direction="fade">
                <SRCToolsTab
                  importedSRCRuns={importedSRCRuns}
                  firestoreCategories={firestoreCategories}
                  firestorePlatforms={firestorePlatforms}
                  availableLevels={availableLevels}
                  importedRunsCategories={importedRunsCategories}
                  srcCategoriesWithVars={srcCategoriesWithVars}
                  allCategoriesForSRCLinking={allCategoriesForSRCLinking}
                  importingRuns={importingRuns}
                  loadingImportedRuns={loadingImportedRuns}
                  clearingImportedRuns={clearingImportedRuns}
                  batchVerifying={batchVerifying}
                  batchVerifyingAll={batchVerifyingAll}
                  autoclaiming={autoclaiming}
                  backfillingSrcPlayerName={backfillingSrcPlayerName}
                  loadingSRCCategories={loadingSRCCategories}
                  updatingCategory={updatingCategory}
                  importProgress={importProgress}
                  onImportFromSRC={handleImportFromSRC}
                  onClearImportedRuns={handleClearImportedRuns}
                  onBatchVerify={handleBatchVerify}
                  onBatchVerifyAll={handleBatchVerifyAll}
                  onAutoclaimRuns={handleAutoclaimRuns}
                  onBackfillSrcPlayerName={handleBackfillSrcPlayerName}
                  onFetchSRCCategoriesWithVariables={
                    fetchSRCCategoriesWithVariables
                  }
                  onEditRun={handleEditImportedRun}
                  onReject={handleReject}
                  onLinkCategory={handleLinkCategory}
                  onUnlinkCategory={handleUnlinkCategory}
                  onFetchCategories={fetchCategories}
                  categoryLeaderboardType={categoryLeaderboardType}
                />
              </FadeIn>
            </AnimatedTabsContent>

            {/* Unverified Runs Section */}
            <AnimatedTabsContent value="runs" className="space-y-4">
              <FadeIn key="runs" direction="fade">
                <RunsTab
                  firestoreCategories={firestoreCategories}
                  firestorePlatforms={firestorePlatforms}
                  onVerify={handleVerify}
                  onReject={handleReject}
                />
              </FadeIn>
            </AnimatedTabsContent>

            {/* Translations Section */}
            <AnimatedTabsContent value="translations" className="space-y-4">
              <FadeIn key="translations" direction="fade">
                <TranslationTab />
              </FadeIn>
            </AnimatedTabsContent>

            {/* Confirm Clear Unverified Runs Dialog */}
            <Dialog
              open={showConfirmClearUnverifiedDialog}
              onOpenChange={setShowConfirmClearUnverifiedDialog}
            >
              <DialogContent className="bg-[hsl(240,21%,16%)] border-[hsl(235,13%,30%)]">
                <DialogHeader>
                  <DialogTitle className="text-[#f2cdcd]">
                    Clear All Unverified Runs
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-[hsl(222,15%,60%)] mb-4">
                    Are you sure you want to delete all{" "}
                    {
                      unverifiedRuns.filter((run) => !run.importedFromSRC)
                        .length
                    }{" "}
                    unverified runs? This action cannot be undone and will
                    permanently delete all manually submitted runs that are
                    awaiting verification.
                  </p>
                  <p className="text-sm text-red-400 mb-4">
                    Note: This will only delete manually submitted runs.
                    Imported runs will remain in the Imported Runs tab.
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmClearUnverifiedDialog(false)}
                    disabled={clearingUnverifiedRuns}
                    className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleClearUnverifiedRuns}
                    disabled={clearingUnverifiedRuns}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {clearingUnverifiedRuns ? "Deleting..." : "Delete All"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Verify Imported Run Dialog */}
            <Dialog
              open={!!verifyingRun}
              onOpenChange={(open) => {
                if (!open) {
                  setVerifyingRun(null);
                  setVerifyingRunCategory("");
                  setVerifyingRunPlatform("");
                  setVerifyingRunLevel("");
                }
              }}
            >
              <DialogContent className="bg-[hsl(240,21%,16%)] border-[hsl(235,13%,30%)] max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-[#f2cdcd]">
                    Verify Imported Run
                  </DialogTitle>
                </DialogHeader>
                {verifyingRun && (
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-[hsl(222,15%,60%)]">
                      Select the category, platform, and level (if applicable)
                      for this run before verifying.
                    </p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="verify-category"
                            className="text-sm font-medium"
                          >
                            Category <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={verifyingRunCategory || ""}
                            onValueChange={(value) => {
                              setVerifyingRunCategory(value);
                              // Clear subcategory if category changes (for regular runs)
                              if (verifyingRun.leaderboardType === "regular") {
                                // Subcategory will be handled by the category change
                              }
                            }}
                          >
                            <SelectTrigger
                              id="verify-category"
                              className="w-full bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] hover:border-[hsl(235,13%,40%)] focus:ring-2 focus:ring-[#cba6f7] transition-colors"
                            >
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent className="bg-[hsl(240,21%,16%)] border-[hsl(235,13%,30%)]">
                              {firestoreCategories
                                .filter((cat) => {
                                  const runLeaderboardType =
                                    verifyingRun.leaderboardType || "regular";
                                  const catType =
                                    (cat as Category).leaderboardType ||
                                    "regular";
                                  return catType === runLeaderboardType;
                                })
                                .map((cat) => (
                                  <SelectItem
                                    key={cat.id}
                                    value={cat.id}
                                    className="focus:bg-[hsl(240,21%,20%)] cursor-pointer"
                                  >
                                    {cat.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          {!verifyingRunCategory && (
                            <p className="text-xs text-red-400 mt-1">
                              Category is required
                            </p>
                          )}
                          {verifyingRun.srcCategoryName && (
                            <p className="text-xs text-[hsl(222,15%,60%)] mt-1">
                              SRC: {verifyingRun.srcCategoryName}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="verify-platform"
                            className="text-sm font-medium"
                          >
                            Platform <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={verifyingRunPlatform || ""}
                            onValueChange={setVerifyingRunPlatform}
                          >
                            <SelectTrigger
                              id="verify-platform"
                              className="w-full bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] hover:border-[hsl(235,13%,40%)] focus:ring-2 focus:ring-[#cba6f7] transition-colors"
                            >
                              <SelectValue placeholder="Select a platform" />
                            </SelectTrigger>
                            <SelectContent className="bg-[hsl(240,21%,16%)] border-[hsl(235,13%,30%)]">
                              {firestorePlatforms.map((platform) => (
                                <SelectItem
                                  key={platform.id}
                                  value={platform.id}
                                  className="focus:bg-[hsl(240,21%,20%)] cursor-pointer"
                                >
                                  {platform.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {!verifyingRunPlatform && (
                            <p className="text-xs text-red-400 mt-1">
                              Platform is required
                            </p>
                          )}
                          {verifyingRun.srcPlatformName && (
                            <p className="text-xs text-[hsl(222,15%,60%)] mt-1">
                              SRC: {verifyingRun.srcPlatformName}
                            </p>
                          )}
                        </div>
                      </div>
                      {(verifyingRun.leaderboardType === "individual-level" ||
                        verifyingRun.leaderboardType === "community-golds") && (
                        <div className="space-y-2">
                          <Label
                            htmlFor="verify-level"
                            className="text-sm font-medium"
                          >
                            Level <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={verifyingRunLevel || ""}
                            onValueChange={setVerifyingRunLevel}
                          >
                            <SelectTrigger
                              id="verify-level"
                              className="w-full bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] hover:border-[hsl(235,13%,40%)] focus:ring-2 focus:ring-[#cba6f7] transition-colors"
                            >
                              <SelectValue placeholder="Select a level" />
                            </SelectTrigger>
                            <SelectContent className="bg-[hsl(240,21%,16%)] border-[hsl(235,13%,30%)]">
                              {availableLevels.map((level) => (
                                <SelectItem
                                  key={level.id}
                                  value={level.id}
                                  className="focus:bg-[hsl(240,21%,20%)] cursor-pointer"
                                >
                                  {level.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {!verifyingRunLevel && (
                            <p className="text-xs text-red-400 mt-1">
                              Level is required
                            </p>
                          )}
                          {verifyingRun.srcLevelName && (
                            <p className="text-xs text-[hsl(222,15%,60%)] mt-1">
                              SRC: {verifyingRun.srcLevelName}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="bg-[hsl(240,21%,15%)] rounded-none p-3 border border-[hsl(235,13%,30%)]">
                      <div className="text-sm space-y-1">
                        <div>
                          <strong>Player:</strong> {verifyingRun.playerName}
                        </div>
                        {verifyingRun.player2Name && (
                          <div>
                            <strong>Player 2:</strong>{" "}
                            {verifyingRun.player2Name}
                          </div>
                        )}
                        <div>
                          <strong>Time:</strong>{" "}
                          {formatTime(verifyingRun.time || "00:00:00")}
                        </div>
                        <div>
                          <strong>Date:</strong> {verifyingRun.date}
                        </div>
                        {verifyingRun.srcCategoryName && (
                          <div className="text-xs text-[hsl(222,15%,60%)]">
                            SRC Category: {verifyingRun.srcCategoryName}
                          </div>
                        )}
                        {verifyingRun.srcPlatformName && (
                          <div className="text-xs text-[hsl(222,15%,60%)]">
                            SRC Platform: {verifyingRun.srcPlatformName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setVerifyingRun(null);
                      setVerifyingRunCategory("");
                      setVerifyingRunPlatform("");
                      setVerifyingRunLevel("");
                    }}
                    className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (!verifyingRunCategory || !verifyingRunPlatform) {
                        toast({
                          title: "Missing Information",
                          description: "Please select a category and platform.",
                          variant: "destructive",
                        });
                        return;
                      }
                      if (
                        (verifyingRun?.leaderboardType === "individual-level" ||
                          verifyingRun?.leaderboardType ===
                            "community-golds") &&
                        !verifyingRunLevel
                      ) {
                        toast({
                          title: "Missing Information",
                          description: "Please select a level.",
                          variant: "destructive",
                        });
                        return;
                      }
                      if (verifyingRun) {
                        verifyRunDirectly(verifyingRun.id, verifyingRun);
                      }
                    }}
                    className="bg-gradient-to-r from-[#cba6f7] to-[#b4a0e2] hover:from-[#b4a0e2] hover:to-[#cba6f7] text-[hsl(240,21%,15%)] font-bold"
                  >
                    Verify Run
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Category Management Section */}
            <AnimatedTabsContent
              value="categories"
              className="space-y-4 animate-fade-in"
            >
              <CategoriesTab
                selectedTranslationLanguage={selectedTranslationLanguage}
                onTranslationLanguageChange={setSelectedTranslationLanguage}
                onStartEditTranslation={handleStartEditTranslation}
              />
            </AnimatedTabsContent>

            {/* Level Management Section */}
            <AnimatedTabsContent
              value="levels"
              className="space-y-4 animate-fade-in"
            >
              <LevelManagementTab
                selectedTranslationLanguage={selectedTranslationLanguage}
                onTranslationLanguageChange={setSelectedTranslationLanguage}
                onStartEditTranslation={handleStartEditTranslation}
              />
            </AnimatedTabsContent>

            {/* Platform Management Section */}
            <AnimatedTabsContent
              value="platforms"
              className="space-y-4 animate-fade-in"
            >
              <PlatformManagementTab
                selectedTranslationLanguage={selectedTranslationLanguage}
                onTranslationLanguageChange={setSelectedTranslationLanguage}
                onStartEditTranslation={handleStartEditTranslation}
              />
            </AnimatedTabsContent>

            {/* Users Section */}
            <AnimatedTabsContent
              value="users"
              className="space-y-4 animate-fade-in"
            >
              <UsersTab />
            </AnimatedTabsContent>

            {/* Points Configuration Section */}
            <AnimatedTabsContent
              value="points"
              className="space-y-4 animate-fade-in"
            >
              <PointsConfigTab />
            </AnimatedTabsContent>

            {/* Manage Downloads Section */}
            <AnimatedTabsContent
              value="downloads"
              className="space-y-4 animate-fade-in"
            >
              <DownloadsTab
                selectedTranslationLanguage={selectedTranslationLanguage}
                onTranslationLanguageChange={setSelectedTranslationLanguage}
                adminTranslations={adminTranslations}
                onStartEditTranslation={(
                  type,
                  id,
                  originalName,
                  language,
                  value,
                ) => {
                  setEditingEntityTranslation({
                    type,
                    id,
                    originalName,
                    language,
                  });
                  setEditingTranslationValue(value);
                }}
              />
            </AnimatedTabsContent>
          </Tabs>

          {/* Edit Imported Run Dialog */}
          <Dialog
            open={!!editingImportedRun}
            onOpenChange={(open) => {
              if (!open) {
                // Only close if not currently saving
                if (!savingImportedRun) {
                  setEditingImportedRun(null);
                  setEditingImportedRunForm({});
                }
              }
            }}
          >
            <DialogContent className="bg-[hsl(240,21%,16%)] border-[hsl(235,13%,30%)] max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-[#f2cdcd]">
                  {editingImportedRun?.importedFromSRC
                    ? "Edit Imported Run"
                    : "Edit Run"}
                </DialogTitle>
              </DialogHeader>
              {editingImportedRun && (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-playerName">
                        Player Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-playerName"
                        value={
                          editingImportedRunForm.playerName ??
                          editingImportedRun.playerName ??
                          ""
                        }
                        onChange={(e) =>
                          setEditingImportedRunForm({
                            ...editingImportedRunForm,
                            playerName: e.target.value,
                          })
                        }
                        className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                        placeholder="Enter player name"
                      />
                      {!editingImportedRunForm.playerName &&
                        !editingImportedRun.playerName && (
                          <p className="text-xs text-red-400 mt-1">
                            Player name is required
                          </p>
                        )}
                    </div>
                    <div>
                      <Label htmlFor="edit-player2Name">
                        Player 2 Name (Co-op)
                        {(editingImportedRunForm.runType ??
                          editingImportedRun.runType) === "co-op" && (
                          <span className="text-red-500"> *</span>
                        )}
                      </Label>
                      <Input
                        id="edit-player2Name"
                        value={
                          editingImportedRunForm.player2Name ??
                          editingImportedRun.player2Name ??
                          ""
                        }
                        onChange={(e) =>
                          setEditingImportedRunForm({
                            ...editingImportedRunForm,
                            player2Name: e.target.value || undefined,
                          })
                        }
                        className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                        placeholder="Enter second player name"
                        disabled={
                          (editingImportedRunForm.runType ??
                            editingImportedRun.runType) !== "co-op"
                        }
                      />
                      {(editingImportedRunForm.runType ??
                        editingImportedRun.runType) === "co-op" &&
                        !editingImportedRunForm.player2Name &&
                        !editingImportedRun.player2Name && (
                          <p className="text-xs text-red-400 mt-1">
                            Player 2 name is required for co-op runs
                          </p>
                        )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="edit-category"
                          className="text-sm font-medium"
                        >
                          Category <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={
                            editingImportedRunForm.category ??
                            editingImportedRun.category ??
                            ""
                          }
                          onValueChange={(value) => {
                            // Clear subcategory when category changes - it will be autofilled if srcSubcategory exists
                            setEditingImportedRunForm({
                              ...editingImportedRunForm,
                              category: value,
                              subcategory: "",
                            });
                          }}
                        >
                          <SelectTrigger
                            id="edit-category"
                            className="w-full bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] hover:border-[hsl(235,13%,40%)] focus:ring-2 focus:ring-[#cba6f7] transition-colors"
                          >
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent className="bg-[hsl(240,21%,16%)] border-[hsl(235,13%,30%)]">
                            {firestoreCategories
                              .filter((cat) => {
                                // Filter categories by leaderboard type
                                const runLeaderboardType =
                                  editingImportedRunForm.leaderboardType ??
                                  editingImportedRun.leaderboardType ??
                                  "regular";
                                const catType =
                                  (cat as Category).leaderboardType ||
                                  "regular";
                                return catType === runLeaderboardType;
                              })
                              .map((cat) => (
                                <SelectItem
                                  key={cat.id}
                                  value={cat.id}
                                  className="focus:bg-[hsl(240,21%,20%)] cursor-pointer"
                                >
                                  {cat.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {!editingImportedRunForm.category &&
                          !editingImportedRun.category && (
                            <p className="text-xs text-red-400 mt-1">
                              Category is required
                            </p>
                          )}
                        {editingImportedRun.srcCategoryName && (
                          <p className="text-xs text-[hsl(222,15%,60%)] mt-1">
                            SRC: {editingImportedRun.srcCategoryName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="edit-platform"
                          className="text-sm font-medium"
                        >
                          Platform <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={
                            editingImportedRunForm.platform ??
                            editingImportedRun.platform ??
                            ""
                          }
                          onValueChange={(value) =>
                            setEditingImportedRunForm({
                              ...editingImportedRunForm,
                              platform: value,
                            })
                          }
                        >
                          <SelectTrigger
                            id="edit-platform"
                            className="w-full bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] hover:border-[hsl(235,13%,40%)] focus:ring-2 focus:ring-[#cba6f7] transition-colors"
                          >
                            <SelectValue placeholder="Select a platform" />
                          </SelectTrigger>
                          <SelectContent className="bg-[hsl(240,21%,16%)] border-[hsl(235,13%,30%)]">
                            {firestorePlatforms.map((platform) => (
                              <SelectItem
                                key={platform.id}
                                value={platform.id}
                                className="focus:bg-[hsl(240,21%,20%)] cursor-pointer"
                              >
                                {platform.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!editingImportedRunForm.platform &&
                          !editingImportedRun.platform && (
                            <p className="text-xs text-red-400 mt-1">
                              Platform is required
                            </p>
                          )}
                        {editingImportedRun.srcPlatformName && (
                          <p className="text-xs text-[hsl(222,15%,60%)] mt-1">
                            SRC: {editingImportedRun.srcPlatformName}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Subcategory selector (only for regular leaderboard type) */}
                    {editingImportedRun.leaderboardType === "regular" &&
                      editingSubcategories.length > 0 && (
                        <div>
                          <Label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                            <Trophy className="h-3.5 w-3.5 text-[#cba6f7]" />
                            Subcategory <span className="text-red-500">*</span>
                          </Label>
                          <Tabs
                            value={
                              editingImportedRunForm.subcategory ||
                              editingSubcategories[0]?.id ||
                              ""
                            }
                            onValueChange={(value) =>
                              setEditingImportedRunForm({
                                ...editingImportedRunForm,
                                subcategory: value,
                              })
                            }
                          >
                            <AnimatedTabsList
                              className="flex w-full p-0.5 gap-1 overflow-x-auto overflow-y-hidden scrollbar-hide rounded-none"
                              style={{ minWidth: "max-content" }}
                              indicatorClassName="h-0.5 bg-[#cba6f7]"
                            >
                              {editingSubcategories.map(
                                (subcategory, index) => (
                                  <AnimatedTabsTrigger
                                    key={subcategory.id}
                                    value={subcategory.id}
                                    className="transition-all duration-300 font-medium py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap data-[state=active]:text-[#cba6f7]"
                                    style={{
                                      animationDelay: `${index * 50}ms`,
                                    }}
                                  >
                                    {subcategory.name}
                                  </AnimatedTabsTrigger>
                                ),
                              )}
                            </AnimatedTabsList>
                          </Tabs>
                          {editingImportedRun.srcSubcategory && (
                            <p className="text-xs text-[hsl(222,15%,60%)] mt-1">
                              SRC: {editingImportedRun.srcSubcategory}
                            </p>
                          )}
                        </div>
                      )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-runType">
                          Run Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={
                            editingImportedRunForm.runType ??
                            editingImportedRun.runType ??
                            ""
                          }
                          onValueChange={(value) => {
                            const newRunType = value as "solo" | "co-op";
                            setEditingImportedRunForm({
                              ...editingImportedRunForm,
                              runType: newRunType,
                              // Clear player2Name if switching to solo
                              player2Name:
                                newRunType === "solo"
                                  ? undefined
                                  : editingImportedRunForm.player2Name,
                            });
                          }}
                        >
                          <SelectTrigger className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
                            <SelectValue placeholder="Select run type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solo">Solo</SelectItem>
                            <SelectItem value="co-op">Co-op</SelectItem>
                          </SelectContent>
                        </Select>
                        {!editingImportedRunForm.runType &&
                          !editingImportedRun.runType && (
                            <p className="text-xs text-red-400 mt-1">
                              Run type is required
                            </p>
                          )}
                      </div>
                      <div>
                        <Label htmlFor="edit-time">
                          Time (HH:MM:SS){" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="edit-time"
                          value={
                            editingImportedRunForm.time ??
                            editingImportedRun.time ??
                            ""
                          }
                          onChange={(e) =>
                            setEditingImportedRunForm({
                              ...editingImportedRunForm,
                              time: e.target.value,
                            })
                          }
                          className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                          placeholder="00:00:00"
                        />
                        {!editingImportedRunForm.time &&
                          !editingImportedRun.time && (
                            <p className="text-xs text-red-400 mt-1">
                              Time is required
                            </p>
                          )}
                      </div>
                    </div>
                    {(editingImportedRun.leaderboardType ===
                      "individual-level" ||
                      editingImportedRun.leaderboardType ===
                        "community-golds") && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="edit-level"
                          className="text-sm font-medium"
                        >
                          Level <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={
                            editingImportedRunForm.level ??
                            editingImportedRun.level ??
                            ""
                          }
                          onValueChange={(value) =>
                            setEditingImportedRunForm({
                              ...editingImportedRunForm,
                              level: value,
                            })
                          }
                        >
                          <SelectTrigger
                            id="edit-level"
                            className="w-full bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] hover:border-[hsl(235,13%,40%)] focus:ring-2 focus:ring-[#cba6f7] transition-colors"
                          >
                            <SelectValue placeholder="Select a level" />
                          </SelectTrigger>
                          <SelectContent className="bg-[hsl(240,21%,16%)] border-[hsl(235,13%,30%)]">
                            {availableLevels.map((level) => (
                              <SelectItem
                                key={level.id}
                                value={level.id}
                                className="focus:bg-[hsl(240,21%,20%)] cursor-pointer"
                              >
                                {level.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!editingImportedRunForm.level &&
                          !editingImportedRun.level && (
                            <p className="text-xs text-red-400 mt-1">
                              Level is required for{" "}
                              {editingImportedRun.leaderboardType ===
                              "individual-level"
                                ? "Individual Level"
                                : "Community Gold"}{" "}
                              runs
                            </p>
                          )}
                        {editingImportedRun.srcLevelName && (
                          <p className="text-xs text-[hsl(222,15%,60%)] mt-1">
                            SRC: {editingImportedRun.srcLevelName}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="edit-date">
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={
                        editingImportedRunForm.date ??
                        editingImportedRun.date ??
                        ""
                      }
                      onChange={(e) =>
                        setEditingImportedRunForm({
                          ...editingImportedRunForm,
                          date: e.target.value,
                        })
                      }
                      className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                    />
                    {!editingImportedRunForm.date &&
                      !editingImportedRun.date && (
                        <p className="text-xs text-red-400 mt-1">
                          Date is required
                        </p>
                      )}
                  </div>
                  <div>
                    <Label htmlFor="edit-videoUrl">Video URL</Label>
                    <Input
                      id="edit-videoUrl"
                      value={
                        editingImportedRunForm.videoUrl ??
                        editingImportedRun.videoUrl ??
                        ""
                      }
                      onChange={(e) =>
                        setEditingImportedRunForm({
                          ...editingImportedRunForm,
                          videoUrl: e.target.value || undefined,
                        })
                      }
                      className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-comment">Comment</Label>
                    <Textarea
                      id="edit-comment"
                      value={
                        editingImportedRunForm.comment ??
                        editingImportedRun.comment ??
                        ""
                      }
                      onChange={(e) =>
                        setEditingImportedRunForm({
                          ...editingImportedRunForm,
                          comment: e.target.value || undefined,
                        })
                      }
                      className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                      placeholder="Optional comment..."
                    />
                  </div>
                </div>
              )}
              <DialogFooter className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingImportedRun(null);
                    setEditingImportedRunForm({});
                  }}
                  className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveImportedRun}
                  disabled={savingImportedRun}
                  className="bg-gradient-to-r from-[#cba6f7] to-[#b4a0e2] hover:from-[#b4a0e2] hover:to-[#cba6f7] text-[hsl(240,21%,15%)] font-bold"
                >
                  {savingImportedRun ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={async () => {
                    // Verify the run immediately after saving
                    if (!editingImportedRun) return;

                    // Validate required fields first
                    const finalForm = {
                      playerName:
                        editingImportedRunForm.playerName ??
                        editingImportedRun.playerName,
                      player2Name:
                        editingImportedRunForm.player2Name ??
                        editingImportedRun.player2Name,
                      category:
                        editingImportedRunForm.category ??
                        editingImportedRun.category,
                      subcategory:
                        editingImportedRunForm.subcategory ??
                        editingImportedRun.subcategory,
                      platform:
                        editingImportedRunForm.platform ??
                        editingImportedRun.platform,
                      runType:
                        editingImportedRunForm.runType ??
                        editingImportedRun.runType,
                      leaderboardType:
                        editingImportedRunForm.leaderboardType ??
                        editingImportedRun.leaderboardType,
                      level:
                        editingImportedRunForm.level ??
                        editingImportedRun.level,
                      time:
                        editingImportedRunForm.time ?? editingImportedRun.time,
                      date:
                        editingImportedRunForm.date ?? editingImportedRun.date,
                      videoUrl:
                        editingImportedRunForm.videoUrl ??
                        editingImportedRun.videoUrl,
                      comment:
                        editingImportedRunForm.comment ??
                        editingImportedRun.comment,
                    };

                    // Quick validation
                    if (
                      !finalForm.playerName?.trim() ||
                      !finalForm.category?.trim() ||
                      !finalForm.platform?.trim() ||
                      !finalForm.time?.trim() ||
                      !finalForm.date?.trim()
                    ) {
                      toast({
                        title: "Missing Information",
                        description:
                          "Please fill in all required fields before verifying.",
                        variant: "destructive",
                      });
                      return;
                    }

                    setSavingImportedRun(true);
                    try {
                      const updateData: Partial<LeaderboardEntry> = {
                        playerName: finalForm.playerName.trim(),
                        category: finalForm.category.trim(),
                        platform: finalForm.platform.trim(),
                        runType: finalForm.runType,
                        leaderboardType: finalForm.leaderboardType,
                        time: finalForm.time.trim(),
                        date: finalForm.date.trim(),
                        verified: true, // Verify immediately
                        verifiedBy:
                          currentUser?.uid ||
                          currentUser?.displayName ||
                          "Admin",
                      };

                      // Add optional fields
                      if (
                        finalForm.player2Name &&
                        finalForm.player2Name.trim()
                      ) {
                        updateData.player2Name = finalForm.player2Name.trim();
                      } else if (finalForm.runType === "co-op") {
                        updateData.player2Name =
                          finalForm.player2Name?.trim() || "";
                      }

                      if (finalForm.level && finalForm.level.trim()) {
                        updateData.level = finalForm.level.trim();
                      }

                      if (finalForm.videoUrl && finalForm.videoUrl.trim()) {
                        updateData.videoUrl = finalForm.videoUrl.trim();
                      }

                      if (finalForm.comment && finalForm.comment.trim()) {
                        updateData.comment = finalForm.comment.trim();
                      }

                      // Add subcategory for regular runs
                      if (finalForm.leaderboardType === "regular") {
                        if (
                          finalForm.subcategory &&
                          finalForm.subcategory.trim()
                        ) {
                          updateData.subcategory = finalForm.subcategory.trim();
                        } else {
                          // Clear subcategory if none selected
                          updateData.subcategory = undefined;
                        }
                      }

                      // Dynamic import at call site

                      const { updateLeaderboardEntryFirestore } =
                        await import("@/lib/data/firestore/runs");
                      const success = await updateLeaderboardEntry(
                        editingImportedRun.id,
                        updateData,
                      );
                      if (success) {
                        toast({
                          title: "Run Verified",
                          description:
                            "The run has been saved and verified successfully.",
                        });
                        // Update local state - remove from imported runs since it's now verified
                        setImportedSRCRuns((prev) =>
                          prev.filter(
                            (run) => run.id !== editingImportedRun.id,
                          ),
                        );
                        setUnverifiedRuns((prev) =>
                          prev.filter(
                            (run) => run.id !== editingImportedRun.id,
                          ),
                        );
                        // Close dialog and reset form
                        setEditingImportedRun(null);
                        setEditingImportedRunForm({});
                      } else {
                        throw new Error("Failed to verify run");
                      }
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description:
                          error.message || "Failed to verify imported run.",
                        variant: "destructive",
                      });
                    } finally {
                      setSavingImportedRun(false);
                    }
                  }}
                  disabled={savingImportedRun}
                  className="bg-gradient-to-r from-[#a6e3a1] to-[#94e2d5] hover:from-[#94e2d5] hover:to-[#a6e3a1] text-[hsl(240,21%,15%)] font-bold"
                >
                  {savingImportedRun ? "Verifying..." : "Save & Verify"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes gradient {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          .animate-fade-in {
            animation: fadeIn 0.6s ease-out forwards;
          }

          .animate-fade-in-delay {
            animation: fadeIn 0.8s ease-out 0.2s forwards;
            opacity: 0;
          }

          .animate-gradient {
            background-size: 200% auto;
            animation: gradient 3s linear infinite;
          }
        `}</style>
        </FadeIn>
      </div>
    </div>
  );
};

export default Admin;
