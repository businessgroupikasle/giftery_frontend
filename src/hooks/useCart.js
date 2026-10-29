import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  selectCartItems,
  selectCartTotal,
  selectCartCount,
  addToCartAsync,
  removeFromCartAsync,
  clearCartAsync,
} from '@store/slices/cartSlice';

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
    return dispatch(addToCartAsync(item)).unwrap();
  }, [dispatch]);

  const removeFromCart = useCallback(async (itemId) => {
    return dispatch(removeFromCartAsync(itemId)).unwrap();
  }, [dispatch]);

  const emptyCart = useCallback(() => {
    return dispatch(clearCartAsync()).unwrap();
  }, [dispatch]);

  return { items, total, count, addToCart, removeFromCart, emptyCart };
};

export default useCart;
