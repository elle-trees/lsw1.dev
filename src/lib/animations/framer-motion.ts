import { Variants, Transition } from "framer-motion";

/**
 * Optimized Framer Motion animation system
 * Consolidated and streamlined for better performance and smaller bundle size
 */

// Optimized transitions - using smoother spring physics with better performance
export const transitions = {
  smooth: { 
    type: "spring" as const,
    stiffness: 280,
    damping: 28,
    mass: 0.8,
  } as Transition,
  spring: { 
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 0.9,
  } as Transition,
  springBounce: { 
    type: "spring" as const,
    stiffness: 350,
    damping: 26,
    mass: 0.85,
  } as Transition,
  quick: { 
    type: "spring" as const,
    stiffness: 400,
    damping: 35,
    mass: 0.7,
  } as Transition,
  gentle: {
    type: "spring" as const,
    stiffness: 200,
    damping: 25,
    mass: 1,
  } as Transition,
} as const;

// Factory function for creating slide variants (reduces code duplication)
// Optimized with smoother animations and reduced motion support
const createSlideVariants = (direction: 'up' | 'down' | 'left' | 'right'): Variants => {
  const offsets = {
    up: { y: 8, exitY: -6 },
    down: { y: -8, exitY: 6 },
    left: { x: 12, exitX: -12 },
    right: { x: -12, exitX: 12 },
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
      transition: transitions.smooth,
    },
    exit: { 
      opacity: 0, 
      ...(isVertical ? { y: offset.exitY } : { x: offset.exitX }),
      transition: transitions.quick,
    },
  };
};

// Fade animation - optimized for smooth transitions
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: transitions.gentle,
  },
  exit: { 
    opacity: 0, 
    transition: transitions.quick,
  },
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

// Optimized stagger system - smoother and more performant
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

// Interactive hover/tap animations - subtle and smooth
export const cardHoverVariants: Variants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.01,
    y: -2,
    transition: transitions.gentle,
  },
};

export const buttonVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: transitions.quick },
  tap: { scale: 0.95, transition: transitions.quick },
};

// Page transition variants - optimized for smooth navigation
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 4 },
  enter: { 
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
  exit: { 
    opacity: 0,
    y: -2,
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

// Table row animations - smooth staggered entrance
export const tableRowVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.015,
      ...transitions.smooth,
    },
  }),
};

// List item variants for dynamic lists (replaces auto-animate)
export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 4, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -4,
    transition: transitions.quick,
  },
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

