/**
 * Unified Animation System
 * 
 * Optimized animation system using Framer Motion for smooth, performant animations
 */

// Framer Motion exports
export {
  transitions,
  fadeVariants,
  slideUpVariants,
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  scaleVariants,
  fadeSlideUpVariants,
  fadeSlideDownVariants,
  staggerContainerVariants,
  staggerItemVariants,
  cardHoverVariants,
  buttonVariants,
  pageVariants,
  modalVariants,
  modalBackdropVariants,
  tableRowVariants,
  createSpringTransition,
} from './framer-motion';

// AutoAnimate exports
export {
  autoAnimateConfigs,
  bouncyPlugin,
  slidePlugin,
  useAutoAnimateWithConfig,
  applyAutoAnimate,
  useAutoAnimateRef,
} from './auto-animate';

// Hooks exports
export {
  useAnimateList,
  useAnimateTable,
  useAnimateGrid,
  useAnimateConditional,
} from './hooks';

// Type exports
export type { Variants, Transition } from 'framer-motion';

