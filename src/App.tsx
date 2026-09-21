import { RouterProvider } from 'react-router-dom';

import { SnackbarProvider } from './components/SnackbarProvider';
import { AuthProvider } from './data/AuthProvider';
import { router } from './routes/router';

export function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <RouterProvider router={router} />
      </SnackbarProvider>
    </AuthProvider>
  );
}
