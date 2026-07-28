import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';

/**
 * productService — All product API calls
 */
const productService = {
  getAll: (params) => axiosInstance.get(ENDPOINTS.PRODUCTS.LIST, { params }),
  getById: (id) => axiosInstance.get(ENDPOINTS.PRODUCTS.DETAIL(id)),
  getBySlug: (slug) => axiosInstance.get(ENDPOINTS.PRODUCTS.BY_SLUG(slug)),
  getFeatured: () => axiosInstance.get(ENDPOINTS.PRODUCTS.FEATURED),
  getNewArrivals: () => axiosInstance.get(ENDPOINTS.PRODUCTS.NEW_ARRIVALS),
  search: (query) => axiosInstance.get(ENDPOINTS.PRODUCTS.SEARCH, { params: { q: query } }),
  create: (data) => axiosInstance.post(ENDPOINTS.PRODUCTS.CREATE, data),
  update: (id, data) => axiosInstance.put(ENDPOINTS.PRODUCTS.UPDATE(id), data),
  delete: (id) => axiosInstance.delete(ENDPOINTS.PRODUCTS.DELETE(id)),
};

export default productService;
