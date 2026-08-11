import { supabase } from '../supabase/client';
import type { ShopSettings, UpdateSettingsPayload } from '../types/settings';

/**
 * Settings Service - Manages shop configuration
 */

/**
 * Fetch the current shop settings (single row)
 */
export async function getSettings(): Promise<ShopSettings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }

  return data as ShopSettings;
}

/**
 * Update shop settings
 */
export async function updateSettings(
  settingsId: string,
  payload: UpdateSettingsPayload
): Promise<ShopSettings | null> {
  const { data, error } = await supabase
    .from('settings')
    .update(payload)
    .eq('id', settingsId)
    .select()
    .single();

  if (error) {
    console.error('Error updating settings:', error);
    throw new Error(error.message);
  }

  return data as ShopSettings;
}

/**
 * Upload shop logo
 */
export async function uploadLogo(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `shop-logo-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading logo:', uploadError);
    throw new Error(uploadError.message);
  }

  // Get public URL since logos bucket is public
  const { data: urlData } = supabase.storage
    .from('logos')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
