import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, FileQuestion } from 'lucide-react';

/**
 * 404 Not Found page
 */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-4">
      <div className="text-center max-w-md">
        {/* 404 Icon */}
        <div className="relative mx-auto w-32 h-32 mb-8">
          <div className="absolute inset-0 rounded-full bg-indigo-100 dark:bg-indigo-900/30 animate-pulse" />
          <div className="relative flex items-center justify-center w-full h-full">
            <FileQuestion size={56} className="text-indigo-400 dark:text-indigo-500" />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-7xl font-extrabold text-gray-200 dark:text-gray-800 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors font-medium text-sm shadow-md shadow-indigo-500/20"
          >
            <Home size={16} />
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
