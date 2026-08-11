import { format, formatDistanceToNow, isToday, parseISO } from 'date-fns';

/**
 * Format a date string for display (e.g., "Aug 7, 2026, 3:05 PM")
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return 'Unknown Date';
  return format(parseISO(dateString), 'MMM d, yyyy, h:mm a');
}

/**
 * Format a date string as relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(dateString: string | undefined | null): string {
  if (!dateString) return '';
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
}

/**
 * Check if a date string is from today
 */
export function isDateToday(dateString: string | undefined | null): boolean {
  if (!dateString) return false;
  return isToday(parseISO(dateString));
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

/**
 * Format order number for display
 */
export function formatOrderNumber(orderNumber: string): string {
  return orderNumber.toUpperCase();
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string | undefined | null): string {
  if (!filename) return '';
  return filename.slice(filename.lastIndexOf('.')).toLowerCase();
}

/**
 * Get file type icon name based on extension
 */
export function getFileTypeIcon(filename: string | undefined | null): string {
  if (!filename) return 'file';
  const ext = getFileExtension(filename);
  switch (ext) {
    case '.pdf':
      return 'file-text';
    case '.doc':
    case '.docx':
      return 'file-type';
    case '.jpg':
    case '.jpeg':
    case '.png':
      return 'image';
    default:
      return 'file';
  }
}

/**
 * Check if file is an image type
 */
export function isImageFile(filename: string | undefined | null): boolean {
  if (!filename) return false;
  const ext = getFileExtension(filename);
  return ['.jpg', '.jpeg', '.png'].includes(ext);
}

/**
 * Check if file is a PDF
 */
export function isPdfFile(filename: string): boolean {
  return getFileExtension(filename) === '.pdf';
}

/**
 * Format storage percentage
 */
export function formatStoragePercentage(usedBytes: number, totalBytes: number): number {
  if (totalBytes === 0) return 0;
  return Math.round((usedBytes / totalBytes) * 100);
}
