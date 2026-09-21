import { useEffect, useState } from 'react';

/**
 * Aktuální čas, který se sám obnovuje — sloupec „Běží“ u spuštěných činností
 * se tak posouvá bez zásahu uživatele. Interval odpovídá prototypu.
 */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
