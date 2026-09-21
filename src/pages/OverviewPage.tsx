import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

import { ActivityDialog } from '../components/ActivityDialog';
import { InvoiceDialog } from '../components/InvoiceDialog';
import { InvoicedChip } from '../components/InvoicedChip';
import { PageFab } from '../components/PageFab';
import { MonoText, RecordList, type Column } from '../components/RecordList';
import { TablePager } from '../components/TablePager';
import { useNow } from '../components/useNow';
import { useSnackbar } from '../components/useSnackbar';
import { createActivity, markInvoiced, stopActivity } from '../data/activityMutations';
import { useAuth } from '../data/useAuth';
import { useCustomers } from '../data/useCustomers';
import { useOverviewPage } from '../data/useOverviewPage';
import { useRunningActivities } from '../data/useRunningActivities';
import { newActivityForm } from '../domain/activityForm';
import { activityDuration, formatDuration } from '../domain/duration';
import { countRunning } from '../domain/plural';
import type { ActivityFormValues } from '../domain/schemas';
import { formatDateTime } from '../domain/time';
import type { Activity } from '../domain/types';
import { layout } from '../theme';

const PAGE_SIZE = 10;

export function OverviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const notify = useSnackbar();
  const now = useNow();

  const { customers } = useCustomers();
  const { activities: running } = useRunningActivities();
  const done = useOverviewPage(PAGE_SIZE);

  const [newOpen, setNewOpen] = useState(false);
  const [invoicing, setInvoicing] = useState<Activity | null>(null);
  const [busy, setBusy] = useState(false);

  const customerNames = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer.name])),
    [customers],
  );
  const nameOf = (activity: Activity) => customerNames.get(activity.customerId) ?? '—';

  /** Klik na řádek otevře detail zákazníka s editačním modálem té činnosti. */
  const openActivity = (activity: Activity) =>
    navigate(`/zakaznici/${activity.customerId}?cinnost=${activity.id}`);

  async function stop(activity: Activity) {
    if (!user) return;
    await stopActivity(user.uid, activity);
    done.reload();
    notify('Činnost ukončena');
  }

  async function submitNew(values: ActivityFormValues) {
    if (!user) return;
    setBusy(true);
    try {
      await createActivity(user.uid, values);
      setNewOpen(false);
      notify(values.end ? 'Činnost uložena' : 'Činnost spuštěna');
      done.reload();
    } finally {
      setBusy(false);
    }
  }

  async function confirmInvoice(invoiceDate: string, note: string) {
    if (!user || !invoicing) return;
    setBusy(true);
    try {
      await markInvoiced(user.uid, invoicing.id, invoiceDate, note);
      setInvoicing(null);
      notify('Označeno jako vyfakturováno');
      done.reload();
    } finally {
      setBusy(false);
    }
  }

  const runningColumns: Column<Activity>[] = [
    {
      key: 'name',
      header: 'Činnost',
      render: (activity) => <Box sx={{ fontWeight: 500 }}>{activity.name}</Box>,
    },
    { key: 'customer', header: 'Zákazník', render: nameOf },
    {
      key: 'start',
      header: 'Začátek',
      render: (activity) => <MonoText>{formatDateTime(activity.start)}</MonoText>,
    },
    {
      key: 'running',
      header: 'Běží',
      align: 'right',
      render: (activity) => (
        <Typography
          component="span"
          sx={{ fontFamily: 'inherit', color: 'running.text', fontWeight: 500 }}
        >
          <MonoText>{formatDuration(activityDuration(activity.start, null, now))}</MonoText>
        </Typography>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: 140,
      render: (activity) => (
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
      ),
    },
  ];

  const doneColumns: Column<Activity>[] = [
    { key: 'name', header: 'Činnost', render: (activity) => activity.name },
    { key: 'customer', header: 'Zákazník', render: nameOf },
    {
      key: 'start',
      header: 'Začátek',
      render: (activity) => <MonoText>{formatDateTime(activity.start)}</MonoText>,
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
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: 150,
      render: (activity) =>
        activity.invoiced ? null : (
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
    <>
      <Box
        sx={{
          maxWidth: layout.contentMaxWidth,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Paper>
          <CardHeader title="Běžící činnosti" note={countRunning(running.length)} />
          <RecordList
            columns={runningColumns}
            items={running}
            getKey={(activity) => activity.id}
            onRowClick={openActivity}
            rowSx={() => ({
              bgcolor: 'running.row',
              '&:hover': { bgcolor: 'running.rowHover !important' },
            })}
            minWidth={820}
            renderMobileCard={(activity) => (
              <RunningCard
                activity={activity}
                customer={nameOf(activity)}
                now={now}
                onStop={stop}
              />
            )}
            empty="Žádná činnost právě neběží. Novou spustíte tlačítkem +."
          />
        </Paper>

        <Paper>
          <CardHeader title="Odpracovaná práce" note="od nejnovějšího záznamu" />
          <RecordList
            columns={doneColumns}
            items={done.activities}
            getKey={(activity) => activity.id}
            onRowClick={openActivity}
            minWidth={1080}
            renderMobileCard={(activity) => (
              <DoneCard
                activity={activity}
                customer={nameOf(activity)}
                onInvoice={() => setInvoicing(activity)}
              />
            )}
            empty={done.loading ? 'Načítám…' : 'Zatím tu není žádná odpracovaná práce.'}
          />
          {done.total > 0 && (
            <TablePager
              total={done.total}
              pageIndex={done.pageIndex}
              pageSize={PAGE_SIZE}
              hasNext={done.hasNext}
              onPageChange={done.goToPage}
            />
          )}
        </Paper>
      </Box>

      <PageFab title="Nová činnost" onClick={() => setNewOpen(true)} />

      <ActivityDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onSubmit={submitNew}
        customers={customers}
        initial={newActivityForm()}
        editing={false}
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
            ? `${invoicing.name} · ${nameOf(invoicing)} · ${formatDuration(invoicing.durationMinutes)}`
            : ''
        }
        busy={busy}
      />
    </>
  );
}

function CardHeader({ title, note }: { title: string; note: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 1.5,
        p: 2,
        px: 3,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="subtitle1">{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {note}
      </Typography>
    </Box>
  );
}

function RunningCard({
  activity,
  customer,
  now,
  onStop,
}: {
  activity: Activity;
  customer: string;
  now: Date;
  onStop: (activity: Activity) => Promise<void>;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'running.row' }}>
      <Typography sx={{ fontWeight: 500 }}>{activity.name}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {customer} · od {formatDateTime(activity.start)}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography sx={{ color: 'running.text', fontWeight: 500 }}>
          <MonoText>{formatDuration(activityDuration(activity.start, null, now))}</MonoText>
        </Typography>
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
      </Box>
    </Paper>
  );
}

function DoneCard({
  activity,
  customer,
  onInvoice,
}: {
  activity: Activity;
  customer: string;
  onInvoice: () => void;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography sx={{ fontWeight: 500 }}>{activity.name}</Typography>
      <Typography variant="body2" color="text.secondary">
        {customer}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        <MonoText>
          {formatDateTime(activity.start)} → {formatDateTime(activity.end)}
        </MonoText>
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
        <Typography sx={{ fontWeight: 500 }}>
          <MonoText>{formatDuration(activity.durationMinutes)}</MonoText>
        </Typography>
        <InvoicedChip invoiced={activity.invoiced} />
        {!activity.invoiced && (
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
        )}
      </Box>
    </Paper>
  );
}
