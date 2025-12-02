// Premium Animation Variants for Debloat AI
// Apple-inspired microinteractions

export const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1] // macOS-style easing
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    transition: {
      duration: 0.2
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
      ease: 'easeOut'
    }
  },
  hover: {
    y: -4,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    borderColor: 'rgba(46,196,182,0.15)',
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

export const cardHoverDark = {
  rest: {
    y: 0,
    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  hover: {
    y: -4,
    boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 0 20px rgba(88,166,175,0.12)',
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

export const buttonHover = {
  rest: {
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: 'easeOut'
    }
  },
  hover: {
    scale: 1.04,
    y: -1,
    transition: {
      duration: 0.15,
      ease: 'easeOut'
    }
  },
  tap: {
    scale: 0.97,
    y: 0,
    transition: {
      duration: 0.08,
      ease: 'easeInOut'
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
      staggerChildren: 0.03,
      delayChildren: 0.05
    }
  }
};

export const packageListItem = {
  hidden: { opacity: 0, y: 10 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const iconRotate = {
  rest: { rotate: 0 },
  hover: { 
    rotate: 10,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
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
      ease: 'easeOut'
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
      ease: 'easeInOut'
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
      ease: 'easeInOut'
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
      ease: 'easeOut'
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
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const spinConnect = {
  connecting: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  },
  connected: {
    rotate: 90,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};
