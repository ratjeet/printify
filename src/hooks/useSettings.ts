import { useState, useEffect, useCallback } from 'react';
import type { ShopSettings, UpdateSettingsPayload } from '../types/settings';
import * as settingsService from '../services/settings.service';

/**
 * Hook for managing shop settings
 */
export function useSettings() {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(async (payload: UpdateSettingsPayload) => {
    if (!settings) throw new Error('Settings not loaded');
    try {
      const updated = await settingsService.updateSettings(settings.id, payload);
      if (updated) setSettings(updated);
      return updated;
    } catch (err) {
      throw err;
    }
  }, [settings]);

  const uploadLogo = useCallback(async (file: File) => {
    try {
      const logoUrl = await settingsService.uploadLogo(file);
      if (settings) {
        const updated = await settingsService.updateSettings(settings.id, { logo_url: logoUrl });
        if (updated) setSettings(updated);
      }
      return logoUrl;
    } catch (err) {
      throw err;
    }
  }, [settings]);

  return {
    settings,
    isLoading,
    error,
    fetchSettings,
    updateSettings,
    uploadLogo,
  };
}
