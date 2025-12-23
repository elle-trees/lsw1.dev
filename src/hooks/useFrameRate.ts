import { useState, useEffect, useRef } from "react";

/**
 * Hook to measure the current application frame rate
 * Useful for performance monitoring and ensuring smooth playback on high-refresh displays
 *
 * Supports Variable Refresh Rate (VRR) monitors by accurately measuring
 * real frame delivery rather than assuming a fixed refresh rate.
 */
export function useFrameRate(enabled: boolean = true) {
  const [fps, setFps] = useState(0);
  const [avgFps, setAvgFps] = useState(0);

  // Refs for tracking frames without triggering re-renders
  const frameCount = useRef(0);
  const lastTime = useRef(0);
  const rafId = useRef<number | null>(null);

  // History for average calculation (keep last 10 seconds of data)
  const fpsHistory = useRef<number[]>([]);
  const MAX_HISTORY = 10;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Reset state on mount/enable
    lastTime.current = 0;
    frameCount.current = 0;

    const loop = (time: number) => {
      // Sync with rAF timestamp on first frame
      if (lastTime.current === 0) {
        lastTime.current = time;
      }

      frameCount.current++;

      // Update FPS calculation every second (1000ms)
      if (time >= lastTime.current + 1000) {
        const delta = time - lastTime.current;
        const currentFps = Math.round((frameCount.current * 1000) / delta);

        setFps(currentFps);

        // Update history and average
        fpsHistory.current.push(currentFps);
        if (fpsHistory.current.length > MAX_HISTORY) {
          fpsHistory.current.shift();
        }

        const sum = fpsHistory.current.reduce((a, b) => a + b, 0);
        setAvgFps(Math.round(sum / fpsHistory.current.length));

        // Reset counters
        frameCount.current = 0;
        lastTime.current = time;
      }

      rafId.current = requestAnimationFrame(loop);
    };

    // Start the loop
    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [enabled]);

  return { fps, avgFps };
}
