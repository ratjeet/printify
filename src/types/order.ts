// Order status enum
export type OrderStatus = 'pending' | 'printing' | 'done' | 'cancelled';

// Color mode
export type ColorMode = 'bw' | 'color';

// Print side
export type PrintSide = 'single' | 'double';

// Paper size
export type PaperSize = 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal';

// Order interface matching database schema
export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  shop_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  copies: number;
  color_mode: ColorMode;
  paper_size: PaperSize;
  print_side: PrintSide;
  notes: string | null;
  estimated_price: number | null;
  status: OrderStatus;
  scheduled_deletion_at: string | null;
  created_at: string;
  updated_at: string;
}

// Order creation payload (what the customer submits)
export interface CreateOrderPayload {
  shop_id: string;
  customer_name: string;
  file_name: string;
  file_path: string;
  file_size: number;
  copies: number;
  color_mode: ColorMode;
  paper_size: PaperSize;
  print_side: PrintSide;
  notes?: string;
  estimated_price?: number;
}

// Order filters for the dashboard
export interface OrderFilters {
  status?: OrderStatus | 'all';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Order stats for the dashboard cards
export interface OrderStats {
  todayOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalOrders: number;
}
