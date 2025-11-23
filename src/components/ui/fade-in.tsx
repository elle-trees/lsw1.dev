import { motion, MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { fadeSlideUpVariants, transitions } from "@/lib/animations"

interface FadeInProps extends MotionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "fade" | "scale"
}

export function FadeIn({ 
  children, 
  className, 
  delay = 0, 
  direction = "up",
  ...props 
}: FadeInProps) {
  const getVariants = () => {
    switch (direction) {
      case "down":
        return {
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0 },
        };
      case "left":
        return {
          hidden: { opacity: 0, x: 20 },
          visible: { opacity: 1, x: 0 },
        };
      case "right":
        return {
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0 },
        };
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
      case "scale":
        return {
          hidden: { opacity: 0, scale: 0.9 },
          visible: { opacity: 1, scale: 1 },
        };
      default:
        return fadeSlideUpVariants;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={getVariants()}
      transition={{ ...transitions.spring, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

