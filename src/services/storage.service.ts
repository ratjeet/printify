import { supabase } from '../supabase/client';
import { STORAGE_BUCKETS } from '../utils/constants';

/**
 * Storage Service - Manages storage usage and file listing
 */

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  maxStorage: number; // Supabase free tier: 1GB
  recentFiles: StorageFile[];
}

export interface StorageFile {
  name: string;
  size: number;
  createdAt: string;
  path: string;
}

/**
 * Get storage statistics for the documents bucket
 */
export async function getStorageStats(): Promise<StorageStats> {
  const maxStorage = 100 * 1024 * 1024; // 100MB default

  try {
    // Query active orders directly for accurate storage stats
    const { data: orders, error } = await supabase
      .from('orders')
      .select('file_name, file_size, file_path, created_at')
      .neq('file_path', 'deleted')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error listing active files from orders:', error);
      throw error;
    }

    const activeOrders = orders || [];
    const totalSize = activeOrders.reduce((sum, order) => sum + (order.file_size || 0), 0);

    const recentFiles: StorageFile[] = activeOrders.slice(0, 10).map(order => ({
      name: order.file_name,
      size: order.file_size || 0,
      createdAt: order.created_at,
      path: order.file_path,
    }));

    return {
      totalFiles: activeOrders.length,
      totalSize,
      maxStorage,
      recentFiles,
    };
  } catch (err) {
    console.error('Error getting storage stats:', err);
    return {
      totalFiles: 0,
      totalSize: 0,
      maxStorage,
      recentFiles: [],
    };
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.DOCUMENTS)
    .remove([filePath]);

  if (error) {
    console.error('Error deleting file:', error);
    throw new Error(error.message);
  }
}
