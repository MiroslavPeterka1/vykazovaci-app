import { useMemo, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { ActivityDialog } from '../components/ActivityDialog';
import { ConfirmPhraseDialog } from '../components/ConfirmPhraseDialog';
import { CustomerDialog } from '../components/CustomerDialog';
import { InvoiceDialog } from '../components/InvoiceDialog';
import { InvoicedChip } from '../components/InvoicedChip';
import { MonoText, RecordList, type Column } from '../components/RecordList';
import { TablePager } from '../components/TablePager';
import { usePageTitle } from '../components/usePageTitle';
import { useSnackbar } from '../components/useSnackbar';
import {
  createActivity,
  deleteActivity,
  markInvoiced,
  stopActivity,
  updateActivity,
} from '../data/activityMutations';
import { deleteCustomerCascade, updateCustomer } from '../data/customerMutations';
import { useAuth } from '../data/useAuth';
import { useCustomerActivities } from '../data/useCustomerActivities';
import { useCustomers } from '../data/useCustomers';
import { newActivityForm, toActivityForm } from '../domain/activityForm';
import { formatDuration } from '../domain/duration';
import {
  emptyActivityFilters,
  filterActivities,
  page as pageOf,
  type ActivityFilters,
  type InvoicedFilter,
} from '../domain/filters';
import { countRecords } from '../domain/plural';
import type { ActivityFormValues, CustomerFormValues } from '../domain/schemas';
import { formatDate, formatDateTime } from '../domain/time';
import { customerTotals } from '../domain/totals';
import type { Activity, Customer } from '../domain/types';
import { layout, monoFontFamily } from '../theme';

const ACTIVITY_PAGE_SIZE = 10;

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

  // Otevřený modál činnosti drží URL, takže funguje zpětné tlačítko i proklik
  // z Přehledu rovnou na konkrétní činnost.
  const [searchParams, setSearchParams] = useSearchParams();
  const editingActivity =
    activities.find((item) => item.id === searchParams.get('cinnost')) ?? null;
  const [creatingActivity, setCreatingActivity] = useState(false);
  const [invoicing, setInvoicing] = useState<Activity | null>(null);
  const [activityFilters, setActivityFilters] = useState<ActivityFilters>(emptyActivityFilters);
  const [activityPage, setActivityPage] = useState(0);

  const filteredActivities = useMemo(
    () => filterActivities(activities, activityFilters),
    [activities, activityFilters],
  );

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
      await deleteCustomerCascade(customer.id);
      setDeleteOpen(false);
      notify('Zákazník a jeho činnosti smazány');
      navigate('/zakaznici');
    } finally {
      setBusy(false);
    }
  }

  /** Generický zápis drží typy: `invoiced` je výčet, ostatní filtry jsou text. */
  function setActivityFilter<K extends keyof ActivityFilters>(key: K, value: ActivityFilters[K]) {
    setActivityFilters((current) => ({ ...current, [key]: value }));
    setActivityPage(0);
  }

  function closeActivityDialog() {
    setCreatingActivity(false);
    setSearchParams({}, { replace: true });
  }

  async function submitActivity(values: ActivityFormValues) {
    if (!user) return;
    setBusy(true);
    try {
      if (editingActivity) {
        await updateActivity(user.uid, editingActivity.id, values);
        notify('Činnost uložena');
      } else {
        await createActivity(user.uid, values);
        notify(values.end ? 'Činnost uložena' : 'Činnost spuštěna');
      }
      closeActivityDialog();
    } finally {
      setBusy(false);
    }
  }

  async function removeActivity() {
    if (!user || !editingActivity) return;
    setBusy(true);
    try {
      await deleteActivity(user.uid, editingActivity.id);
      closeActivityDialog();
      notify('Činnost smazána');
    } finally {
      setBusy(false);
    }
  }

  async function stop(activity: Activity) {
    if (!user) return;
    await stopActivity(user.uid, activity);
    notify('Činnost ukončena');
  }

  async function confirmInvoice(invoiceDate: string, note: string) {
    if (!user || !invoicing) return;
    setBusy(true);
    try {
      await markInvoiced(user.uid, invoicing.id, invoiceDate, note);
      setInvoicing(null);
      notify('Označeno jako vyfakturováno');
    } finally {
      setBusy(false);
    }
  }

  const textFilter = (key: 'name' | 'start' | 'note', placeholder = 'Filtr') => (
    <TextField
      value={activityFilters[key]}
      onChange={(event) => setActivityFilter(key, event.target.value)}
      placeholder={placeholder}
      size="small"
      fullWidth
      slotProps={{
        htmlInput: { 'aria-label': `Filtr sloupce ${key}`, style: { fontSize: 12 } },
      }}
    />
  );

  const activityColumns: Column<Activity>[] = [
    {
      key: 'name',
      header: 'Činnost',
      render: (activity) => activity.name,
      filter: textFilter('name'),
    },
    {
      key: 'start',
      header: 'Začátek',
      render: (activity) => <MonoText>{formatDateTime(activity.start)}</MonoText>,
      filter: textFilter('start', 'dd.mm.'),
    },
    {
      key: 'end',
      header: 'Konec',
      render: (activity) => <MonoText>{formatDateTime(activity.end)}</MonoText>,
    },
    {
      key: 'duration',
      header: 'Vykázáno',
      align: 'right',
      render: (activity) => (
        <Box sx={{ fontWeight: 500 }}>
          <MonoText>{formatDuration(activity.durationMinutes)}</MonoText>
        </Box>
      ),
    },
    {
      key: 'invoiced',
      header: 'Vyfakturováno',
      render: (activity) => <InvoicedChip invoiced={activity.invoiced} />,
      filter: (
        <TextField
          select
          value={activityFilters.invoiced}
          onChange={(event) => setActivityFilter('invoiced', event.target.value as InvoicedFilter)}
          size="small"
          fullWidth
          slotProps={{ htmlInput: { 'aria-label': 'Filtr fakturace' } }}
        >
          <MenuItem value="all">Vše</MenuItem>
          <MenuItem value="yes">Vyfakturováno</MenuItem>
          <MenuItem value="no">Nevyfakturováno</MenuItem>
        </TextField>
      ),
    },
    {
      key: 'invoiceDate',
      header: 'DUZP',
      render: (activity) => <MonoText>{formatDate(activity.invoiceDate)}</MonoText>,
    },
    {
      key: 'note',
      header: 'Poznámka',
      render: (activity) => (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 220 }}>
          {activity.note || '—'}
        </Typography>
      ),
      filter: textFilter('note'),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: 140,
      render: (activity) =>
        activity.end === null ? (
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={(event) => {
              event.stopPropagation();
              void stop(activity);
            }}
          >
            Ukončit
          </Button>
        ) : activity.invoiced ? null : (
          <Button
            size="small"
            variant="outlined"
            onClick={(event) => {
              event.stopPropagation();
              setInvoicing(activity);
            }}
          >
            Vyfakturovat
          </Button>
        ),
    },
  ];

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
              {countRecords(filteredActivities.length)}
            </Typography>
            <Button
              variant="contained"
              size="small"
              sx={{ ml: 'auto' }}
              onClick={() => setCreatingActivity(true)}
            >
              + Činnost
            </Button>
          </Box>

          <RecordList
            columns={activityColumns}
            items={pageOf(filteredActivities, activityPage, ACTIVITY_PAGE_SIZE)}
            getKey={(activity) => activity.id}
            onRowClick={(activity) => setSearchParams({ cinnost: activity.id })}
            rowSx={(activity) =>
              activity.end === null
                ? { bgcolor: 'running.row', '&:hover': { bgcolor: 'running.rowHover !important' } }
                : {}
            }
            minWidth={1080}
            renderMobileCard={(activity) => (
              <ActivityCard
                activity={activity}
                onStop={stop}
                onInvoice={() => setInvoicing(activity)}
              />
            )}
            empty={
              activities.length === 0
                ? 'Pro tohoto zákazníka zatím není vykázaná žádná práce.'
                : 'Nic nenalezeno.'
            }
          />

          {filteredActivities.length > 0 && (
            <TablePager
              total={filteredActivities.length}
              pageIndex={activityPage}
              pageSize={ACTIVITY_PAGE_SIZE}
              onPageChange={setActivityPage}
            />
          )}
        </Paper>
      </Box>

      <CustomerDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={saveEdit}
        busy={busy}
        initial={toFormValues(customer)}
      />

      <ActivityDialog
        open={creatingActivity || editingActivity !== null}
        onClose={closeActivityDialog}
        onSubmit={submitActivity}
        onDelete={editingActivity ? removeActivity : undefined}
        customers={customers}
        initial={editingActivity ? toActivityForm(editingActivity) : newActivityForm(customer.id)}
        editing={editingActivity !== null}
        busy={busy}
      />

      <InvoiceDialog
        open={invoicing !== null}
        activityId={invoicing?.id ?? null}
        onClose={() => setInvoicing(null)}
        onConfirm={confirmInvoice}
        initialNote={invoicing?.note ?? ''}
        subtitle={
          invoicing
            ? `${invoicing.name} · ${customer.name} · ${formatDuration(invoicing.durationMinutes)}`
            : ''
        }
        busy={busy}
      />

      <ConfirmPhraseDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        busy={busy}
        title="Smazat zákazníka?"
        body={`Smaže se zákazník i všechny jeho činnosti (${countRecords(activities.length)}). Operaci nelze vrátit zpět.`}
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

