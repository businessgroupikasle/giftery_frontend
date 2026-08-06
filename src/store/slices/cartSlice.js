import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '@services/cartService';
import { getToken } from '@utils/storage';

const STORAGE_KEY = 'giftery_cart_state';

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        return {
          items: parsed.items,
          totalQuantity: parsed.items.length,
          totalPrice: parsed.items.reduce(
            (acc, i) => acc + (Number(i.quantity) || 1) * Number(i.price || i.salePrice || i.product?.price || 0),
            0
          ),
        };
      }
    }
  } catch (e) {
    console.warn('Cart load error from storage:', e);
  }
  return { items: [], totalQuantity: 0, totalPrice: 0 };
};

const saveCartToStorage = (state) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        items: state.items,
        totalQuantity: state.totalQuantity,
        totalPrice: state.totalPrice,
      })
    );
  } catch (e) {
    console.warn('Cart save error to storage:', e);
  }
};

const recalculateCart = (state) => {
  state.totalQuantity = state.items.length;
  state.totalPrice = state.items.reduce(
    (sum, i) => sum + (Number(i.quantity) || 1) * Number(i.price || i.salePrice || i.product?.salePrice || i.product?.price || 0),
    0
  );
  saveCartToStorage(state);
};

const normalizeCartItem = (item) => {
  const p = item.product || {};
  const targetId = String(p.id || item.productId || item.id || `item-${Date.now()}`);
  const unitPrice = Number(p.price || item.price || item.salePrice || 0);
  const qty = Number(item.quantity) || 1;
  const img = Array.isArray(p.images)
    ? p.images[0]
    : (p.image || item.image || '/images/products/placeholder.png');

  return {
    id: targetId,
    dbItemId: item.id, // Database CartItem ID if available
    productId: targetId,
    name: p.name || item.name || 'Gift Item',
    variant: item.variant || 'Standard Edition',
    price: unitPrice,
    salePrice: unitPrice,
    image: img,
    slug: p.slug || item.slug || '',
    quantity: qty,
    maxStock: p.stock !== undefined ? Number(p.stock) : (item.maxStock || 9999),
  };
};

// ── Async Thunks for Database Profile Sync ─────────────────────────────────

export const fetchCartAsync = createAsyncThunk('cart/fetchCartAsync', async (_, { rejectWithValue }) => {
  try {
    if (!getToken()) return null;
    const cartData = await cartService.getCart();
    return cartData;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch cart');
  }
});

export const addToCartAsync = createAsyncThunk('cart/addToCartAsync', async (payload, { dispatch, rejectWithValue }) => {
  // Always update local state first for immediate snappy UI feedback
  dispatch(cartSlice.actions.addItem(payload));

  if (getToken()) {
    try {
      const targetId = payload.id || payload.productId || payload.product?.id;
      const qty = Number(payload.quantity) || 1;
      if (targetId) {
        await cartService.addItem({ productId: targetId, quantity: qty });
      }
    } catch (err) {
      console.warn('Backend cart sync error on add:', err.message);
    }
  }
});

export const updateQuantityAsync = createAsyncThunk('cart/updateQuantityAsync', async (payload, { dispatch, getState, rejectWithValue }) => {
  dispatch(cartSlice.actions.updateQuantity(payload));

  if (getToken()) {
    try {
      const state = getState();
      const targetId = String(payload.id || payload.productId || '');
      const item = state.cart.items.find((i) => String(i.id || i.productId) === targetId);

      if (item && item.dbItemId) {
        if (payload.quantity <= 0) {
          await cartService.removeItem(item.dbItemId);
        } else {
          await cartService.updateItem(item.dbItemId, payload.quantity);
        }
      } else if (targetId) {
        // Fallback to fetch fresh cart from DB if dbItemId not linked
        await cartService.addItem({ productId: targetId, quantity: payload.quantity });
      }
    } catch (err) {
      console.warn('Backend cart sync error on update:', err.message);
    }
  }
});

