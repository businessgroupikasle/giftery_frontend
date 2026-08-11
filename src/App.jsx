import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuth from '@hooks/useAuth';
import useWishlist from '@hooks/useWishlist';
import ProtectedRoute from '@routes/ProtectedRoute';
import { ROUTES } from '@constants/routes';
import { ENDPOINTS } from '@api/endpoints';
import axiosInstance from '@api/axiosInstance';
import Maintenance from '@pages/Maintenance';

// ── Lazy-loaded Pages ─────────────────────────────────────────
const Home        = lazy(() => import('@pages/Home'));
const Shop        = lazy(() => import('@pages/Shop'));
const Product     = lazy(() => import('@pages/Product'));
const CorporateGifts = lazy(() => import('@pages/CorporateGifts'));
const PersonalizedGifts = lazy(() => import('@pages/PersonalizedGifts'));
const Toys        = lazy(() => import('@pages/Toys'));
const Search      = lazy(() => import('@pages/Search'));
const Cart        = lazy(() => import('@pages/Cart'));
const Checkout    = lazy(() => import('@pages/Checkout'));
const Wishlist    = lazy(() => import('@pages/Wishlist'));
const Login       = lazy(() => import('@pages/Login'));
const Register    = lazy(() => import('@pages/Register'));
const Orders      = lazy(() => import('@pages/Orders'));
const Profile     = lazy(() => import('@pages/Profile'));
const Contact     = lazy(() => import('@pages/Contact'));
const About       = lazy(() => import('@pages/About'));
const FAQ         = lazy(() => import('@pages/FAQ'));
const TermsAndConditions = lazy(() => import('@pages/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('@pages/PrivacyPolicy'));
const NotFound    = lazy(() => import('@pages/NotFound'));
const Dashboard   = lazy(() => import('@pages/Dashboard'));

// ── Fallback ──────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div className="spinner" />
  </div>
);

const App = () => {
  const { user } = useAuth();
  const { hydrateWishlist } = useWishlist();
  const location = useLocation();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(() => {
    try {
      const stored = localStorage.getItem('store_basic_settings');
      if (stored) {
        return JSON.parse(stored).maintenanceMode === true;
      }
    } catch(e) {}
    return false;
  });

  useEffect(() => {
    const fetchAndSyncSettings = async () => {
      try {
        const response = await axiosInstance.get(ENDPOINTS.SETTINGS.GET);
        if (response?.data) {
          localStorage.setItem('store_basic_settings', JSON.stringify(response.data));
          if (response.data.storeLogo) {
            localStorage.setItem('giftery_store_logo', response.data.storeLogo);
          }
          setIsMaintenanceMode(response.data.maintenanceMode === true);
          window.dispatchEvent(new Event('store_settings_updated'));
          window.dispatchEvent(new Event('store_logo_updated'));
        }
      } catch(e) {
        console.error('Failed to sync settings from backend:', e);
      }
    };

    fetchAndSyncSettings();
  }, []);

  useEffect(() => {
    if (user) {
      hydrateWishlist();
    }
  }, [user, hydrateWishlist]);

  useEffect(() => {
    const handleSettingsUpdate = () => {
      try {
        const stored = localStorage.getItem('store_basic_settings');
        if (stored) {
          setIsMaintenanceMode(JSON.parse(stored).maintenanceMode === true);
        }
      } catch(e) {}
    };

    window.addEventListener('store_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('store_settings_updated', handleSettingsUpdate);
  }, []);

  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'STORE_ADMIN');
  const isAuthRoute = location.pathname.includes('/login') || location.pathname.includes('/register');

  if (isMaintenanceMode && !isAdmin && !isAuthRoute) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="*" element={<Maintenance />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path={ROUTES.HOME}       element={<Home />} />
        <Route path="/home"             element={<Home />} />
        <Route path="/index.html"       element={<Home />} />
        <Route path="/shop"             element={<Navigate to={ROUTES.CORPORATE_GIFTS} replace />} />
        <Route path={ROUTES.PRODUCT}    element={<Product />} />
        {/* Categories page removed — redirect all /categories/* to Corporate Gifts */}
        <Route path={ROUTES.CATEGORIES} element={<Navigate to={ROUTES.CORPORATE_GIFTS} replace />} />
        <Route path={ROUTES.CATEGORY}   element={<Navigate to={ROUTES.CORPORATE_GIFTS} replace />} />
        <Route path={ROUTES.CORPORATE_GIFTS} element={<CorporateGifts />} />
        <Route path={`${ROUTES.CATEGORIES}/corporate-gifts`} element={<Navigate to={ROUTES.CORPORATE_GIFTS} replace />} />
        <Route path={ROUTES.PERSONALIZED_GIFTS} element={<PersonalizedGifts />} />
        <Route path={`${ROUTES.CATEGORIES}/personalized-gifts`} element={<Navigate to={ROUTES.PERSONALIZED_GIFTS} replace />} />
        <Route path={ROUTES.TOYS}       element={<Toys />} />
        <Route path={`${ROUTES.CATEGORIES}/toys`} element={<Navigate to={ROUTES.TOYS} replace />} />
        <Route path={ROUTES.SEARCH}     element={<Search />} />
        <Route path={ROUTES.CART}       element={<Cart />} />
        <Route path={ROUTES.WISHLIST}   element={<Wishlist />} />
        <Route path={ROUTES.CHECKOUT}   element={<Checkout />} />
        <Route path={ROUTES.LOGIN}      element={<Login />} />
        <Route path={ROUTES.ADMIN_LOGIN} element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path={ROUTES.SUPER_ADMIN_LOGIN} element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path={ROUTES.REGISTER}   element={<Register />} />
        <Route path={ROUTES.CONTACT}    element={<Contact />} />
        <Route path={ROUTES.ABOUT}      element={<About />} />
        <Route path={ROUTES.FAQ}        element={<FAQ />} />
        <Route path={ROUTES.TERMS}      element={<TermsAndConditions />} />
        <Route path="/terms"            element={<Navigate to={ROUTES.TERMS} replace />} />
        <Route path={ROUTES.PRIVACY}    element={<PrivacyPolicy />} />
        <Route path="/privacy"          element={<Navigate to={ROUTES.PRIVACY} replace />} />

        {/* Protected */}
        <Route path={ROUTES.ORDERS}    element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path={ROUTES.PROFILE}   element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin & Super Admin */}
        <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute requiredRole="ADMIN"><Dashboard /></ProtectedRoute>} />
        <Route path={ROUTES.SUPER_ADMIN_DASHBOARD} element={<ProtectedRoute requiredRole="SUPER_ADMIN"><Dashboard /></ProtectedRoute>} />

        {/* 404 */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
