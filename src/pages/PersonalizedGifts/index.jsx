import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Layout from '@components/layout/Layout';
import { addToCart } from '@store/slices/cartSlice';
import { addToWishlist } from '@store/slices/wishlistSlice';
import { ROUTES } from '@constants/routes';
import styles from './PersonalizedGifts.module.css';

const SUBCATEGORIES_DATA = [
  { id: 'all', name: 'All Personalized Gifts' },
  { id: 'photo-frames', name: 'Photo Frames' },
  { id: 'acrylic-frame', name: 'Acrylic Frame' },
  { id: 'caricature', name: 'Caricature' },
  { id: 'clock', name: 'Clock' },
  { id: 'wooden-engraving', name: 'Wooden Photo Engraving' },
];

const SubCategoryIcon = ({ type }) => {
  const stroke = "#334155";
  const gold = "#D97706";
  const goldLight = "#FEF3C7";

  switch (type) {
    case 'photo-frames':
      return (
        <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
          <path d="M12 42L16 12H42L38 42H12Z" stroke={stroke} strokeWidth="2.5" fill="#FFFFFF"/>
          <rect x="18" y="16" width="18" height="22" rx="2" stroke={stroke} strokeWidth="2" fill={goldLight}/>
          <circle cx="27" cy="22" r="3" fill={gold}/>
          <path d="M21 34L25 28L30 34" stroke={stroke} strokeWidth="2"/>
          <line x1="12" y1="42" x2="8" y2="44" stroke={stroke} strokeWidth="2.5"/>
        </svg>
      );
    case 'acrylic-frame':
      return (
        <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
          <rect x="10" y="10" width="34" height="34" rx="4" stroke={stroke} strokeWidth="2.5" fill="#FFFFFF"/>
          <circle cx="15" cy="15" r="2" fill={gold}/>
          <circle cx="39" cy="15" r="2" fill={gold}/>
          <circle cx="15" cy="39" r="2" fill={gold}/>
          <circle cx="39" cy="39" r="2" fill={gold}/>
          <rect x="18" y="18" width="18" height="18" rx="2" fill={goldLight} stroke={gold} strokeWidth="1.8"/>
          <path d="M21 31L25 25L30 31" stroke={stroke} strokeWidth="2"/>
          <circle cx="24" cy="22" r="2" fill={gold}/>
        </svg>
      );
    case 'caricature':
      return (
        <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
          <rect x="12" y="8" width="30" height="38" rx="3" stroke={stroke} strokeWidth="2.5" fill="#FFFFFF"/>
          <circle cx="27" cy="22" r="7" fill={goldLight} stroke={stroke} strokeWidth="2"/>
          <path d="M23 21C23 21 25 19 27 21" stroke={stroke} strokeWidth="1.8"/>
          <path d="M24 25C25.5 27 28.5 27 30 25" stroke={gold} strokeWidth="2" strokeLinecap="round"/>
          <path d="M19 38C19 32 23 30 27 30C31 30 35 32 35 38" fill={goldLight} stroke={stroke} strokeWidth="2"/>
        </svg>
      );
    case 'clock':
      return (
        <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
          <circle cx="27" cy="27" r="18" stroke={stroke} strokeWidth="2.8" fill="#FFFFFF"/>
          <circle cx="27" cy="27" r="14" fill={goldLight} stroke={gold} strokeWidth="1.5"/>
          <line x1="27" y1="27" x2="27" y2="18" stroke={stroke} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="27" y1="27" x2="34" y2="23" stroke={gold} strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="27" cy="27" r="2" fill={stroke}/>
          <line x1="27" y1="13" x2="27" y2="15" stroke={stroke} strokeWidth="2"/>
          <line x1="27" y1="39" x2="27" y2="41" stroke={stroke} strokeWidth="2"/>
          <line x1="13" y1="27" x2="15" y2="27" stroke={stroke} strokeWidth="2"/>
          <line x1="39" y1="27" x2="41" y2="27" stroke={stroke} strokeWidth="2"/>
        </svg>
      );
    case 'wooden-engraving':
      return (
        <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
          <rect x="8" y="14" width="38" height="26" rx="3" fill="#FDE68A" stroke={stroke} strokeWidth="2.5"/>
          <path d="M42 16V36C42 38 44 38 44 38V18L42 16Z" fill={gold} stroke={stroke} strokeWidth="1.5"/>
          <circle cx="20" cy="24" r="5" fill={goldLight} stroke={stroke} strokeWidth="1.8"/>
          <path d="M14 36C14 31 17 29 20 29C23 29 26 31 26 36" fill={goldLight} stroke={stroke} strokeWidth="1.8"/>
          <circle cx="33" cy="24" r="5" fill={goldLight} stroke={stroke} strokeWidth="1.8"/>
          <path d="M27 36C27 31 30 29 33 29C36 29 39 31 39 36" fill={goldLight} stroke={stroke} strokeWidth="1.8"/>
        </svg>
      );
    default:
      return null;
  }
};

