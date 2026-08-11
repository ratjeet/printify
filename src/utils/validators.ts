import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from './constants';
import { getFileExtension } from './formatters';

/**
 * Validate file type against allowed extensions
 */
export function validateFileType(file: File): { valid: boolean; error?: string } {
  const ext = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File type "${ext}" is not allowed. Accepted: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }
  return { valid: true };
}

/**
 * Validate file size against maximum allowed
 */
export function validateFileSize(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`,
    };
  }
  return { valid: true };
}

/**
 * Validate complete file upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const typeCheck = validateFileType(file);
  if (!typeCheck.valid) return typeCheck;

  const sizeCheck = validateFileSize(file);
  if (!sizeCheck.valid) return sizeCheck;

  return { valid: true };
}

/**
 * Validate number of copies
 */
export function validateCopies(copies: number): { valid: boolean; error?: string } {
  if (!Number.isInteger(copies) || copies < 1) {
    return { valid: false, error: 'Copies must be at least 1.' };
  }
  if (copies > 999) {
    return { valid: false, error: 'Maximum 999 copies allowed.' };
  }
  return { valid: true };
}

/**
 * Sanitize user text input (notes, etc.)
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Strip angle brackets to prevent injection
    .slice(0, 500); // Limit length
}
