import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ROUTES } from '@constants/routes';
import { useCartContext } from '@context/CartContext';
import { logout } from '@store/slices/authSlice';
import styles from './Header.module.css';

const GiftLogo = () => (
  <svg width="42" height="46" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.logoSvg}>
    {/* Ribbon Top Loops */}
    <path d="M13 10C13 10 9 3 4.5 5.5C1 7.5 2 12 8.5 12H13" stroke="#e5c158" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M23 10C23 10 27 3 31.5 5.5C35 7.5 34 12 27.5 12H23" stroke="#e5c158" strokeWidth="2.2" strokeLinecap="round"/>
    
    {/* Gift Box Cover / Lid */}
    <rect x="2" y="12" width="32" height="7" rx="1.5" fill="url(#lidGrad)" stroke="#d4af37" strokeWidth="0.8"/>
    
    {/* Gift Box Base */}
    <rect x="4" y="19" width="28" height="18" rx="1.5" fill="url(#boxGrad)" stroke="#a0a0a0" strokeWidth="0.8"/>
    
    {/* Vertical Gold Ribbon */}
    <rect x="15.5" y="12" width="5" height="25" fill="url(#goldGrad)"/>
    
    {/* Horizontal Gold Ribbon */}
    <rect x="2" y="14.5" width="32" height="2.5" fill="url(#goldGrad)"/>

    <defs>
      <linearGradient id="lidGrad" x1="2" y1="12" x2="34" y2="19" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f5f5f5"/>
        <stop offset="1" stopColor="#b8b8b8"/>
      </linearGradient>
      <linearGradient id="boxGrad" x1="4" y1="19" x2="32" y2="37" gradientUnits="userSpaceOnUse">
        <stop stopColor="#e0e0e0"/>
        <stop offset="1" stopColor="#8a8a8a"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="15.5" y1="12" x2="20.5" y2="37" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f7dc6f"/>
        <stop offset="0.5" stopColor="#d4af37"/>
        <stop offset="1" stopColor="#aa7c11"/>
      </linearGradient>
    </defs>
  </svg>
);

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const cartCount = useSelector((s) => s.cart.items.reduce((n, i) => n + i.quantity, 0));
  const wishlistCount = useSelector((s) => s.wishlist.items.length);
  const { toggleCart } = useCartContext();

  const [activeDropdown, setActiveDropdown] = useState(null);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Brand / Logo */}
        <Link to={ROUTES.HOME} className={styles.brand}>
          <GiftLogo />
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>GIFTERY</span>
            <span className={styles.brandTagline}>PREMIUM GIFTS, LASTING IMPRESSIONS</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Main navigation">
          {/* Home */}
          <NavLink
            to={ROUTES.HOME}
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            Home
          </NavLink>

          {/* About Us */}
          <NavLink
            to={ROUTES.ABOUT}
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            About Us
          </NavLink>

          {/* Corporate Gifts Dropdown */}
          <div
            className={styles.dropdownWrapper}
            onMouseEnter={() => setActiveDropdown('corporate')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <NavLink
              to={ROUTES.CORPORATE_GIFTS}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              Corporate Gifts <span className={styles.dropdownArrow}>⌄</span>
            </NavLink>
            {activeDropdown === 'corporate' && (
              <div className={styles.dropdownMenuWide}>
                <Link to={ROUTES.CORPORATE_GIFTS}>All Corporate Gifts</Link>
                <Link to={ROUTES.CORPORATE_GIFTS}>Onboarding Kit</Link>
                <Link to={ROUTES.CORPORATE_GIFTS}>Work Anniversary Kit</Link>
                <Link to={ROUTES.CORPORATE_GIFTS}>Employee Anniversary Kit</Link>
                <Link to={ROUTES.CORPORATE_GIFTS}>Diaries & Notebooks</Link>
                <Link to={ROUTES.CORPORATE_GIFTS}>Drinkware</Link>
                <Link to={ROUTES.CORPORATE_GIFTS}>Apparel</Link>
                <Link to={ROUTES.CORPORATE_GIFTS}>Electronics</Link>
                <Link to={ROUTES.CORPORATE_GIFTS}>Backpacks</Link>
                <Link to={ROUTES.CORPORATE_GIFTS}>Accessories</Link>
                <Link to={ROUTES.CORPORATE_GIFTS}>Trophies & Awards</Link>
                <Link to={ROUTES.CORPORATE_GIFTS}>Caps</Link>
                <Link to={ROUTES.CORPORATE_GIFTS}>Umbrellas</Link>
                <Link to={ROUTES.CORPORATE_GIFTS}>Card Holders</Link>
                <Link to={ROUTES.CORPORATE_GIFTS}>Premium Gifts</Link>
                <Link to={ROUTES.CORPORATE_GIFTS}>Cups & Mugs</Link>
                <Link to={ROUTES.CORPORATE_GIFTS}>Keychains</Link>
              </div>
            )}
          </div>

          {/* Personalized Gifts Dropdown */}
          <div
            className={styles.dropdownWrapper}
            onMouseEnter={() => setActiveDropdown('personalized')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <NavLink
              to={ROUTES.PERSONALIZED_GIFTS}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              Personalized Gifts <span className={styles.dropdownArrow}>⌄</span>
            </NavLink>
            {activeDropdown === 'personalized' && (
              <div className={styles.dropdownMenu}>
                <Link to={ROUTES.PERSONALIZED_GIFTS}>All Personalized Gifts</Link>
                <Link to={ROUTES.PERSONALIZED_GIFTS}>Photo Frames</Link>
                <Link to={ROUTES.PERSONALIZED_GIFTS}>Acrylic Frames</Link>
                <Link to={ROUTES.PERSONALIZED_GIFTS}>Caricatures</Link>
                <Link to={ROUTES.PERSONALIZED_GIFTS}>Clocks</Link>
                <Link to={ROUTES.PERSONALIZED_GIFTS}>Wooden Photo Engraving</Link>
              </div>
            )}
          </div>

          {/* Toys Dropdown */}
          <div
            className={styles.dropdownWrapper}
            onMouseEnter={() => setActiveDropdown('toys')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <NavLink
              to={ROUTES.TOYS}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              Toys <span className={styles.dropdownArrow}>⌄</span>
            </NavLink>
            {activeDropdown === 'toys' && (
              <div className={styles.dropdownMenu}>
                <Link to={ROUTES.TOYS}>All Toys</Link>
                <Link to={ROUTES.TOYS}>0 - 2 Years</Link>
                <Link to={ROUTES.TOYS}>3 - 5 Years</Link>
                <Link to={ROUTES.TOYS}>6 - 8 Years</Link>
                <Link to={ROUTES.TOYS}>9 - 12 Years</Link>
                <Link to={ROUTES.TOYS}>Teens</Link>
                <Link to={ROUTES.TOYS}>Educational Toys</Link>
                <Link to={ROUTES.TOYS}>Remote Control Toys</Link>
                <Link to={ROUTES.TOYS}>Soft Toys</Link>
                <Link to={ROUTES.TOYS}>Building Blocks</Link>
                <Link to={ROUTES.TOYS}>Dolls</Link>
                <Link to={ROUTES.TOYS}>Cars & Bikes</Link>
                <Link to={ROUTES.TOYS}>Outdoor Toys</Link>
              </div>
            )}
          </div>

          {/* Contact */}
          <NavLink
            to={ROUTES.CONTACT}
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            Contact
          </NavLink>
        </nav>


        {/* Action Icons: Wishlist, Cart, Profile */}
        <div className={styles.actions}>
          {/* 1. Wishlist */}
          <Link to={ROUTES.WISHLIST} className={styles.iconBtn} aria-label="Wishlist">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {wishlistCount > 0 && <span className={styles.iconBadge}>{wishlistCount}</span>}
          </Link>

          {/* 2. Cart with Gold Badge */}
          <Link to={ROUTES.CART} className={styles.cartBtn} aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className={styles.cartBadge}>{cartCount}</span>
          </Link>

          {/* 3. Account / User Profile */}
          <div className={styles.userMenu}>
            <Link to={isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN} className={styles.profileTriggerBtn} aria-label="Account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {isAuthenticated ? (
                <div className={styles.profileTriggerContent}>
                  <span className={styles.profileTriggerName}>{user?.name || 'User'}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.profileChevron}>
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </div>
              ) : (
                <span className={styles.profileTriggerName}>Sign In</span>
              )}
            </Link>
            {isAuthenticated && (
              <div className={styles.accountDropdown}>
                <div className={styles.accountHeader}>Your Account</div>
                <Link to={ROUTES.PROFILE} className={styles.dropdownOption}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>My Profile</span>
                </Link>
                <Link to={ROUTES.ORDERS} className={styles.dropdownOption}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                  <span>Orders</span>
                </Link>
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <Link to={ROUTES.DASHBOARD} className={styles.dropdownOption} style={{ color: '#dfa843', fontWeight: 'bold' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dfa843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    <span>{user?.role === 'SUPER_ADMIN' ? 'Super Admin Panel' : 'Admin Dashboard'}</span>
                  </Link>
                )}
                <button onClick={() => dispatch(logout())} className={styles.dropdownOption}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
