import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { pageVariants } from "@/lib/animations";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Wrapper component for page transitions
 * Provides smooth enter/exit animations for route changes
 */
export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

