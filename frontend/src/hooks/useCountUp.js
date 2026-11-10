import { useState, useEffect } from 'react';

export const useCountUp = (targetValue, duration = 800) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion || targetValue === 0 || targetValue === null || targetValue === undefined) {
      setCount(targetValue || 0);
      return;
    }

    const numTarget = typeof targetValue === 'number' ? targetValue : parseInt(targetValue, 10);
    if (isNaN(numTarget)) {
      setCount(targetValue);
      return;
    }

    let startTime = null;
    let animationFrameId = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Ease-out quad
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(easedProgress * numTarget);
      
      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(numTarget);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [targetValue, duration]);

  return count;
};