const CATEGORIES_DATA = [
  { id: 'frames', name: 'Photo Frames', count: 42 },
  { id: 'acrylic', name: 'Acrylic Frames', count: 35 },
  { id: 'wallets', name: 'Engraved Leather Wallets', count: 28 },
  { id: 'pens', name: 'Custom Name Pens', count: 39 },
  { id: 'plaques', name: 'Wooden Engraved Plaques', count: 24 },
  { id: 'caricature', name: 'Hand-drawn Caricatures', count: 19 },
  { id: 'clocks', name: 'Personalized Photo Clocks', count: 26 },
];

const OCCASIONS_DATA = [
  { id: 'birthday', label: 'Birthday Celebrations', count: 38 },
  { id: 'anniversary', label: 'Anniversary & Romance', count: 44 },
  { id: 'wedding', label: 'Wedding & Reception', count: 29 },
  { id: 'corporate', label: 'Employee Appreciation', count: 32 },
  { id: 'festival', label: 'Festival Gifts', count: 25 },
];

const PRODUCTS_LIST = [
  {
    id: 'pg-101',
    name: 'Laser Engraved Photo Frame',
    price: 1499,
    rating: 4.9,
    reviewsCount: 142,
    badge: 'BEST SELLER',
    badgeType: 'badgeBestSeller',
    image: '/images/cat_corporate.png',
    slug: 'laser-engraved-photo-frame',
  },
  {
    id: 'pg-102',
    name: 'Acrylic Photo Standee with Standoffs',
    price: 2199,
    rating: 4.8,
    reviewsCount: 96,
    badge: null,
    image: '/images/cat_welcome.png',
    slug: 'acrylic-photo-standee-standoffs',
  },
  {
    id: 'pg-103',
    name: 'Custom Engraved Wooden Plaque',
    price: 899,
    rating: 4.8,
    reviewsCount: 76,
    badge: null,
    image: '/images/cat_merch.png',
    slug: 'custom-engraved-wooden-plaque',
  },
  {
    id: 'pg-104',
    name: 'Handcrafted Caricature Portrait Frame',
    price: 1299,
    rating: 4.7,
    reviewsCount: 63,
    badge: 'NEW',
    badgeType: 'badgeNew',
    image: '/images/cat_eco.png',
    slug: 'handcrafted-caricature-portrait-frame',
  },
  {
    id: 'pg-105',
    name: 'Laser Engraved Leather Journal & Pen',
    price: 649,
    rating: 4.9,
    reviewsCount: 112,
    badge: null,
    image: '/images/cat_corporate.png',
    slug: 'laser-engraved-leather-journal-pen',
  },
  {
    id: 'pg-106',
    name: 'Personalized Photo Desk Clock',
    price: 1799,
    rating: 4.8,
    reviewsCount: 89,
    badge: 'TRENDING',
    badgeType: 'badgeTrending',
    image: '/images/cat_tech.png',
    slug: 'personalized-photo-desk-clock',
  },
  {
    id: 'pg-107',
    name: 'Custom Name Hydro Flask Bottle',
    price: 2499,
    rating: 4.9,
    reviewsCount: 57,
    badge: null,
    image: '/images/cat_welcome.png',
    slug: 'custom-name-hydro-flask-bottle',
  },
  {
    id: 'pg-108',
    name: 'Eco Wooden Photo Engraving Set',
    price: 799,
    rating: 4.7,
    reviewsCount: 68,
    badge: 'ECO FRIENDLY',
    badgeType: 'badgeEco',
    image: '/images/cat_eco.png',
    slug: 'eco-wooden-photo-engraving-set',
  },
];

