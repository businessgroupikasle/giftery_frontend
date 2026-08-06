import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import { getToken } from '@utils/storage';

const STORAGE_KEY = 'giftery_wishlist_state';

const loadWishlistFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Wishlist load error from storage:', e);
  }
  return [];
};

const saveWishlistToStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Wishlist save error to storage:', e);
  }
};

const normalizeWishlistItem = (item) => {
  const p = item.product || {};
  const targetId = String(p.id || item.productId || item.id || `wish-${Date.now()}`);
  const unitPrice = Number(p.price || item.price || 0);
  const img = Array.isArray(p.images)
    ? p.images[0]
    : (p.image || item.image || '/placeholder.jpg');

  return {
    id: targetId,
    productId: targetId,
    name: p.name || item.name || 'Gift Item',
    price: unitPrice,
    image: img,
    slug: p.slug || item.slug || '',
  };
};

// ── Async Thunks for Wishlist Database Sync ─────────────────────────────────

export const fetchWishlistAsync = createAsyncThunk(
  'wishlist/fetchWishlistAsync',
  async (_, { rejectWithValue }) => {
    try {
      if (!getToken()) return null;
      const res = await axiosInstance.get(ENDPOINTS.WISHLIST.GET);
      const wishlist = res?.data?.wishlist || res?.wishlist || res;
      if (wishlist && Array.isArray(wishlist.items)) {
        return wishlist.items.map(normalizeWishlistItem);
      }
      return [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlistAsync = createAsyncThunk(
  'wishlist/addToWishlistAsync',
  async (product, { dispatch, rejectWithValue }) => {
    dispatch(wishlistSlice.actions.addToWishlist(product));
    if (getToken()) {
      try {
        const targetId = product.productId || product.id;
        if (targetId) {
          await axiosInstance.post(ENDPOINTS.WISHLIST.ADD, { productId: targetId });
        }
      } catch (err) {
        console.warn('Backend wishlist sync error on add:', err.message);
      }
    }
  }
);

export const removeFromWishlistAsync = createAsyncThunk(
  'wishlist/removeFromWishlistAsync',
  async (idPayload, { dispatch, rejectWithValue }) => {
    const targetId = String(idPayload);
    dispatch(wishlistSlice.actions.removeFromWishlist(targetId));
    if (getToken()) {
      try {
        await axiosInstance.delete(ENDPOINTS.WISHLIST.REMOVE(targetId));
      } catch (err) {
        console.warn('Backend wishlist sync error on remove:', err.message);
      }
    }
  }
);

export const clearWishlistAsync = createAsyncThunk(
  'wishlist/clearWishlistAsync',
  async (_, { dispatch, rejectWithValue }) => {
    dispatch(wishlistSlice.actions.clearWishlist());
    if (getToken()) {
      try {
        await axiosInstance.delete(ENDPOINTS.WISHLIST.CLEAR);
      } catch (err) {
        console.warn('Backend wishlist sync error on clear:', err.message);
      }
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: loadWishlistFromStorage(),
    loading: false,
    error: null,
  },
  reducers: {
    setWishlist: (state, action) => {
      state.items = (action.payload || []).map(normalizeWishlistItem);
      saveWishlistToStorage(state.items);
    },
    addToWishlist: (state, action) => {
      const newId = String(action.payload.productId || action.payload.id);
      const exists = state.items.some((i) => String(i.productId || i.id) === newId);
      if (!exists) {
        state.items.push(normalizeWishlistItem(action.payload));
        saveWishlistToStorage(state.items);
      }
    },
    removeFromWishlist: (state, action) => {
      const removeId = String(action.payload);
      state.items = state.items.filter((i) => String(i.productId || i.id) !== removeId);
      saveWishlistToStorage(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWishlistAsync.fulfilled, (state, action) => {
      if (Array.isArray(action.payload)) {
        state.items = action.payload;
        saveWishlistToStorage(state.items);
      }
    });
  },
});

export const { setWishlist, addToWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;

// Convenient aliases used across app
export const addToWishlistAlias = addToWishlistAsync;
export const removeFromWishlistAlias = removeFromWishlistAsync;

// Selectors
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.some((i) => String(i.productId || i.id) === String(productId));

export default wishlistSlice.reducer;
