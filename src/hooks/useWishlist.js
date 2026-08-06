import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  selectWishlistItems,
  addToWishlist as addToWishlistAction,
  removeFromWishlist as removeFromWishlistAction,
  setWishlist,
} from '@store/slices/wishlistSlice';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';

const useWishlist = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);

  const addToWishlist = useCallback(async (product) => {
    dispatch(addToWishlistAction(product));
    try {
      await axiosInstance.post(ENDPOINTS.WISHLIST.ADD, { productId: product.id });
    } catch {
      // Optimistic update — Redux already updated, no rollback needed
    }
  }, [dispatch]);

  const removeFromWishlist = useCallback(async (id) => {
    dispatch(removeFromWishlistAction(id));
    try {
      await axiosInstance.delete(ENDPOINTS.WISHLIST.REMOVE(id));
    } catch {
      // Optimistic update — Redux already updated
    }
  }, [dispatch]);

  const hydrateWishlist = useCallback(async () => {
    try {
      const res = await axiosInstance.get(ENDPOINTS.WISHLIST.GET);
      const apiItems = res?.wishlist?.items ? res.wishlist.items.map((i) => i.product || i) : [];
      dispatch(setWishlist(apiItems));
    } catch {
      // Not logged in or no backend wishlist yet
    }
  }, [dispatch]);

  return { items, addToWishlist, removeFromWishlist, hydrateWishlist };
};

export default useWishlist;
