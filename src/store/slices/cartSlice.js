import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '@services/cartService';
import { getToken } from '@utils/storage';
import { cartsMatch, createCartQueue } from './cartSync';
import { logout, setCredentials } from './authSlice';

const STORAGE_KEY = 'giftery_cart_state';
const enqueueCart = createCartQueue();

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.items)) {
        const publicItems = parsed.items.filter((item) => !item.customization && !item.isCustomized && !item.logo && !item.customText);
        if (publicItems.length !== parsed.items.length) {
          parsed.items = publicItems;
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: publicItems }));
        }
      }
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
        items: state.items.filter((item) => !item.customization && !item.isCustomized && !item.logo && !item.customText),
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
    : (p.image || item.image || '/images/product-placeholder.svg');

  return {
    id: item.customization ? String(item.id) : targetId,
    dbItemId: item.id, // Database CartItem ID if available
    productId: targetId,
    name: p.name || item.name || 'Gift Item',
    variant: item.variant || 'Standard Edition',
    price: unitPrice,
    salePrice: unitPrice,
    image: img,
    slug: p.slug || item.slug || '',
    quantity: qty,
    customization: item.customization || null,
    isCustomized: Boolean(item.customization),
    maxStock: p.stock !== undefined ? Number(p.stock) : (item.maxStock || 9999),
  };
};

// ── Async Thunks for Database Profile Sync ─────────────────────────────────

export const fetchCartAsync = createAsyncThunk('cart/fetchCartAsync', async (_, { dispatch, getState, rejectWithValue }) => {
  try {
    const token = getToken();
    if (!token) return null;
    return await enqueueCart(async () => {
      const revision = getState().cart.revision;
      const cart = await cartService.getCart();
      if (getToken() === token && getState().auth.token === token && getState().cart.revision === revision && Array.isArray(cart?.items)) {
        dispatch(cartSlice.actions.setCart(cart.items));
      }
      return cart;
    });
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch cart');
  }
});

export const addToCartAsync = createAsyncThunk('cart/addToCartAsync', async (payload, { dispatch, getState, rejectWithValue }) => {
  const token = getToken();
  if (!token) {
    if (payload.customization) return rejectWithValue('Please sign in to add a customized product.');
    dispatch(cartSlice.actions.addItem(payload));
    return;
  }
  try {
    return await enqueueCart(async () => {
      if (getToken() !== token || getState().auth.token !== token) throw new Error('Your session changed. Please try again.');
      const revision = getState().cart.revision;
      const cart = await cartService.addItem({ productId: payload.productId || payload.id || payload.product?.id, quantity: Number(payload.quantity) || 1, customization: payload.customization });
      if (!Array.isArray(cart?.items)) throw new Error('The cart response did not include items.');
      if (getToken() !== token || getState().auth.token !== token || getState().cart.revision !== revision) throw new Error('Cart changed during the update. Refresh your cart to see the saved result.');
      dispatch(cartSlice.actions.setCart(cart.items));
      return cart;
    });
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to add product to cart.');
  }
});

export const updateQuantityAsync = createAsyncThunk('cart/updateQuantityAsync', async (payload, { dispatch, getState, rejectWithValue }) => {
  const token = getToken();
  if (token) {
    try {
      return await enqueueCart(async () => {
        if (getToken() !== token || getState().auth.token !== token) throw new Error('Your session changed. Please try again.');
        const targetId = String(payload.id || payload.productId || '');
        const item = getState().cart.items.find((i) => String(i.id || i.productId) === targetId);
        if (!item) throw new Error('This cart item is no longer available.');
        const revision = getState().cart.revision;
        let itemId = item.dbItemId;
        if (!itemId) {
          const cart = await cartService.getCart();
          itemId = cart?.items?.find((i) => !i.customization && String(i.productId || i.product?.id) === String(item.productId))?.id;
        }
        if (!itemId) throw new Error('This item is not synchronized with your cart.');
        const quantity = Math.min(Number(payload.quantity), item.maxStock ?? 9999);
        const cart = quantity <= 0 ? await cartService.removeItem(itemId) : await cartService.updateItem(itemId, quantity);
        if (!Array.isArray(cart?.items)) throw new Error('The cart response did not include items.');
        if (getToken() !== token || getState().auth.token !== token || getState().cart.revision !== revision) throw new Error('Cart changed during the update. Refresh your cart to see the saved result.');
        dispatch(cartSlice.actions.setCart(cart.items));
        return cart;
      });
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update cart quantity.');
    }
  }
  dispatch(cartSlice.actions.updateQuantity(payload));
});

