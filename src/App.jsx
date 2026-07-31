import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@routes/ProtectedRoute';
import { ROUTES } from '@constants/routes';

// ── Lazy-loaded Pages ─────────────────────────────────────────
const Home        = lazy(() => import('@pages/Home'));
const Shop        = lazy(() => import('@pages/Shop'));
const Product     = lazy(() => import('@pages/Product'));
const Categories  = lazy(() => import('@pages/Categories'));
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
        <Route path={ROUTES.SHOP}       element={<Shop />} />
        <Route path={ROUTES.PRODUCT}    element={<Product />} />
        <Route path={ROUTES.CATEGORIES} element={<Categories />} />
        <Route path={ROUTES.CATEGORY}   element={<Categories />} />
        <Route path={ROUTES.CORPORATE_GIFTS} element={<CorporateGifts />} />
        <Route path={`${ROUTES.CATEGORIES}/corporate-gifts`} element={<CorporateGifts />} />
        <Route path={ROUTES.PERSONALIZED_GIFTS} element={<PersonalizedGifts />} />
        <Route path={`${ROUTES.CATEGORIES}/personalized-gifts`} element={<PersonalizedGifts />} />
        <Route path={ROUTES.TOYS}       element={<Toys />} />
        <Route path={`${ROUTES.CATEGORIES}/toys`} element={<Toys />} />
        <Route path={ROUTES.SEARCH}     element={<Search />} />
        <Route path={ROUTES.CART}       element={<Cart />} />
        <Route path={ROUTES.LOGIN}      element={<Login />} />
        <Route path={ROUTES.REGISTER}   element={<Register />} />
        <Route path={ROUTES.CONTACT}    element={<Contact />} />
        <Route path={ROUTES.ABOUT}      element={<About />} />
        <Route path={ROUTES.FAQ}        element={<FAQ />} />

        {/* Protected */}
        <Route path={ROUTES.CHECKOUT} element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path={ROUTES.WISHLIST}  element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path={ROUTES.ORDERS}    element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path={ROUTES.PROFILE}   element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin */}
        <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute requiredRole="ADMIN"><Dashboard /></ProtectedRoute>} />

        {/* 404 */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
