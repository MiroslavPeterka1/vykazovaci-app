import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { ResponsiveDialog } from './ResponsiveDialog';

export interface DisplayNameDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (displayName: string) => Promise<void>;
  initial: string;
  busy?: boolean;
}

export function DisplayNameDialog({
  open,
  onClose,
  onSubmit,
  initial,
  busy,
}: DisplayNameDialogProps) {
  const [value, setValue] = useState(initial);

  // Odvození z props během renderu, ne efektem.
  const [lastInitial, setLastInitial] = useState(initial);
  if (initial !== lastInitial) {
    setLastInitial(initial);
    setValue(initial);
  }

  const valid = value.trim().length > 0;

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title="Změna jména"
      maxWidth={420}
      actions={
        <>
          <Button onClick={onClose}>Zrušit</Button>
          <Button
            variant="contained"
            disabled={!valid || busy}
            onClick={() => void onSubmit(value)}
          >
            Uložit
          </Button>
        </>
      }
    >
      <TextField
        fullWidth
        label="Jméno"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        error={!valid}
        helperText={valid ? ' ' : 'Vyplňte jméno'}
        sx={{ mt: 1 }}
      />
    </ResponsiveDialog>
  );
}
