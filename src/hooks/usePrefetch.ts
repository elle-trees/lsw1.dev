import { useRef } from "react";
import { useHref } from "react-router-dom";

/**
 * Hook to prefetch a route on hover
 * This improves perceived performance by loading route chunks before the user clicks
 * 
 * For React Router with lazy loading, we prefetch the route's JavaScript chunks
 * by creating prefetch links. The browser will prefetch resources in the background,
 * and when the user clicks, the route will load much faster.
 */
export function usePrefetchOnHover(to: string) {
  const href = useHref(to);
  const hasPrefetched = useRef(false);

  const handleMouseEnter = () => {
    if (!hasPrefetched.current && typeof document !== "undefined") {
      // Check if link already exists
      const existingLink = document.querySelector(`link[data-prefetch="${href}"]`);
      
      if (!existingLink) {
        // Create a prefetch link element for the route
        // This helps the browser prepare for navigation
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = href;
        link.as = "document";
        link.setAttribute("data-prefetch", href);
        link.crossOrigin = "anonymous";
        
        // Add to head
        document.head.appendChild(link);
      }
      
      hasPrefetched.current = true;
    }
  };

  return { onMouseEnter: handleMouseEnter };
}

