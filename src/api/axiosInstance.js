import axios from 'axios';
import env from '@config/env';
import { getToken, clearAuth } from '@utils/storage';

/**
 * axiosInstance — Pre-configured Axios client
 *
 * - baseURL pulled from VITE_API_BASE_URL via env.js
 * - Automatically attaches Bearer token from localStorage
 * - Handles 401 → clears auth and redirects to login
 */
const axiosInstance = axios.create({
  baseURL: `${env.API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request Interceptor ───────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    // Token expired / unauthorized
    if (status === 401) {
      clearAuth();
      window.location.href = '/login';
    }

    // Forbidden
    if (status === 403) {
      window.location.href = '/403';
    }

    return Promise.reject({
      status,
      message,
      errors: error.response?.data?.errors || [],
    });
  }
);

export default axiosInstance;