function ActivityCard({
  activity,
  onStop,
  onInvoice,
}: {
  activity: Activity;
  onStop: (activity: Activity) => Promise<void>;
  onInvoice: () => void;
}) {
  const running = activity.end === null;
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, borderRadius: 2, bgcolor: running ? 'running.row' : undefined }}
    >
      <Typography sx={{ fontWeight: 500 }}>{activity.name}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        <MonoText>
          {formatDateTime(activity.start)} → {formatDateTime(activity.end)}
        </MonoText>
      </Typography>
      {activity.note && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {activity.note}
        </Typography>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
        <Typography sx={{ fontWeight: 500 }}>
          <MonoText>{formatDuration(activity.durationMinutes)}</MonoText>
        </Typography>
        <InvoicedChip invoiced={activity.invoiced} />
        {running ? (
          <Button
            size="small"
            variant="outlined"
            color="error"
            sx={{ ml: 'auto', minHeight: 36 }}
            onClick={(event) => {
              event.stopPropagation();
              void onStop(activity);
            }}
          >
            Ukončit
          </Button>
        ) : (
          !activity.invoiced && (
            <Button
              size="small"
              variant="outlined"
              sx={{ ml: 'auto', minHeight: 36 }}
              onClick={(event) => {
                event.stopPropagation();
                onInvoice();
              }}
            >
              Vyfakturovat
            </Button>
          )
        )}
      </Box>
    </Paper>
  );
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
