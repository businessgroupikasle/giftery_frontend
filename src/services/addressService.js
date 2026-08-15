import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';

/**
 * addressService — Unified delivery address client service
 */
export const addressService = {
  /**
   * Fetch all saved addresses for the authenticated user
   * @returns {Promise<{ addresses: Array, defaultAddress: Object|null }>}
   */
  getAddresses: async () => {
    try {
      const res = await axiosInstance.get(ENDPOINTS.ADDRESSES.LIST);
      const data = res?.data || res;
      let addresses = data?.addresses || [];
      let defaultAddress = data?.defaultAddress || null;

      if (!Array.isArray(addresses) && Array.isArray(data)) {
        addresses = data;
      }

      if (!defaultAddress && addresses.length > 0) {
        defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
      }

      return { addresses, defaultAddress };
    } catch (err) {
      // Fallback to /users/address
      try {
        const fallbackRes = await axiosInstance.get(ENDPOINTS.ADDRESSES.USER_ADDRESS);
        const fallbackData = fallbackRes?.data || fallbackRes;
        const address = fallbackData?.address || null;
        return {
          addresses: address ? [address] : [],
          defaultAddress: address,
        };
      } catch (e) {
        console.warn('Address fetch warning:', e.message);
        return { addresses: [], defaultAddress: null };
      }
    }
  },

  /**
   * Get single address by ID
   */
  getAddressById: async (id) => {
    const res = await axiosInstance.get(ENDPOINTS.ADDRESSES.DETAIL(id));
    return res?.data?.address || res?.address || res;
  },

  /**
   * Create a new address
   */
  createAddress: async (addressData) => {
    const res = await axiosInstance.post(ENDPOINTS.ADDRESSES.CREATE, addressData);
    return res?.data?.address || res?.address || res;
  },

  /**
   * Update an existing address
   */
  updateAddress: async (id, addressData) => {
    const res = await axiosInstance.put(ENDPOINTS.ADDRESSES.UPDATE(id), addressData);
    return res?.data?.address || res?.address || res;
  },

  /**
   * Set address as default
   */
  setDefaultAddress: async (id) => {
    const res = await axiosInstance.put(ENDPOINTS.ADDRESSES.SET_DEFAULT(id));
    return res?.data?.address || res?.address || res;
  },

  /**
   * Delete address
   */
  deleteAddress: async (id) => {
    const res = await axiosInstance.delete(ENDPOINTS.ADDRESSES.DELETE(id));
    return res?.data || res;
  },
};

export default addressService;
