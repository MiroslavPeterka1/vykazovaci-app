import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppShell } from '../components/AppShell';
import { CustomerDetailPage } from '../pages/CustomerDetailPage';
import { CustomersPage } from '../pages/CustomersPage';
import { LoginPage } from '../pages/LoginPage';
import { OverviewPage } from '../pages/OverviewPage';
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
          { path: '/prehled', element: <OverviewPage /> },
          { path: '/zakaznici', element: <CustomersPage /> },
          { path: '/zakaznici/:id', element: <CustomerDetailPage /> },
          { path: '/profil', element: <PlaceholderPage title="Uživatelský profil" /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/prehled" replace /> },
]);
