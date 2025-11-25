/**
 * Hook for GameDetails business logic (sorting, filtering, active tab calculation)
 */

import { useMemo } from "react";
import { GameDetailsConfig, GameDetailsHeaderLink } from "@/types/database";
import { useTranslation } from "react-i18next";
import type { User as FirebaseUser } from "firebase/auth";

interface UseGameDetailsLogicProps {
  config: GameDetailsConfig | null;
  currentUser: (FirebaseUser & { isAdmin: boolean }) | null;
  currentPath: string;
}

export function useGameDetailsLogic({
  config,
  currentUser,
  currentPath,
}: UseGameDetailsLogicProps) {
  const { t } = useTranslation();

  // Compute sorted header links
  const sortedHeaderLinks = useMemo(() => {
    if (!config) return [];
    let headerLinks = [...(config.headerLinks || [])];
    if (currentUser?.isAdmin) {
      const hasAdminLink = headerLinks.some(link => link.route === "/admin");
      if (!hasAdminLink) {
        headerLinks.push({
          id: "admin",
          label: t("components.admin"),
          route: "/admin",
          icon: "ShieldAlert",
          color: "#f2cdcd",
          order: 999,
          adminOnly: true,
        });
      }
    }
    return headerLinks
      .filter(link => !link.adminOnly || currentUser?.isAdmin)
      .sort((a, b) => {
        const orderA = a.order ?? Infinity;
        const orderB = b.order ?? Infinity;
        return orderA - orderB;
      });
  }, [config, currentUser, t]);

  // Sort platforms by order
  const sortedPlatforms = useMemo(() => {
    if (!config) return [];
    return [...config.platforms].sort((a, b) => {
      const orderA = a.order ?? Infinity;
      const orderB = b.order ?? Infinity;
      return orderA - orderB;
    });
  }, [config]);

  // Determine active tab
  const activeTab = useMemo(() => {
    const activeLink = sortedHeaderLinks.find(
      (link) =>
        currentPath === link.route ||
        (link.route !== "/" && currentPath.startsWith(link.route))
    );
    return activeLink?.id || sortedHeaderLinks[0]?.id || "";
  }, [sortedHeaderLinks, currentPath]);

  // Get active link color
  const activeLinkColor = useMemo(() => {
    const activeLink = sortedHeaderLinks.find(
      (link) =>
        currentPath === link.route ||
        (link.route !== "/" && currentPath.startsWith(link.route))
    );
    return activeLink?.color || "#89b4fa"; // Default to ctp-blue
  }, [sortedHeaderLinks, currentPath]);

  // Check if component should be visible on current page
  const isVisible = useMemo(() => {
    if (!config) return false;
    return config.visibleOnPages.some(page => {
      if (page === "/") {
        return currentPath === "/";
      }
      return currentPath.startsWith(page);
    });
  }, [config, currentPath]);

  return {
    sortedHeaderLinks,
    sortedPlatforms,
    activeTab,
    activeLinkColor,
    isVisible,
  };
}

