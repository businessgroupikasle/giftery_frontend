import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ROUTES } from '@constants/routes';
import { useCartContext } from '@context/CartContext';
import { logout } from '@store/slices/authSlice';
import useAuth from '@hooks/useAuth';
import styles from './Header.module.css';

const GiftLogo = () => (
  <div style={{ display: 'inline-flex', flexDirection: 'column', justifyContent: 'center', lineHeight: '1.15' }}>
    <span style={{
      fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
      fontSize: '1.85rem',
      fontWeight: '800',
      color: '#ffffff',
      letterSpacing: '0.06em',
      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
      lineHeight: '1',
    }}>
      GIFTERY
    </span>
    <span style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.62rem',
      fontWeight: '800',
      color: '#d99b26',
      letterSpacing: '0.12em',
      marginTop: '5px',
      textTransform: 'uppercase',
    }}>
      PREMIUM GIFTS, LASTING IMPRESSIONS
    </span>
  </div>
);

const DEFAULT_LOGO_URL = '/images/store-logo.png';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { logout: handleLogoutClick } = useAuth();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const cartCount = useSelector((s) => s.cart.items.length);
  const wishlistCount = useSelector((s) => s.wishlist.items.length);
  const { toggleCart } = useCartContext();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [customLogo, setCustomLogo] = useState(() => {
    try {
      return localStorage.getItem('giftery_store_logo') || null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const handleLogoUpdate = () => {
      try {
        const logo = localStorage.getItem('giftery_store_logo');
        setCustomLogo(logo || null);
      } catch (e) {}
    };

    window.addEventListener('store_logo_updated', handleLogoUpdate);
    window.addEventListener('store_settings_updated', handleLogoUpdate);
    window.addEventListener('storage', handleLogoUpdate);

    return () => {
      window.removeEventListener('store_logo_updated', handleLogoUpdate);
      window.removeEventListener('store_settings_updated', handleLogoUpdate);
      window.removeEventListener('storage', handleLogoUpdate);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Brand / Logo */}
        <Link to={ROUTES.HOME} className={styles.brand}>
          <img
            src={customLogo || DEFAULT_LOGO_URL}
            alt="GIFTERY Logo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_LOGO_URL;
            }}
            style={{ height: '70px', maxWidth: '320px', objectFit: 'contain' }}
          />
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


        {/* Mobile Menu Toggle Button */}
        <button
          className={styles.mobileMenuToggleBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          ☰
        </button>

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
                <div className={styles.accountHeader}>
                  <span className={styles.signedInLabel}>Signed in as</span>
                  <strong className={styles.userEmailText} title={user?.email}>{user?.email || 'user@example.com'}</strong>
                </div>

                <div className={styles.dropdownDivider} />

                <Link to={ROUTES.PROFILE} className={styles.dropdownOption}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>My Profile</span>
                </Link>

                <Link to={ROUTES.ORDERS} className={styles.dropdownOption}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  <span>My Orders</span>
                </Link>

                {/* <Link to={ROUTES.PROFILE} className={styles.dropdownOption}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  <span>Settings</span>
                </Link> */}

                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <Link to={ROUTES.DASHBOARD} className={styles.dropdownOption} style={{ color: '#dfa843', fontWeight: 'bold' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dfa843" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    <span>{user?.role === 'SUPER_ADMIN' ? 'Super Admin Panel' : 'Admin Dashboard'}</span>
                  </Link>
                )}

                <div className={styles.dropdownDivider} />

                <button onClick={handleLogoutClick} className={`${styles.dropdownOption} ${styles.signOutOption}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav className={styles.mobileNavDrawer}>
          <NavLink
            to={ROUTES.HOME}
            className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.active : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </NavLink>

          <NavLink
            to={ROUTES.ABOUT}
            className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.active : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            About Us
          </NavLink>

          <NavLink
            to={ROUTES.CORPORATE_GIFTS}
            className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.active : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Corporate Gifts
          </NavLink>

          <NavLink
            to={ROUTES.PERSONALIZED_GIFTS}
            className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.active : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Personalized Gifts
          </NavLink>

          <NavLink
            to={ROUTES.TOYS}
            className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.active : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Toys
          </NavLink>

          <NavLink
            to={ROUTES.CONTACT}
            className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.active : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </NavLink>

          <div className={styles.mobileNavDivider} />

          {isAuthenticated ? (
            <>
              <Link
                to={ROUTES.PROFILE}
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                My Profile
              </Link>
              <Link
                to={ROUTES.ORDERS}
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                My Orders
              </Link>
              {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                <Link
                  to={ROUTES.DASHBOARD}
                  className={styles.mobileNavLink}
                  style={{ color: '#dfa843', fontWeight: 'bold' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogoutClick();
                  setMobileMenuOpen(false);
                }}
                className={`${styles.mobileNavLink} ${styles.logoutBtn}`}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to={ROUTES.LOGIN}
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
