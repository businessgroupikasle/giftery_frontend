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
    REQUEST_OTP: '/auth/request-otp',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_OTP: '/auth/resend-otp',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
  },

  // ── Users ─────────────────────────────────────────────────
  USERS: {
    LIST: '/users',
    DETAIL: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    STATUS: (id) => `/users/${id}/status`,
    DELETE: (id) => `/users/${id}`,
    UPDATE_PASSWORD: '/users/change-password',
    UPLOAD_AVATAR: '/users/avatar',
  },

  // ── Addresses ─────────────────────────────────────────────
  ADDRESSES: {
    LIST: '/addresses',
    DETAIL: (id) => `/addresses/${id}`,
    CREATE: '/addresses',
    UPDATE: (id) => `/addresses/${id}`,
    DELETE: (id) => `/addresses/${id}`,
    SET_DEFAULT: (id) => `/addresses/${id}/default`,
    USER_ADDRESS: '/users/address',
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
    ADD: '/cart',
    UPDATE: (itemId) => `/cart/${itemId}`,
    REMOVE: (itemId) => `/cart/${itemId}`,
    CLEAR: '/cart',
  },

  // ── Wishlist ──────────────────────────────────────────────
  WISHLIST: {
    GET: '/wishlist',
    ADD: '/wishlist',
    REMOVE: (productId) => `/wishlist/${productId}`,
    CLEAR: '/wishlist',
  },

  // ── Orders ────────────────────────────────────────────────
  ORDERS: {
    LIST: '/orders',
    MY: '/orders/my',
    MY_ORDERS: '/orders/my',
    DETAIL: (id) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
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
    RAZORPAY_CREATE_ORDER: '/payments/razorpay/create-order',
    RAZORPAY_VERIFY: '/payments/razorpay/verify-payment',
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
    PRODUCTS: {
      LIST: '/dashboard/products',
      DETAIL: (id) => `/dashboard/products/${id}`,
      CREATE: '/dashboard/products',
      UPDATE: (id) => `/dashboard/products/${id}`,
      DELETE: (id) => `/dashboard/products/${id}`,
      CLONE: (id) => `/dashboard/products/${id}/clone`,
      STATUS: (id) => `/dashboard/products/${id}/status`,
      INVENTORY: (id) => `/dashboard/products/${id}/inventory`,
      LOW_STOCK: '/dashboard/products/stock/low',
      OUT_OF_STOCK: '/dashboard/products/stock/outofstock',
      BY_STATUS: (status) => `/dashboard/products/status/${status}`,
      TOP_SELLING: '/dashboard/products/top-selling',
      STATS: '/dashboard/products/stats',
      BULK_STATUS: '/dashboard/products/batch/status',
      BULK_DELETE: '/dashboard/products/batch/delete',
    },
  },

  // ── Settings ──────────────────────────────────────────────
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
  },

  // ── Enquiries & Uploads ────────────────────────────────────
  ENQUIRIES: {
    SUBMIT: '/enquiries',
    LIST: '/enquiries',
    UPDATE_STATUS: (id) => `/enquiries/${id}/status`,
  },
  UPLOADS: {
    SINGLE: '/uploads',
  },
};
