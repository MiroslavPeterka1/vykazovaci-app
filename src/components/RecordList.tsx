import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

import { monoFontFamily } from '../theme';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  render: (item: T) => ReactNode;
  /** Pole filtru do druhého řádku hlavičky; bez něj zůstane buňka prázdná. */
  filter?: ReactNode;
  width?: number | string;
}

export interface RecordListProps<T> {
  columns: Column<T>[];
  items: T[];
  getKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  rowSx?: (item: T) => SxProps<Theme>;
  /** Pod touto šířkou tabulka scrolluje vodorovně uvnitř karty. */
  minWidth?: number;
  /**
   * Karta pro mobil. Návrh má pro každou obrazovku jiné uspořádání karty,
   * takže sdílená je tabulka a přepínač, samotná karta zůstává na obrazovce.
   */
  renderMobileCard: (item: T) => ReactNode;
  empty?: ReactNode;
}

/** Tabulka na desktopu, seznam karet na mobilu. */
export function RecordList<T>({
  columns,
  items,
  getKey,
  onRowClick,
  rowSx,
  minWidth = 840,
  renderMobileCard,
  empty,
}: RecordListProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const hasFilters = columns.some((column) => column.filter);

  if (items.length === 0 && empty) {
    return (
      <Box sx={{ px: 3, py: 4, textAlign: 'center', color: 'text.secondary', fontSize: 14 }}>
        {empty}
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Stack spacing={1} sx={{ p: 2 }}>
        {items.map((item) => (
          <Box
            key={getKey(item)}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
            sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
          >
            {renderMobileCard(item)}
          </Box>
        ))}
      </Stack>
    );
  }

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth }} size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                align={column.align ?? 'left'}
                sx={{ width: column.width, border: 0, pt: 1.5, pb: hasFilters ? 0.5 : 1.5 }}
              >
                {column.header}
              </TableCell>
            ))}
          </TableRow>
          {hasFilters && (
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} sx={{ pt: 0, pb: 1.5 }}>
                  {column.filter}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={getKey(item)}
              hover
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              sx={{ cursor: onRowClick ? 'pointer' : 'default', ...rowSx?.(item) }}
            >
              {columns.map((column) => (
                <TableCell key={column.key} align={column.align ?? 'left'} sx={{ py: 1.5 }}>
                  {column.render(item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

/**
 * Buňka s číslem, časem nebo dobou — návrh je má všude monospace a na jednom
 * řádku. Kdyby se datum lámalo, řádky tabulky by zbytečně narostly.
 */
export function MonoText({ children }: { children: ReactNode }) {
  return (
    <Typography
      component="span"
      sx={{ fontFamily: monoFontFamily, fontSize: 14, whiteSpace: 'nowrap' }}
    >
      {children}
    </Typography>
  );
}
