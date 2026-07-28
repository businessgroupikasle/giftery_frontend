import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';

const paymentService = {
  createIntent: (payload) => axiosInstance.post(ENDPOINTS.PAYMENTS.CREATE_INTENT, payload),
  confirm: (payload) => axiosInstance.post(ENDPOINTS.PAYMENTS.CONFIRM, payload),
  getHistory: () => axiosInstance.get(ENDPOINTS.PAYMENTS.HISTORY),
};

export default paymentService;
