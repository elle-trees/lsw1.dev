import { motion, MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  fadeSlideUpVariants, 
  fadeSlideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  fadeVariants,
  scaleVariants,
  transitions 
} from "@/lib/animations"

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
        return fadeSlideDownVariants;
      case "left":
        return slideLeftVariants;
      case "right":
        return slideRightVariants;
      case "fade":
        return fadeVariants;
      case "scale":
        return scaleVariants;
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

