import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from './data/AuthProvider';
import { router } from './routes/router';

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
