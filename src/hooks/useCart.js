import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  selectCartItems,
  selectCartTotal,
  selectCartCount,
  addItem,
  removeItem,
  clearCart,
} from '@store/slices/cartSlice';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';

/**
 * useCart — Cart state and actions
 */
const useCart = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);

  const addToCart = useCallback(async (product, quantity = 1) => {
    const item = { productId: product.id, product, quantity };
    dispatch(addItem(item));
    try {
      await axiosInstance.post(ENDPOINTS.CART.ADD, { productId: product.id, quantity });
    } catch {
      // Optimistic update — rollback on real app if needed
    }
  }, [dispatch]);

  const removeFromCart = useCallback(async (itemId) => {
    dispatch(removeItem(itemId));
    try {
      await axiosInstance.delete(ENDPOINTS.CART.REMOVE(itemId));
    } catch { /* silent */ }
  }, [dispatch]);

  const emptyCart = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  return { items, total, count, addToCart, removeFromCart, emptyCart };
};

export default useCart;
