import { durationMinutes } from './duration';
import { countActivities } from './plural';
import {
  date,
  duration,
  empty,
  number,
  text,
  time,
  withFormula,
  type ReportCell,
  type ReportSheet,
  type ReportWorkbook,
} from './reportModel';
import { fromWallClock, spansDstChange, toWallClock } from './time';

export const MONTH_NAMES = [
  'Leden',
  'Únor',
  'Březen',
  'Duben',
  'Květen',
  'Červen',
  'Červenec',
  'Srpen',
  'Září',
  'Říjen',
  'Listopad',
  'Prosinec',
] as const;

export interface ReportCustomer {
  name: string;
  ico: string;
  dic: string;
  address: string;
}

export interface ReportAuthor {
  name: string;
  email: string;
}

/** Do výkazu jdou jen ukončené činnosti, proto je `end` povinný. */
export interface ReportActivity {
  name: string;
  start: Date;
  end: Date;
  invoiced: boolean;
  invoiceDate: Date | null;
  note: string;
}

export type ReportPeriod =
  { kind: 'month'; year: number; month: number } | { kind: 'year'; year: number };

export interface ReportInput {
  customer: ReportCustomer;
  author: ReportAuthor;
  period: ReportPeriod;
  activities: ReportActivity[];
  /** Datum vystavení; předává se kvůli testovatelnosti. */
  issuedAt: Date;
}

const pad2 = (value: number): string => String(value).padStart(2, '0');

/** „Čermák Media, s.r.o." → „Cermak_Media_s_r_o" */
export function customerSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function reportFileName(customerName: string, period: ReportPeriod): string {
  const slug = customerSlug(customerName) || 'Zakaznik';
  const suffix =
    period.kind === 'month' ? `${period.year}-${pad2(period.month)}` : String(period.year);
  return `Vykaz_${slug}_${suffix}.xlsx`;
}

/**
 * Hranice období v pražské zóně, polootevřený interval [od, do).
 *
 * Přetečení měsíce řeší `Date.UTC` samo: měsíc 13 je leden následujícího roku.
 */
export function periodRange(period: ReportPeriod): { from: Date; to: Date } {
  const startMonth = period.kind === 'month' ? period.month : 1;
  const endMonth = period.kind === 'month' ? period.month + 1 : 13;
  return {
    from: fromWallClock({ year: period.year, month: startMonth, day: 1, hour: 0, minute: 0 }),
    to: fromWallClock({ year: period.year, month: endMonth, day: 1, hour: 0, minute: 0 }),
  };
}

export function periodLabel(period: ReportPeriod): string {
  return period.kind === 'month'
    ? `${MONTH_NAMES[period.month - 1]} ${period.year}`
    : `Rok ${period.year}`;
}

/** Doba jako zlomek dne — tak Excel ukládá čas. */
function durationDays(activity: ReportActivity): number {
  return durationMinutes(activity.start, activity.end) / (24 * 60);
}

const MONTH_COLUMN_WIDTHS = [12, 30, 9, 9, 12, 14, 12, 30];
const SUMMARY_COLUMN_WIDTHS = [14, 16, 18, 20, 22, 16];

/** Hlavička souboru: řádky 1–9, tabulka pak začíná na řádku 10. */
function metaRows(input: ReportInput, periodText: string): ReportCell[][] {
  const { customer, author, issuedAt } = input;
  const ico = [customer.ico, customer.dic].filter(Boolean).join(' / ');
  return [
    [text('PRACOVNÍ VÝKAZ', 'title')],
    [],
    [text('Zákazník', 'metaLabel'), text(customer.name, 'metaValueStrong')],
    [text('IČ / DIČ', 'metaLabel'), text(ico, 'metaValue')],
    [text('Adresa', 'metaLabel'), text(customer.address, 'metaValue')],
    [text('Období', 'metaLabel'), text(periodText, 'metaValueStrong')],
    [
      text('Vypracoval', 'metaLabel'),
      text([author.name, author.email].filter(Boolean).join(', '), 'metaValue'),
    ],
    [text('Vystaveno', 'metaLabel'), date(issuedAt, 'metaValue')],
    [],
  ];
}

const HEADER_ROW = 10;
const FIRST_DATA_ROW = HEADER_ROW + 1;

export interface MonthSheetResult {
  sheet: ReportSheet;
  count: number;
  /** 1-based číslo řádku „Celkem“. */
  totalRow: number;
  lastDataRow: number;
}

