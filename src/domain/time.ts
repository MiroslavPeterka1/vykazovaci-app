/**
 * Převody mezi absolutním okamžikem (`Date`) a pražským "nástěnným" časem.
 *
 * Tohle je jediné místo v aplikaci, kde se o zónách rozhoduje. Nikde jinde se
 * nesmí použít `new Date('2026-09-20T16:42')` ani `date.getHours()` — obojí
 * pracuje v zóně zařízení, takže na notebooku v jiné zemi by aplikace počítala
 * s jinými hodnotami, než jaké zobrazuje.
 */

export const TIME_ZONE = 'Europe/Prague';

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export interface WallClock {
  year: number;
  month: number; // 1–12
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** Rozloží okamžik na složky tak, jak je v danou chvíli ukazují hodiny v Praze. */
export function toWallClock(date: Date): WallClock {
  const parts = partsFormatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((p) => p.type === type);
    if (!part) throw new Error(`Intl nevrátil část ${type}.`);
    return Number(part.value);
  };
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
}

/** Posun pražské zóny proti UTC v milisekundách pro daný okamžik (+1 h / +2 h). */
export function zoneOffsetMs(date: Date): number {
  const w = toWallClock(date);
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
  return asUtc - date.getTime();
}

/**
 * Pražský nástěnný čas → okamžik.
 *
 * Dva průchody: první odhad použije posun platný v odhadnutém okamžiku, druhý
 * ho opraví, pokud odhad spadl na druhou stranu přechodu času.
 *
 * Hraniční případy (obojí je vědomé chování, ne chyba):
 * - Neexistující čas (29. 3. 2026 02:30, hodina se přeskočila) → posune se na 03:30.
 * - Dvojznačný čas (25. 10. 2026 02:30 nastane dvakrát) → bere se druhý výskyt,
 *   tedy už v zimním čase.
 */
export function fromWallClock(wall: Omit<WallClock, 'second'> & { second?: number }): Date {
  const asUtc = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second ?? 0,
  );
  let instant = asUtc - zoneOffsetMs(new Date(asUtc));
  instant = asUtc - zoneOffsetMs(new Date(instant));
  return new Date(instant);
}

const pad = (n: number): string => String(n).padStart(2, '0');

/** "20.09.2026 16:42" */
export function formatDateTime(date: Date | null | undefined): string {
  if (!date) return '—';
  const w = toWallClock(date);
  return `${pad(w.day)}.${pad(w.month)}.${w.year} ${pad(w.hour)}:${pad(w.minute)}`;
}

/** "20.09.2026" */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return '—';
  const w = toWallClock(date);
  return `${pad(w.day)}.${pad(w.month)}.${w.year}`;
}

/** Hodnota pro `<input type="datetime-local">`, tedy "2026-09-20T16:42". */
export function toDateTimeLocalValue(date: Date | null | undefined): string {
  if (!date) return '';
  const w = toWallClock(date);
  return `${w.year}-${pad(w.month)}-${pad(w.day)}T${pad(w.hour)}:${pad(w.minute)}`;
}

/** Hodnota z `<input type="datetime-local">` → okamžik. Prázdný vstup dá null. */
export function fromDateTimeLocalValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value.trim());
  if (!match) return null;
  const [, year, month, day, hour, minute] = match as unknown as string[];
  return fromWallClock({
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
  });
}

/** Hodnota pro `<input type="date">`, tedy "2026-09-20". */
export function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return '';
  const w = toWallClock(date);
  return `${w.year}-${pad(w.month)}-${pad(w.day)}`;
}

/** Hodnota z `<input type="date">` → pražská půlnoc daného dne. Používá se pro DUZP. */
export function fromDateInputValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, year, month, day] = match as unknown as string[];
  return fromWallClock({
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: 0,
    minute: 0,
  });
}

/** Pražská půlnoc prvního dne měsíce, ve kterém leží `date`. Pro statistiky "tento měsíc". */
export function startOfMonth(date: Date): Date {
  const w = toWallClock(date);
  return fromWallClock({ year: w.year, month: w.month, day: 1, hour: 0, minute: 0 });
}

/**
 * True, pokud mezi začátkem a koncem došlo ke změně letního/zimního času.
 * Modál činnosti u takové doby zobrazuje poznámku "zahrnuje změnu času".
 */
export function spansDstChange(start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  return zoneOffsetMs(start) !== zoneOffsetMs(end);
}
