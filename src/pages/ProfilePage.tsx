import { useMemo, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

import { ConfirmPhraseDialog } from '../components/ConfirmPhraseDialog';
import { DisplayNameDialog } from '../components/DisplayNameDialog';
import { useAsyncAction } from '../components/useAsyncAction';
import { useSnackbar } from '../components/useSnackbar';
import { userInitials } from '../components/userInitials';
import { deleteAccount } from '../data/accountMutations';
import { logout } from '../data/auth';
import { updateDisplayName } from '../data/profileMutations';
import { useActivityCount } from '../data/useActivityCount';
import { useAuth } from '../data/useAuth';
import { useCustomers } from '../data/useCustomers';
import { formatDuration } from '../domain/duration';
import { countCustomers, countRecords } from '../domain/plural';
import { layout, monoFontFamily } from '../theme';

const DELETE_PHRASE = 'SMAZAT ÚČET';

export function ProfilePage() {
  const { user, profile, refresh } = useAuth();
  const navigate = useNavigate();
  const notify = useSnackbar();
  const { customers } = useCustomers();
  const { count: activityCount } = useActivityCount();

  const [nameOpen, setNameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { busy, run } = useAsyncAction();

  const displayName = profile?.displayName || user?.displayName || '';

  // Součty už na zákaznících udržuje trigger, stačí je sečíst — žádný dotaz navíc.
  const totalMinutes = useMemo(
    () => customers.reduce((sum, customer) => sum + customer.totalMinutes, 0),
    [customers],
  );

  async function saveName(next: string) {
    if (!user) return;
    const ok = await run(async () => {
      await updateDisplayName(user.uid, next);
      await refresh();
    }, 'Jméno se nepodařilo uložit.');
    if (ok) {
      setNameOpen(false);
      notify('Jméno uloženo');
    }
  }

  async function confirmDelete() {
    const ok = await run(async () => {
      await deleteAccount();
      // Účet už ve Firebase Auth neexistuje; klientovi zbývá zahodit relaci.
      await logout();
    }, 'Účet se nepodařilo smazat.');
    if (ok) {
      navigate('/prihlaseni', { replace: true });
      notify('Účet a všechna data smazány');
    }
  }

  return (
    <Box
      sx={{
        maxWidth: layout.profileMaxWidth,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.light', fontSize: 20 }}>
            {userInitials(displayName, user?.email)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 500 }} noWrap>
                {displayName || 'Uživatel'}
              </Typography>
              <IconButton size="small" aria-label="Změnit jméno" onClick={() => setNameOpen(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          <Stat label="Zákazníků" value={String(customers.length)} />
          <Stat label="Činností" value={String(activityCount)} />
          <Stat label="Celkem vykázáno" value={formatDuration(totalMinutes)} mono />
        </Box>

        <Button variant="outlined" color="inherit" onClick={() => void logout()}>
          Odhlásit se
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ color: 'error.main', mb: 1 }}>
          Smazání účtu
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2 }}>
          Smazáním účtu se nenávratně odstraní všichni vaši zákazníci a všechny vykázané činnosti.
          Operaci nelze vrátit zpět.
        </Typography>
        <Button variant="contained" color="error" onClick={() => setDeleteOpen(true)}>
          Smazat účet
        </Button>
      </Paper>

      <DisplayNameDialog
        open={nameOpen}
        onClose={() => setNameOpen(false)}
        onSubmit={saveName}
        initial={displayName}
        busy={busy}
      />

      <ConfirmPhraseDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        busy={busy}
        title="Smazat účet?"
        body={`Smažou se všichni vaši zákazníci (${countCustomers(customers.length)}) a všechny vykázané činnosti (${countRecords(activityCount)}). Operaci nelze vrátit zpět.`}
        phrase={DELETE_PHRASE}
        fieldLabel={`Napište ${DELETE_PHRASE}`}
      />
    </Box>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
      <Typography variant="caption" color="text.secondary" component="div">
        {label}
      </Typography>
      <Typography
        sx={{ fontSize: 24, fontWeight: 500, fontFamily: mono ? monoFontFamily : undefined }}
      >
        {value}
      </Typography>
    </Box>
  );
}
