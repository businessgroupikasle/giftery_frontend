import axios from 'axios';
import env from '@config/env';
import { getToken, clearAuth } from '@utils/storage';
import { GetRequestStore, parseRetryAfter, stableSerialize, waitFor } from './requestPolicy';

const MAX_GET_RETRIES = 2;
const RETRY_BUDGET_MS = 8000;
const getRequestStore = new GetRequestStore();

const cacheablePublicPath = (url = '') =>
  ['/products', '/categories', '/settings'].some((path) => url === path || url.startsWith(`${path}?`));

const getRequestKey = (url, config = {}) =>
  `${getToken() || 'anonymous'}|${url}|${stableSerialize(config.params || {})}`;

const axiosInstance = axios.create({
  baseURL: `${env.API_BASE_URL}/api/v1`,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const requestUrl = error.config?.url || '';
    const method = error.config?.method?.toLowerCase();
    const cancelled = axios.isCancel(error) || error.code === 'ERR_CANCELED';
    const retryable = method === 'get' && !cancelled && (status === 429 || !status || status >= 500);

    if (retryable) {
      const config = error.config;
      const retryCount = config.__retryCount || 0;
      const startedAt = config.__retryStartedAt || Date.now();
      const retryAfter = parseRetryAfter(error.response?.headers?.['retry-after']);
      const fallbackDelay = (300 * (2 ** retryCount)) + Math.floor(Math.random() * 200);
      const delay = retryAfter ?? fallbackDelay;

      if (retryCount < MAX_GET_RETRIES && Date.now() - startedAt + delay <= RETRY_BUDGET_MS) {
        config.__retryCount = retryCount + 1;
        config.__retryStartedAt = startedAt;
        await waitFor(delay, config.signal);
        return axiosInstance(config);
      }
    }

    const isAuthRoute = requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/request-otp') ||
      requestUrl.includes('/auth/verify-email');

    if (status === 401 && !isAuthRoute) {
      clearAuth();
      window.location.href = '/login';
    }
    if (status === 403 && !isAuthRoute) window.location.assign('/403');

    return Promise.reject({
      status,
      message: status === 429
        ? (message || 'Too many requests. Please wait before trying again.')
        : (message || 'Invalid username or password. Please check your credentials.'),
      errors: error.response?.data?.errors || [],
      headers: error.response?.headers || {},
      retryAfter: parseRetryAfter(error.response?.headers?.['retry-after']),
      code: error.code,
    });
  }
);

const baseGet = axiosInstance.get.bind(axiosInstance);
axiosInstance.get = (url, config = {}) => {
  if (config.signal) return baseGet(url, config);
  const key = getRequestKey(url, config);
  const cacheable = !getToken() && cacheablePublicPath(url) && !config.signal;
  return getRequestStore.run(key, () => baseGet(url, config), cacheable);
};

['post', 'put', 'patch', 'delete'].forEach((method) => {
  const baseMutation = axiosInstance[method].bind(axiosInstance);
  axiosInstance[method] = async (...args) => {
    const result = await baseMutation(...args);
    getRequestStore.clear();
    return result;
  };
});

export default axiosInstance;
