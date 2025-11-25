import autoAnimate, { AutoAnimationPlugin, AutoAnimateOptions } from '@formkit/auto-animate';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { RefObject, useEffect, useRef } from 'react';

/**
 * Optimized AutoAnimate configuration presets
 */
export const autoAnimateConfigs = {
  default: {
    duration: 250,
    easing: 'ease-in-out',
  } as AutoAnimateOptions,
  
  smooth: {
    duration: 300,
    easing: 'ease-in-out',
  } as AutoAnimateOptions,
  
  quick: {
    duration: 200,
    easing: 'ease-out',
  } as AutoAnimateOptions,
} as const;

/**
 * Custom AutoAnimate plugin for bouncy animations (optimized)
 */
export const bouncyPlugin: AutoAnimationPlugin = (el, action, oldCoords, newCoords) => {
  let keyframes: Keyframe[] = [];
  
  if (action === 'add') {
    keyframes = [
      { transform: 'scale(0.9)', opacity: '0' },
      { transform: 'scale(1.02)', opacity: '1', offset: 0.7 },
      { transform: 'scale(1)', opacity: '1' },
    ];
  } else if (action === 'remove') {
    keyframes = [
      { transform: 'scale(1)', opacity: '1' },
      { transform: 'scale(0.9)', opacity: '0' },
    ];
  } else if (action === 'remain' && oldCoords && newCoords) {
    const deltaX = oldCoords.left - newCoords.left;
    const deltaY = oldCoords.top - newCoords.top;
    
    if (deltaX || deltaY) {
      keyframes = [
        { transform: `translate(${deltaX}px, ${deltaY}px)` },
        { transform: 'translate(0, 0)' },
      ];
    }
  }
  
  return new KeyframeEffect(el, keyframes, {
    duration: 280,
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  });
};

/**
 * Optimized AutoAnimate plugin for slide animations (table rows)
 * Provides smooth slide-in/out animations
 */
export const slidePlugin: AutoAnimationPlugin = (el, action, oldCoords, newCoords) => {
  let keyframes: Keyframe[] = [];
  
  if (action === 'add') {
    keyframes = [
      { transform: 'translateX(-16px)', opacity: '0' },
      { transform: 'translateX(0)', opacity: '1' },
    ];
  } else if (action === 'remove') {
    keyframes = [
      { transform: 'translateX(0)', opacity: '1' },
      { transform: 'translateX(-16px)', opacity: '0' },
    ];
  } else if (action === 'remain' && oldCoords && newCoords) {
    const deltaX = oldCoords.left - newCoords.left;
    const deltaY = oldCoords.top - newCoords.top;
    
    if (deltaX || deltaY) {
      keyframes = [
        { transform: `translate(${deltaX}px, ${deltaY}px)` },
        { transform: 'translate(0, 0)' },
      ];
    }
  }
  
  return new KeyframeEffect(el, keyframes, {
    duration: 300,
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  });
};

/**
 * React hook for AutoAnimate with configuration
 * 
 * @param config - AutoAnimate configuration options
 * @returns Tuple of [ref, enable/disable function]
 * 
 * @example
 * ```tsx
 * const [parent] = useAutoAnimateWithConfig(autoAnimateConfigs.smooth);
 * 
 * return (
 *   <ul ref={parent}>
 *     {items.map(item => <li key={item.id}>{item.name}</li>)}
 *   </ul>
 * );
 * ```
 */
export function useAutoAnimateWithConfig(
  config: AutoAnimateOptions | AutoAnimationPlugin = autoAnimateConfigs.default
): [RefObject<HTMLElement>, (enabled: boolean) => void] {
  return useAutoAnimate<HTMLElement>(config);
}

/**
 * Direct AutoAnimate utility for imperative usage
 * 
 * @param element - DOM element to animate
 * @param config - AutoAnimate configuration options
 * @returns Animation controller with enable/disable methods
 * 
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * 
 * useEffect(() => {
 *   if (containerRef.current) {
 *     const controller = applyAutoAnimate(containerRef.current, autoAnimateConfigs.smooth);
 *     return () => controller.disable();
 *   }
 * }, []);
 * ```
 */
export function applyAutoAnimate(
  element: HTMLElement,
  config: AutoAnimateOptions | AutoAnimationPlugin = autoAnimateConfigs.default
) {
  return autoAnimate(element, config);
}

/**
 * Hook to apply AutoAnimate to a ref imperatively
 * 
 * @param ref - React ref to the element
 * @param config - AutoAnimate configuration options
 * 
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * useAutoAnimateRef(containerRef, autoAnimateConfigs.smooth);
 * 
 * return <div ref={containerRef}>...</div>;
 * ```
 */
export function useAutoAnimateRef<T extends HTMLElement>(
  ref: RefObject<T>,
  config: AutoAnimateOptions | AutoAnimationPlugin = autoAnimateConfigs.default
) {
  useEffect(() => {
    if (ref.current) {
      const controller = applyAutoAnimate(ref.current, config);
      return () => controller.disable();
    }
  }, [ref, config]);
}

