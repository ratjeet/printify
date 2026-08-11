import { useState, useEffect, useCallback } from 'react';
import * as storageService from '../services/storage.service';
import type { StorageStats } from '../services/storage.service';
import { supabase } from '../supabase/client';

/**
 * Hook for storage statistics
 */
export function useStorage() {
  const [stats, setStats] = useState<StorageStats>({
    totalFiles: 0,
    totalSize: 0,
    maxStorage: 100 * 1024 * 1024, // default 100MB
    recentFiles: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await storageService.getStorageStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching storage stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Set up real-time subscription for storage stats (based on orders)
    const channel = supabase.channel('storage-stats-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    refreshStats: fetchStats,
  };
}
