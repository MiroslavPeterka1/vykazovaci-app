import Chip from '@mui/material/Chip';

/** Stav fakturace v tabulkách — zelený „Ano“, šedé „Ne“. */
export function InvoicedChip({ invoiced }: { invoiced: boolean }) {
  return (
    <Chip
      size="small"
      label={invoiced ? 'Ano' : 'Ne'}
      sx={
        invoiced
          ? { bgcolor: 'success.light', color: 'success.dark', fontWeight: 500 }
          : { bgcolor: 'rgba(0,0,0,0.08)', color: 'text.secondary', fontWeight: 500 }
      }
    />
  );
}
