import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { pageVariants } from "@/lib/animations";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Wrapper component for page transitions
 * Provides smooth enter animations for route changes
 * Exit animations removed to prevent reload flash
 */
export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="enter"
      variants={pageVariants}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

