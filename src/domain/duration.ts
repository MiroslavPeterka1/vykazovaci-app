/** Výpočet a formátování vykázané doby. */

/**
 * Doba v minutách mezi dvěma okamžiky, zaokrouhlená na celé minuty.
 *
 * Počítá se z absolutních okamžiků, proto vyjde správně i přes změnu času:
 * 24. 10. 2026 22:00 → 25. 10. 2026 06:00 je 9 hodin, protože ten den má 25 hodin.
 */
export function durationMinutes(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 60_000);
}

/**
 * Minuty → "HH:MM". Hodiny mohou přesáhnout 24 (dlouhá činnost se nezalamuje do dnů).
 * Záporná hodnota se ořezává na nulu — validace konce před začátkem je jinde.
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return '—';
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/** Doba činnosti pro zobrazení: u běžící se počítá k `now`, u ukončené z jejího konce. */
export function activityDuration(start: Date, end: Date | null, now: Date): number {
  return durationMinutes(start, end ?? now);
}
