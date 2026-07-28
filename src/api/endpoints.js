/**
 * endpoints.js — All backend API endpoint constants
 *
 * Usage:
 *   import { ENDPOINTS } from '@api/endpoints';
 *   axiosInstance.get(ENDPOINTS.PRODUCTS.LIST)
 */

export const ENDPOINTS = {
  // ── Auth ─────────────────────────────────────────────────
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
    GOOGLE: '/auth/google',
  },

  // ── Users ─────────────────────────────────────────────────
  USERS: {
    LIST: '/users',
    DETAIL: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    UPDATE_PASSWORD: '/users/change-password',
    UPLOAD_AVATAR: '/users/avatar',
  },

  // ── Products ──────────────────────────────────────────────
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id) => `/products/${id}`,
    BY_SLUG: (slug) => `/products/slug/${slug}`,
    CREATE: '/products',
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
    FEATURED: '/products/featured',
    NEW_ARRIVALS: '/products/new-arrivals',
    SEARCH: '/products/search',
  },

  // ── Categories ────────────────────────────────────────────
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id) => `/categories/${id}`,
    CREATE: '/categories',
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`,
    PRODUCTS: (id) => `/categories/${id}/products`,
  },

  // ── Cart ──────────────────────────────────────────────────
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: (itemId) => `/cart/items/${itemId}`,
    REMOVE: (itemId) => `/cart/items/${itemId}`,
    CLEAR: '/cart/clear',
    MERGE: '/cart/merge',
  },

  // ── Wishlist ──────────────────────────────────────────────
  WISHLIST: {
    GET: '/wishlist',
    ADD: '/wishlist/add',
    REMOVE: (productId) => `/wishlist/${productId}`,
    CLEAR: '/wishlist/clear',
  },

  // ── Orders ────────────────────────────────────────────────
  ORDERS: {
    LIST: '/orders',
    MY_ORDERS: '/orders/my-orders',
    DETAIL: (id) => `/orders/${id}`,
    CREATE: '/orders',
    CANCEL: (id) => `/orders/${id}/cancel`,
    TRACK: (id) => `/orders/${id}/track`,
  },

  // ── Reviews ───────────────────────────────────────────────
  REVIEWS: {
    LIST: (productId) => `/products/${productId}/reviews`,
    CREATE: (productId) => `/products/${productId}/reviews`,
    UPDATE: (reviewId) => `/reviews/${reviewId}`,
    DELETE: (reviewId) => `/reviews/${reviewId}`,
  },

  // ── Payments ──────────────────────────────────────────────
  PAYMENTS: {
    CREATE_INTENT: '/payments/create-intent',
    CONFIRM: '/payments/confirm',
    WEBHOOK: '/payments/webhook',
    HISTORY: '/payments/history',
  },

  // ── Dashboard (Admin) ─────────────────────────────────────
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ORDERS: '/dashboard/recent-orders',
    REVENUE: '/dashboard/revenue',
  },

  // ── Settings ──────────────────────────────────────────────
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
  },
};
