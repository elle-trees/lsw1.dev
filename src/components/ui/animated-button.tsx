import * as React from "react"
import { motion, MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { buttonVariants as motionButtonVariants, transitions } from "@/lib/animations"
import { buttonVariants, ButtonProps } from "@/components/ui/button"

// We export a motion-enhanced button that uses Shadcn styles
const AnimatedButton = React.forwardRef<HTMLButtonElement, ButtonProps & MotionProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    if (asChild) {
      console.warn("AnimatedButton does not support asChild. Use motion(Component) with buttonVariants instead.")
    }
    
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={motionButtonVariants}
        transition={transitions.quick}
        {...props}
      />
    )
  }
)
AnimatedButton.displayName = "AnimatedButton"

export { AnimatedButton }
