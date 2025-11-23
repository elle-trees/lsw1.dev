import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { staggerContainerVariants, staggerItemVariants } from "@/lib/animations";

interface StaggerListProps {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
}

/**
 * Container component for staggered list animations
 * Use this to wrap lists of items that should animate in sequence
 */
export function StaggerList({ children, className, itemClassName }: StaggerListProps) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className={cn(className)}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={staggerItemVariants}
          className={cn(itemClassName)}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

