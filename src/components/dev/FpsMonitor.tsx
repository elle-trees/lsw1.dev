import { useFrameRate } from "@/hooks/useFrameRate";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    __SHOW_FPS__?: boolean;
    toggleFps?: () => void;
  }
}

export const toggleFpsMonitor = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("toggle-fps"));
  }
};

/**
 * FPS Monitor component
 * Displays real-time frame rate information
 *
 * Automatically detects display refresh rate via requestAnimationFrame
 * Works with High Refresh Rate and VRR displays
 */
export function FpsMonitor() {
  const { fps, avgFps } = useFrameRate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkVisibility = () => {
      // 1. Dev mode
      const isDev = import.meta.env.DEV;

      // 2. Local storage
      const isStorageEnabled = localStorage.getItem("show-fps") === "true";

      // 3. URL params (search)
      const searchParams = new URLSearchParams(window.location.search);
      const hasSearchParam = searchParams.get("debug_fps") === "true";

      // 4. URL params (hash) - handle hash routing or params in hash
      // e.g. /#/route?debug_fps=true or /#debug_fps=true
      const hash = window.location.hash;
      const hasHashParam =
        hash.includes("debug_fps=true") ||
        new URLSearchParams(hash.split("?")[1] || "").get("debug_fps") ===
          "true";

      // 5. Global window toggle (for console)
      const isGlobalEnabled = window.__SHOW_FPS__ === true;

      const shouldShow =
        isDev ||
        isStorageEnabled ||
        hasSearchParam ||
        hasHashParam ||
        isGlobalEnabled;

      if (shouldShow !== isVisible) {
        console.log("[FpsMonitor] Visibility changed:", {
          shouldShow,
          isDev,
          isStorageEnabled,
          hasSearchParam,
          hasHashParam,
          isGlobalEnabled,
          url: window.location.href,
        });
        setIsVisible(shouldShow);
      }
    };

    // Check immediately
    checkVisibility();

    // Check periodically to catch URL changes that don't trigger full reloads
    const interval = setInterval(checkVisibility, 1000);

    // Also expose global toggle helper
    window.toggleFps = () => {
      const newState = localStorage.getItem("show-fps") !== "true";
      localStorage.setItem("show-fps", newState ? "true" : "false");
      console.log(`FPS Monitor ${newState ? "enabled" : "disabled"}`);
      checkVisibility();
    };

    // Listen for custom toggle event
    const handleToggle = () => {
      if (window.toggleFps) {
        window.toggleFps();
      }
    };
    window.addEventListener("toggle-fps", handleToggle);

    return () => {
      clearInterval(interval);
      delete window.toggleFps;
      window.removeEventListener("toggle-fps", handleToggle);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  // Color coding for FPS health
  // Green for smooth (near 60 or higher)
  // Yellow for acceptable but dropping (30-55)
  // Red for poor performance (<30)
  const getHealthColor = (value: number) => {
    if (value >= 55) return "text-green-400";
    if (value >= 30) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="fixed bottom-2 right-2 z-[9999] flex flex-col gap-1 rounded-md bg-black/80 p-2 text-xs font-mono text-white shadow-lg pointer-events-none select-none backdrop-blur-sm border border-white/10 transition-opacity duration-300">
      <div className="flex items-center justify-between gap-3">
        <span className="text-gray-400">FPS:</span>
        <span className={cn("font-bold", getHealthColor(fps))}>{fps}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-gray-400">AVG:</span>
        <span className={cn("font-bold", getHealthColor(avgFps))}>
          {avgFps}
        </span>
      </div>
    </div>
  );
}
