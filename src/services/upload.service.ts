import { supabase } from '../supabase/client';
import { STORAGE_BUCKETS } from '../utils/constants';

/**
 * Upload Service - Handles customer file uploads
 */

/**
 * Upload a file to the documents bucket
 * Files are stored with a unique path to prevent collisions
 */
export async function uploadFile(file: File): Promise<{ path: string; size: number }> {
  // Create a unique file path: timestamp-randomstring-filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${timestamp}-${random}-${sanitizedName}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.DOCUMENTS)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  return {
    path: filePath,
    size: file.size,
  };
}

/**
 * Calculate estimated price based on print options and settings
 */
export function calculateEstimatedPrice(
  copies: number,
  colorMode: 'bw' | 'color',
  printSide: 'single' | 'double',
  bwPrice: number,
  colorPrice: number
): number {
  const pricePerPage = colorMode === 'color' ? colorPrice : bwPrice;
  const sideMultiplier = printSide === 'double' ? 2 : 1;
  return copies * pricePerPage * sideMultiplier;
}
