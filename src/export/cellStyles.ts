import type { CellStyle } from '../domain/reportModel';

export interface StyleSpec {
  bold?: boolean;
  size?: number;
  /** Barva písma v ARGB. */
  color?: string;
  /** Výplň v ARGB. */
  fill?: string;
  align?: 'left' | 'center' | 'right';
  underline?: boolean;
  /** Silná linka nahoře, odděluje řádek součtu. */
  topBorder?: boolean;
}

/** Barvy z návrhu exportu. */
const GREEN = 'FF1D6F42';
const GREEN_DARK = 'FF1B5E20';
const GREEN_LIGHT = 'FFE2EFDA';
const AMBER_TEXT = 'FF9C5700';
const AMBER_FILL = 'FFFFF2CC';
const GREY = 'FF666666';
const GREY_LIGHT = 'FF999999';
const GREY_NOTE = 'FF555555';
const LINK = 'FF0563C1';

export const CELL_STYLES: Record<CellStyle, StyleSpec> = {
  title: { bold: true, size: 18, color: GREEN },
  metaLabel: { color: GREY },
  metaValue: {},
  metaValueStrong: { bold: true },
  tableHeader: { bold: true, color: 'FFFFFFFF', fill: GREEN },
  data: {},
  dataCenter: { align: 'center' },
  dataMuted: { color: GREY_NOTE },
  invoicedYes: { align: 'center', color: GREEN_DARK },
  invoicedNo: { align: 'center', color: AMBER_TEXT, fill: AMBER_FILL },
  total: { bold: true, fill: GREEN_LIGHT, topBorder: true },
  sumInvoiced: { color: GREEN_DARK, align: 'right' },
  sumUninvoiced: { color: AMBER_TEXT, align: 'right' },
  monthLink: { color: LINK, underline: true },
  monthEmpty: { color: GREY_LIGHT },
  uninvoicedHighlight: { color: AMBER_TEXT, fill: AMBER_FILL },
};
