import { createSlice } from '@reduxjs/toolkit';

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
      state.items = items.map((item) => {
        const itemId = String(item.id || item.productId || item.product?.id || `item-${Date.now()}`);
        const qty = Number(item.quantity) || 1;
        const unitPrice = Number(item.price || item.salePrice || item.product?.salePrice || item.product?.price || 0);
        return {
          ...item,
          id: itemId,
          productId: itemId,
          name: item.name || item.product?.name || 'Gift Item',
          price: unitPrice,
          salePrice: unitPrice,
          image: item.image || item.product?.images?.[0] || item.product?.image || '/images/products/placeholder.png',
          slug: item.slug || item.product?.slug || '',
          quantity: qty,
        };
      });
      recalculateCart(state);
    },
    addItem: (state, action) => {
      const payload = action.payload || {};
      const targetId = String(payload.id || payload.productId || payload.product?.id || `prod-${Date.now()}`);
      const qty = Number(payload.quantity) || 1;
      const unitPrice = Number(payload.price || payload.salePrice || payload.product?.salePrice || payload.product?.price || 0);

      // Find existing item by id, productId or product.id
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
          product: payload.product || {
            id: targetId,
            name: payload.name || 'Gift Item',
            price: unitPrice,
            image: payload.image || '',
          },
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
      saveCartToStorage(state);
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
});

export const { setCart, addItem, removeItem, clearCart, updateQuantity, setCartLoading, setCartError } =
  cartSlice.actions;

// Convenient aliases used by components
export const addToCart = addItem;
export const removeFromCart = removeItem;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.totalPrice;
export const selectCartCount = (state) => state.cart.items.length;

export default cartSlice.reducer;
