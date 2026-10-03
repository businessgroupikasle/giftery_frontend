import { useEffect, useState } from 'react';

export const DEFAULT_STORE_SETTINGS = {
  freeShippingThreshold: 999,
  standardShippingFee: 99,
  taxPercentage: 18,
};

const toNonNegativeNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export const normalizeStoreSettings = (settings = {}, fallback = DEFAULT_STORE_SETTINGS) => ({
  ...fallback,
  ...settings,
  freeShippingThreshold: toNonNegativeNumber(settings.freeShippingThreshold ?? settings.freeShippingMinimum, fallback.freeShippingThreshold),
  standardShippingFee: toNonNegativeNumber(settings.standardShippingFee ?? settings.shippingFee ?? settings.deliveryCharge, fallback.standardShippingFee),
  taxPercentage: toNonNegativeNumber(settings.taxPercentage ?? settings.taxRate, fallback.taxPercentage),
  requireEmailOTP: settings.requireEmailOTP ?? settings.require2FA ?? fallback.requireEmailOTP,
});

export const readStoreSettings = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('store_basic_settings') || '{}');
    return normalizeStoreSettings(stored);
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
};

const useStoreSettings = () => {
  const [settings, setSettings] = useState(readStoreSettings);

  useEffect(() => {
    const refreshSettings = () => setSettings(readStoreSettings());
    window.addEventListener('store_settings_updated', refreshSettings);
    window.addEventListener('storage', refreshSettings);
    return () => {
      window.removeEventListener('store_settings_updated', refreshSettings);
      window.removeEventListener('storage', refreshSettings);
    };
  }, []);

  return settings;
};

export default useStoreSettings;
