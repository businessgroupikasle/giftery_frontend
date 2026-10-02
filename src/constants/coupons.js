/**
 * coupons.js — Centralized promotional coupons configuration and retrieval helpers
 */

export const DEFAULT_COUPONS = [
  { id: 'c-0', code: 'MANDATORY123', discount: '10% OFF', category: 'All Products', status: 'Active' },
  { id: 'c-1', code: 'LUXURY20', discount: '20% OFF', category: 'Corporate Gifts', status: 'Active' },
  { id: 'c-2', code: 'WELCOME10', discount: '₹100 OFF', category: 'First Purchase', status: 'Active' },
  { id: 'c-3', code: 'GIFTERY10', discount: '10% OFF', category: 'All Products', status: 'Active' },
  { id: 'c-4', code: 'SAVE10', discount: '₹50 OFF', category: 'Special Offer', status: 'Active' },
];

/**
 * Get stored coupons from localStorage merged with default coupons.
 * Ensures mandatory and standard promotional coupons are always accessible.
 * @returns {Array} List of coupon objects
 */
export const getStoredCoupons = () => {
  try {
    const stored = localStorage.getItem('admin_coupons');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const map = new Map();
        // Seed standard defaults first
        DEFAULT_COUPONS.forEach((c) => map.set(c.code.toUpperCase(), c));
        // Overwrite or append with admin customizations
        parsed.forEach((c) => {
          if (c && c.code) {
            map.set(c.code.toUpperCase(), c);
          }
        });
        return Array.from(map.values());
      }
    }
  } catch (e) {}
  return DEFAULT_COUPONS;
};
