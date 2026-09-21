import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppShell } from '../components/AppShell';
import { LoginPage } from '../pages/LoginPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { RequireAuth } from './RequireAuth';
import { TermsRoute } from './TermsRoute';

export const router = createBrowserRouter([
  { path: '/prihlaseni', element: <LoginPage /> },
  { path: '/podminky', element: <TermsRoute /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
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
