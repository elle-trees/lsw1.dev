/**
 * Hook for GameDetails event handlers
 */

import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";
import { useTranslation } from "react-i18next";
import type { User as FirebaseUser } from "firebase/auth";

interface UseGameDetailsHandlersProps {
  currentUser: (FirebaseUser & { isAdmin: boolean }) | null;
  unverifiedRunsCount: number;
  unclaimedRunsCount: number;
  onNotificationCountsReset: () => void;
}

export function useGameDetailsHandlers({
  currentUser,
  unverifiedRunsCount,
  unclaimedRunsCount,
  onNotificationCountsReset,
}: UseGameDetailsHandlersProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      onNotificationCountsReset();
      toast({
        title: t("components.loggedOut"),
        description: t("components.loggedOutSuccess"),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: getErrorMessage(error, t("components.logoutError")),
        variant: "destructive",
      });
    }
  }, [toast, t, onNotificationCountsReset]);

  const handleNotificationClick = useCallback(() => {
    if (currentUser?.isAdmin && unverifiedRunsCount > 0) {
      navigate("/admin");
    } else if (unclaimedRunsCount > 0) {
      navigate("/settings");
    }
  }, [currentUser, unverifiedRunsCount, unclaimedRunsCount, navigate]);

  return {
    handleLogout,
    handleNotificationClick,
  };
}

