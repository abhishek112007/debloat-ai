// Premium Animation Variants for Debloat AI
// Apple-inspired microinteractions with enhanced polish

// Custom easing curves - typed properly for framer-motion
export const easings = {
  smooth: [0.22, 1, 0.36, 1] as const,      // macOS-style
  bounce: [0.68, -0.55, 0.265, 1.55] as const, // Playful bounce
  snappy: [0.4, 0, 0.2, 1] as const,       // Material Design
  elastic: [0.68, -0.6, 0.32, 1.6] as const, // Elastic snap
};

export const pageTransition = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: easings.smooth
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    y: -10,
    transition: {
      duration: 0.2
    }
  }
};

// Staggered container for lists
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1
    }
  }
};

// Individual stagger items
export const staggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: easings.smooth
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

// Notification slide animations
export const notificationSlide = {
  initial: { opacity: 0, x: 100, scale: 0.8 },
  animate: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    x: 100, 
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: easings.snappy
    }
  }
};

// Floating action bar animation
export const floatingBar = {
  initial: { opacity: 0, y: 50, scale: 0.9 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    y: 50, 
    scale: 0.9,
    transition: {
      duration: 0.25,
      ease: easings.snappy
    }
  }
};

// Icon micro-interactions
export const iconBounce = {
  rest: { scale: 1, rotate: 0 },
  hover: { 
    scale: 1.2,
    rotate: 5,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 15
    }
  },
  tap: { 
    scale: 0.9,
    rotate: -5,
    transition: {
      duration: 0.1
    }
  }
};

// Pulse animation for status indicators
export const pulseStatus = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const
    }
  }
};

// Shimmer loading effect
export const shimmerEffect = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear' as const
    }
  }
};

// Scale up on enter
export const scaleUp = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20
    }
  },
  exit: { 
    scale: 0.8, 
    opacity: 0,
    transition: {
      duration: 0.15
    }
  }
};

export const cardHover = {
  rest: {
    y: 0,
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    borderColor: 'rgba(0,0,0,0.05)',
    transition: {
      duration: 0.2,
      ease: 'easeOut' as const
    }
  },
  hover: {
    y: -4,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    borderColor: 'rgba(46,196,182,0.15)',
    transition: {
      duration: 0.2,
      ease: 'easeOut' as const
    }
  }
};

export const cardHoverDark = {
  rest: {
    y: 0,
    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
    transition: {
      duration: 0.2,
      ease: 'easeOut' as const
    }
  },
  hover: {
    y: -4,
    boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 0 20px rgba(88,166,175,0.12)',
    transition: {
      duration: 0.2,
      ease: 'easeOut' as const
    }
  }
};

export const buttonHover = {
  rest: {
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: 'easeOut' as const
    }
  },
  hover: {
    scale: 1.04,
    y: -1,
    transition: {
      duration: 0.15,
      ease: 'easeOut' as const
    }
  },
  tap: {
    scale: 0.97,
    y: 0,
    transition: {
      duration: 0.08,
      ease: 'easeInOut' as const
    }
  }
};

export const glowButton = {
  rest: {
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: {
      duration: 0.2
    }
  },
  hover: {
    boxShadow: '0 4px 16px rgba(46,196,182,0.25), 0 0 20px rgba(46,196,182,0.15)',
    transition: {
      duration: 0.2
    }
  }
};

export const glowButtonDark = {
  rest: {
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: {
      duration: 0.2
    }
  },
  hover: {
    boxShadow: '0 4px 16px rgba(88,166,175,0.25), 0 0 20px rgba(88,166,175,0.15)',
    transition: {
      duration: 0.2
    }
  }
};

export const packageListContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.015,
      delayChildren: 0.02
    }
  }
};

export const packageListItem = {
  hidden: { opacity: 0, y: 6 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.15,
      ease: easings.smooth
    }
  }
};

export const iconRotate = {
  rest: { rotate: 0 },
  hover: { 
    rotate: 10,
    transition: {
      duration: 0.2,
      ease: 'easeOut' as const
    }
  }
};

export const slideIn = {
  hidden: { x: -10, opacity: 0 },
  show: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut' as const
    }
  }
};

