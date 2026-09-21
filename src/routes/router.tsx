import Box from '@mui/material/Box';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { LoginPage } from '../pages/LoginPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { TermsPage } from '../pages/TermsPage';
import { RequireAuth } from './RequireAuth';
import { TemporaryShell } from './TemporaryShell';

export const router = createBrowserRouter([
  { path: '/prihlaseni', element: <LoginPage /> },
  {
    // Podmínky musí být dostupné i nepřihlášenému uživateli — odkazuje na ně
    // registrační formulář.
    path: '/podminky',
    element: (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
        <TermsPage />
      </Box>
    ),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <TemporaryShell />,
        children: [
          { path: '/prehled', element: <PlaceholderPage title="Přehled" /> },
          { path: '/zakaznici', element: <PlaceholderPage title="Zákazníci" /> },
          { path: '/zakaznici/:id', element: <PlaceholderPage title="Detail zákazníka" /> },
          { path: '/profil', element: <PlaceholderPage title="Uživatelský profil" /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/prehled" replace /> },
]);
