import { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { toDateInputValue } from '../domain/time';
import { ResponsiveDialog } from './ResponsiveDialog';

export interface InvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (invoiceDate: string, note: string) => Promise<void>;
  /** Při změně činnosti se pole nastaví znovu. */
  activityId: string | null;
  /** „činnost · zákazník · doba“ */
  subtitle: string;
  initialNote: string;
  busy?: boolean;
}

/** Označení činnosti za vyfakturovanou — doplní DUZP a poznámku. */
export function InvoiceDialog({
  open,
  onClose,
  onConfirm,
  activityId,
  subtitle,
  initialNote,
  busy,
}: InvoiceDialogProps) {
  const [invoiceDate, setInvoiceDate] = useState(() => toDateInputValue(new Date()));
  const [note, setNote] = useState(initialNote);

  // Odvození stavu z props během renderu, ne efektem — React tenhle vzor
  // doporučuje a nevede na kaskádové překreslení jako setState v efektu.
  const [lastActivityId, setLastActivityId] = useState(activityId);
  if (activityId !== lastActivityId) {
    setLastActivityId(activityId);
    if (activityId) {
      setInvoiceDate(toDateInputValue(new Date()));
      setNote(initialNote);
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title="Vyfakturovat"
      subtitle={subtitle}
      maxWidth={480}
      actions={
        <>
          <Button onClick={onClose}>Zrušit</Button>
          <Button
            variant="contained"
            disabled={busy}
            onClick={() => void onConfirm(invoiceDate, note)}
          >
            Vyfakturovat
          </Button>
        </>
      }
    >
      <Stack spacing={2.5} sx={{ pt: 1 }}>
        <TextField
          label="DUZP"
          type="date"
          value={invoiceDate}
          onChange={(event) => setInvoiceDate(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Poznámka"
          multiline
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </Stack>
    </ResponsiveDialog>
  );
}
