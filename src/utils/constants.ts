import type { PaperSize, OrderStatus } from '../types/order';

// App
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Printify';
export const MAX_FILE_SIZE_MB = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Allowed file types
export const ALLOWED_FILE_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'image/jpeg': '.jpg',
  'image/png': '.png',
};

export const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

// Paper sizes
export const PAPER_SIZES: { value: PaperSize; label: string }[] = [
  { value: 'A4', label: 'A4 (210 × 297 mm)' },
  { value: 'A3', label: 'A3 (297 × 420 mm)' },
  { value: 'A5', label: 'A5 (148 × 210 mm)' },
  { value: 'Letter', label: 'Letter (8.5 × 11 in)' },
  { value: 'Legal', label: 'Legal (8.5 × 14 in)' },
];

// Order statuses
export const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  { value: 'printing', label: 'Printing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'done', label: 'Done', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
];

// Auto-delete duration options
export const AUTO_DELETE_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: '1 Hour' },
  { value: 6, label: '6 Hours' },
  { value: 24, label: '24 Hours' },
  { value: 72, label: '3 Days' },
  { value: 168, label: '7 Days' },
];

// Session
export const SESSION_KEY = 'printify_session';
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Supabase Storage buckets
export const STORAGE_BUCKETS = {
  LOGOS: 'logos',
  DOCUMENTS: 'documents',
} as const;

// Theme
export const THEME_KEY = 'printify_theme';
export const DEFAULT_THEME_COLOR = '#4F46E5';
