import { Variants } from 'framer-motion';

export const useAboutAnimations = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const sectionVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 15,
      }
    },
  };

  const titleVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.2
      }
    }
  };

  const copyrightVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 1.5,
        duration: 0.8
      }
    }
  };

  return {
    containerVariants,
    sectionVariants,
    titleVariants,
    contentVariants,
    copyrightVariants
  };
};

export const useHowItWorksAnimations = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const stepVariants: Variants = {
    hidden: {
      x: -100,
      opacity: 0
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
        duration: 0.5,
      }
    },
  };

  const sectionTitleVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.9
      }
    }
  };

  const flowImageVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 1.5
      }
    }
  };

  return {
    containerVariants,
    stepVariants,
    sectionTitleVariants,
    imageVariants,
    flowImageVariants
  };
};

export const useCommonAnimations = () => {
  const fadeInVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const fadeInUpVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const fadeInLeftVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const interactiveVariants: Variants = {
    hover: {
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 10
      }
    },
    tap: {
      scale: 0.95
    }
  };

  return {
    fadeInVariants,
    fadeInUpVariants,
    fadeInLeftVariants,
    interactiveVariants
  };
};
