import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ROUTES } from '@constants/routes';
import { useCartContext } from '@context/CartContext';
import { logout } from '@store/slices/authSlice';
import styles from './Header.module.css';

const GiftLogo = () => (
  <svg width="36" height="40" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.logoSvg}>
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

  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.SHOP}?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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
              to={`${ROUTES.CATEGORIES}/corporate-gifts`}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              Corporate Gifts <span className={styles.dropdownArrow}>⌄</span>
            </NavLink>
            {activeDropdown === 'corporate' && (
              <div className={styles.dropdownMenu}>
                <Link to={`${ROUTES.CATEGORIES}/corporate-gifts`}>All Corporate Gifts</Link>
                <Link to={`${ROUTES.CATEGORIES}/corporate-gifts`}>Executive Gift Hampers</Link>
                <Link to={`${ROUTES.CATEGORIES}/welcome-kits`}>Employee Welcome Kits</Link>
                <Link to={`${ROUTES.CATEGORIES}/custom-merchandise`}>Custom Branded Merchandise</Link>
                <Link to={`${ROUTES.CATEGORIES}/tech-gifts`}>Tech & Electronics Gifts</Link>
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
              to={`${ROUTES.CATEGORIES}/personalized-gifts`}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              Personalized Gifts <span className={styles.dropdownArrow}>⌄</span>
            </NavLink>
            {activeDropdown === 'personalized' && (
              <div className={styles.dropdownMenu}>
                <Link to={`${ROUTES.CATEGORIES}/personalized-gifts`}>All Personalized Gifts</Link>
                <Link to={`${ROUTES.CATEGORIES}/personalized-gifts`}>Laser Engraved Leather Sets</Link>
                <Link to={`${ROUTES.CATEGORIES}/personalized-gifts`}>Custom Logo Diaries & Pens</Link>
                <Link to={`${ROUTES.CATEGORIES}/personalized-gifts`}>Custom Drinkware & Flasks</Link>
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
              to={`${ROUTES.CATEGORIES}/toys`}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              Toys <span className={styles.dropdownArrow}>⌄</span>
            </NavLink>
            {activeDropdown === 'toys' && (
              <div className={styles.dropdownMenu}>
                <Link to={`${ROUTES.CATEGORIES}/toys`}>All Toys & Desk Games</Link>
                <Link to={`${ROUTES.CATEGORIES}/toys`}>Executive Desk Toys & Fidgets</Link>
                <Link to={`${ROUTES.CATEGORIES}/toys`}>Educational Brain Teasers</Link>
                <Link to={`${ROUTES.CATEGORIES}/toys`}>Corporate Board Games</Link>
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

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn} aria-label="Search">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>

        {/* Action Icons */}
        <div className={styles.actions}>
          {/* Wishlist */}
          <Link to={ROUTES.WISHLIST} className={styles.iconBtn} aria-label="Wishlist">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {wishlistCount > 0 && <span className={styles.iconBadge}>{wishlistCount}</span>}
          </Link>

          {/* Account / User Menu */}
          <div className={styles.userMenu}>
            <Link to={isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN} className={styles.iconBtn} aria-label="Account">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
            {isAuthenticated && (
              <div className={styles.accountDropdown}>
                <div className={styles.accountName}>{user?.name || 'User Account'}</div>
                <Link to={ROUTES.PROFILE}>My Profile</Link>
                <Link to={ROUTES.ORDERS}>My Orders</Link>
                <Link to={ROUTES.WISHLIST}>Wishlist</Link>
                {user?.role === 'ADMIN' && <Link to={ROUTES.DASHBOARD}>Dashboard</Link>}
                <button onClick={() => dispatch(logout())}>Logout</button>
              </div>
            )}
          </div>

          {/* Cart with Gold Badge */}
          <button className={styles.cartBtn} onClick={toggleCart} aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className={styles.cartBadge}>{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
