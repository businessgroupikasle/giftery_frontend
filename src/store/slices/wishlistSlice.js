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
      const exists = state.items.some((i) => i.productId === action.payload.productId);
      if (!exists) state.items.push(action.payload);
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
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
  state.wishlist.items.some((i) => i.productId === productId);

export default wishlistSlice.reducer;