export const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 12px rgba(46,196,182,0.15)',
      '0 0 24px rgba(46,196,182,0.25)',
      '0 0 12px rgba(46,196,182,0.15)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const
    }
  }
};

export const pulseGlowDark = {
  animate: {
    boxShadow: [
      '0 0 12px rgba(88,166,175,0.12)',
      '0 0 24px rgba(88,166,175,0.20)',
      '0 0 12px rgba(88,166,175,0.12)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const
    }
  }
};

export const filterChipTap = {
  rest: { scale: 1 },
  tap: { 
    scale: 0.95,
    transition: {
      duration: 0.08
    }
  }
};

export const successGlow = {
  initial: { boxShadow: '0 0 0px rgba(16,185,129,0)' },
  animate: {
    boxShadow: [
      '0 0 0px rgba(16,185,129,0)',
      '0 0 30px rgba(16,185,129,0.4)',
      '0 0 0px rgba(16,185,129,0)'
    ],
    transition: {
      duration: 1,
      ease: 'easeOut' as const
    }
  }
};

export const magneticHover = {
  whileHover: {
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  },
  whileTap: {
    scale: 0.98
  }
};

export const tiltCard = {
  rest: {
    rotateX: 0,
    rotateY: 0
  },
  hover: {
    rotateX: 2,
    rotateY: -2,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 10
    }
  }
};

export const fadeSlideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

export const spinConnect = {
  connecting: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear' as const
    }
  },
  connected: {
    rotate: 90,
    transition: {
      duration: 0.3,
      ease: easings.smooth
    }
  }
};

// Modal animations
export const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

export const modalContent = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 30
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20,
    transition: {
      duration: 0.15
    }
  }
};

// Checkbox animation
export const checkboxSpring = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 20
    }
  },
  exit: { 
    scale: 0, 
    opacity: 0,
    transition: {
      duration: 0.1
    }
  }
};

// Progress bar fill
export const progressFill = {
  initial: { width: '0%' },
  animate: (width: number) => ({
    width: `${width}%`,
    transition: {
      duration: 0.8,
      ease: easings.smooth
    }
  })
};

// Counter number animation (for stats)
export const counterPop = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.3,
      ease: easings.bounce
    }
  }
};

// Ripple effect for buttons
export const rippleEffect = {
  initial: { scale: 0, opacity: 0.5 },
  animate: { 
    scale: 4, 
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
};

// Slide in from different directions
export const slideInFromLeft = {
  initial: { x: -50, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easings.smooth
    }
  },
  exit: { 
    x: -50, 
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

export const slideInFromRight = {
  initial: { x: 50, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easings.smooth
    }
  },
  exit: { 
    x: 50, 
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

export const slideInFromBottom = {
  initial: { y: 30, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easings.smooth
    }
  },
  exit: { 
    y: 30, 
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

// Hover glow effect
export const hoverGlow = (color: string = 'rgba(46,196,182,0.3)') => ({
  rest: {
    boxShadow: `0 0 0 ${color.replace('0.3', '0')}`
  },
  hover: {
    boxShadow: `0 0 20px ${color}`,
    transition: {
      duration: 0.3
    }
  }
});

// Typewriter effect settings
export const typewriter = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: {
      delay: i * 0.03
    }
  })
};

// Rotate on hover
export const rotateOnHover = {
  rest: { rotate: 0 },
  hover: { 
    rotate: 180,
    transition: {
      duration: 0.4,
      ease: easings.smooth
    }
  }
};

// Wiggle animation
export const wiggle = {
  animate: {
    rotate: [0, -3, 3, -3, 3, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut'
    }
  }
};

// Breathing animation
export const breathing = {
  animate: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Success checkmark animation
export const successCheck = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { 
    pathLength: 1, 
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: easings.smooth
    }
  }
};

// Card 3D tilt effect
export const card3DTilt = {
  rest: {
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    transition: {
      duration: 0.3
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.3
    }
  }
};

// List item with stagger
export const listItemVariant = {
  hidden: { 
    opacity: 0, 
    x: -20,
    filter: 'blur(4px)'
  },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: easings.smooth
    }
  }),
  exit: {
    opacity: 0,
    x: 20,
    filter: 'blur(4px)',
    transition: {
      duration: 0.2
    }
  }
};
