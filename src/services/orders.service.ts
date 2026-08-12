import { supabase } from '../supabase/client';
import type { Order, CreateOrderPayload, OrderStatus } from '../types/order';
import { STORAGE_BUCKETS } from '../utils/constants';

/**
 * Orders Service - Manages print orders
 */

/**
 * Create a new order (called by customers)
 */
export async function createOrder(payload: Omit<CreateOrderPayload, 'shop_id'>): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_name: payload.customer_name,
      file_name: payload.file_name,
      file_path: payload.file_path,
      file_size: payload.file_size,
      copies: payload.copies,
      color_mode: payload.color_mode,
      paper_size: payload.paper_size,
      print_side: payload.print_side,
      notes: payload.notes || null,
      estimated_price: payload.estimated_price || null,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw new Error(error.message);
  }

  return data as Order;
}

/**
 * Fetch all orders with optional filters
 */
export async function getOrders(
  status?: OrderStatus | 'all',
  search?: string
): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.ilike('order_number', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    throw new Error(error.message);
  }

  return (data || []) as Order[];
}

/**
 * Fetch a single order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  return data as Order;
}

/**
 * Fetch a single order by order number (for customer success page)
 */
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const { data, error } = await supabase.rpc('get_order_by_number', {
    p_order_number: orderNumber
  });

  if (error) {
    console.error('Error fetching order by number:', error);
    return null;
  }

  // The RPC returns an array (table), we just want the first one
  if (data && data.length > 0) {
    return data[0] as Order;
  }
  
  return null;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  autoDeleteHours?: number
): Promise<Order> {
  const updateData: Record<string, unknown> = { status };

  // If marking as done, set scheduled deletion time
  if (status === 'done' && autoDeleteHours) {
    const deletionTime = new Date();
    deletionTime.setHours(deletionTime.getHours() + autoDeleteHours);
    updateData.scheduled_deletion_at = deletionTime.toISOString();
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw new Error(error.message);
  }

  return data as Order;
}

/**
 * Delete an order and its associated file
 */
export async function deleteOrderFile(orderId: string, filePath: string): Promise<void> {
  // Delete file from storage first
  if (filePath && filePath !== 'deleted') {
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKETS.DOCUMENTS)
      .remove([filePath]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
    }
  }

  // Update the order record instead of deleting it
  const { error } = await supabase
    .from('orders')
    .update({ 
      file_path: 'deleted',
      file_size: 0 
    })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order:', error);
    throw new Error(error.message);
  }
}

/**
 * Get today's order count
 */
export async function getTodayOrderCount(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  if (error) {
    console.error('Error getting today order count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get orders count by status
 */
export async function getOrderCountByStatus(status: OrderStatus): Promise<number> {
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', status);

  if (error) {
    console.error('Error getting order count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get file download URL (signed URL for private bucket)
 */
export async function getFileDownloadUrl(filePath: string): Promise<string | null> {
  if (filePath === 'deleted') return null;
  
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.DOCUMENTS)
    .getPublicUrl(filePath);

  return data.publicUrl ? `${data.publicUrl}?download=` : null;
}

/**
 * Get orders that are scheduled for deletion (past their deletion time)
 */
export async function getExpiredOrders(): Promise<Order[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .not('scheduled_deletion_at', 'is', null)
    .lte('scheduled_deletion_at', now);

  if (error) {
    console.error('Error fetching expired orders:', error);
    return [];
  }

  return (data || []) as Order[];
}

/**
 * Clean up expired orders (delete records and files)
 */
export async function cleanupExpiredOrders(): Promise<number> {
  const expiredOrders = await getExpiredOrders();

  let deletedCount = 0;
  for (const order of expiredOrders) {
    try {
      await deleteOrderFile(order.id, order.file_path);
      deletedCount++;
    } catch (err) {
      console.error(`Failed to cleanup order ${order.order_number}:`, err);
    }
  }

  return deletedCount;
}
