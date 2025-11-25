import React, { RefObject, useEffect } from 'react';
import { useAutoAnimateWithConfig, autoAnimateConfigs, slidePlugin } from './auto-animate';
import type { AutoAnimateOptions, AutoAnimationPlugin } from '@formkit/auto-animate';

/**
 * Unified animation hooks
 */

/**
 * Hook for animating lists, tables, and dynamic content
 * Uses AutoAnimate for automatic animations on add/remove/reorder
 * 
 * @param config - Optional AutoAnimate configuration (default: smooth)
 * @returns Tuple of [ref, enable/disable function]
 * 
 * @example
 * ```tsx
 * const [listRef] = useAnimateList();
 * 
 * return (
 *   <ul ref={listRef}>
 *     {items.map(item => <li key={item.id}>{item.name}</li>)}
 *   </ul>
 * );
 * ```
 */
export function useAnimateList(
  config: AutoAnimateOptions | AutoAnimationPlugin = autoAnimateConfigs.smooth
) {
  return useAutoAnimateWithConfig(config);
}

/**
 * Hook for animating table bodies
 * Optimized for table row animations with slide-in/slide-out effects
 * 
 * @param config - Optional AutoAnimate configuration (default: slidePlugin for slide animations)
 * @returns Tuple of [ref, enable/disable function]
 * 
 * @example
 * ```tsx
 * const [tbodyRef] = useAnimateTable();
 * 
 * return (
 *   <TableBody ref={tbodyRef}>
 *     {rows.map(row => <TableRow key={row.id}>...</TableRow>)}
 *   </TableBody>
 * );
 * ```
 */
export function useAnimateTable(
  config: AutoAnimateOptions | AutoAnimationPlugin = slidePlugin
) {
  return useAutoAnimateWithConfig(config);
}

/**
 * Hook for animating card grids
 * Optimized for card-based layouts
 * 
 * @param config - Optional AutoAnimate configuration (default: smooth)
 * @returns Tuple of [ref, enable/disable function]
 * 
 * @example
 * ```tsx
 * const [gridRef] = useAnimateGrid();
 * 
 * return (
 *   <div ref={gridRef} className="grid grid-cols-3 gap-4">
 *     {cards.map(card => <Card key={card.id}>...</Card>)}
 *   </div>
 * );
 * ```
 */
export function useAnimateGrid(
  config: AutoAnimateOptions | AutoAnimationPlugin = autoAnimateConfigs.smooth
) {
  return useAutoAnimateWithConfig(config);
}

/**
 * Hook for conditionally enabling/disabling animations
 * Useful for performance optimization or user preferences
 * 
 * @param enabled - Whether animations should be enabled
 * @param config - Optional AutoAnimate configuration
 * @returns Tuple of [ref, enable/disable function]
 * 
 * @example
 * ```tsx
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 * const [listRef, setEnabled] = useAnimateConditional(!prefersReducedMotion);
 * 
 * return <ul ref={listRef}>...</ul>;
 * ```
 */
export function useAnimateConditional(
  enabled: boolean = true,
  config: AutoAnimateOptions | AutoAnimationPlugin = autoAnimateConfigs.default
): [RefObject<HTMLElement>, (enabled: boolean) => void] {
  const [ref, setEnabled] = useAutoAnimateWithConfig(config);
  
  useEffect(() => {
    setEnabled(enabled);
  }, [enabled, setEnabled]);
  
  return [ref, setEnabled];
}

