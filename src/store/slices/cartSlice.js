import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalQuantity: 0,
    totalPrice: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setCart: (state, action) => {
      const items = action.payload;
      state.items = items;
      state.totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
      state.totalPrice = items.reduce(
        (sum, i) => sum + i.quantity * (i.product?.salePrice || i.product?.price || 0),
        0
      );
    },
    addItem: (state, action) => {
      const existing = state.items.find((i) => i.productId === action.payload.productId);
      if (existing) {
        existing.quantity += action.payload.quantity || 1;
      } else {
        state.items.push(action.payload);
      }
      state.totalQuantity += action.payload.quantity || 1;
      state.totalPrice +=
        (action.payload.quantity || 1) *
        (action.payload.product?.salePrice || action.payload.product?.price || 0);
    },
    removeItem: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        state.totalQuantity -= item.quantity;
        state.totalPrice -= item.quantity * (item.product?.salePrice || item.product?.price || 0);
        state.items = state.items.filter((i) => i.id !== action.payload);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    },
    updateQuantity: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        const diff = action.payload.quantity - item.quantity;
        item.quantity = action.payload.quantity;
        state.totalQuantity += diff;
        state.totalPrice += diff * (item.product?.price || item.price || 0);
      }
    },
    setCartLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCartError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setCart, addItem, removeItem, clearCart, updateQuantity, setCartLoading, setCartError } =
  cartSlice.actions;

// Convenient aliases used by components
export const addToCart    = addItem;
export const removeFromCart = removeItem;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.totalPrice;
export const selectCartCount = (state) => state.cart.totalQuantity;

export default cartSlice.reducer;
