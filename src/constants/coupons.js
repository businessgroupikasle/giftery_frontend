/**
 * Admin-created coupons are the only valid coupon source.
 * Hard-coded promotional coupons must not be reintroduced because deleted
 * coupons need to stay deleted.
 */
export const DEFAULT_COUPONS = [];

const STORAGE_KEY = 'admin_coupons';
const LEGACY_COUPONS = new Map([
  ['c-0', 'MANDATORY123'],
  ['c-1', 'LUXURY20'],
  ['c-2', 'WELCOME10'],
  ['c-3', 'GIFTERY10'],
  ['c-4', 'SAVE10'],
]);

const isLegacySeedCoupon = (coupon) =>
  coupon && LEGACY_COUPONS.get(String(coupon.id)) === String(coupon.code || '').toUpperCase();

export const getStoredCoupons = () => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    const adminCoupons = parsed.filter(
      (coupon) => coupon && coupon.code && !isLegacySeedCoupon(coupon)
    );

    if (adminCoupons.length !== parsed.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(adminCoupons));
      window.localStorage.removeItem('giftery_applied_coupon');
    }

    return adminCoupons;
  } catch {
    return [];
  }
};
