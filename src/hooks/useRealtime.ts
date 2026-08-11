import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase/client';
import type { Order } from '../types/order';

// Notification sound - a simple beep using Web Audio API
function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;

    oscillator.start();

    // Create a pleasant two-tone notification
    setTimeout(() => {
      oscillator.frequency.value = 1000;
    }, 150);

    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 300);
  } catch (err) {
    console.warn('Could not play notification sound:', err);
  }
}

/**
 * Hook for realtime order updates via Supabase Realtime
 */
export function useRealtime(
  onNewOrder: (order: Order) => void,
  onOrderUpdate?: (order: Order) => void,
  onOrderDelete?: (orderId: string) => void,
  notificationEnabled: boolean = true
) {
  const callbackRef = useRef({ onNewOrder, onOrderUpdate, onOrderDelete });

  // Keep callback refs updated
  useEffect(() => {
    callbackRef.current = { onNewOrder, onOrderUpdate, onOrderDelete };
  }, [onNewOrder, onOrderUpdate, onOrderDelete]);

  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as Order;
          callbackRef.current.onNewOrder(newOrder);

          // Play notification sound for new orders
          if (notificationEnabled) {
            playNotificationSound();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updatedOrder = payload.new as Order;
          callbackRef.current.onOrderUpdate?.(updatedOrder);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'orders' },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id;
          callbackRef.current.onOrderDelete?.(deletedId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [notificationEnabled]);
}

/**
 * Hook for auto-cleanup of expired orders
 * Checks every 5 minutes for orders past their scheduled deletion time
 */
export function useAutoCleanup(onCleanup?: (count: number) => void) {
  const cleanupExpiredOrders = useCallback(async () => {
    try {
      // Import dynamically to avoid circular deps
      const { cleanupExpiredOrders: cleanup } = await import('../services/orders.service');
      const count = await cleanup();
      if (count > 0) {
        onCleanup?.(count);
      }
    } catch (err) {
      console.error('Auto-cleanup error:', err);
    }
  }, [onCleanup]);

  useEffect(() => {
    // Run cleanup immediately
    cleanupExpiredOrders();

    // Run every 5 minutes
    const interval = setInterval(cleanupExpiredOrders, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [cleanupExpiredOrders]);
}
