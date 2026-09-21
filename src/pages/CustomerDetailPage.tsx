import { useMemo, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';

import { ConfirmPhraseDialog } from '../components/ConfirmPhraseDialog';
import { CustomerDialog } from '../components/CustomerDialog';
import { usePageTitle } from '../components/usePageTitle';
import { useSnackbar } from '../components/useSnackbar';
import { deleteCustomerCascade, updateCustomer } from '../data/customerMutations';
import { useAuth } from '../data/useAuth';
import { useCustomerActivities } from '../data/useCustomerActivities';
import { useCustomers } from '../data/useCustomers';
import { formatDuration } from '../domain/duration';
import type { CustomerFormValues } from '../domain/schemas';
import { customerTotals } from '../domain/totals';
import type { Customer } from '../domain/types';
import { layout, monoFontFamily } from '../theme';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const notify = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { customers, loading } = useCustomers();
  const { activities } = useCustomerActivities(id);

  const customer = customers.find((item) => item.id === id) ?? null;
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  usePageTitle(customer?.name ?? null);

  const totals = useMemo(() => customerTotals(activities, new Date()), [activities]);

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!customer) {
    return (
      <Paper sx={{ p: 3, maxWidth: 520 }}>
        <Typography variant="subtitle1" gutterBottom>
          Zákazník nenalezen
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Zákazník neexistuje, nebo byl smazán.
        </Typography>
        <Button onClick={() => navigate('/zakaznici')}>Zpět na zákazníky</Button>
      </Paper>
    );
  }

  async function saveEdit(values: CustomerFormValues) {
    if (!user || !customer) return;
    setBusy(true);
    try {
      await updateCustomer(user.uid, customer.id, values);
      setEditOpen(false);
      notify('Zákazník uložen');
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!user || !customer) return;
    setBusy(true);
    try {
      await deleteCustomerCascade(user.uid, customer.id);
      setDeleteOpen(false);
      notify('Zákazník a jeho činnosti smazány');
      navigate('/zakaznici');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ maxWidth: layout.detailMaxWidth }}>
      <Button onClick={() => navigate('/zakaznici')} startIcon={<ArrowBackIcon />} sx={{ mb: 1.5 }}>
        Zpět na zákazníky
      </Button>

      {/* Flex s gap, ne Stack: Stack dělá rozestupy marginy podle pořadí v DOM,
          takže by se s přeskládáním karet přes `order` rozešly. */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Paper sx={{ order: isMobile ? 2 : 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              p: 2,
              pl: 3,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 500, lineHeight: 1.3 }}>
                {customer.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Zákazník
              </Typography>
            </Box>
            <IconButton aria-label="Editovat zákazníka" onClick={() => setEditOpen(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="Smazat zákazníka"
              color="error"
              onClick={() => setDeleteOpen(true)}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box
            sx={{
              p: 2,
              px: 3,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(auto-fit, minmax(150px, 1fr))',
              },
              gap: '14px 24px',
            }}
          >
            <Attribute label="IČ" value={customer.ico} mono inline={isMobile} />
            <Attribute label="DIČ" value={customer.dic} mono inline={isMobile} />
            <Attribute label="Adresa" value={customer.address} inline={isMobile} />
            <Attribute label="Kontaktní osoba" value={customer.person} inline={isMobile} />
            <Attribute label="Telefon" value={customer.phone} mono inline={isMobile} />
            <Attribute label="E-mail" value={customer.email} inline={isMobile} />
          </Box>
        </Paper>

        <Paper sx={{ order: isMobile ? 1 : 2 }}>
          <Box
            sx={{
              p: 2,
              px: 3,
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                md: 'repeat(auto-fit, minmax(170px, 1fr))',
              },
              gap: '14px 24px',
            }}
          >
            <Stat label="Celkem vykázáno" minutes={totals.totalMinutes} />
            <Stat label="Celkem vyfakturováno" minutes={totals.invoicedMinutes} success />
            <Stat label="Vykázáno tento měsíc" minutes={totals.monthMinutes} />
            <Stat label="Vyfakturováno tento měsíc" minutes={totals.monthInvoicedMinutes} success />
          </Box>
        </Paper>

        <Paper sx={{ order: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 2,
              pl: 3,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle1">Činnosti</Typography>
            <Typography variant="body2" color="text.secondary">
              {activities.length} záznamů
            </Typography>
          </Box>
          <Box sx={{ px: 3, py: 4, textAlign: 'center', color: 'text.secondary', fontSize: 14 }}>
            Tabulka činností přijde v další etapě.
          </Box>
        </Paper>
      </Box>

      <CustomerDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={saveEdit}
        busy={busy}
        initial={toFormValues(customer)}
      />

      <ConfirmPhraseDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        busy={busy}
        title="Smazat zákazníka?"
        body={`Smaže se zákazník i všechny jeho činnosti (${activities.length} záznamů). Operaci nelze vrátit zpět.`}
        phrase={customer.name}
        fieldLabel="Napište název zákazníka"
      />
    </Box>
  );
}

function toFormValues(customer: Customer): CustomerFormValues {
  return {
    name: customer.name,
    ico: customer.ico,
    dic: customer.dic,
    address: customer.address,
    person: customer.person,
    phone: customer.phone,
    email: customer.email,
  };
}

/** Na mobilu má návrh popisek vlevo v pevném sloupci, na desktopu nad hodnotou. */
function Attribute({
  label,
  value,
  mono,
  inline,
}: {
  label: string;
  value: string;
  mono?: boolean;
  inline?: boolean;
}) {
  const text = (
    <Typography
      sx={{
        fontSize: 14,
        overflowWrap: 'anywhere',
        fontFamily: mono ? monoFontFamily : undefined,
      }}
    >
      {value || '—'}
    </Typography>
  );

  if (inline) {
    return (
      <Box sx={{ display: 'flex', gap: 2, minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ width: 110, flexShrink: 0, pt: '2px' }}
        >
          {label}
        </Typography>
        <Box sx={{ minWidth: 0 }}>{text}</Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" component="div">
        {label}
      </Typography>
      {text}
    </Box>
  );
}

function Stat({ label, minutes, success }: { label: string; minutes: number; success?: boolean }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" component="div">
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 20,
          fontWeight: 500,
          fontFamily: monoFontFamily,
          color: success ? 'success.main' : 'text.primary',
        }}
      >
        {formatDuration(minutes)}
      </Typography>
    </Box>
  );
}
