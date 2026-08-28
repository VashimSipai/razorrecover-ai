import { useEffect, useRef } from 'react';

/**
 * Custom React hook to periodically poll an async callback function.
 * @param {Function} callback - The async function to execute on each interval
 * @param {number} delayMs - Interval duration in milliseconds (pass null to pause)
 */
export function usePolling(callback, delayMs = 15000) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null) return;
    
    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };

    tick(); // Execute immediately on mount
    const id = setInterval(tick, delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
}
