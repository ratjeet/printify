import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'sonner';

// Layouts
import PublicLayout from '@/layouts/PublicLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Pages
import Login from '@/pages/Login';
import Upload from '@/pages/Upload';
import UploadSuccess from '@/pages/UploadSuccess';
import Landing from '@/pages/Landing';
import NotFound from '@/pages/NotFound';

// Dashboard Pages
import Dashboard from '@/pages/dashboard/Dashboard';
import Orders from '@/pages/dashboard/Orders';
import OrderDetails from '@/pages/dashboard/OrderDetails';
import Settings from '@/pages/dashboard/Settings';
import Storage from '@/pages/dashboard/Storage';
import Profile from '@/pages/dashboard/Profile';
import Support from '@/pages/dashboard/Support';
import QRCode from '@/pages/dashboard/QRCode';

// Components
import LoadingSpinner from '@/components/shared/LoadingSpinner';

/**
 * Auth guard - redirects unauthenticated users to login
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <LoadingSpinner size={32} text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * Login guard - redirects authenticated users to dashboard
 */
function LoginRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <LoadingSpinner size={32} text="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes (customer-facing) */}
            <Route element={<PublicLayout />}>
              <Route path="/upload" element={<Upload />} />
              <Route path="/upload/success/:orderNumber" element={<UploadSuccess />} />
            </Route>

            {/* Login route */}
            <Route
              path="/login"
              element={
                <LoginRoute>
                  <Login />
                </LoginRoute>
              }
            />

            {/* Protected dashboard routes */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/orders" element={<Orders />} />
              <Route path="/dashboard/orders/:id" element={<OrderDetails />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              <Route path="/dashboard/storage" element={<Storage />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="/dashboard/qr" element={<QRCode />} />
              <Route path="/dashboard/support" element={<Support />} />
            </Route>

            {/* Landing page */}
            <Route path="/" element={<Landing />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>

        {/* Global toast notification container */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'font-sans',
          }}
          richColors
          closeButton
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
