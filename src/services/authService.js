import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import { setToken, setUser, clearAuth } from '@utils/storage';

/**
 * authService — All authentication API calls
 */
const authService = {
  /**
   * Login with email + password
   * @param {{ email: string, password: string }} credentials
   */
  login: async (credentials) => {
    const data = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, credentials);
    setToken(data.token);
    setUser(data.user);
    return data;
  },

  /**
   * Register a new user
   */
  register: async (payload) => {
    const data = await axiosInstance.post(ENDPOINTS.AUTH.REGISTER, payload);
    setToken(data.token);
    setUser(data.user);
    return data;
  },

  /**
   * Logout and clear local credentials
   */
  logout: async () => {
    try {
      await axiosInstance.post(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      clearAuth();
    }
  },

  /**
   * Get the currently authenticated user
   */
  getMe: () => axiosInstance.get(ENDPOINTS.AUTH.ME),

  /**
   * Send forgot-password email
   */
  forgotPassword: (email) =>
    axiosInstance.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  /**
   * Reset password with token
   */
  resetPassword: (token, password) =>
    axiosInstance.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),
};

export default authService;
