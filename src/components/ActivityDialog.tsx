import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { activityFormSchema, type ActivityFormValues } from '../domain/schemas';
import { durationMinutes, formatDuration } from '../domain/duration';
import { matchesText } from '../domain/filters';
import { fromDateTimeLocalValue, spansDstChange, toDateInputValue } from '../domain/time';
import type { Customer } from '../domain/types';
import { monoFontFamily } from '../theme';
import { ResponsiveDialog } from './ResponsiveDialog';

export interface ActivityDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ActivityFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
  customers: Customer[];
  initial: ActivityFormValues;
  /** Editace má jiný titulek i popisek ukládacího tlačítka než nová činnost. */
  editing: boolean;
  busy?: boolean;
}

export function ActivityDialog({
  open,
  onClose,
  onSubmit,
  onDelete,
  customers,
  initial,
  editing,
  busy,
}: ActivityDialogProps) {
  const { register, handleSubmit, reset, control, watch, setValue, formState } =
    useForm<ActivityFormValues>({
      resolver: zodResolver(activityFormSchema),
      defaultValues: initial,
    });

  useEffect(() => {
    if (open) reset(initial);
  }, [open, initial, reset]);

  const startValue = watch('start');
  const endValue = watch('end');
  const invoiced = watch('invoiced');
  const invoiceDateValue = watch('invoiceDate');

  const start = fromDateTimeLocalValue(startValue);
  const end = fromDateTimeLocalValue(endValue);
  const duration = start && end ? formatDuration(durationMinutes(start, end)) : 'běží';
  const durationNote = spansDstChange(start, end) ? 'zahrnuje změnu času' : 'HH:MM, dopočítáno';

  // Prototyp má u nové činnosti vždy „Spustit“, ale když uživatel vyplní konec,
  // nic se nespouští — činnost rovnou vzniká ukončená. Popisek proto říká,
  // co se opravdu stane.
  const saveLabel = editing || endValue ? 'Uložit' : 'Spustit';

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={editing ? 'Editace činnosti' : 'Nová činnost'}
      maxWidth={520}
      actions={
        <>
          {editing && onDelete && (
            <Button color="error" sx={{ mr: 'auto' }} onClick={() => void onDelete()}>
              Smazat
            </Button>
          )}
          <Button onClick={onClose}>Zrušit</Button>
          <Button
            variant="contained"
            disabled={busy}
            onClick={handleSubmit((values) => onSubmit(values))}
          >
            {saveLabel}
          </Button>
        </>
      }
    >
      <Box
        component="form"
        onSubmit={handleSubmit((values) => onSubmit(values))}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}
        noValidate
      >
        <TextField
          label="Název činnosti"
          error={!!formState.errors.name}
          helperText={formState.errors.name?.message}
          {...register('name')}
        />

        <Controller
          name="customerId"
          control={control}
          render={({ field }) => (
            <Autocomplete
              options={customers}
              value={customers.find((customer) => customer.id === field.value) ?? null}
              onChange={(_, selected) => field.onChange(selected?.id ?? '')}
              getOptionLabel={(customer) => customer.name}
              // Hledá stejně jako seznam zákazníků: bez ohledu na diakritiku
              // a napříč všemi atributy, ne jen v názvu.
              filterOptions={(options, { inputValue }) =>
                options.filter((customer) =>
                  matchesText(
                    [customer.name, customer.ico, customer.address, customer.person].join(' '),
                    inputValue,
                  ),
                )
              }
              noOptionsText="Nic nenalezeno"
              slotProps={{ listbox: { style: { maxHeight: 220 } } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Zákazník"
                  placeholder="Hledat zákazníka…"
                  error={!!formState.errors.customerId}
                  helperText={formState.errors.customerId?.message}
                />
              )}
            />
          )}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Začátek"
            type="datetime-local"
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!formState.errors.start}
            helperText={formState.errors.start?.message}
            {...register('start')}
          />
          <TextField
            label="Konec"
            type="datetime-local"
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!formState.errors.end}
            helperText={formState.errors.end?.message}
            {...register('end')}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: 'rgba(0,0,0,0.03)',
            borderRadius: 1,
            px: 2,
            py: 1.5,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Vykázaná doba
          </Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 500, fontFamily: monoFontFamily }}>
            {duration}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            {durationNote}
          </Typography>
        </Box>

        <Controller
          name="invoiced"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              label="Vyfakturováno"
              control={
                <Switch
                  checked={field.value}
                  onChange={(event) => {
                    field.onChange(event.target.checked);
                    // Zapnutí přepínače předvyplní DUZP dneškem, jak to dělá návrh.
                    if (event.target.checked && !invoiceDateValue) {
                      setValue('invoiceDate', toDateInputValue(new Date()));
                    }
                  }}
                />
              }
            />
          )}
        />

        {invoiced && (
          <TextField
            label="DUZP"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
            {...register('invoiceDate')}
          />
        )}

        <TextField label="Poznámka" multiline rows={2} {...register('note')} />
      </Box>
    </ResponsiveDialog>
  );
}
