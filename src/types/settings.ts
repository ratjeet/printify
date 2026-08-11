import type { PaperSize } from './order';

// Shop settings interface matching database schema
export interface ShopSettings {
  id: string;
  shop_name: string;
  logo_url: string | null;
  welcome_message: string;
  theme_color: string;
  pricing_enabled: boolean;
  bw_price: number;
  color_price: number;
  paper_sizes: PaperSize[];
  allow_double_side: boolean;
  notification_enabled: boolean;
  auto_delete_hours: number;
  created_at: string;
  updated_at: string;
}

// Settings update payload
export interface UpdateSettingsPayload {
  shop_name?: string;
  logo_url?: string | null;
  welcome_message?: string;
  theme_color?: string;
  pricing_enabled?: boolean;
  bw_price?: number;
  color_price?: number;
  paper_sizes?: PaperSize[];
  allow_double_side?: boolean;
  notification_enabled?: boolean;
  auto_delete_hours?: number;
}