export const removeFromCartAsync = createAsyncThunk('cart/removeFromCartAsync', async (idPayload, { dispatch, getState, rejectWithValue }) => {
  const targetId = String(idPayload);
  const state = getState();
  const item = state.cart.items.find((i) => String(i.id || i.productId) === targetId);

  dispatch(cartSlice.actions.removeItem(idPayload));

  if (getToken()) {
    try {
      if (item && item.dbItemId) {
        await cartService.removeItem(item.dbItemId);
      }
    } catch (err) {
      console.warn('Backend cart sync error on remove:', err.message);
    }
  }
});

export const clearCartAsync = createAsyncThunk('cart/clearCartAsync', async (_, { dispatch, rejectWithValue }) => {
  dispatch(cartSlice.actions.clearCart());

  if (getToken()) {
    try {
      await cartService.clearCart();
    } catch (err) {
      console.warn('Backend cart sync error on clear:', err.message);
    }
  }
});

const initialCartData = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: initialCartData.items,
    totalQuantity: initialCartData.totalQuantity,
    totalPrice: initialCartData.totalPrice,
    loading: false,
    error: null,
  },
  reducers: {
    setCart: (state, action) => {
      const items = Array.isArray(action.payload) ? action.payload : [];
      state.items = items.map(normalizeCartItem);
      recalculateCart(state);
    },
    addItem: (state, action) => {
      const payload = action.payload || {};
      const targetId = String(payload.id || payload.productId || payload.product?.id || `prod-${Date.now()}`);
      const qty = Number(payload.quantity) || 1;
      const unitPrice = Number(payload.price || payload.salePrice || payload.product?.salePrice || payload.product?.price || 0);

      const existingIndex = state.items.findIndex((i) => {
        const itemId = String(i.id || i.productId || i.product?.id || '');
        return itemId === targetId;
      });

      const maxStock = payload.maxStock !== undefined ? Number(payload.maxStock) : 9999;

      if (existingIndex > -1) {
        const item = state.items[existingIndex];
        const itemMaxStock = item.maxStock !== undefined ? Number(item.maxStock) : maxStock;
        const totalReq = item.quantity + qty;
        item.quantity = Math.min(totalReq, itemMaxStock);
      } else {
        const newItem = {
          id: targetId,
          productId: targetId,
          name: payload.name || payload.product?.name || 'Gift Item',
          variant: payload.variant || 'Standard Edition',
          isCustomized: Boolean(payload.isCustomized),
          price: unitPrice,
          salePrice: unitPrice,
          image: payload.image || payload.product?.images?.[0] || payload.product?.image || '/images/products/placeholder.png',
          slug: payload.slug || payload.product?.slug || '',
          quantity: Math.min(qty, maxStock),
          maxStock,
        };
        state.items.push(newItem);
      }

      recalculateCart(state);
    },
    removeItem: (state, action) => {
      const targetId = String(action.payload);
      state.items = state.items.filter((i) => {
        const itemId = String(i.id || i.productId || i.product?.id || '');
        return itemId !== targetId;
      });
      recalculateCart(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    },
    updateQuantity: (state, action) => {
      const { id, productId, quantity } = action.payload || {};
      const targetId = String(id || productId || '');
      const newQty = Number(quantity);

      const item = state.items.find((i) => {
        const itemId = String(i.id || i.productId || i.product?.id || '');
        return itemId === targetId;
      });

      if (item) {
        const itemMaxStock = item.maxStock !== undefined ? Number(item.maxStock) : 9999;
        if (newQty <= 0) {
          state.items = state.items.filter((i) => String(i.id || i.productId || i.product?.id || '') !== targetId);
        } else {
          item.quantity = Math.min(newQty, itemMaxStock);
        }
        recalculateCart(state);
      }
    },
    setCartLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCartError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCartAsync.fulfilled, (state, action) => {
      if (action.payload && Array.isArray(action.payload.items)) {
        state.items = action.payload.items.map(normalizeCartItem);
        recalculateCart(state);
      }
    });
  },
});

export const { setCart, addItem, removeItem, clearCart, updateQuantity, setCartLoading, setCartError } =
  cartSlice.actions;

// Aliases
export const addToCart = addToCartAsync;
export const removeFromCart = removeFromCartAsync;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.totalPrice;
export const selectCartCount = (state) => state.cart.items.length;

export default cartSlice.reducer;
