import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  setCredentials,
  logout,
} from '@store/slices/authSlice';
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
    return data;
  }, [dispatch]);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    dispatch(setCredentials({ user: data.user, token: data.token }));
    return data;
  }, [dispatch]);

  const logoutUser = useCallback(async () => {
    await authService.logout();
    clearAuth();
    dispatch(logout());
  }, [dispatch]);

  return { user, isAuthenticated, loading, login, register, logout: logoutUser };
};

export default useAuth;
