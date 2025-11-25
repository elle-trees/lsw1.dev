/**
 * GameHeader Component
 * Displays game title, cover image, categories, platforms, and desktop navigation tabs
 */

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, AnimatedTabsList, AnimatedTabsTrigger } from "@/components/ui/animated-tabs";
import { GameDetailsConfig, GameDetailsHeaderLink } from "@/types/database";
import { Trophy, Upload, Radio, Download, BarChart3, ShieldAlert } from "lucide-react";
import LegoStudIcon from "@/components/icons/LegoStudIcon";
import { getPlatformTranslation, getHeaderLinkTranslation } from "@/lib/i18n/entity-translations";
import { cn } from "@/lib/utils";

interface GameHeaderProps {
  config: GameDetailsConfig;
  sortedPlatforms: Array<{ id: string; label: string; order?: number }>;
  sortedHeaderLinks: GameDetailsHeaderLink[];
  currentPath: string;
  activeTab: string;
  activeLinkColor: string;
  onTabChange: (value: string) => void;
  onNavigate: (route: string) => void;
}

// Icon mapping for header links
const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number; color?: string }>> = {
  Trophy,
  Upload,
  Radio,
  Download,
  BarChart3,
  ShieldAlert,
};

export function GameHeader({
  config,
  sortedPlatforms,
  sortedHeaderLinks,
  currentPath,
  activeTab,
  activeLinkColor,
  onTabChange,
  onNavigate,
}: GameHeaderProps) {
  return (
    <motion.div
      className="flex items-end gap-2 sm:gap-4 lg:gap-5 min-w-0 flex-shrink flex-1"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Game Cover Image */}
      {config.coverImageUrl && (
        <motion.div
          className="flex-shrink-0 hidden sm:block"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <img
            src={config.coverImageUrl}
            alt={config.title}
            className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-none border border-ctp-surface1"
          />
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col h-24 sm:h-28 md:h-32">
        <div className="flex-1">
          {/* Title and Categories */}
          <motion.div
            className="mb-1 sm:mb-1.5"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-ctp-text mb-0.5 sm:mb-1.5 leading-tight">
              {config.title}
              {config.subtitle && (
                <span className="text-ctp-subtext1 font-normal text-xs sm:text-sm md:text-base">
                  {" "}({config.subtitle})
                </span>
              )}
            </h1>
            {config.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
                {config.categories.map((category, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.3 + index * 0.05,
                      duration: 0.2,
                    }}
                  >
                    <Badge
                      variant="outline"
                      className="bg-ctp-surface0 text-ctp-text border-ctp-surface1 text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1"
                    >
                      {category}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Platform Buttons */}
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {sortedPlatforms.map((platform, index) => (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.4 + index * 0.05,
                  duration: 0.2,
                }}
              >
                <Button
                  variant="outline"
                  className="bg-ctp-surface0 text-ctp-text border-ctp-surface1 hover:bg-ctp-surface1 hover:border-ctp-mauve/50 rounded-none text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-2.5 py-0.5 sm:py-1 h-auto"
                >
                  {getPlatformTranslation(platform.id, platform.label)}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Header Navigation Links - Using Animated Tabs */}
        {sortedHeaderLinks.length > 0 && (
          <motion.div
            className="hidden xl:block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
              <AnimatedTabsList
                className="h-auto bg-transparent p-0 gap-2 sm:gap-3 lg:gap-4 border-none"
                indicatorClassName="h-0.5"
                indicatorColor={activeLinkColor}
              >
                {sortedHeaderLinks.map((link) => {
                  const IconComponent =
                    link.icon === "LegoStud"
                      ? LegoStudIcon
                      : link.icon
                        ? iconMap[link.icon]
                        : null;
                  const linkColor = link.color || "#cdd6f4";
                  const isActive =
                    currentPath === link.route ||
                    (link.route !== "/" && currentPath.startsWith(link.route));

                  return (
                    <AnimatedTabsTrigger
                      key={link.id}
                      value={link.id}
                      className={cn(
                        "relative flex items-center gap-1.5 px-2 py-1.5 h-auto text-sm font-medium bg-transparent hover:bg-ctp-surface0/50 transition-all duration-300 group"
                      )}
                      style={{
                        color: linkColor,
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(link.route);
                      }}
                    >
                      {IconComponent && (
                        link.icon === "LegoStud" ? (
                          <LegoStudIcon
                            size={16}
                            color={linkColor}
                            className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                          />
                        ) : (
                          <IconComponent
                            className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                            style={{ color: linkColor }}
                          />
                        )
                      )}
                      <span>{getHeaderLinkTranslation(link.id, link.label)}</span>
                    </AnimatedTabsTrigger>
                  );
                })}
              </AnimatedTabsList>
            </Tabs>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

