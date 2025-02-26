import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to detect scrolling in a scrollable element
 * @param threshold - Number of pixels to scroll before triggering (default: 10)
 * @param selector - CSS selector for the scrollable element (default: '[data-scrollable="true"]')
 * @returns Whether the element has been scrolled past the threshold
 */
export const useScrollDetection = (threshold = 10, selector = '[data-scrollable="true"]') => {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const findScrollableParent = () => {
      const scrollableElement = document.querySelector(selector);
      return scrollableElement || document.documentElement;
    };

    const scrollableParent = findScrollableParent();
    scrollRef.current = scrollableParent as HTMLElement;

    const handleScroll = () => {
      if (scrollRef.current) {
        setIsScrolled(scrollRef.current.scrollTop > threshold);
      }
    };

    scrollRef.current.addEventListener('scroll', handleScroll);

    // Initial check
    handleScroll();

    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [threshold, selector]);

  return isScrolled;
};
