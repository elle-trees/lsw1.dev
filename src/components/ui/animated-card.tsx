import * as React from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  fadeSlideUpVariants,
  cardHoverVariants,
  transitions,
} from "@/lib/animations";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
  delay?: number;
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, children, hover = true, delay = 0, ...props }, ref) => {
    const combinedVariants: Variants = hover
      ? {
          hidden: fadeSlideUpVariants.hidden,
          visible: {
            ...fadeSlideUpVariants.visible,
            ...cardHoverVariants.rest,
          },
          hover: cardHoverVariants.hover,
        }
      : fadeSlideUpVariants;

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={combinedVariants}
        transition={{ ...transitions.spring, delay }}
        whileHover={hover ? "hover" : undefined}
        className={cn(
          "rounded-none border bg-card text-card-foreground shadow-sm",
          className,
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
AnimatedCard.displayName = "AnimatedCard";

export { AnimatedCard };
