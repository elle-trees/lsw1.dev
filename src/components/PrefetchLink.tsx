import { useRouter } from "@tanstack/react-router";
import { usePrefetch } from "@/hooks/usePrefetch";
import { forwardRef } from "react";

/**
 * PrefetchLink component that automatically prefetches routes and data on hover
 * 
 * This component provides navigation with prefetching capabilities.
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

export const PrefetchLink = forwardRef<HTMLAnchorElement, PrefetchLinkProps>(
  ({ to, params, prefetchOnHover = true, onClick, className, children, ...props }, ref) => {
    const router = useRouter();
    const prefetch = usePrefetch(to, params);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Call custom onClick if provided
      onClick?.(e);
      
      // If custom onClick prevented default, respect that
      if (e.defaultPrevented) {
        return;
      }
      
      // Navigate using router
      e.preventDefault();
      if (params && Object.keys(params).length > 0) {
        router.navigate({ to, params });
      } else {
        router.navigate({ to });
      }
    };

    const handleMouseEnter = prefetchOnHover ? prefetch.onMouseEnter : undefined;

    // Build href for the anchor tag
    let href = to;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        href = href.replace(`$${key}`, value);
      });
    }

    return (
      <a
        ref={ref}
        href={href}
        className={className}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        {...props}
      >
        {children}
      </a>
    );
  }
);

PrefetchLink.displayName = "PrefetchLink";

