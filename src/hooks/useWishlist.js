import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  selectWishlistItems,
  addToWishlistAsync,
  removeFromWishlistAsync,
  fetchWishlistAsync,
  addToWishlist as addToWishlistAction,
  removeFromWishlist as removeFromWishlistAction,
  setWishlist,
} from '@store/slices/wishlistSlice';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import { getToken } from '@utils/storage';

const useWishlist = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);

  const addToWishlist = useCallback(async (product) => {
    const prodId = product.id || product.productId;
    dispatch(addToWishlistAction({ ...product, id: prodId, productId: prodId }));
    if (getToken()) {
      try {
        await axiosInstance.post(ENDPOINTS.WISHLIST.ADD, { productId: prodId });
      } catch (err) {
        console.warn('Backend wishlist add sync:', err.message);
      }
    }
  }, [dispatch]);

  const removeFromWishlist = useCallback(async (id) => {
    dispatch(removeFromWishlistAction(String(id)));
    if (getToken()) {
      try {
        await axiosInstance.delete(ENDPOINTS.WISHLIST.REMOVE(String(id)));
      } catch (err) {
        console.warn('Backend wishlist remove sync:', err.message);
      }
    }
  }, [dispatch]);

  const hydrateWishlist = useCallback(async () => {
    if (getToken()) {
      dispatch(fetchWishlistAsync());
    }
  }, [dispatch]);

  return { items, addToWishlist, removeFromWishlist, hydrateWishlist };
};

export default useWishlist;
