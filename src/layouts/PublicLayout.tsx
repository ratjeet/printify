import { Outlet } from 'react-router-dom';

/**
 * PublicLayout - Layout wrapper for customer-facing pages
 * Provides a clean, minimal container without navigation
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-300">
      <Outlet />
    </div>
  );
}
