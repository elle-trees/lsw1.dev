import { useFrameRate } from "@/hooks/useFrameRate";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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

  // Only show in dev mode or if explicitly enabled via local storage
  useEffect(() => {
    // Check if we're in development mode
    const isDev = import.meta.env.DEV;

    // Check local storage override
    const isEnabled = localStorage.getItem("show-fps") === "true";

    // Also allow toggling via query param for easy testing on mobile/other devices
    // ?debug_fps=true
    const hasQueryParam = new URLSearchParams(window.location.search).get("debug_fps") === "true";

    setIsVisible(isDev || isEnabled || hasQueryParam);
  }, []);

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
        <span className={cn("font-bold", getHealthColor(fps))}>
          {fps}
        </span>
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