const PersonalizedGifts = () => {
  const dispatch = useDispatch();

  // Filter States
  const [activeSubCategory, setActiveSubCategory] = useState('photo-frames');
  const [selectedCategory, setSelectedCategory] = useState('frames');
  const [minPrice, setMinPrice] = useState('100');
  const [maxPrice, setMaxPrice] = useState('5000');
  const [selectedOccasions, setSelectedOccasions] = useState(['birthday']);
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Quote Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    phone: '',
    quantity: '10-25',
    notes: '',
  });

  const toggleOccasion = (id) => {
    setSelectedOccasions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearAll = () => {
    setSelectedCategory('frames');
    setMinPrice('100');
    setMaxPrice('5000');
    setSelectedOccasions([]);
  };

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    setQuoteSubmitted(true);
    setTimeout(() => {
      setShowQuoteModal(false);
      setQuoteSubmitted(false);
    }, 2000);
  };

  return (
    <Layout>
      <div className={styles.pageContainer}>
        {/* Top Header Banner — Full-Bleed Background Image */}
        <div className={styles.topBanner}>
          {/* Background product image */}
          <img
            src="/images/personalized_hero_bg.png"
            alt="Premium Personalized Gift Collection"
            className={styles.heroBgImage}
          />
          {/* Warm dark left→right gradient overlay */}
          <div className={styles.heroOverlay} />

          <div className={styles.topBannerInner}>
            <div className={styles.bannerMain}>
              <div className={styles.breadcrumb}>
                <Link to={ROUTES.HOME}>Home</Link>
                <span>›</span>
                <span style={{ color: '#d4a85a', fontWeight: 600 }}>Personalized Gifts</span>
              </div>
              <h1 className={styles.bannerTitle}>Personalized Gifts</h1>
              <p className={styles.bannerSubtitle}>
                Make every occasion special with our range of personalized gifts that carry your emotions and create unforgettable memories.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Category Icon Bar Section */}
        <div className={styles.subCategorySection}>
          <div className={styles.subCategoryContainer}>
            {SUBCATEGORIES_DATA.map((sub) => {
              const isActive = activeSubCategory === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubCategory(sub.id)}
                  className={`${styles.subCategoryCard} ${isActive ? styles.subCategoryActive : ''}`}
                >
                  <div className={styles.subCategoryIconWrapper}>
                    <SubCategoryIcon type={sub.id} />
                  </div>
                  <p className={styles.subCategoryName}>{sub.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Workspace */}
        <div className={styles.workspace}>
          {/* Left Filter Sidebar */}
          <aside className={styles.filterSidebar}>
            <div className={styles.filterHeader}>
              <h3>Filters</h3>
              <button onClick={handleClearAll} className={styles.clearAllBtn}>
                Clear All
              </button>
            </div>

            {/* Section 1: Categories */}
            <div className={styles.filterSection}>
              <div className={styles.sectionTitleRow}>
                <span>Categories</span>
                <span className={styles.toggleIcon}>−</span>
              </div>
              <div className={styles.categoryList}>
                {CATEGORIES_DATA.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      className={`${styles.categoryItem} ${isActive ? styles.categoryActive : ''}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <div className={styles.categoryLeft}>
                        {isActive && <span className={styles.goldDot} />}
                        <span>{cat.name}</span>
                      </div>
                      <span className={styles.itemCount}>({cat.count})</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Price Range */}
            <div className={styles.filterSection}>
              <div className={styles.sectionTitleRow}>
                <span>Price Range</span>
                <span className={styles.toggleIcon}>−</span>
              </div>
              <div className={styles.priceSliderWrapper}>
                <div className={styles.priceTrack}>
                  <div className={styles.priceRangeFill} />
                  <div className={`${styles.priceThumb} ${styles.thumbMin}`} />
                  <div className={`${styles.priceThumb} ${styles.thumbMax}`} />
                </div>
                <div className={styles.priceInputs}>
                  <div className={styles.priceInputBox}>
                    <span>₹</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>
                  <span className={styles.toText}>to</span>
                  <div className={styles.priceInputBox}>
                    <span>₹</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Occasion */}
            <div className={styles.filterSection}>
              <div className={styles.sectionTitleRow}>
                <span>Occasion</span>
                <span className={styles.toggleIcon}>−</span>
              </div>
              <div className={styles.checkboxList}>
                {OCCASIONS_DATA.map((occ) => (
                  <label key={occ.id} className={styles.checkboxItem}>
                    <div className={styles.checkboxLeft}>
                      <input
                        type="checkbox"
                        checked={selectedOccasions.includes(occ.id)}
                        onChange={() => toggleOccasion(occ.id)}
                        className={styles.checkboxInput}
                      />
                      <span>{occ.label}</span>
                    </div>
                    <span className={styles.itemCount}>({occ.count})</span>
                  </label>
                ))}
              </div>
            </div>

            <button className={styles.applyFiltersBtn}>Apply Filters</button>
          </aside>

          {/* Right Product Grid Area */}
          <main className={styles.contentArea}>
            {/* Top Toolbar */}
            <div className={styles.contentHeader}>
              <div className={styles.titleGroup}>
                <h2>All Products</h2>
                <p>Showing 1–12 of 148 products</p>
              </div>

              <div className={styles.controlGroup}>
                <div className={styles.sortSelectWrapper}>
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={styles.sortSelect}
                  >
                    <option value="popularity">Popularity</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                <div className={styles.sortSelectWrapper}>
                  <span>View:</span>
                  <div className={styles.viewToggle}>
                    <button
                      className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
                      onClick={() => setViewMode('grid')}
                      aria-label="Grid View"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                      </svg>
                    </button>
                    <button
                      className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
                      onClick={() => setViewMode('list')}
                      aria-label="List View"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Engraving Bulk Banner */}
            <div className={styles.bulkBanner}>
              <div className={styles.bulkContent}>
                <div className={styles.bulkBadgeIcon}>✒️</div>
                <div className={styles.bulkText}>
                  <h3>Looking for Bulk Custom Engraving?</h3>
                  <p>Get exclusive pricing on custom photo frames, engraved gifts & corporate sets.</p>
                  <button
                    onClick={() => setShowQuoteModal(true)}
                    className={styles.quoteBtn}
                  >
                    REQUEST A QUOTE ➔
                  </button>
                </div>
              </div>

              <img
                src="/images/cat_corporate.png"
                alt="Personalized Gifts Custom Engraving Bulk Order"
                className={styles.bulkImagePreview}
              />
            </div>

            {/* Product Cards Grid */}
            <div className={styles.productGrid}>
              {PRODUCTS_LIST.map((prod) => (
                <div key={prod.id} className={styles.card}>
                  {prod.badge && (
                    <span className={`${styles.cardBadge} ${styles[prod.badgeType]}`}>
                      {prod.badge}
                    </span>
                  )}
                  <button
                    className={styles.wishlistBtn}
                    onClick={() => dispatch(addToWishlist({ id: prod.id }))}
                    aria-label="Add to wishlist"
                  >
                    ♡
                  </button>

                  <div className={styles.cardImageWrapper}>
                    <img src={prod.image} alt={prod.name} className={styles.cardImage} />
                  </div>

                  <Link to={ROUTES.PRODUCT_PATH(prod.slug)} className={styles.cardTitle}>
                    {prod.name}
                  </Link>

                  <div className={styles.cardPrice}>₹{prod.price.toLocaleString('en-IN')}.00</div>

                  <div className={styles.cardRatingRow}>
                    <span className={styles.stars}>★★★★★</span>
                    <span>({prod.reviewsCount})</span>
                  </div>

                  <button
                    className={styles.cardCartBtn}
                    onClick={() =>
                      dispatch(
                        addToCart({
                          id: prod.id,
                          name: prod.name,
                          price: prod.price,
                          image: prod.image,
                          slug: prod.slug,
                        })
                      )
                    }
                    aria-label="Add to cart"
                  >
                    🛒
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className={styles.pagination}>
              <button
                className={styles.pageSquareBtn}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              <button
                className={`${styles.pageSquareBtn} ${currentPage === 1 ? styles.pageSquareActive : ''}`}
                onClick={() => setCurrentPage(1)}
              >
                1
              </button>
              <button
                className={`${styles.pageSquareBtn} ${currentPage === 2 ? styles.pageSquareActive : ''}`}
                onClick={() => setCurrentPage(2)}
              >
                2
              </button>
              <button
                className={`${styles.pageSquareBtn} ${currentPage === 3 ? styles.pageSquareActive : ''}`}
                onClick={() => setCurrentPage(3)}
              >
                3
              </button>
              <button
                className={`${styles.pageSquareBtn} ${currentPage === 4 ? styles.pageSquareActive : ''}`}
                onClick={() => setCurrentPage(4)}
              >
                4
              </button>
              <button
                className={`${styles.pageSquareBtn} ${currentPage === 5 ? styles.pageSquareActive : ''}`}
                onClick={() => setCurrentPage(5)}
              >
                5
              </button>
              <span className={styles.pageEllipsis}>...</span>
              <button
                className={`${styles.pageSquareBtn} ${currentPage === 14 ? styles.pageSquareActive : ''}`}
                onClick={() => setCurrentPage(14)}
              >
                14
              </button>
              <button
                className={styles.pageSquareBtn}
                onClick={() => setCurrentPage((p) => Math.min(14, p + 1))}
              >
                ›
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Quote Request Modal Popup */}
      {showQuoteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowQuoteModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowQuoteModal(false)}>
              ✕
            </button>

            {quoteSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <h3 style={{ fontSize: '1.4rem', color: '#16a34a', marginTop: '1rem' }}>
                  Quote Request Submitted!
                </h3>
                <p style={{ color: '#64748b' }}>
                  Our customization specialist will contact you within 1 business hour.
                </p>
              </div>
            ) : (
              <>
                <h3 className={styles.modalTitle}>Request Custom Engraving Quote</h3>
                <p className={styles.modalDesc}>
                  Get special pricing on custom photo frames, acrylic stands, and engraved gifts.
                </p>

                <form onSubmit={handleQuoteSubmit} className={styles.modalForm}>
                  <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Sharma"
                      value={quoteForm.name}
                      onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                      className={styles.formControl}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="ananya@example.com"
                      value={quoteForm.email}
                      onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                      className={styles.formControl}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Estimated Quantity</label>
                    <select
                      value={quoteForm.quantity}
                      onChange={(e) => setQuoteForm({ ...quoteForm, quantity: e.target.value })}
                      className={styles.formControl}
                    >
                      <option value="5-15">5 – 15 Units</option>
                      <option value="15-50">15 – 50 Units</option>
                      <option value="50-200">50 – 200 Units</option>
                      <option value="200+">200+ Units (Custom)</option>
                    </select>
                  </div>

                  <button type="submit" className={styles.submitQuoteBtn}>
                    SUBMIT QUOTE REQUEST ➔
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PersonalizedGifts;
