import { createContext, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, loadUserFromStorage } from '@store/slices/authSlice';
import authService from '@services/authService';

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
