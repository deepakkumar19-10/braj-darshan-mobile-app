/**
 * The current time, refreshed every minute and whenever the app comes back to the
 * foreground, so "open now" badges, today's Panchang and festival countdowns stay
 * correct on a screen that stays mounted (Home sits at the bottom of the stack).
 */

import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

export function useNow(intervalMs = 60000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const timer = setInterval(tick, intervalMs);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [intervalMs]);

  return now;
}

export default useNow;
