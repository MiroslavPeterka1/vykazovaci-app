import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { AuthContext, type AuthState } from '../data/authContext';
import { LoginPage } from './LoginPage';

// Stránka jen zobrazuje formuláře; skutečné přihlašování by táhlo inicializaci Firebase.
vi.mock('../data/auth', () => ({
  registerWithEmail: vi.fn(),
  sendPasswordReset: vi.fn(),
  signInWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
}));

const signedOut: AuthState = {
  user: null,
  profile: null,
  loading: false,
  emailVerified: false,
  refresh: () => Promise.resolve(),
};

function renderAt(url: string) {
  render(
    <AuthContext.Provider value={signedOut}>
      <MemoryRouter initialEntries={[url]}>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('LoginPage', () => {
  it('bez parametru otevře přihlášení', () => {
    renderAt('/prihlaseni');
    expect(screen.getByRole('tab', { name: 'Přihlášení' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByLabelText('Heslo znovu')).not.toBeInTheDocument();
  });

  it('s parametrem registrace otevře rovnou registraci', () => {
    renderAt('/prihlaseni?registrace');
    expect(screen.getByRole('tab', { name: 'Registrace' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText(/Heslo znovu/)).toBeInTheDocument();
  });
});
