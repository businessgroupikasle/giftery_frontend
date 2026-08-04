import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@routes/ProtectedRoute';
import { ROUTES } from '@constants/routes';

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
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path={ROUTES.HOME}       element={<Home />} />
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
