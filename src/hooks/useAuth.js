import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  setCredentials,
  logout,
} from '@store/slices/authSlice';
import { clearWishlist, fetchWishlistAsync } from '@store/slices/wishlistSlice';
import { clearCart, fetchCartAsync } from '@store/slices/cartSlice';
import authService from '@services/authService';
import { clearAuth } from '@utils/storage';

/**
 * useAuth — Hook for authentication state and actions
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    dispatch(setCredentials({ user: data.user, token: data.token }));
    dispatch(fetchCartAsync());
    dispatch(fetchWishlistAsync());
    return data;
  }, [dispatch]);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    dispatch(setCredentials({ user: data.user, token: data.token }));
    dispatch(fetchCartAsync());
    dispatch(fetchWishlistAsync());
    return data;
  }, [dispatch]);

  const logoutUser = useCallback(async () => {
    try {
      await authService.logout();
    } catch (e) {}
    clearAuth();
    try {
      localStorage.removeItem('giftery_cart_state');
      localStorage.removeItem('giftery_wishlist_state');
      localStorage.removeItem('giftery_applied_coupon');
      localStorage.removeItem('giftery_user');
      localStorage.removeItem('ec_user');
    } catch (e) {}
    dispatch(logout());
    dispatch(clearWishlist());
    dispatch(clearCart());
  }, [dispatch]);

  return { user, isAuthenticated, loading, login, register, logout: logoutUser };
};

export default useAuth;
