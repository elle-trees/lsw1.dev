/**
 * GameDetails Component (Refactored)
 * Main header component with game details, navigation, and authentication
 */

import { useState, useRef } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useScroll as useScrollHook } from "@/hooks/useScroll";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { LoginModal } from "@/components/LoginModal";
import { useGameDetails } from "./GameDetails/useGameDetails";
import { useGameDetailsHandlers } from "./GameDetails/useGameDetailsHandlers";
import { useGameDetailsLogic } from "./GameDetails/useGameDetailsLogic";
import { GameHeader } from "./GameDetails/GameHeader";
import { MobileNavigation } from "./GameDetails/MobileNavigation";
import { DesktopNavigation } from "./GameDetails/DesktopNavigation";
import { GameSearch } from "./GameSearch";
import { useGame } from "@/contexts/GameContext";

interface GameDetailsProps {
  className?: string;
}

export function GameDetails({ className }: GameDetailsProps) {
  const routerState = useRouterState();
  const location = {
    pathname: routerState.location.pathname,
    search: routerState.location.search,
  };
  const { currentUser, loading: authLoading } = useAuth();
  const { currentGame, switchGame, availableGames } = useGame();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { isScrolled } = useScrollHook({ threshold: 10 });

  // Use custom hooks for data and logic
  const {
    config,
    loading,
    unclaimedRunsCount,
    unverifiedRunsCount,
    resetNotificationCounts,
  } = useGameDetails(currentUser, authLoading);

  // Use handlers hook
  const { handleLogout, handleNotificationClick } = useGameDetailsHandlers({
    currentUser,
    unverifiedRunsCount,
    unclaimedRunsCount,
    onNotificationCountsReset: resetNotificationCounts,
  });

  // Use logic hook
  const {
    sortedHeaderLinks,
    sortedPlatforms,
    activeTab,
    activeLinkColor,
    isVisible,
  } = useGameDetailsLogic({
    config,
    currentUser,
    currentPath: location.pathname,
  });

  // Framer Motion scroll tracking for smooth animations
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 50], [1, 0.95]);
  const headerBlur = useTransform(scrollY, [0, 50], [0, 8]);
  const headerScale = useTransform(scrollY, [0, 50], [1, 0.98]);
  const headerY = useTransform(scrollY, [0, 50], [0, -2]);

  // Smooth spring animations
  const smoothOpacity = useSpring(headerOpacity, {
    stiffness: 100,
    damping: 30,
  });
  const smoothBlur = useSpring(headerBlur, {
    stiffness: 100,
    damping: 30,
  });
  const smoothScale = useSpring(headerScale, {
    stiffness: 100,
    damping: 30,
  });
  const smoothY = useSpring(headerY, {
    stiffness: 100,
    damping: 30,
  });

  const handleTabChange = (value: string) => {
    const link = sortedHeaderLinks.find((l) => l.id === value);
    if (link) {
      navigate({ to: link.route });
    }
  };

  const notificationCount = currentUser?.isAdmin
    ? unverifiedRunsCount
    : unclaimedRunsCount;
  const hasNotifications = notificationCount > 0;

  // Don't render if loading, disabled, or not visible on current page
  if (loading) {
    // Still render header controls even if game details are disabled
    return (
      <motion.header
        ref={headerRef}
        className={cn(
          "bg-[#1e1e2e] shadow-lg sticky top-0 z-40 w-full overflow-x-hidden transition-all duration-300",
          isScrolled && "shadow-xl",
        )}
        style={{
          opacity: smoothOpacity,
          scale: smoothScale,
          y: smoothY,
          backdropFilter: `blur(${smoothBlur}px)`,
        }}
      >
        <div className="px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-[1920px] mx-auto w-full">
            <div className="flex items-center justify-between h-14 sm:h-16 min-w-0 w-full">
              <div className="flex items-center gap-2 sm:gap-4 lg:gap-10 min-w-0 flex-shrink">
                {/* Empty space where game details would be */}
              </div>

              <div className="flex-1 flex justify-center px-4">
                <div className="w-full max-w-md">
                  <GameSearch />
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-3 flex-shrink-0">
                <MobileNavigation
                  isOpen={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                  config={config}
                  sortedHeaderLinks={sortedHeaderLinks}
                  currentPath={location.pathname}
                  currentUser={currentUser}
                  authLoading={authLoading}
                  notificationCount={notificationCount}
                  hasNotifications={hasNotifications}
                  onNotificationClick={handleNotificationClick}
                  onLoginClick={() => setIsLoginOpen(true)}
                  onLogout={handleLogout}
                />
              </div>

              <DesktopNavigation
                config={config}
                currentUser={currentUser}
                authLoading={authLoading}
                onLoginClick={() => setIsLoginOpen(true)}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
        <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      </motion.header>
    );
  }

  return (
    <>
      <motion.header
        ref={headerRef}
        className={cn(
          "bg-[#1e1e2e] shadow-lg sticky top-0 z-40 w-full overflow-x-hidden transition-all duration-300",
          isScrolled && "shadow-xl",
          className,
        )}
        style={{
          opacity: smoothOpacity,
          scale: smoothScale,
          y: smoothY,
          backdropFilter: `blur(${smoothBlur}px)`,
        }}
      >
        <div className="px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-[1920px] mx-auto w-full">
            <div className="flex items-start justify-between min-w-0 w-full py-2 sm:py-3">
              {/* Game Details Section - Left Side */}
              <div className="flex items-start gap-2 sm:gap-3 md:gap-4 lg:gap-5 min-w-0 flex-shrink flex-1">
                {isVisible ? (
                  <GameHeader
                    config={config}
                    sortedPlatforms={sortedPlatforms}
                    sortedHeaderLinks={sortedHeaderLinks}
                    currentPath={location.pathname}
                    activeTab={activeTab}
                    activeLinkColor={activeLinkColor}
                    onTabChange={handleTabChange}
                    onNavigate={(route) => navigate({ to: route })}
                    currentGame={currentGame}
                    availableGames={availableGames}
                    switchGame={switchGame}
                  />
                ) : null}
              </div>

              <div className="flex-1 flex justify-center px-4">
                <div className="w-full max-w-md">
                  <GameSearch />
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-3 flex-shrink-0">
                <MobileNavigation
                  isOpen={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                  config={config}
                  sortedHeaderLinks={sortedHeaderLinks}
                  currentPath={location.pathname}
                  currentUser={currentUser}
                  authLoading={authLoading}
                  notificationCount={notificationCount}
                  hasNotifications={hasNotifications}
                  onNotificationClick={handleNotificationClick}
                  onLoginClick={() => setIsLoginOpen(true)}
                  onLogout={handleLogout}
                />
              </div>

              {/* Desktop Navigation */}
              <DesktopNavigation
                config={config}
                currentUser={currentUser}
                authLoading={authLoading}
                onLoginClick={() => setIsLoginOpen(true)}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </motion.header>
      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </>
  );
}