/**
 * Jeden list s rozpisem činností. Používá ho měsíční výkaz i každý měsíc
 * ročního výkazu, takže oba mají shodnou strukturu.
 *
 * Oddělovač argumentů ve vzorcích je čárka, i když ho Excel českému uživateli
 * ukáže jako středník. Ve formátu xlsx se vzorce ukládají vždy s čárkou;
 * se středníkem by je Excel odmítl otevřít.
 */
export function buildMonthSheet(
  input: ReportInput,
  sheetName: string,
  periodText: string,
): MonthSheetResult {
  const activities = [...input.activities].sort((a, b) => a.start.getTime() - b.start.getTime());
  const rows: ReportCell[][] = metaRows(input, periodText);

  rows.push(
    [
      'Datum',
      'Činnost',
      'Začátek',
      'Konec',
      'Doba [h:mm]',
      'Vyfakturováno',
      'DUZP',
      'Poznámka',
    ].map((label) => text(label, 'tableHeader')),
  );

  for (const activity of activities) {
    const row = rows.length + 1;
    const days = durationDays(activity);
    const durationCell = duration(days, 'data');
    rows.push([
      date(activity.start, 'data'),
      text(activity.name, 'data'),
      time(activity.start, 'dataCenter'),
      time(activity.end, 'dataCenter'),
      // Vzorec Konec − Začátek počítá s nástěnným časem, takže přes přechod
      // letního času dá jiné číslo než skutečná doba. V takovém řádku proto
      // zůstane jen hodnota spočítaná z absolutních okamžiků.
      spansDstChange(activity.start, activity.end)
        ? durationCell
        : withFormula(durationCell, `=D${row}-C${row}`),
      text(activity.invoiced ? 'Ano' : 'Ne', activity.invoiced ? 'invoicedYes' : 'invoicedNo'),
      date(activity.invoiceDate, 'dataCenter'),
      text(activity.note, 'dataMuted'),
    ]);
  }

  const lastDataRow = rows.length;
  const hasData = activities.length > 0;
  const totalDays = activities.reduce((sum, activity) => sum + durationDays(activity), 0);
  const invoicedDays = activities
    .filter((activity) => activity.invoiced)
    .reduce((sum, activity) => sum + durationDays(activity), 0);

  const totalRow = lastDataRow + 1;
  const range = `E${FIRST_DATA_ROW}:E${lastDataRow}`;
  rows.push([
    text('Celkem', 'total'),
    text(countActivities(activities.length), 'total'),
    empty('total'),
    empty('total'),
    // SUBTOTAL místo SUM, aby součet respektoval zapnutý automatický filtr.
    hasData
      ? withFormula(duration(totalDays, 'total'), `=SUBTOTAL(9,${range})`)
      : duration(0, 'total'),
    empty('total'),
    empty('total'),
    empty('total'),
  ]);

  rows.push([
    empty(),
    text('z toho vyfakturováno', 'dataMuted'),
    empty(),
    empty(),
    hasData
      ? withFormula(
          duration(invoicedDays, 'sumInvoiced'),
          `=SUMIFS(${range},F${FIRST_DATA_ROW}:F${lastDataRow},"Ano")`,
        )
      : duration(0, 'sumInvoiced'),
  ]);

  rows.push([
    empty(),
    text('z toho nevyfakturováno', 'dataMuted'),
    empty(),
    empty(),
    withFormula(
      duration(totalDays - invoicedDays, 'sumUninvoiced'),
      `=E${totalRow}-E${totalRow + 1}`,
    ),
  ]);

  rows.push([]);
  rows.push([empty(), text('Podpis zákazníka: ______________________', 'dataMuted')]);

  return {
    sheet: {
      name: sheetName,
      rows,
      columnWidths: MONTH_COLUMN_WIDTHS,
      freezeBelowRow: HEADER_ROW,
      autoFilter: hasData ? `A${HEADER_ROW}:H${lastDataRow}` : undefined,
    },
    count: activities.length,
    totalRow,
    lastDataRow,
  };
}

export function buildMonthlyReport(input: ReportInput): ReportWorkbook {
  if (input.period.kind !== 'month') throw new Error('buildMonthlyReport čeká měsíční období.');
  const { year, month } = input.period;
  const { sheet } = buildMonthSheet(
    input,
    `Výkaz ${pad2(month)}-${year}`,
    periodLabel(input.period),
  );
  return { fileName: reportFileName(input.customer.name, input.period), sheets: [sheet] };
}

/** Do kterého měsíce (1–12) činnost patří podle pražského času jejího začátku. */
function monthOf(activity: ReportActivity): number {
  return toWallClock(activity.start).month;
}

