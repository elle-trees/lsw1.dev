import { useNavigate } from "@tanstack/react-router";
import { useCallback, useRef } from "react";
import { prefetchRouteData } from "@/lib/prefetch";

/**
 * PrefetchLink component that automatically prefetches routes and data on hover
 * 
 * This component provides navigation with prefetching capabilities using TanStack Router.
 * Uses programmatic navigation to ensure reliable navigation.
 * 
 * @example
 * ```tsx
 * <PrefetchLink to="/leaderboards">Leaderboards</PrefetchLink>
 * <PrefetchLink to="/player/$playerId" params={{ playerId: "123" }}>Player</PrefetchLink>
 * ```
 */
export interface PrefetchLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * The route path to navigate to (TanStack Router format)
   * e.g., "/leaderboards" or "/player/$playerId"
   */
  to: string;
  /**
   * Optional parameters for dynamic routes
   * e.g., { playerId: "123" } for /player/$playerId
   */
  params?: Record<string, string>;
  /**
   * Whether to prefetch on hover (default: true)
   */
  prefetchOnHover?: boolean;
}

export const PrefetchLink = ({ 
  to, 
  params, 
  prefetchOnHover = true, 
  onClick,
  className,
  children,
  ...props 
}: PrefetchLinkProps) => {
  const navigate = useNavigate();
  const hasPrefetched = useRef(false);

  // Build the actual path for prefetching and href
  const buildPath = useCallback(() => {
    let path = to;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        path = path.replace(`$${key}`, value);
      });
    }
    return path;
  }, [to, params]);

  const handleMouseEnter = useCallback(() => {
    if (!prefetchOnHover || hasPrefetched.current) return;
    
    const path = buildPath();
    
    // Prefetch data using our system
    prefetchRouteData(path, params).catch(() => {
      // Silent fail
    });
    
    hasPrefetched.current = true;
  }, [to, params, prefetchOnHover, buildPath]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Always prevent default to avoid page reload
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate immediately - this is the most important part
    try {
      if (params && Object.keys(params).length > 0) {
        navigate({ to, params });
      } else {
        navigate({ to });
      }
    } catch (error) {
      console.error('PrefetchLink navigation error:', error, { to, params });
      // Fallback to window.location
      const path = buildPath();
      window.location.href = path;
      return;
    }
    
    // Call custom onClick after navigation (for things like closing menus)
    // Use setTimeout to ensure navigation happens first
    if (onClick) {
      setTimeout(() => {
        onClick(e);
      }, 0);
    }
  }, [onClick, navigate, to, params, buildPath]);

  const href = buildPath();

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </a>
  );
};

PrefetchLink.displayName = "PrefetchLink";
