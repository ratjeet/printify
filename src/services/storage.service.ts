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
    const { data: files, error } = await supabase.storage
      .from(STORAGE_BUCKETS.DOCUMENTS)
      .list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Error listing storage files:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        maxStorage,
        recentFiles: [],
      };
    }

    const fileList = (files || []).filter(f => f.name !== '.emptyFolderPlaceholder');

    const totalSize = fileList.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);

    const recentFiles: StorageFile[] = fileList.slice(0, 10).map(file => ({
      name: file.name,
      size: file.metadata?.size || 0,
      createdAt: file.created_at || new Date().toISOString(),
      path: file.name,
    }));

    return {
      totalFiles: fileList.length,
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
