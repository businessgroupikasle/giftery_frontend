import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';

/**
 * cartService.js — Frontend service for user profile database cart API
 */
export const cartService = {
  getCart: async () => {
    const res = await axiosInstance.get(ENDPOINTS.CART.GET, { signal: new AbortController().signal });
    return res.data?.cart || res.cart || res;
  },

  addItem: async ({ productId, quantity = 1, customization }) => {
    const res = await axiosInstance.post(ENDPOINTS.CART.ADD, { productId, quantity, ...(customization ? { customization } : {}) });
    return res.data?.cart || res.cart || res;
  },

  updateItem: async (itemId, quantity) => {
    const res = await axiosInstance.put(ENDPOINTS.CART.UPDATE(itemId), { quantity });
    return res.data?.cart || res.cart || res;
  },

  removeItem: async (itemId) => {
    const res = await axiosInstance.delete(ENDPOINTS.CART.REMOVE(itemId));
    return res.data?.cart || res.cart || res;
  },

  clearCart: async () => {
    const res = await axiosInstance.delete(ENDPOINTS.CART.CLEAR);
    return res.data?.cart || res.cart || res;
  },
};

export default cartService;
