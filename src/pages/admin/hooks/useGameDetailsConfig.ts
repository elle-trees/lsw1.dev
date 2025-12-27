import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { GameDetailsConfig, GameDetailsHeaderLink } from "@/types/database";
import { useGame } from "@/contexts/GameContext";

export function useGameDetailsConfig(activeTab: string) {
  const { toast } = useToast();
  const { currentGame } = useGame();

  const [gameDetailsConfig, setGameDetailsConfig] =
    useState<GameDetailsConfig | null>(null);
  const [loadingGameDetailsConfig, setLoadingGameDetailsConfig] =
    useState(false);
  const [savingGameDetailsConfig, setSavingGameDetailsConfig] = useState(false);
  const [gameDetailsConfigForm, setGameDetailsConfigForm] = useState<
    Partial<GameDetailsConfig>
  >({});

  // Header links management state
  const [newHeaderLink, setNewHeaderLink] = useState({
    label: "",
    route: "",
    icon: "",
    color: "#cdd6f4",
    adminOnly: false,
  });
  const [editingHeaderLink, setEditingHeaderLink] =
    useState<GameDetailsHeaderLink | null>(null);
  const [editingHeaderLinkForm, setEditingHeaderLinkForm] = useState({
    label: "",
    route: "",
    icon: "",
    color: "#cdd6f4",
    adminOnly: false,
  });
  const [addingHeaderLink, setAddingHeaderLink] = useState(false);
  const [updatingHeaderLink, setUpdatingHeaderLink] = useState(false);
  const [reorderingHeaderLink, setReorderingHeaderLink] = useState<
    string | null
  >(null);

  // Load game details config when switching to game-details tab
  useEffect(() => {
    if (activeTab === "game-details") {
      const loadGameDetailsConfig = async () => {
        setLoadingGameDetailsConfig(true);
        try {
          const { getGameDetailsConfigFirestore } =
            await import("@/lib/data/firestore/game-details");
          const config = await getGameDetailsConfigFirestore(currentGame.id);
          setGameDetailsConfig(config);
          setGameDetailsConfigForm(
            config || {
              id: "default",
              title: "LEGO Star Wars: The Video Game",
              subtitle: "2005",
              categories: [],
              platforms: [],
              headerLinks: [],
              navItems: [],
              visibleOnPages: [],
              enabled: true,
            },
          );
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load game details configuration.",
            variant: "destructive",
          });
        } finally {
          setLoadingGameDetailsConfig(false);
        }
      };
      loadGameDetailsConfig();
    }
  }, [activeTab, toast, currentGame]);

  const handleSaveGameDetailsConfig = async () => {
    if (!gameDetailsConfig) return;

    setSavingGameDetailsConfig(true);
    try {
      // Merge form data with existing config, ensuring all required fields are present
      // For optional fields, convert empty strings to undefined
      const getOptionalField = (
        formValue: string | undefined,
        configValue: string | undefined,
      ): string | undefined => {
        const value = formValue ?? configValue;
        return value === "" ? undefined : value;
      };

      const configToSave: GameDetailsConfig = {
        id: gameDetailsConfig.id,
        title: gameDetailsConfigForm.title ?? gameDetailsConfig.title ?? "",
        subtitle: getOptionalField(
          gameDetailsConfigForm.subtitle,
          gameDetailsConfig.subtitle,
        ),
        coverImageUrl: getOptionalField(
          gameDetailsConfigForm.coverImageUrl,
          gameDetailsConfig.coverImageUrl,
        ),
        categories:
          gameDetailsConfigForm.categories ??
          gameDetailsConfig.categories ??
          [],
        platforms:
          gameDetailsConfigForm.platforms ?? gameDetailsConfig.platforms ?? [],
        discordUrl: getOptionalField(
          gameDetailsConfigForm.discordUrl,
          gameDetailsConfig.discordUrl,
        ),
        speedrunComUrl: getOptionalField(
          gameDetailsConfigForm.speedrunComUrl,
          gameDetailsConfig.speedrunComUrl,
        ),
        headerLinks:
          gameDetailsConfigForm.headerLinks ??
          gameDetailsConfig.headerLinks ??
          [],
        navItems:
          gameDetailsConfigForm.navItems ?? gameDetailsConfig.navItems ?? [],
        visibleOnPages:
          gameDetailsConfigForm.visibleOnPages ??
          gameDetailsConfig.visibleOnPages ??
          [],
        enabled:
          gameDetailsConfigForm.enabled ?? gameDetailsConfig.enabled ?? true,
      };
      const { updateGameDetailsConfigFirestore } =
        await import("@/lib/data/firestore/game-details");
      const success = await updateGameDetailsConfigFirestore(
        currentGame.id,
        configToSave,
      );
      if (success) {
        // Reload config to get updated values
        const { getGameDetailsConfigFirestore } =
          await import("@/lib/data/firestore/game-details");
        const updatedConfig = await getGameDetailsConfigFirestore(
          currentGame.id,
        );
        setGameDetailsConfig(updatedConfig);
        setGameDetailsConfigForm(updatedConfig || gameDetailsConfigForm);

        toast({
          title: "Success",
          description: "Game details configuration saved successfully.",
        });
      } else {
        throw new Error("Failed to save configuration");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to save game details configuration.",
        variant: "destructive",
      });
    } finally {
      setSavingGameDetailsConfig(false);
    }
  };

  const handleAddHeaderLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeaderLink.label.trim() || !newHeaderLink.route.trim()) {
      toast({
        title: "Error",
        description: "Label and route are required.",
        variant: "destructive",
      });
      return;
    }

    setAddingHeaderLink(true);
    try {
      const currentLinks =
        gameDetailsConfigForm.headerLinks ??
        gameDetailsConfig?.headerLinks ??
        [];
      const newLink: GameDetailsHeaderLink = {
        id: newHeaderLink.label.toLowerCase().replace(/\s+/g, "-"),
        label: newHeaderLink.label.trim(),
        route: newHeaderLink.route.trim(),
        icon: newHeaderLink.icon || undefined,
        color: newHeaderLink.color || undefined,
        adminOnly: newHeaderLink.adminOnly,
        order: currentLinks.length + 1,
      };

      const updatedLinks = [...currentLinks, newLink];
      setGameDetailsConfigForm({
        ...gameDetailsConfigForm,
        headerLinks: updatedLinks,
      });
      setNewHeaderLink({
        label: "",
        route: "",
        icon: "",
        color: "#cdd6f4",
        adminOnly: false,
      });

      toast({
        title: "Header Link Added",
        description:
          "New header link has been added. Don't forget to save the configuration.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add header link.",
        variant: "destructive",
      });
    } finally {
      setAddingHeaderLink(false);
    }
  };

  const handleStartEditHeaderLink = (link: GameDetailsHeaderLink) => {
    setEditingHeaderLink(link);
    setEditingHeaderLinkForm({
      label: link.label,
      route: link.route,
      icon: link.icon || "",
      color: link.color || "#cdd6f4",
      adminOnly: link.adminOnly || false,
    });
  };

  const handleCancelEditHeaderLink = () => {
    setEditingHeaderLink(null);
    setEditingHeaderLinkForm({
      label: "",
      route: "",
      icon: "",
      color: "#cdd6f4",
      adminOnly: false,
    });
  };

  const handleSaveEditHeaderLink = async () => {
    if (
      !editingHeaderLink ||
      !editingHeaderLinkForm.label.trim() ||
      !editingHeaderLinkForm.route.trim()
    ) {
      toast({
        title: "Error",
        description: "Label and route are required.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingHeaderLink(true);
    try {
      const currentLinks =
        gameDetailsConfigForm.headerLinks ??
        gameDetailsConfig?.headerLinks ??
        [];
      const updatedLinks = currentLinks.map((link) =>
        link.id === editingHeaderLink.id
          ? {
              ...link,
              label: editingHeaderLinkForm.label.trim(),
              route: editingHeaderLinkForm.route.trim(),
              icon: editingHeaderLinkForm.icon || undefined,
              color: editingHeaderLinkForm.color || undefined,
              adminOnly: editingHeaderLinkForm.adminOnly,
            }
          : link,
      );

      setGameDetailsConfigForm({
        ...gameDetailsConfigForm,
        headerLinks: updatedLinks,
      });
      handleCancelEditHeaderLink();

      toast({
        title: "Header Link Updated",
        description:
          "Header link has been updated. Don't forget to save the configuration.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update header link.",
        variant: "destructive",
      });
    } finally {
      setUpdatingHeaderLink(false);
    }
  };

  const handleDeleteHeaderLink = (linkId: string) => {
    if (!window.confirm("Are you sure you want to delete this header link?")) {
      return;
    }

    try {
      const currentLinks =
        gameDetailsConfigForm.headerLinks ??
        gameDetailsConfig?.headerLinks ??
        [];
      const updatedLinks = currentLinks.filter((link) => link.id !== linkId);
      // Reorder remaining links
      const reorderedLinks = updatedLinks.map((link, index) => ({
        ...link,
        order: index + 1,
      }));

      setGameDetailsConfigForm({
        ...gameDetailsConfigForm,
        headerLinks: reorderedLinks,
      });

      toast({
        title: "Header Link Deleted",
        description:
          "Header link has been removed. Don't forget to save the configuration.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete header link.",
        variant: "destructive",
      });
    }
  };

  const handleMoveHeaderLinkUp = (linkId: string) => {
    setReorderingHeaderLink(linkId);
    try {
      const currentLinks = [
        ...(gameDetailsConfigForm.headerLinks ??
          gameDetailsConfig?.headerLinks ??
          []),
      ];
      const index = currentLinks.findIndex((link) => link.id === linkId);

      if (index <= 0) {
        setReorderingHeaderLink(null);
        return;
      }

      // Swap with previous
      [currentLinks[index - 1], currentLinks[index]] = [
        currentLinks[index],
        currentLinks[index - 1],
      ];

      // Update orders
      const reorderedLinks = currentLinks.map((link, idx) => ({
        ...link,
        order: idx + 1,
      }));

      setGameDetailsConfigForm({
        ...gameDetailsConfigForm,
        headerLinks: reorderedLinks,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move header link.",
        variant: "destructive",
      });
    } finally {
      setReorderingHeaderLink(null);
    }
  };

  const handleMoveHeaderLinkDown = (linkId: string) => {
    setReorderingHeaderLink(linkId);
    try {
      const currentLinks = [
        ...(gameDetailsConfigForm.headerLinks ??
          gameDetailsConfig?.headerLinks ??
          []),
      ];
      const index = currentLinks.findIndex((link) => link.id === linkId);

      if (index < 0 || index >= currentLinks.length - 1) {
        setReorderingHeaderLink(null);
        return;
      }

      // Swap with next
      [currentLinks[index], currentLinks[index + 1]] = [
        currentLinks[index + 1],
        currentLinks[index],
      ];

      // Update orders
      const reorderedLinks = currentLinks.map((link, idx) => ({
        ...link,
        order: idx + 1,
      }));

      setGameDetailsConfigForm({
        ...gameDetailsConfigForm,
        headerLinks: reorderedLinks,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move header link.",
        variant: "destructive",
      });
    } finally {
      setReorderingHeaderLink(null);
    }
  };

  return {
    gameDetailsConfig,
    loadingGameDetailsConfig,
    savingGameDetailsConfig,
    gameDetailsConfigForm,
    setGameDetailsConfigForm,
    newHeaderLink,
    setNewHeaderLink,
    editingHeaderLink,
    editingHeaderLinkForm,
    setEditingHeaderLinkForm,
    addingHeaderLink,
    updatingHeaderLink,
    reorderingHeaderLink,
    handleSaveGameDetailsConfig,
    handleAddHeaderLink,
    handleStartEditHeaderLink,
    handleCancelEditHeaderLink,
    handleSaveEditHeaderLink,
    handleDeleteHeaderLink,
    handleMoveHeaderLinkUp,
    handleMoveHeaderLinkDown,
  };
}
