import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { pageRangeLabel } from '../domain/filters';

export interface TablePagerProps {
  total: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (next: number) => void;
  /** Přehled stránkuje serverem a dopředu neví, jestli další stránka existuje. */
  hasNext?: boolean;
}

/** Popisek „1–50 z N“ a šipky, jak je má návrh v patě tabulky. */
export function TablePager({ total, pageIndex, pageSize, onPageChange, hasNext }: TablePagerProps) {
  const canPrev = pageIndex > 0;
  const canNext = hasNext ?? (pageIndex + 1) * pageSize < total;

  return (
    <Box
      sx={{
        px: 3,
        py: 1.5,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 2,
        fontSize: 13,
        color: 'text.secondary',
      }}
    >
      <span>{pageRangeLabel(total, pageIndex, pageSize)}</span>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <IconButton
          size="small"
          aria-label="Předchozí stránka"
          disabled={!canPrev}
          onClick={() => onPageChange(pageIndex - 1)}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          aria-label="Další stránka"
          disabled={!canNext}
          onClick={() => onPageChange(pageIndex + 1)}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
