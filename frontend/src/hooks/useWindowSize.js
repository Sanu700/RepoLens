import { useState, useEffect } from 'react';

export default function useWindowSize() {
  // Safe default — never reference window at module level
  const [size, setSize] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    // Set real size immediately on mount
    const update = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    update();

    // Debounced resize to avoid jank
    let timer;
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(update, 120);
    };
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
      clearTimeout(timer);
    };
  }, []);

  return {
    width: size.width,
    isMobile: size.width < 600,
    isTablet: size.width < 900,
  };
}