export const removeFromCartAsync = createAsyncThunk('cart/removeFromCartAsync', async (idPayload, { dispatch, getState, rejectWithValue }) => {
  const token = getToken();
  if (token) {
    try {
      return await enqueueCart(async () => {
        if (getToken() !== token || getState().auth.token !== token) throw new Error('Your session changed. Please try again.');
        const item = getState().cart.items.find((i) => String(i.id || i.productId) === String(idPayload));
        if (!item) throw new Error('This cart item is no longer available.');
        const revision = getState().cart.revision;
        let itemId = item.dbItemId;
        if (!itemId) {
          const cart = await cartService.getCart();
          itemId = cart?.items?.find((i) => !i.customization && String(i.productId || i.product?.id) === String(item.productId))?.id;
        }
        if (!itemId) throw new Error('This item is not synchronized with your cart.');
        const cart = await cartService.removeItem(itemId);
        if (!Array.isArray(cart?.items)) throw new Error('The cart response did not include items.');
        if (getToken() !== token || getState().auth.token !== token || getState().cart.revision !== revision) throw new Error('Cart changed during the update. Refresh your cart to see the saved result.');
        dispatch(cartSlice.actions.setCart(cart.items));
        return cart;
      });
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to remove item from cart.');
    }
  }
  dispatch(cartSlice.actions.removeItem(idPayload));
});

export const clearCartAsync = createAsyncThunk('cart/clearCartAsync', async (_, { dispatch, getState, rejectWithValue }) => {
  try {
    const token = getToken();
    if (token) {
      await enqueueCart(async () => {
        if (getToken() !== token || getState().auth.token !== token) throw new Error('Your session changed. Please try again.');
        const revision = getState().cart.revision;
        await cartService.clearCart();
        if (getToken() === token && getState().auth.token === token && getState().cart.revision === revision) dispatch(cartSlice.actions.clearCart());
      });
    } else {
      dispatch(cartSlice.actions.clearCart());
    }
    return true;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to clear cart');
  }
});

export const confirmCartForCheckout = createAsyncThunk('cart/confirmCheckout', async (displayedItems, { getState, rejectWithValue }) => {
  const token = getToken();
  if (!token) return rejectWithValue('Please sign in to check out your cart.');
  try {
    return await enqueueCart(async () => {
      if (getToken() !== token || getState().auth.token !== token) throw new Error('Your session changed. Please sign in again.');
      const revision = getState().cart.revision;
      const cart = await cartService.getCart();
      if (!Array.isArray(cart?.items)) throw new Error('Unable to verify your cart.');
      if (getToken() !== token || getState().auth.token !== token || getState().cart.revision !== revision || !cart.items.length || !cartsMatch(displayedItems, getState().cart.items) || !cartsMatch(getState().cart.items, cart.items.map(normalizeCartItem))) {
        throw new Error('Your cart is not synchronized. Return to the cart and refresh it before checking out.');
      }
      return cart;
    });
  } catch (err) {
    return rejectWithValue(err.message || 'Unable to verify your cart.');
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
    revision: 0,
  },
  reducers: {
    setCart: (state, action) => {
      state.revision += 1;
      const items = Array.isArray(action.payload) ? action.payload : [];
      state.items = items.map(normalizeCartItem);
      recalculateCart(state);
    },
    addItem: (state, action) => {
      state.revision += 1;
      const payload = action.payload || {};
      const targetId = String(payload.id || payload.productId || payload.product?.id || `prod-${Date.now()}`);
      const qty = Number(payload.quantity) || 1;
      const unitPrice = Number(payload.price || payload.salePrice || payload.product?.salePrice || payload.product?.price || 0);

      const existingIndex = state.items.findIndex((i) => {
        const itemId = String(i.id || i.productId || i.product?.id || '');
        return !payload.customization && !i.customization && itemId === targetId;
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
          variant: payload.variant || payload.product?.variant || 'Standard Edition',
          sku: payload.sku || payload.product?.sku || '',
          isCustomized: Boolean(payload.isCustomized || payload.logo || payload.customization),
          logo: payload.logo || null,
          customText: payload.customText || '',
          customization: payload.customization || null,
          price: unitPrice,
          salePrice: unitPrice,
          image: payload.image || payload.product?.images?.[0] || payload.product?.image || '/images/product-placeholder.svg',
          slug: payload.slug || payload.product?.slug || '',
          quantity: Math.min(qty, maxStock),
          maxStock,
        };
        state.items.push(newItem);
      }

      recalculateCart(state);
    },
    removeItem: (state, action) => {
      state.revision += 1;
      const targetId = String(action.payload);
      state.items = state.items.filter((i) => {
        const itemId = String(i.id || i.productId || i.product?.id || '');
        return itemId !== targetId;
      });
      recalculateCart(state);
    },
    clearCart: (state) => {
      state.revision += 1;
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    },
    updateQuantity: (state, action) => {
      state.revision += 1;
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
    builder.addCase(logout, (state) => {
      state.items = state.items.filter((item) => !item.customization && !item.isCustomized && !item.logo && !item.customText);
      state.revision += 1;
      recalculateCart(state);
    }).addCase(setCredentials, (state) => {
      state.items = state.items.filter((item) => !item.customization && !item.isCustomized && !item.logo && !item.customText);
      state.revision += 1;
      recalculateCart(state);
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
