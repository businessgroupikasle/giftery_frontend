import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import { unwrapApiData } from '@utils/apiResponse';

const unwrapCoupons = (response) => {
  const value = unwrapApiData(response);
  return Array.isArray(value) ? value : [];
};

export const couponService = {
  listActive: async () => unwrapCoupons(await axiosInstance.get(ENDPOINTS.COUPONS.LIST)),
  listAdmin: async () => unwrapCoupons(await axiosInstance.get(ENDPOINTS.COUPONS.ADMIN_LIST)),
  create: async (coupon) => unwrapApiData(await axiosInstance.post(ENDPOINTS.COUPONS.CREATE, coupon)),
  update: async (id, coupon) => unwrapApiData(await axiosInstance.put(ENDPOINTS.COUPONS.UPDATE(id), coupon)),
  remove: async (id) => axiosInstance.delete(ENDPOINTS.COUPONS.DELETE(id)),
};
