import type { ReportCell, ReportWorkbook } from '../domain/reportModel';
import { toWallClock } from '../domain/time';
import { CELL_STYLES } from './cellStyles';

/**
 * Převede popis sešitu na soubor .xlsx.
 *
 * ExcelJS se načítá dynamickým importem, protože jeho prohlížečový build má
 * kolem 260 kB gzip — víc než celý zbytek aplikace. Stáhne se až ve chvíli,
 * kdy si uživatel opravdu řekne o výkaz.
 */

const FONT = 'Calibri';
const FONT_SIZE = 11;

const NUMBER_FORMATS = {
  date: 'dd.mm.yyyy',
  time: 'hh:mm',
  duration: '[h]:mm',
} as const;

/**
 * ExcelJS ukládá `Date` podle jeho UTC složek. Aby buňka ukázala pražský čas,
 * předáváme datum, jehož UTC složky odpovídají pražskému nástěnnému času.
 *
 * `withTime: false` navíc čas ořízne — buňka s datem má nést jen den. Formát
 * dd.mm.rrrr by čas sice skryl, ale zůstal by v hodnotě a vylezl při každé
 * změně formátu nebo při porovnávání buněk.
 */
function asSpreadsheetDate(value: Date, withTime: boolean): Date {
  const wall = toWallClock(value);
  return new Date(
    Date.UTC(
      wall.year,
      wall.month - 1,
      wall.day,
      withTime ? wall.hour : 0,
      withTime ? wall.minute : 0,
      withTime ? wall.second : 0,
    ),
  );
}

interface WritableCell {
  value: unknown;
  numFmt?: string;
}

function toWritable(cell: ReportCell): WritableCell {
  switch (cell.value.type) {
    case 'empty':
      return { value: null };
    case 'text':
      return { value: cell.value.text || null };
    case 'number':
      return { value: cell.value.number };
    case 'date':
      return { value: asSpreadsheetDate(cell.value.date, false), numFmt: NUMBER_FORMATS.date };
    case 'time':
      return { value: asSpreadsheetDate(cell.value.date, true), numFmt: NUMBER_FORMATS.time };
    case 'duration':
      return { value: cell.value.days, numFmt: NUMBER_FORMATS.duration };
  }
}

export async function buildXlsx(workbook: ReportWorkbook): Promise<Blob> {
  const ExcelJS = await import('exceljs');
  const book = new ExcelJS.Workbook();
  book.creator = 'Vykazovátko';
  book.created = new Date();

  for (const sheetSpec of workbook.sheets) {
    const sheet = book.addWorksheet(sheetSpec.name);

    sheetSpec.columnWidths.forEach((width, index) => {
      sheet.getColumn(index + 1).width = width;
    });

    sheetSpec.rows.forEach((cells, rowIndex) => {
      cells.forEach((cellSpec, columnIndex) => {
        const cell = sheet.getCell(rowIndex + 1, columnIndex + 1);
        const writable = toWritable(cellSpec);

        cell.value = cellSpec.formula
          ? { formula: cellSpec.formula, result: writable.value as never }
          : (writable.value as never);
        if (writable.numFmt) cell.numFmt = writable.numFmt;

        const style = cellSpec.style ? CELL_STYLES[cellSpec.style] : undefined;
        cell.font = {
          name: FONT,
          size: style?.size ?? FONT_SIZE,
          bold: style?.bold ?? false,
          underline: style?.underline ?? false,
          ...(style?.color ? { color: { argb: style.color } } : {}),
        };
        if (style?.fill) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: style.fill } };
        }
        if (style?.align) cell.alignment = { horizontal: style.align, vertical: 'middle' };
        if (style?.topBorder) {
          cell.border = { top: { style: 'medium', color: { argb: 'FF1D6F42' } } };
        }
      });
    });

    if (sheetSpec.freezeBelowRow) {
      sheet.views = [{ state: 'frozen', ySplit: sheetSpec.freezeBelowRow }];
    }
    if (sheetSpec.autoFilter) sheet.autoFilter = sheetSpec.autoFilter;

    sheet.pageSetup = {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 },
    };
    if (sheetSpec.freezeBelowRow) {
      // Hlavička tabulky se opakuje na každé vytištěné stránce.
      sheet.pageSetup.printTitlesRow = `${sheetSpec.freezeBelowRow}:${sheetSpec.freezeBelowRow}`;
    }
  }

  const buffer = await book.xlsx.writeBuffer();
  return new Blob([buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/** Nabídne soubor ke stažení. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
