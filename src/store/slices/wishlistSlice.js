import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload;
    },
    addToWishlist: (state, action) => {
      const newId = action.payload.productId || action.payload.id;
      const exists = state.items.some((i) => (i.productId || i.id) === newId);
      if (!exists) state.items.push(action.payload);
    },
    removeFromWishlist: (state, action) => {
      const removeId = action.payload;
      state.items = state.items.filter((i) => (i.productId || i.id) !== removeId);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const { setWishlist, addToWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;

export const selectWishlistItems = (state) => state.wishlist.items;
export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.some((i) => (i.productId || i.id) === productId);

export default wishlistSlice.reducer;
