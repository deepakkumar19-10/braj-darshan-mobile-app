import { useCallback, useRef } from 'react';

/**
 * Wraps a press handler so rapid double/rage taps run it only once.
 * Stops duplicate screens being pushed and duplicate links/calls being opened.
 */
export function usePressGuard(handler, delayMs = 700) {
  const lastPress = useRef(0);
  return useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastPress.current < delayMs) return;
      lastPress.current = now;
      if (handler) handler(...args);
    },
    [handler, delayMs]
  );
}

export default usePressGuard;
