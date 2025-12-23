/**
 * DesktopNavigation Component
 * Desktop social links and authentication buttons
 */

import { Button } from "@/components/ui/button";
import { PrefetchLink } from "@/components/PrefetchLink";
import { Trophy, User, Settings, Github, Activity } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Notifications } from "@/components/Notifications";
import { GameDetailsConfig } from "@/types/database";
import { useTranslation } from "react-i18next";
import { toggleFpsMonitor } from "@/components/dev/FpsMonitor";
import type { User as FirebaseUser } from "firebase/auth";

interface DesktopNavigationProps {
  config: GameDetailsConfig | null;
  currentUser: (FirebaseUser & { isAdmin: boolean }) | null;
  authLoading: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
}

export function DesktopNavigation({
  config,
  currentUser,
  authLoading,
  onLoginClick,
  onLogout,
}: DesktopNavigationProps) {
  const { t } = useTranslation();

  return (
    <div className="hidden xl:flex items-center gap-3 flex-shrink-0">
      <a
        href="https://discord.gg/6A5MNqaK49"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#5865F2] hover:text-[#5865F2] transition-all duration-300 hover:scale-110"
        aria-label="Discord Server"
      >
        <svg
          className="h-5 w-5 transition-transform duration-300 hover:rotate-12"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      </a>
      {config?.speedrunComUrl && (
        <a
          href={config.speedrunComUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#F59E0B] hover:text-[#F59E0B] transition-all duration-300 hover:scale-110"
          aria-label="Speedrun.com"
        >
          <Trophy className="h-5 w-5 transition-transform duration-300 hover:rotate-12" />
        </a>
      )}
      <a
        href="https://github.com/elle-trees/lsw1.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="text-ctp-text hover:text-ctp-text transition-all duration-300 hover:scale-110"
        aria-label="GitHub Repository"
      >
        <Github className="h-5 w-5 transition-transform duration-300 hover:rotate-12" />
      </a>
      <button
        onClick={toggleFpsMonitor}
        className="text-ctp-text hover:text-ctp-text transition-all duration-300 hover:scale-110"
        aria-label="Toggle FPS Monitor"
        title="Toggle FPS Monitor"
      >
        <Activity className="h-5 w-5 transition-transform duration-300 hover:rotate-12" />
      </button>
      <LanguageSwitcher />
      {authLoading ? (
        <Button variant="outline" className="text-ctp-text border-ctp-surface1">
          {t("components.loading")}
        </Button>
      ) : currentUser ? (
        <div className="flex items-center gap-2">
          <PrefetchLink
            to="/player/$playerId"
            params={{ playerId: currentUser.uid }}
            className="text-ctp-text hover:text-ctp-text mr-2 transition-all duration-300 hover:scale-105 cursor-pointer font-medium"
          >
            {t("components.hi", {
              name: currentUser.displayName || currentUser.email?.split("@")[0],
            })}
          </PrefetchLink>
          <Notifications />
          <Button
            variant="outline"
            asChild
            className="text-ctp-text hover:text-ctp-text border-ctp-surface1 hover:bg-ctp-blue hover:border-ctp-blue transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <PrefetchLink to="/settings">
              <Settings className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-90" />
              {t("components.settings")}
            </PrefetchLink>
          </Button>
          <Button
            variant="outline"
            onClick={onLogout}
            className="text-ctp-text hover:text-ctp-text border-ctp-surface1 hover:bg-ctp-blue hover:border-ctp-blue transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            {t("components.logout")}
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={onLoginClick}
          className="text-ctp-text hover:text-ctp-text border-ctp-surface1 hover:bg-ctp-blue hover:border-ctp-blue flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <User className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          {t("components.signIn")}
        </Button>
      )}
    </div>
  );
}
