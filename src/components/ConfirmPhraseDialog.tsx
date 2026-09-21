import { useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { ResponsiveDialog } from './ResponsiveDialog';

export interface ConfirmPhraseDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  body: ReactNode;
  /** Text, který musí uživatel přesně opsat, aby se tlačítko odemklo. */
  phrase: string;
  fieldLabel: string;
  busy?: boolean;
}

/**
 * Potvrzení nevratné akce opsáním přesné fráze — u zákazníka jeho název,
 * u účtu „SMAZAT ÚČET“.
 */
export function ConfirmPhraseDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  phrase,
  fieldLabel,
  busy,
}: ConfirmPhraseDialogProps) {
  const [typed, setTyped] = useState('');
  const matches = typed.trim() === phrase;

  // Pole se čistí při zavření i po potvrzení, ne efektem na `open` — jinak by
  // se stav měnil v těle efektu a React by hlásil kaskádové překreslení.
  function close() {
    setTyped('');
    onClose();
  }

  async function confirm() {
    await onConfirm();
    setTyped('');
  }

  return (
    <ResponsiveDialog
      open={open}
      onClose={close}
      title={title}
      maxWidth={480}
      actions={
        <>
          <Button onClick={close}>Zrušit</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!matches || busy}
            onClick={() => void confirm()}
          >
            Smazat nenávratně
          </Button>
        </>
      }
    >
      <Typography sx={{ mb: 2, lineHeight: 1.6 }}>{body}</Typography>
      <TextField
        fullWidth
        label={fieldLabel}
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        color="error"
        autoComplete="off"
      />
      <Box sx={{ mt: 0.75, fontSize: 12, color: 'text.secondary', overflowWrap: 'anywhere' }}>
        Přesný text: {phrase}
      </Box>
    </ResponsiveDialog>
  );
}
