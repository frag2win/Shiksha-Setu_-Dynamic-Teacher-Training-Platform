/**
 * Page transition wrapper using Framer Motion
 * Provides elegant book-like page turn animations
 * Optimized for GPU acceleration and smooth 60fps
 */

import { motion, useReducedMotion } from 'framer-motion';

// Book page turn animation - horizontal slide with subtle 3D rotation
const pageVariants = {
  initial: {
    opacity: 0,
    x: 60,
    rotateY: -5,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for paper-like feel
      opacity: { duration: 0.2 },
    },
  },
  exit: {
    opacity: 0,
    x: -60,
    rotateY: 5,
    scale: 0.98,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Reduced motion variants
const reducedMotionVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export function PageTransition({ children, className = '' }) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={shouldReduceMotion ? reducedMotionVariants : pageVariants}
      className={className}
      style={{ 
        perspective: '1200px',
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </motion.div>
  );
}

// Modal overlay animation
export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15 }
  },
};

// Modal content animation - book page flip in
export const modalVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
    y: 20,
    rotateX: -5,
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    transition: { 
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 }
  },
};

// Staggered list animation for cards
export const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const listItemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    }
  },
};

// Card hover animation - gentle lift like paper
export const cardHoverVariants = {
  rest: {
    y: 0,
    scale: 1,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  hover: {
    y: -6,
    scale: 1.01,
    boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
  tap: {
    y: -2,
    scale: 0.99,
  },
};

// Fade in animation for elements
export function FadeIn({ children, delay = 0, className = '', direction = 'up' }) {
  const shouldReduceMotion = useReducedMotion();
  
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directions[direction],
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0,
      }}
      transition={{ 
        duration: shouldReduceMotion ? 0.1 : 0.5, 
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Ink reveal animation for text generation
export function InkReveal({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(4px)' }}
      animate={{ 
        opacity: 1, 
        filter: 'blur(0px)',
      }}
      transition={{
        duration: 0.8,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Sparkle effect component
export function Sparkle({ delay = 0, size = 4, color = 'var(--warm-400)' }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1.2, 0],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 1.5,
        delay,
        repeat: Infinity,
        repeatDelay: 3,
        ease: 'easeInOut',
      }}
    />
  );
}

// Default export for convenience
export default PageTransition;
