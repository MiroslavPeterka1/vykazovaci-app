import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppShell } from '../components/AppShell';
import { CustomerDetailPage } from '../pages/CustomerDetailPage';
import { CustomersPage } from '../pages/CustomersPage';
import { LoginPage } from '../pages/LoginPage';
import { OverviewPage } from '../pages/OverviewPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { ProfilePage } from '../pages/ProfilePage';
import { TermsPage } from '../pages/TermsPage';
import { LegalRoute } from './LegalRoute';
import { RequireAuth } from './RequireAuth';

export const PRIVACY_PATH = '/ochrana-osobnich-udaju';
export const TERMS_PATH = '/podminky';

export const router = createBrowserRouter([
  { path: '/prihlaseni', element: <LoginPage /> },
  {
    path: TERMS_PATH,
    element: (
      <LegalRoute>
        <TermsPage />
      </LegalRoute>
    ),
  },
  {
    path: PRIVACY_PATH,
    element: (
      <LegalRoute>
        <PrivacyPage />
      </LegalRoute>
    ),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/prehled', element: <OverviewPage /> },
          { path: '/zakaznici', element: <CustomersPage /> },
          { path: '/zakaznici/:id', element: <CustomerDetailPage /> },
          { path: '/profil', element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/prehled" replace /> },
]);