export function buildYearlyReport(input: ReportInput): ReportWorkbook {
  if (input.period.kind !== 'year') throw new Error('buildYearlyReport čeká roční období.');
  const year = input.period.year;

  const byMonth = new Map<number, ReportActivity[]>();
  for (const activity of input.activities) {
    const month = monthOf(activity);
    const list = byMonth.get(month);
    if (list) list.push(activity);
    else byMonth.set(month, [activity]);
  }

  // Listy vznikají jen pro měsíce s daty, souhrn ukazuje všech dvanáct.
  const monthSheets = new Map<number, MonthSheetResult>();
  for (let month = 1; month <= 12; month += 1) {
    const activities = byMonth.get(month);
    if (!activities || activities.length === 0) continue;
    const sheetName = `${pad2(month)} ${MONTH_NAMES[month - 1]}`;
    monthSheets.set(
      month,
      buildMonthSheet(
        { ...input, activities, period: { kind: 'month', year, month } },
        sheetName,
        `${MONTH_NAMES[month - 1]} ${year}`,
      ),
    );
  }

  const rows: ReportCell[][] = metaRows(input, periodLabel(input.period));
  rows.push(
    [
      'Měsíc',
      'Počet činností',
      'Vykázáno [h:mm]',
      'Vyfakturováno [h:mm]',
      'Nevyfakturováno [h:mm]',
      'Poslední DUZP',
    ].map((label) => text(label, 'tableHeader')),
  );

  let totalCount = 0;
  let totalDays = 0;
  let totalInvoicedDays = 0;

  for (let month = 1; month <= 12; month += 1) {
    const row = rows.length + 1;
    const built = monthSheets.get(month);
    const activities = byMonth.get(month) ?? [];
    const monthName = MONTH_NAMES[month - 1] ?? '';
    const sumDays = activities.reduce((sum, activity) => sum + durationDays(activity), 0);
    const invoicedDays = activities
      .filter((activity) => activity.invoiced)
      .reduce((sum, activity) => sum + durationDays(activity), 0);
    const lastInvoiceDate = activities
      .map((activity) => activity.invoiceDate)
      .filter((value): value is Date => value !== null)
      .sort((a, b) => b.getTime() - a.getTime())[0];

    totalCount += activities.length;
    totalDays += sumDays;
    totalInvoicedDays += invoicedDays;

    if (built) {
      const sheetRef = `'${built.sheet.name}'`;
      rows.push([
        withFormula(text(monthName, 'monthLink'), `=HYPERLINK("#${sheetRef}!A1","${monthName}")`),
        withFormula(
          number(built.count, 'data'),
          `=COUNTA(${sheetRef}!B${FIRST_DATA_ROW}:B${built.lastDataRow})`,
        ),
        withFormula(duration(sumDays, 'data'), `=${sheetRef}!E${built.totalRow}`),
        duration(invoicedDays, 'sumInvoiced'),
        withFormula(
          duration(
            sumDays - invoicedDays,
            sumDays - invoicedDays > 0 ? 'uninvoicedHighlight' : 'data',
          ),
          `=C${row}-D${row}`,
        ),
        date(lastInvoiceDate ?? null, 'dataCenter'),
      ]);
    } else {
      rows.push([
        text(monthName, 'monthEmpty'),
        number(0, 'monthEmpty'),
        duration(0, 'monthEmpty'),
        duration(0, 'monthEmpty'),
        duration(0, 'monthEmpty'),
        empty('dataCenter'),
      ]);
    }
  }

  const firstMonthRow = HEADER_ROW + 1;
  const lastMonthRow = rows.length;
  rows.push([
    text(`Celkem ${year}`, 'total'),
    withFormula(number(totalCount, 'total'), `=SUM(B${firstMonthRow}:B${lastMonthRow})`),
    withFormula(duration(totalDays, 'total'), `=SUM(C${firstMonthRow}:C${lastMonthRow})`),
    withFormula(duration(totalInvoicedDays, 'total'), `=SUM(D${firstMonthRow}:D${lastMonthRow})`),
    withFormula(
      duration(totalDays - totalInvoicedDays, 'total'),
      `=SUM(E${firstMonthRow}:E${lastMonthRow})`,
    ),
    empty('total'),
  ]);

  const summary: ReportSheet = {
    name: `Souhrn ${year}`,
    rows,
    columnWidths: SUMMARY_COLUMN_WIDTHS,
    freezeBelowRow: HEADER_ROW,
    autoFilter: `A${HEADER_ROW}:F${lastMonthRow}`,
  };

  return {
    fileName: reportFileName(input.customer.name, input.period),
    sheets: [summary, ...[...monthSheets.values()].map((built) => built.sheet)],
  };
}

export function buildReport(input: ReportInput): ReportWorkbook {
  return input.period.kind === 'month' ? buildMonthlyReport(input) : buildYearlyReport(input);
}
