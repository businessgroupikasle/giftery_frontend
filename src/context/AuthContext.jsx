import { createContext, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, loadUserFromStorage } from '@store/slices/authSlice';
import { fetchCartAsync } from '@store/slices/cartSlice';
import { fetchWishlistAsync } from '@store/slices/wishlistSlice';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading } = useSelector((s) => s.auth);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      dispatch(loadUserFromStorage());
    }
  }, [dispatch]);

  // Sync user profile database cart & wishlist whenever user authenticates
  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchCartAsync());
      dispatch(fetchWishlistAsync());
    }
  }, [dispatch, isAuthenticated, token]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
