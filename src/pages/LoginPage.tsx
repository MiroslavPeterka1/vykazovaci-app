import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { BrandMark } from '../components/BrandMark';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import {
  registerWithEmail,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
} from '../data/auth';
import { authErrorMessage } from '../data/authErrors';
import { useAuth } from '../data/useAuth';
import {
  loginSchema,
  registrationSchema,
  type LoginValues,
  type RegistrationValues,
} from '../domain/schemas';

type Mode = 'login' | 'register';

export function LoginPage() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (user) return <Navigate to="/prehled" replace />;

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await action();
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 3,
        py: 6,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <BrandMark />
        </Box>

        <Paper sx={{ overflow: 'hidden' }}>
          <Tabs
            value={mode}
            onChange={(_, next: Mode) => switchMode(next)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab value="login" label="Přihlášení" />
            <Tab value="register" label="Registrace" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {info && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {info}
              </Alert>
            )}

            {mode === 'login' ? (
              <LoginForm busy={busy} onRun={run} onInfo={setInfo} onError={setError} />
            ) : (
              <RegisterForm busy={busy} onRun={run} />
            )}

            <Divider sx={{ my: 2.5 }}>NEBO</Divider>

            <GoogleSignInButton disabled={busy} onClick={() => void run(signInWithGoogle)} />
          </Box>
        </Paper>

        <Typography
          variant="caption"
          component="p"
          align="center"
          color="text.secondary"
          sx={{ mt: 3 }}
        >
          Pokračováním souhlasíte s{' '}
          <Link component={RouterLink} to="/podminky">
            podmínkami použití
          </Link>{' '}
          a berete na vědomí{' '}
          <Link component={RouterLink} to="/ochrana-osobnich-udaju">
            zásady ochrany osobních údajů
          </Link>
          .
        </Typography>
      </Box>
    </Box>
  );
}

interface FormProps {
  busy: boolean;
  onRun: (action: () => Promise<void>) => Promise<void>;
}

function LoginForm({
  busy,
  onRun,
  onInfo,
  onError,
}: FormProps & { onInfo: (m: string) => void; onError: (m: string) => void }) {
  const { register, handleSubmit, getValues, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function resetPassword() {
    const email = getValues('email').trim();
    if (!email) {
      onError('Nejdřív vyplňte e-mail, na který má odkaz dorazit.');
      return;
    }
    await onRun(async () => {
      await sendPasswordReset(email);
    });
    onInfo(`Odkaz pro obnovení hesla jsme poslali na ${email}.`);
  }

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onRun(() => signInWithEmail(values.email, values.password)),
      )}
      noValidate
    >
      <Stack spacing={2.5}>
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          error={!!formState.errors.email}
          helperText={formState.errors.email?.message}
          {...register('email')}
        />
        <Box>
          <TextField
            label="Heslo"
            type="password"
            autoComplete="current-password"
            fullWidth
            error={!!formState.errors.password}
            helperText={formState.errors.password?.message}
            {...register('password')}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
            <Link component="button" type="button" variant="body2" onClick={resetPassword}>
              Zapomenuté heslo?
            </Link>
          </Box>
        </Box>
        <Button type="submit" variant="contained" fullWidth size="large" disabled={busy}>
          Přihlásit se
        </Button>
      </Stack>
    </form>
  );
}

function RegisterForm({ busy, onRun }: FormProps) {
  const { register, handleSubmit, formState } = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      passwordAgain: '',
      termsAccepted: false as unknown as true,
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onRun(() =>
          registerWithEmail({
            displayName: values.displayName,
            email: values.email,
            password: values.password,
          }),
        ),
      )}
      noValidate
    >
      <Stack spacing={2.5}>
        <TextField
          label="Jméno"
          autoComplete="name"
          error={!!formState.errors.displayName}
          helperText={formState.errors.displayName?.message}
          {...register('displayName')}
        />
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          error={!!formState.errors.email}
          helperText={formState.errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Heslo"
          type="password"
          autoComplete="new-password"
          error={!!formState.errors.password}
          helperText={formState.errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Heslo znovu"
          type="password"
          autoComplete="new-password"
          error={!!formState.errors.passwordAgain}
          helperText={formState.errors.passwordAgain?.message}
          {...register('passwordAgain')}
        />
        <Box>
          <FormControlLabel
            control={<Checkbox {...register('termsAccepted')} />}
            label={
              <Typography variant="body2">
                Souhlasím s{' '}
                <Link component={RouterLink} to="/podminky">
                  podmínkami použití
                </Link>
              </Typography>
            }
          />
          {formState.errors.termsAccepted && (
            <FormHelperText error>{formState.errors.termsAccepted.message}</FormHelperText>
          )}
        </Box>
        <Button type="submit" variant="contained" fullWidth size="large" disabled={busy}>
          Vytvořit účet
        </Button>
      </Stack>
    </form>
  );
}
