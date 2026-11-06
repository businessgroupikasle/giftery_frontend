import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';

const multipart = { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 };
const { CUSTOMIZATIONS: API } = ENDPOINTS;

/** customizationService.js — Saved designs and private artwork for the signed-in customer. */
export const customizationService = {
  listDesigns: async (params = {}) => {
    const res = await axiosInstance.get(API.DESIGNS, { params });
    return res.data?.data || [];
  },
  getDesign: async (id) => (await axiosInstance.get(API.DESIGN(id))).data,
  createDesign: async (payload) => (await axiosInstance.post(API.DESIGNS, payload)).data,
  updateDesign: async (id, payload) => (await axiosInstance.put(API.DESIGN(id), payload)).data,
  duplicateDesign: async (id) => (await axiosInstance.post(API.DUPLICATE(id))).data,
  deleteDesign: (id) => axiosInstance.delete(API.DESIGN(id)),

  finalizeDesign: async (id, { blob, includesProductImage, revision }) => {
    const form = new FormData();
    form.append('expectedRevision', String(revision));
    form.append('includesProductImage', String(includesProductImage));
    form.append('preview', blob, 'design-preview.jpg');
    return (await axiosInstance.post(API.FINALIZE(id), form, multipart)).data;
  },

  listAssets: async () => (await axiosInstance.get(API.ASSETS)).data || [],
  uploadAsset: async (file, kind) => {
    const form = new FormData();
    form.append('kind', kind);
    form.append('image', file);
    return (await axiosInstance.post(API.ASSETS, form, multipart)).data;
  },
  fetchAssetBlob: (id, params) => axiosInstance.get(API.ASSET(id), { responseType: 'blob', params }),
  deleteAsset: (id) => axiosInstance.delete(API.ASSET(id)),

  listAdminItems: async (params) => (await axiosInstance.get(API.ADMIN_ITEMS, { params })).data,
  updateReviewStatus: async (itemId, payload) => (await axiosInstance.patch(API.ADMIN_ITEM_STATUS(itemId), payload)).data,
};

export default customizationService;
