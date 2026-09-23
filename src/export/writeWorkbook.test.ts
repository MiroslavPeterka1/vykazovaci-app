import { describe, expect, it } from 'vitest';

import { buildMonthlyReport, buildYearlyReport, type ReportInput } from '../domain/workReport';
import { fromDateTimeLocalValue } from '../domain/time';
import { buildXlsx } from './writeWorkbook';

// Testy běží pod TZ=America/New_York. Vygenerovaný soubor se tu znovu načte,
// takže se ověřuje skutečný obsah sešitu, ne jen moje představa o něm.

const at = (value: string): Date => fromDateTimeLocalValue(value)!;

const input: ReportInput = {
  customer: {
    name: 'Horizont IT s.r.o.',
    ico: '27183945',
    dic: 'CZ27183945',
    address: 'Vinohradská 42, Praha 2',
  },
  author: { name: 'Miroslav Peterka', email: 'mp@example.cz' },
  period: { kind: 'month', year: 2026, month: 8 },
  activities: [
    {
      name: 'Vývoj API',
      start: at('2026-08-03T09:00'),
      end: at('2026-08-03T11:30'),
      invoiced: true,
      invoiceDate: at('2026-09-05T00:00'),
      note: 'Faktura 2026/0143',
    },
  ],
  issuedAt: at('2026-09-23T10:00'),
};

/**
 * Doba je v sešitu číslo (zlomek dne) s formátem [h]:mm. ExcelJS ji při čtení
 * rehydratuje na datum od excelovské epochy 30. 12. 1899, takže zpátky na
 * hodiny se dostaneme rozdílem od ní.
 */
const EXCEL_EPOCH = Date.UTC(1899, 11, 30);
const excelHours = (value: unknown): number =>
  (new Date(value as Date).getTime() - EXCEL_EPOCH) / 3_600_000;

async function load(blob: Blob) {
  const ExcelJS = await import('exceljs');
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(await blob.arrayBuffer());
  return book;
}

describe('zápis sešitu', () => {
  it('vytvoří list se jménem podle období', async () => {
    const book = await load(await buildXlsx(buildMonthlyReport(input)));
    expect(book.worksheets.map((sheet) => sheet.name)).toEqual(['Výkaz 08-2026']);
  });

  it('zapíše hlavičku souboru a tabulky tam, kde je čeká souhrn', async () => {
    const book = await load(await buildXlsx(buildMonthlyReport(input)));
    const sheet = book.worksheets[0]!;
    expect(sheet.getCell('A1').value).toBe('PRACOVNÍ VÝKAZ');
    expect(sheet.getCell('B3').value).toBe('Horizont IT s.r.o.');
    expect(sheet.getCell('B4').value).toBe('27183945 / CZ27183945');
    expect(sheet.getCell('B6').value).toBe('Srpen 2026');
    expect(sheet.getCell('A10').value).toBe('Datum');
    expect(sheet.getCell('H10').value).toBe('Poznámka');
  });

  it('časy jsou v pražské zóně, ne v UTC ani v zóně stroje', async () => {
    const book = await load(await buildXlsx(buildMonthlyReport(input)));
    const sheet = book.worksheets[0]!;
    // Činnost začala v 9:00 pražského času, což je 07:00 UTC. V buňce musí
    // stát 9:00, jinak by výkaz ukazoval jiné časy, než uživatel zadal.
    expect((sheet.getCell('C11').value as Date).toISOString()).toBe('2026-08-03T09:00:00.000Z');
    expect((sheet.getCell('D11').value as Date).toISOString()).toBe('2026-08-03T11:30:00.000Z');
    expect((sheet.getCell('A11').value as Date).toISOString()).toBe('2026-08-03T00:00:00.000Z');
  });

  it('doba je číslo s formátem [h]:mm a nese vzorec', async () => {
    const book = await load(await buildXlsx(buildMonthlyReport(input)));
    const cell = book.worksheets[0]!.getCell('E11');
    expect(cell.numFmt).toBe('[h]:mm');
    expect((cell.value as { formula: string }).formula).toBe('=D11-C11');
    expect(excelHours((cell.value as { result: unknown }).result)).toBeCloseTo(2.5, 6);
  });

  it('součtové vzorce přežijí zápis i načtení', async () => {
    const book = await load(await buildXlsx(buildMonthlyReport(input)));
    const sheet = book.worksheets[0]!;
    expect((sheet.getCell('E12').value as { formula: string }).formula).toBe(
      '=SUBTOTAL(9,E11:E11)',
    );
    expect((sheet.getCell('E13').value as { formula: string }).formula).toBe(
      '=SUMIFS(E11:E11,F11:F11,"Ano")',
    );
  });

  it('řádek Celkem nese součet v hodinách', async () => {
    const book = await load(await buildXlsx(buildMonthlyReport(input)));
    const total = book.worksheets[0]!.getCell('E12');
    expect(excelHours((total.value as { result: unknown }).result)).toBeCloseTo(2.5, 6);
  });

  it('nastaví ukotvení příček a automatický filtr', async () => {
    const book = await load(await buildXlsx(buildMonthlyReport(input)));
    const sheet = book.worksheets[0]!;
    expect(sheet.views[0]).toMatchObject({ state: 'frozen', ySplit: 10 });
    expect(sheet.autoFilter).toBeTruthy();
  });

  it('roční výkaz má souhrn a listy měsíců s daty', async () => {
    const yearly = buildYearlyReport({
      ...input,
      period: { kind: 'year', year: 2026 },
      activities: [
        ...input.activities,
        {
          name: 'Konzultace',
          start: at('2026-03-02T08:00'),
          end: at('2026-03-02T10:00'),
          invoiced: false,
          invoiceDate: null,
          note: '',
        },
      ],
    });
    const book = await load(await buildXlsx(yearly));
    expect(book.worksheets.map((sheet) => sheet.name)).toEqual([
      'Souhrn 2026',
      '03 Březen',
      '08 Srpen',
    ]);
    const summary = book.worksheets[0]!;
    expect((summary.getCell('A18').value as { formula: string }).formula).toBe(
      '=HYPERLINK("#\'08 Srpen\'!A1","Srpen")',
    );
  });
});
