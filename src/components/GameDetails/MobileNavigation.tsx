/**
 * MobileNavigation Component
 * Mobile menu sheet with navigation links, account section, and social links
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PrefetchLink } from "@/components/PrefetchLink";
import { Menu, Trophy, Upload, User, Settings, Github, Bell } from "lucide-react";
import LegoStudIcon from "@/components/icons/LegoStudIcon";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GameDetailsConfig, GameDetailsHeaderLink } from "@/types/database";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { getHeaderLinkTranslation } from "@/lib/i18n/entity-translations";
import { iconMap } from "./constants";
import type { User as FirebaseUser } from "firebase/auth";

interface MobileNavigationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  config: GameDetailsConfig | null;
  sortedHeaderLinks: GameDetailsHeaderLink[];
  currentPath: string;
  currentUser: (FirebaseUser & { isAdmin: boolean }) | null;
  authLoading: boolean;
  notificationCount: number;
  hasNotifications: boolean;
  onNotificationClick: () => void;
  onLoginClick: () => void;
  onLogout: () => void;
}

export function MobileNavigation({
  isOpen,
  onOpenChange,
  config,
  sortedHeaderLinks,
  currentPath,
  currentUser,
  authLoading,
  notificationCount,
  hasNotifications,
  onNotificationClick,
  onLoginClick,
  onLogout,
}: MobileNavigationProps) {
  const { t } = useTranslation();

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="xl:hidden text-[hsl(220,17%,92%)] hover:bg-[#89b4fa]/20 hover:text-[#89b4fa] z-[100] flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="sr-only">{t("components.openMenu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] bg-[#1e1e2e] border-ctp-surface1 z-[100] overflow-y-auto">
        <div className="flex flex-col gap-4 sm:gap-6 mt-4 sm:mt-8 pb-4">
          <div className="flex items-center space-x-2 mb-2 sm:mb-4 px-2">
            <LegoStudIcon size={28} color="#60a5fa" />
            <span className="text-lg font-bold text-[#74c7ec]">lsw1.dev</span>
          </div>

          {/* Navigation Links Section */}
          <div className="px-2">
            <div className="text-xs font-semibold text-ctp-subtext1 uppercase tracking-wider mb-2 px-2">
              {t("components.navigation")}
            </div>
            <nav className="flex flex-col gap-1">
              {/* Always show basic routes */}
              <PrefetchLink
                to="/"
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-md transition-all duration-200 text-sm font-medium min-h-[44px] sm:min-h-0",
                  currentPath === "/"
                    ? "bg-ctp-surface1 text-ctp-text"
                    : "text-ctp-subtext1 hover:bg-ctp-surface0 hover:text-ctp-text"
                )}
                style={currentPath === "/" ? { borderLeft: "3px solid #89b4fa" } : {}}
              >
                <span className="flex-1">{t("components.home")}</span>
              </PrefetchLink>
              <PrefetchLink
                to="/leaderboards"
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-md transition-all duration-200 text-sm font-medium min-h-[44px] sm:min-h-0",
                  currentPath.startsWith("/leaderboards")
                    ? "bg-ctp-surface1 text-ctp-text"
                    : "text-ctp-subtext1 hover:bg-ctp-surface0 hover:text-ctp-text"
                )}
                style={currentPath.startsWith("/leaderboards") ? { borderLeft: "3px solid #f9e2af" } : {}}
              >
                <Trophy className="h-4 w-4 flex-shrink-0" style={{ color: currentPath.startsWith("/leaderboards") ? "#f9e2af" : "#cdd6f4" }} />
                <span className="flex-1">{t("components.leaderboards")}</span>
              </PrefetchLink>
              <PrefetchLink
                to="/submit"
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-md transition-all duration-200 text-sm font-medium min-h-[44px] sm:min-h-0",
                  currentPath.startsWith("/submit")
                    ? "bg-ctp-surface1 text-ctp-text"
                    : "text-ctp-subtext1 hover:bg-ctp-surface0 hover:text-ctp-text"
                )}
                style={currentPath.startsWith("/submit") ? { borderLeft: "3px solid #a6e3a1" } : {}}
              >
                <Upload className="h-4 w-4 flex-shrink-0" style={{ color: currentPath.startsWith("/submit") ? "#a6e3a1" : "#cdd6f4" }} />
                <span className="flex-1">{t("components.submitRun")}</span>
              </PrefetchLink>
              {/* Show config links if available (skip duplicates) */}
              {config && sortedHeaderLinks.length > 0 && sortedHeaderLinks.map((link) => {
                  const IconComponent = link.icon === "LegoStud"
                    ? LegoStudIcon
                    : (link.icon ? iconMap[link.icon] : null);
                  const linkColor = link.color || "#cdd6f4";
                  const isActive = currentPath === link.route ||
                    (link.route !== "/" && currentPath.startsWith(link.route));

                  // Skip if already shown above
                  if (link.route === "/" || link.route === "/leaderboards" || link.route === "/submit") {
                    return null;
                  }

                  return (
                    <PrefetchLink
                      key={link.id}
                      to={link.route}
                      onClick={() => onOpenChange(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-md transition-all duration-200 text-sm font-medium min-h-[44px] sm:min-h-0",
                        isActive
                          ? "bg-ctp-surface1 text-ctp-text"
                          : "text-ctp-subtext1 hover:bg-ctp-surface0 hover:text-ctp-text"
                      )}
                      style={isActive ? { borderLeft: `3px solid ${linkColor}` } : {}}
                    >
                      {IconComponent && (
                        link.icon === "LegoStud" ? (
                          <LegoStudIcon
                            size={18}
                            color={isActive ? linkColor : "#cdd6f4"}
                          />
                        ) : (
                          <IconComponent
                            className="h-4 w-4 flex-shrink-0"
                            style={{ color: isActive ? linkColor : "#cdd6f4" }}
                          />
                        )
                      )}
                      <span className="flex-1">{getHeaderLinkTranslation(link.id, link.label)}</span>
                    </PrefetchLink>
                  );
                })}
              </nav>
            </div>

          {/* Account Section */}
          <div className="px-2 pt-2 border-t border-ctp-surface1">
            <div className="text-xs font-semibold text-ctp-subtext1 uppercase tracking-wider mb-2 px-2">
              {t("components.account")}
            </div>
            {authLoading ? (
              <div className="text-sm text-muted-foreground px-2">{t("components.loading")}</div>
            ) : currentUser ? (
              <div className="flex flex-col gap-2">
                <PrefetchLink
                  to="/player/$playerId"
                  params={{ playerId: currentUser.uid }}
                  className="text-sm text-ctp-text transition-colors px-2 py-1.5 rounded-md hover:bg-ctp-surface0"
                  onClick={() => onOpenChange(false)}
                >
                  {t("components.hi", { name: currentUser.displayName || currentUser.email?.split('@')[0] })}
                </PrefetchLink>
                {hasNotifications && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onNotificationClick();
                      onOpenChange(false);
                    }}
                    className="relative w-full text-ctp-text hover:text-ctp-text border-yellow-600/50 hover:bg-yellow-600/20 hover:border-yellow-600 justify-start"
                    title={currentUser.isAdmin ? t("components.runsWaitingForVerification", { count: notificationCount }) : t("components.unclaimedRunsCount", { count: notificationCount })}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    <span className="flex-1 text-left">
                      {currentUser.isAdmin ? t("components.verifyRuns") : t("components.claimRuns")}
                    </span>
                    <Badge
                      variant="destructive"
                      className="h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
                    >
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Badge>
                  </Button>
                )}
                <Button
                  variant="outline"
                  asChild
                  className="w-full text-ctp-text hover:text-ctp-text border-ctp-surface1 hover:bg-ctp-blue hover:border-ctp-blue justify-start"
                  onClick={() => onOpenChange(false)}
                >
                  <PrefetchLink to="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    {t("components.settings")}
                  </PrefetchLink>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onLogout();
                    onOpenChange(false);
                  }}
                  className="w-full text-ctp-text hover:text-ctp-text border-ctp-surface1 hover:bg-ctp-blue hover:border-ctp-blue justify-start"
                >
                  {t("components.logout")}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  onLoginClick();
                  onOpenChange(false);
                }}
                className="w-full text-ctp-text hover:text-ctp-text border-ctp-surface1 hover:bg-ctp-blue hover:border-ctp-blue flex items-center gap-2 justify-start"
              >
                <User className="h-4 w-4" />
                {t("components.signIn")}
              </Button>
            )}
          </div>

          {/* Social Links */}
          <div className="flex gap-4 pt-2 border-t border-ctp-surface1 px-2">
            <a
              href="https://discord.gg/6A5MNqaK49"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5865F2] hover:text-[#5865F2] transition-all duration-300 hover:scale-110 p-2 -m-2"
              aria-label={t("components.discordServer")}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
            {config?.speedrunComUrl && (
              <a
                href={config.speedrunComUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F59E0B] hover:text-[#F59E0B] transition-all duration-300 hover:scale-110 p-2 -m-2"
                aria-label={t("components.speedrunCom")}
              >
                <Trophy className="h-5 w-5" />
              </a>
            )}
            <a
              href="https://github.com/elle-trees/lsw1.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ctp-text hover:text-ctp-text transition-colors p-2 -m-2"
              aria-label={t("components.githubRepository")}
            >
              <Github className="h-5 w-5" />
            </a>
            <div className="px-2">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

