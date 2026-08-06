/**
 * env.js — Centralised environment variable reader with default fallbacks
 *
 * All access to import.meta.env MUST go through this file.
 * Provides default fallbacks to ensure smooth development setup out-of-the-box.
 */

const env = {
  // ── API ──────────────────────────────────────────────────
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',

  // ── App ──────────────────────────────────────────────────
  APP_NAME: import.meta.env.VITE_APP_NAME || 'GIFTERY',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',

  // ── Payments ─────────────────────────────────────────────
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_default',

  // ── Assets ───────────────────────────────────────────────
  CDN_URL: import.meta.env.VITE_CDN_URL || 'http://localhost:5000/uploads',

  // ── Feature Flags ────────────────────────────────────────
  ENABLE_WISHLIST: import.meta.env.VITE_ENABLE_WISHLIST !== 'false',
  ENABLE_REVIEWS: import.meta.env.VITE_ENABLE_REVIEWS !== 'false',
  ENABLE_LIVE_CHAT: import.meta.env.VITE_ENABLE_LIVE_CHAT === 'true',

  // ── Helpers ──────────────────────────────────────────────
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

// Validate required variables in development
if (env.isDev) {
  const required = ['API_BASE_URL'];
  required.forEach((key) => {
    if (!env[key]) {
      console.warn(`[env] ⚠️ Missing environment variable: VITE_${key}`);
    }
  });
}

export default env;
