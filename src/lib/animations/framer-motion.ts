import { Variants, Transition } from "framer-motion";

/**
 * Optimized Framer Motion animation system
 * Consolidated and streamlined for better performance and smaller bundle size
 */

// Optimized transitions - using smoother spring physics
export const transitions = {
  smooth: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } as Transition,
  spring: { type: "spring", stiffness: 300, damping: 30 } as Transition,
  springBounce: { type: "spring", stiffness: 400, damping: 25 } as Transition,
  quick: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } as Transition,
} as const;

// Factory function for creating slide variants (reduces code duplication)
const createSlideVariants = (direction: 'up' | 'down' | 'left' | 'right'): Variants => {
  const offsets = {
    up: { y: 12, exitY: -8 },
    down: { y: -12, exitY: 8 },
    left: { x: 20, exitX: -20 },
    right: { x: -20, exitX: 20 },
  };
  
  const offset = offsets[direction];
  const isVertical = direction === 'up' || direction === 'down';
  
  return {
    hidden: { 
      opacity: 0, 
      ...(isVertical ? { y: offset.y } : { x: offset.x })
    },
    visible: { 
      opacity: 1, 
      ...(isVertical ? { y: 0 } : { x: 0 }),
      transition: transitions.spring,
    },
    exit: { 
      opacity: 0, 
      ...(isVertical ? { y: offset.exitY } : { x: offset.exitX }),
      transition: transitions.quick,
    },
  };
};

// Fade animation
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.smooth },
  exit: { opacity: 0, transition: transitions.quick },
};

// Slide animations (using factory)
export const slideUpVariants = createSlideVariants('up');
export const slideDownVariants = createSlideVariants('down');
export const slideLeftVariants = createSlideVariants('left');
export const slideRightVariants = createSlideVariants('right');

// Combined fade + slide (most commonly used)
export const fadeSlideUpVariants = createSlideVariants('up');
export const fadeSlideDownVariants = createSlideVariants('down');

// Scale animation
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.springBounce,
  },
  exit: { 
    opacity: 0, 
    scale: 0.96,
    transition: transitions.quick,
  },
};

// Optimized stagger system
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
};

// Interactive hover/tap animations
export const cardHoverVariants: Variants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: transitions.smooth,
  },
};

export const buttonVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: transitions.quick },
  tap: { scale: 0.95, transition: transitions.quick },
};

// Page transition variants (optimized)
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  enter: { 
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0,
    y: -4,
    transition: transitions.quick,
  },
};

// Modal/Dialog animations
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.springBounce,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 4,
    transition: transitions.quick,
  },
};

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.smooth },
  exit: { opacity: 0, transition: transitions.quick },
};

// Table row animations (for initial load - use AutoAnimate for list changes)
export const tableRowVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.02,
      ...transitions.spring,
    },
  }),
};

// Utility function for spring transitions with custom values
export const createSpringTransition = (
  stiffness: number = 300,
  damping: number = 30
): Transition => ({
  type: "spring",
  stiffness,
  damping,
});

