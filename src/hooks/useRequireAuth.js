import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { selectIsAuthenticated } from '@store/slices/authSlice';
import { ROUTES } from '@constants/routes';

const useRequireAuth = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    if (isAuthenticated) return true;

    toast.info('Please login now');
    navigate(ROUTES.LOGIN, {
      state: { from: `${location.pathname}${location.search}` },
    });
    return false;
  }, [isAuthenticated, location.pathname, location.search, navigate]);
};

export default useRequireAuth;
