import { useRef, useEffect } from 'react';

// Custom hook to manage undo timer for DeleteCharacterModal
export function useUndoTimer() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timerRef = useRef<any>(null);

  const setTimer = (callback: () => void, delay: number) => {
    timerRef.current = globalThis.setTimeout(callback, delay);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      globalThis.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return { setTimer, clearTimer };
}
