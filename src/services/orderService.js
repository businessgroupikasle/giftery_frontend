import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';

const orderService = {
  getMyOrders: () => axiosInstance.get(ENDPOINTS.ORDERS.MY_ORDERS),
  getById: (id) => axiosInstance.get(ENDPOINTS.ORDERS.DETAIL(id)),
  create: (payload) => axiosInstance.post(ENDPOINTS.ORDERS.CREATE, payload),
  cancel: (id) => axiosInstance.patch(ENDPOINTS.ORDERS.CANCEL(id)),
  track: (id) => axiosInstance.get(ENDPOINTS.ORDERS.TRACK(id)),
};

export default orderService;
