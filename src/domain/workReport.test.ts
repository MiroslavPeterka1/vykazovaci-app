import { describe, expect, it } from 'vitest';

import {
  buildMonthlyReport,
  buildYearlyReport,
  customerSlug,
  periodRange,
  reportFileName,
  type ReportActivity,
  type ReportInput,
} from './workReport';
import type { ReportCell } from './reportModel';
import { fromDateTimeLocalValue } from './time';

// Testy běží pod TZ=America/New_York, takže hranice období i zařazení do měsíce
// musí vycházet z pražské zóny, ne z nastavení stroje.

const at = (value: string): Date => fromDateTimeLocalValue(value)!;

function activity(overrides: Partial<ReportActivity> = {}): ReportActivity {
  return {
    name: 'Vývoj API',
    start: at('2026-08-03T09:00'),
    end: at('2026-08-03T11:30'),
    invoiced: false,
    invoiceDate: null,
    note: '',
    ...overrides,
  };
}

function input(overrides: Partial<ReportInput> = {}): ReportInput {
  return {
    customer: {
      name: 'Horizont IT s.r.o.',
      ico: '27183945',
      dic: 'CZ27183945',
      address: 'Vinohradská 42, Praha 2',
    },
    author: { name: 'Miroslav Peterka', email: 'mp@example.cz' },
    period: { kind: 'month', year: 2026, month: 8 },
    activities: [activity()],
    issuedAt: at('2026-09-23T10:00'),
    ...overrides,
  };
}

const cellAt = (rows: ReportCell[][], row: number, column: number): ReportCell | undefined =>
  rows[row - 1]?.[column];

describe('customerSlug a název souboru', () => {
  it('odstraní diakritiku a nealfanumerické znaky', () => {
    expect(customerSlug('Čermák Media, s.r.o.')).toBe('Cermak_Media_s_r_o');
    expect(customerSlug('  Žížala & Syn  ')).toBe('Zizala_Syn');
  });

  it('poskládá název souboru pro měsíc i rok', () => {
    expect(reportFileName('Horizont IT', { kind: 'month', year: 2026, month: 8 })).toBe(
      'Vykaz_Horizont_IT_2026-08.xlsx',
    );
    expect(reportFileName('Horizont IT', { kind: 'year', year: 2026 })).toBe(
      'Vykaz_Horizont_IT_2026.xlsx',
    );
  });

  it('zákazník bez použitelných znaků dostane náhradní název', () => {
    expect(reportFileName('※※', { kind: 'year', year: 2026 })).toBe('Vykaz_Zakaznik_2026.xlsx');
  });
});

describe('periodRange', () => {
  it('měsíc ohraničí pražskou půlnocí', () => {
    const { from, to } = periodRange({ kind: 'month', year: 2026, month: 8 });
    expect(from.toISOString()).toBe('2026-07-31T22:00:00.000Z');
    expect(to.toISOString()).toBe('2026-08-31T22:00:00.000Z');
  });

  it('prosinec přeteče do ledna dalšího roku', () => {
    const { from, to } = periodRange({ kind: 'month', year: 2026, month: 12 });
    expect(from.toISOString()).toBe('2026-11-30T23:00:00.000Z');
    expect(to.toISOString()).toBe('2026-12-31T23:00:00.000Z');
  });

  it('rok jde od ledna do ledna', () => {
    const { from, to } = periodRange({ kind: 'year', year: 2026 });
    expect(from.toISOString()).toBe('2025-12-31T23:00:00.000Z');
    expect(to.toISOString()).toBe('2026-12-31T23:00:00.000Z');
  });
});

describe('měsíční výkaz', () => {
  it('má hlavičku souboru na řádcích 1–9 a hlavičku tabulky na řádku 10', () => {
    const { sheets } = buildMonthlyReport(input());
    const rows = sheets[0]!.rows;
    expect(cellAt(rows, 1, 0)?.value).toEqual({ type: 'text', text: 'PRACOVNÍ VÝKAZ' });
    expect(cellAt(rows, 6, 1)?.value).toEqual({ type: 'text', text: 'Srpen 2026' });
    expect(cellAt(rows, 10, 0)?.value).toEqual({ type: 'text', text: 'Datum' });
    expect(cellAt(rows, 10, 4)?.value).toEqual({ type: 'text', text: 'Doba [h:mm]' });
  });

  it('data začínají na řádku 11 a doba je vzorec Konec − Začátek', () => {
    const { sheets } = buildMonthlyReport(input());
    const rows = sheets[0]!.rows;
    expect(cellAt(rows, 11, 4)?.formula).toBe('=D11-C11');
    expect(cellAt(rows, 11, 4)?.value).toEqual({ type: 'duration', days: 2.5 / 24 });
  });

  it('součty odkazují na správný rozsah datových řádků', () => {
    const activities = [activity(), activity({ invoiced: true }), activity()];
    const { sheets } = buildMonthlyReport(input({ activities }));
    const rows = sheets[0]!.rows;
    // 3 činnosti → řádky 11–13, Celkem na 14, pod tím 15 a 16.
    expect(cellAt(rows, 14, 4)?.formula).toBe('=SUBTOTAL(9,E11:E13)');
    expect(cellAt(rows, 15, 4)?.formula).toBe('=SUMIFS(E11:E13,F11:F13,"Ano")');
    expect(cellAt(rows, 16, 4)?.formula).toBe('=E14-E15');
    expect(cellAt(rows, 14, 1)?.value).toEqual({ type: 'text', text: '3 činnosti' });
  });

  it('vzorce používají čárku, ne středník — tak se ukládají do xlsx', () => {
    const { sheets } = buildMonthlyReport(input({ activities: [activity()] }));
    const formulas = sheets[0]!.rows
      .flat()
      .map((cell) => cell.formula)
      .filter((formula): formula is string => Boolean(formula));
    expect(formulas.length).toBeGreaterThan(0);
    for (const formula of formulas) expect(formula).not.toContain(';');
  });

  it('činnost přes změnu času nese jen hodnotu, vzorec by dal jiný výsledek', () => {
    const dst = activity({
      start: at('2026-10-24T22:00'),
      end: at('2026-10-25T06:00'),
    });
    const { sheets } = buildMonthlyReport(
      input({ period: { kind: 'month', year: 2026, month: 10 }, activities: [dst] }),
    );
    const cell = cellAt(sheets[0]!.rows, 11, 4);
    expect(cell?.formula).toBeUndefined();
    expect(cell?.value).toEqual({ type: 'duration', days: 9 / 24 });
  });

  it('prázdné období dá jen hlavičku, bez filtru a bez součtových vzorců', () => {
    const { sheets } = buildMonthlyReport(input({ activities: [] }));
    const sheet = sheets[0]!;
    expect(sheet.autoFilter).toBeUndefined();
    expect(cellAt(sheet.rows, 11, 0)?.value).toEqual({ type: 'text', text: 'Celkem' });
    expect(cellAt(sheet.rows, 11, 4)?.formula).toBeUndefined();
    expect(cellAt(sheet.rows, 11, 1)?.value).toEqual({ type: 'text', text: '0 činností' });
  });

  it('ukotvuje příčky pod hlavičkou tabulky a filtruje rozsah dat', () => {
    const { sheets } = buildMonthlyReport(input({ activities: [activity(), activity()] }));
    expect(sheets[0]!.freezeBelowRow).toBe(10);
    expect(sheets[0]!.autoFilter).toBe('A10:H12');
  });
});

