import { useState, useEffect, useCallback } from 'react';
import type { Order, OrderStatus, OrderStats } from '../types/order';
import * as ordersService from '../services/orders.service';
import { supabase } from '../supabase/client';
/**
 * Hook for managing orders state and operations
 */
export function useOrders(initialStatus?: OrderStatus | 'all') {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(initialStatus || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ordersService.getOrders(statusFilter, searchQuery);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription
    const channel = supabase.channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (_payload) => {
          // When any change happens to orders, refetch to keep UI perfectly in sync
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);
  const updateStatus = useCallback(async (orderId: string, status: OrderStatus, autoDeleteHours?: number) => {
    try {
      const updated = await ordersService.updateOrderStatus(orderId, status, autoDeleteHours);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteOrderFile = useCallback(async (orderId: string, filePath: string) => {
    await ordersService.deleteOrderFile(orderId, filePath);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, file_path: 'deleted', file_size: 0 } : o));
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev]);
  }, []);

  const getDownloadUrl = useCallback(async (filePath: string) => {
    if (filePath === 'deleted') return null;
    return ordersService.getFileDownloadUrl(filePath);
  }, []);

  return {
    orders,
    isLoading,
    error,
    statusFilter,
    searchQuery,
    setStatusFilter,
    setSearchQuery,
    fetchOrders,
    updateStatus,
    deleteOrderFile,
    addOrder,
    getDownloadUrl,
  };
}

/**
 * Hook for dashboard order statistics
 */
export function useOrderStats() {
  const [stats, setStats] = useState<OrderStats>({
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const [today, pending, completed] = await Promise.all([
        ordersService.getTodayOrderCount(),
        ordersService.getOrderCountByStatus('pending'),
        ordersService.getOrderCountByStatus('done'),
      ]);

      setStats({
        todayOrders: today,
        pendingOrders: pending,
        completedOrders: completed,
        totalOrders: today, // approximate for dashboard
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Set up real-time subscription for stats
    const channel = supabase.channel('order-stats-realtime')
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

  return { stats, isLoading, refreshStats: fetchStats };
}
