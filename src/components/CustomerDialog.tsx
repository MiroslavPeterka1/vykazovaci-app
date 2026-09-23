import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { customerFormSchema, emptyCustomerForm, type CustomerFormValues } from '../domain/schemas';
import { ResponsiveDialog } from './ResponsiveDialog';

export interface CustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
  /** Vyplněné hodnoty znamenají editaci, prázdné nového zákazníka. */
  initial?: CustomerFormValues;
  busy?: boolean;
}

export function CustomerDialog({ open, onClose, onSubmit, initial, busy }: CustomerDialogProps) {
  const { register, handleSubmit, reset, formState } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: initial ?? emptyCustomerForm,
  });

  useEffect(() => {
    if (open) reset(initial ?? emptyCustomerForm);
  }, [open, initial, reset]);

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={initial ? 'Editace zákazníka' : 'Nový zákazník'}
      maxWidth={560}
      actions={
        <>
          <Button onClick={onClose}>Zrušit</Button>
          <Button
            variant="contained"
            disabled={busy}
            onClick={handleSubmit((values) => onSubmit(values))}
          >
            Uložit
          </Button>
        </>
      }
    >
      <Box
        component="form"
        onSubmit={handleSubmit((values) => onSubmit(values))}
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2.5,
          pt: 1,
        }}
        noValidate
      >
        <TextField
          label="Název"
          sx={{ gridColumn: { sm: 'span 2' } }}
          error={!!formState.errors.name}
          helperText={formState.errors.name?.message}
          {...register('name')}
        />
        <TextField label="IČ" {...register('ico')} />
        <TextField label="DIČ" {...register('dic')} />
        <TextField label="Adresa" sx={{ gridColumn: { sm: 'span 2' } }} {...register('address')} />
        <TextField
          label="Kontaktní osoba"
          sx={{ gridColumn: { sm: 'span 2' } }}
          {...register('person')}
        />
        <TextField label="Telefon" {...register('phone')} />
        <TextField
          label="E-mail"
          error={!!formState.errors.email}
          helperText={formState.errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Poznámka"
          multiline
          rows={3}
          sx={{ gridColumn: { sm: 'span 2' } }}
          {...register('note')}
        />
      </Box>
    </ResponsiveDialog>
  );
}