describe('roční výkaz', () => {
  const yearInput = () =>
    input({
      period: { kind: 'year', year: 2026 },
      activities: [
        activity({ start: at('2026-03-02T08:00'), end: at('2026-03-02T10:00') }),
        activity({
          start: at('2026-08-03T09:00'),
          end: at('2026-08-03T11:30'),
          invoiced: true,
          invoiceDate: at('2026-09-05T00:00'),
        }),
        activity({ start: at('2026-08-04T09:00'), end: at('2026-08-04T10:00') }),
      ],
    });

  it('má souhrn a list jen pro měsíce s daty', () => {
    const { sheets } = buildYearlyReport(yearInput());
    expect(sheets.map((sheet) => sheet.name)).toEqual(['Souhrn 2026', '03 Březen', '08 Srpen']);
  });

  it('souhrn vypíše všech dvanáct měsíců', () => {
    const { sheets } = buildYearlyReport(yearInput());
    const rows = sheets[0]!.rows;
    expect(cellAt(rows, 11, 0)?.value).toEqual({ type: 'text', text: 'Leden' });
    expect(cellAt(rows, 22, 0)?.value).toEqual({ type: 'text', text: 'Prosinec' });
    // Prázdný měsíc nemá odkaz.
    expect(cellAt(rows, 11, 0)?.formula).toBeUndefined();
  });

  it('měsíc s daty odkazuje na svůj list a bere z něj počet i součet', () => {
    const { sheets } = buildYearlyReport(yearInput());
    const rows = sheets[0]!.rows;
    // Srpen je osmý měsíc → řádek 18, má dvě činnosti → data 11–12, Celkem na 13.
    expect(cellAt(rows, 18, 0)?.formula).toBe('=HYPERLINK("#\'08 Srpen\'!A1","Srpen")');
    expect(cellAt(rows, 18, 1)?.formula).toBe("=COUNTA('08 Srpen'!B11:B12)");
    expect(cellAt(rows, 18, 2)?.formula).toBe("='08 Srpen'!E13");
    expect(cellAt(rows, 18, 4)?.formula).toBe('=C18-D18');
  });

  it('odkaz na součet míří opravdu na řádek Celkem v listu měsíce', () => {
    const { sheets } = buildYearlyReport(yearInput());
    const august = sheets.find((sheet) => sheet.name === '08 Srpen')!;
    const referenced = cellAt(sheets[0]!.rows, 18, 2)!.formula!;
    const row = Number(referenced.match(/E(\d+)$/)![1]);
    expect(cellAt(august.rows, row, 0)?.value).toEqual({ type: 'text', text: 'Celkem' });
  });

  it('řádek Celkem sčítá přes všech dvanáct měsíců', () => {
    const { sheets } = buildYearlyReport(yearInput());
    const rows = sheets[0]!.rows;
    expect(cellAt(rows, 23, 0)?.value).toEqual({ type: 'text', text: 'Celkem 2026' });
    expect(cellAt(rows, 23, 1)?.formula).toBe('=SUM(B11:B22)');
    expect(cellAt(rows, 23, 2)?.formula).toBe('=SUM(C11:C22)');
  });

  it('do měsíce zařadí činnost podle pražského času, ne podle UTC', () => {
    // 31. 8. 23:30 UTC je v Praze už 1. 9. 01:30 → patří do září.
    const late = activity({
      start: new Date('2026-08-31T23:30:00Z'),
      end: new Date('2026-09-01T00:30:00Z'),
    });
    const { sheets } = buildYearlyReport(
      input({ period: { kind: 'year', year: 2026 }, activities: [late] }),
    );
    expect(sheets.map((sheet) => sheet.name)).toEqual(['Souhrn 2026', '09 Září']);
  });
});
