import { Loader2 } from 'lucide-react';

/**
 * Shared loading spinner component
 */
interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  text?: string;
}

export default function LoadingSpinner({ size = 24, className = '', text }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 size={size} className="animate-spin text-indigo-600 dark:text-indigo-400" />
      {text && (
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">{text}</p>
      )}
    </div>
  );
}
