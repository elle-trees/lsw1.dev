import { motion, MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface FadeInProps extends MotionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function FadeIn({ children, className, delay = 0, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

