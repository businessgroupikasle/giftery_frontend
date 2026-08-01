import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@store/slices/authSlice';
import { ROUTES } from '@constants/routes';

/**
 * ProtectedRoute — Redirects unauthenticated users to login
 * Preserves the intended destination via location state.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector((s) => s.auth.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    );
  }

  if (requiredRole) {
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const isAdmin = user?.role === 'ADMIN';

    if (requiredRole === 'SUPER_ADMIN' && !isSuperAdmin) {
      return <Navigate to={ROUTES.HOME} replace />;
    }

    if (requiredRole === 'ADMIN' && !isAdmin && !isSuperAdmin) {
      return <Navigate to={ROUTES.HOME} replace />;
    }

    if (requiredRole !== 'SUPER_ADMIN' && requiredRole !== 'ADMIN' && user?.role !== requiredRole) {
      return <Navigate to={ROUTES.HOME} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
