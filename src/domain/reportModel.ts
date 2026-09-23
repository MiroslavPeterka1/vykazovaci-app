/**
 * Popis sešitu pracovního výkazu — čistá data, bez ExcelJS a bez prohlížeče.
 *
 * Existuje odděleně proto, že vzorce se odkazují na konkrétní čísla řádků
 * (`=SUBTOTAL(9;E11:E23)`, odkaz ze souhrnu do listu měsíce). Posun o jeden
 * řádek je chyba, kterou by uživatel odhalil až v Excelu. Takhle ji odhalí test.
 */

export type ReportValue =
  | { type: 'empty' }
  | { type: 'text'; text: string }
  | { type: 'number'; number: number }
  /** Zobrazí se jako dd.mm.rrrr. */
  | { type: 'date'; date: Date }
  /** Plný datum a čas, zobrazený jako hh:mm — díky tomu sedí i činnost přes půlnoc. */
  | { type: 'time'; date: Date }
  /** Doba jako zlomek dne s formátem [h]:mm, takže součet smí přesáhnout 24 h. */
  | { type: 'duration'; days: number };

export type CellStyle =
  | 'title'
  | 'metaLabel'
  | 'metaValue'
  | 'metaValueStrong'
  | 'tableHeader'
  | 'data'
  | 'dataCenter'
  | 'dataMuted'
  | 'invoicedYes'
  | 'invoicedNo'
  | 'total'
  | 'sumInvoiced'
  | 'sumUninvoiced'
  | 'monthLink'
  | 'monthEmpty'
  | 'uninvoicedHighlight';

export interface ReportCell {
  value: ReportValue;
  /** Vzorec včetně rovnítka; `value` slouží jako předpočítaný výsledek. */
  formula?: string;
  style?: CellStyle;
}

export interface ReportSheet {
  name: string;
  /** Řádky odshora; prázdné pole znamená prázdný řádek. */
  rows: ReportCell[][];
  columnWidths: number[];
  /** Pod kterým řádkem ukotvit příčky (1 = pod prvním řádkem). */
  freezeBelowRow?: number;
  /** Rozsah automatického filtru, např. „A10:H23“. */
  autoFilter?: string;
}

export interface ReportWorkbook {
  fileName: string;
  sheets: ReportSheet[];
}

export const text = (value: string, style?: CellStyle): ReportCell => ({
  value: { type: 'text', text: value },
  style,
});

export const empty = (style?: CellStyle): ReportCell => ({ value: { type: 'empty' }, style });

export const number = (value: number, style?: CellStyle): ReportCell => ({
  value: { type: 'number', number: value },
  style,
});

export const date = (value: Date | null, style?: CellStyle): ReportCell =>
  value ? { value: { type: 'date', date: value }, style } : empty(style);

export const time = (value: Date, style?: CellStyle): ReportCell => ({
  value: { type: 'time', date: value },
  style,
});

export const duration = (days: number, style?: CellStyle): ReportCell => ({
  value: { type: 'duration', days },
  style,
});

/** Přidá k buňce vzorec; hodnota v ní zůstane jako předpočítaný výsledek. */
export const withFormula = (cell: ReportCell, formula: string): ReportCell => ({
  ...cell,
  formula,
});
