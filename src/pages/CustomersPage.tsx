import { useMemo, useState } from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

import { MonoText, RecordList, type Column } from '../components/RecordList';
import { PageFab } from '../components/PageFab';
import { CustomerDialog } from '../components/CustomerDialog';
import { TablePager } from '../components/TablePager';
import { useSnackbar } from '../components/useSnackbar';
import { createCustomer } from '../data/customerMutations';
import { useAuth } from '../data/useAuth';
import { useCustomers } from '../data/useCustomers';
import { formatDuration } from '../domain/duration';
import {
  emptyCustomerFilters,
  filterCustomers,
  page,
  type CustomerFilters,
} from '../domain/filters';
import { countCustomers } from '../domain/plural';
import type { CustomerFormValues } from '../domain/schemas';
import type { Customer } from '../domain/types';
import { layout } from '../theme';

const PAGE_SIZE = 50;

export function CustomersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const notify = useSnackbar();
  const { customers, loading } = useCustomers();

  const [filters, setFilters] = useState<CustomerFilters>(emptyCustomerFilters);
  const [pageIndex, setPageIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => filterCustomers(customers, filters), [customers, filters]);
  const visible = page(filtered, pageIndex, PAGE_SIZE);

  /** Změna kteréhokoli filtru vrací stránkování na začátek. */
  function setFilter(key: keyof CustomerFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPageIndex(0);
  }

  const filterField = (key: keyof CustomerFilters) => (
    <TextField
      value={filters[key]}
      onChange={(event) => setFilter(key, event.target.value)}
      placeholder="Filtr"
      variant="outlined"
      size="small"
      fullWidth
      slotProps={{ htmlInput: { 'aria-label': `Filtr sloupce ${key}`, style: { fontSize: 12 } } }}
    />
  );

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Název',
      render: (customer) => <Box sx={{ fontWeight: 500 }}>{customer.name}</Box>,
      filter: filterField('name'),
    },
    {
      key: 'ico',
      header: 'IČ',
      render: (customer) => <MonoText>{customer.ico || '—'}</MonoText>,
      filter: filterField('ico'),
    },
    {
      key: 'address',
      header: 'Adresa',
      render: (customer) => customer.address || '—',
      filter: filterField('address'),
    },
    {
      key: 'person',
      header: 'Kontaktní osoba',
      render: (customer) => customer.person || '—',
      filter: filterField('person'),
    },
    {
      key: 'total',
      header: 'Vykázáno',
      align: 'right',
      render: (customer) => <MonoText>{formatDuration(customer.totalMinutes)}</MonoText>,
    },
  ];

  async function submitNew(values: CustomerFormValues) {
    if (!user) return;
    setBusy(true);
    try {
      const id = await createCustomer(user.uid, values);
      setDialogOpen(false);
      notify('Zákazník vytvořen');
      navigate(`/zakaznici/${id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Paper sx={{ maxWidth: layout.contentMaxWidth }}>
        <Box
          sx={{
            p: 2,
            px: 3,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <TextField
            value={filters.fulltext}
            onChange={(event) => setFilter('fulltext', event.target.value)}
            placeholder="Fulltextové vyhledávání"
            size="small"
            sx={{ flex: 1, maxWidth: 420, minWidth: 200 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {loading ? 'Načítám…' : countCustomers(filtered.length)}
          </Typography>
        </Box>

        <RecordList
          columns={columns}
          items={visible}
          getKey={(customer) => customer.id}
          onRowClick={(customer) => navigate(`/zakaznici/${customer.id}`)}
          renderMobileCard={(customer) => <CustomerCard customer={customer} />}
          empty={
            customers.length === 0
              ? 'Zatím nemáte žádné zákazníky. Nového přidáte tlačítkem +.'
              : 'Nic nenalezeno.'
          }
        />

        {filtered.length > 0 && (
          <TablePager
            total={filtered.length}
            pageIndex={pageIndex}
            pageSize={PAGE_SIZE}
            onPageChange={setPageIndex}
          />
        )}
      </Paper>

      <PageFab title="Nový zákazník" onClick={() => setDialogOpen(true)} />

      <CustomerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={submitNew}
        busy={busy}
      />
    </>
  );
}

function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 2 }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontWeight: 500 }} noWrap>
          {customer.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {customer.address || '—'}
        </Typography>
      </Box>
      <MonoText>{formatDuration(customer.totalMinutes)}</MonoText>
      <ChevronRightIcon sx={{ color: 'rgba(0,0,0,0.4)' }} />
    </Paper>
  );
}
