import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import { setToken, setUser, clearAuth } from '@utils/storage';

/**
 * authService — All authentication API calls
 */
const authService = {
  /**
   * Login with email + password
   */
  login: async (credentials) => {
    const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, credentials);
    const payload = response.data || response;
    if (payload.token) setToken(payload.token);
    if (payload.user) setUser(payload.user);
    return payload;
  },

  /**
   * Request Email Verification OTP inline
   */
  requestOTP: async ({ email, name }) => {
    const response = await axiosInstance.post(ENDPOINTS.AUTH.REQUEST_OTP, { email, name });
    return response.data || response;
  },

  /**
   * Register user (with inline OTP verification)
   */
  register: async (payloadData) => {
    const response = await axiosInstance.post(ENDPOINTS.AUTH.REGISTER, payloadData);
    const payload = response.data || response;
    if (payload.token) setToken(payload.token);
    if (payload.user) setUser(payload.user);
    return payload;
  },

  /**
   * Verify Email using 6-Digit OTP Code
   */
  verifyEmail: async ({ email, otp }) => {
    const response = await axiosInstance.post(ENDPOINTS.AUTH.VERIFY_EMAIL, { email, otp });
    const payload = response.data || response;
    if (payload.token) setToken(payload.token);
    if (payload.user) setUser(payload.user);
    return payload;
  },

  /**
   * Resend Verification OTP Code
   */
  resendOTP: async ({ email }) => {
    const response = await axiosInstance.post(ENDPOINTS.AUTH.RESEND_OTP, { email });
    return response.data || response;
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
