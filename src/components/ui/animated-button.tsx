import * as React from "react"
import { motion, MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...props}
      />
    )
  }
)
AnimatedButton.displayName = "AnimatedButton"

export { AnimatedButton }
