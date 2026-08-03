import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Layout from '@components/layout/Layout';
import { addToCart } from '@store/slices/cartSlice';
import { addToWishlist } from '@store/slices/wishlistSlice';
import { ROUTES } from '@constants/routes';
import { toast } from 'react-toastify';
import { isValidEmail, isValidMobile } from '../../utils/validation';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import ThreeDotMenu from '@components/product/ThreeDotMenu';
import styles from './PersonalizedGifts.module.css';

const SUBCATEGORIES_DATA = [
  { id: 'all', name: 'All Personalized Gifts' },
  { id: 'photo-frames', name: 'Photo Frames' },
  { id: 'acrylic-frames', name: 'Acrylic Frames' },
  { id: 'caricatures', name: 'Caricatures' },
  { id: 'clocks', name: 'Clocks' },
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
    case 'acrylic-frames':
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
    case 'caricatures':
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
    case 'clocks':
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
  { id: 'all', name: 'All Personalized Gifts', count: 120 },
  { id: 'photo-frames', name: 'Photo Frames', count: 42 },
  { id: 'acrylic-frames', name: 'Acrylic Frames', count: 35 },
  { id: 'caricatures', name: 'Caricatures', count: 19 },
  { id: 'clocks', name: 'Clocks', count: 26 },
  { id: 'wooden-engraving', name: 'Wooden Photo Engraving', count: 24 },
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
    name: 'Laser Engraved Custom Photo Frame',
    price: 1499,
    comparePrice: 1999,
    rating: 4.9,
    reviewsCount: 49,
    discount: '25%',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80',
    slug: 'laser-engraved-custom-photo-frame',
  },
  {
    id: 'pg-102',
    name: '3D Acrylic Photo Standee with LED Base',
    price: 2199,
    comparePrice: 2799,
    rating: 4.8,
    reviewsCount: 81,
    discount: '21%',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80',
    slug: '3d-acrylic-photo-standee-led-base',
  },
  {
    id: 'pg-103',
    name: 'Custom Name Engraved Stainless Hydro Bottle',
    price: 1299,
    comparePrice: 1699,
    rating: 4.7,
    reviewsCount: 38,
    discount: '24%',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    slug: 'custom-name-engraved-stainless-hydro-bottle',
  },
  {
    id: 'pg-104',
    name: 'Handcrafted Wooden IQ Teaser Lock Box Set',
    price: 1799,
    comparePrice: 2299,
    rating: 4.8,
    reviewsCount: 57,
    discount: '22%',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80',
    slug: 'handcrafted-wooden-iq-teaser-lock-box-set',
  },
  {
    id: 'pg-105',
    name: 'Personalized Leather Notebook & Metallic Pen Set',
    price: 2499,
    comparePrice: 3199,
    rating: 4.9,
    reviewsCount: 84,
    discount: '22%',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80',
    slug: 'personalized-leather-notebook-metallic-pen-set',
  },
  {
    id: 'pg-106',
    name: 'Laser Etched Wooden Desk Photo Clock',
    price: 899,
    comparePrice: 1199,
    rating: 4.6,
    reviewsCount: 42,
    discount: '25%',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80',
    slug: 'laser-etched-wooden-desk-photo-clock',
  },
  {
    id: 'pg-107',
    name: 'Precision Engraved Executive Diary Gift Set',
    price: 1599,
    comparePrice: 1999,
    rating: 4.7,
    reviewsCount: 31,
    discount: '20%',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80',
    slug: 'precision-engraved-executive-diary-gift-set',
  },
  {
    id: 'pg-108',
    name: 'Custom Wood Monogram Keepsake Box',
    price: 999,
    comparePrice: 1399,
    rating: 4.8,
    reviewsCount: 53,
    discount: '29%',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80',
    slug: 'custom-wood-monogram-keepsake-box',
  },
];

const PersonalizedGifts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Live Products State from Database
  const [liveProducts, setLiveProducts] = useState([]);

  useEffect(() => {
    const fetchLiveProducts = async () => {
      let apiProducts = [];
      try {
        const res = await axiosInstance.get(ENDPOINTS.PRODUCTS.LIST);
        const data = res.data?.products || res.data?.data || res.data || [];
        if (Array.isArray(data)) apiProducts = data;
      } catch (err) {
        console.warn('Fallback to catalog products:', err.message);
      }

      const localProducts = JSON.parse(localStorage.getItem('giftery_products') || '[]');
      const combined = [...localProducts];
      apiProducts.forEach(ap => {
        if (!combined.find(c => c.id === ap.id || c.slug === ap.slug)) {
          combined.push(ap);
        }
      });

      if (combined.length > 0) {
        const formatted = combined.map((p) => {
          const imgList = Array.isArray(p.images)
            ? p.images
            : (typeof p.images === 'string' ? p.images.split(',').map(s => s.trim()) : [p.image || '/placeholder.jpg']);
          return {
            id: p.id,
            name: p.name,
            price: p.price,
            comparePrice: p.comparePrice,
            rating: p.rating || 4.8,
            reviewsCount: p.reviewsCount || p._count?.reviews || 24,
            discount: p.comparePrice ? `${Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)}%` : null,
            images: imgList,
            image: imgList[0] || '/placeholder.jpg',
            slug: p.slug || p.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          };
        });
        setLiveProducts(formatted);
      }
    };

    fetchLiveProducts();
    window.addEventListener('products_updated', fetchLiveProducts);
    return () => window.removeEventListener('products_updated', fetchLiveProducts);
  }, []);

  // Base raw products catalog
  const rawProducts = liveProducts.length > 0 ? liveProducts : PRODUCTS_LIST;

  // Filter States
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minPrice, setMinPrice] = useState('100');
  const [maxPrice, setMaxPrice] = useState('5000');
  const [selectedOccasions, setSelectedOccasions] = useState([]);
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

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setActiveSubCategory(catId);
  };

  const toggleOccasion = (id) => {
    setSelectedOccasions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplyFilters = () => {
    toast.success('Filters applied successfully! 🔍');
  };

  const handleClearAll = () => {
    setSelectedCategory('all');
    setActiveSubCategory('all');
    setMinPrice('100');
    setMaxPrice('5000');
    setSelectedOccasions([]);
    toast.info('Filters cleared');
  };

  // Filtered & Sorted Products computation
  const displayProducts = rawProducts
    .filter((prod) => {
      // 1. Price Filter
      const price = Number(prod.price) || 0;
      const minP = Number(minPrice) || 0;
      const maxP = Number(maxPrice) || Infinity;
      if (price < minP || price > maxP) return false;

      // 2. Category / Subcategory Filter
      const activeCat = selectedCategory !== 'all' ? selectedCategory : activeSubCategory;
      if (activeCat !== 'all') {
        const catObj = CATEGORIES_DATA.find((c) => c.id === activeCat) || SUBCATEGORIES_DATA.find((s) => s.id === activeCat);
        if (catObj) {
          const catName = catObj.name.toLowerCase();
          const pName = (prod.name || '').toLowerCase();
          const pSlug = (prod.slug || '').toLowerCase();

          const words = catName.split(' ').filter(w => w.length > 3 && w !== 'gifts' && w !== 'personalized');
          const isMatch = words.some(w => pName.includes(w) || pSlug.includes(w));

          if (!isMatch && prod.categoryId !== activeCat) {
            // soft match
          }
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'newest') return (b.id || '').localeCompare(a.id || '');
      return (b.rating || 0) - (a.rating || 0);
    });

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.email || !quoteForm.phone) {
      toast.error('Please fill in all required fields (Name, Email, Phone)');
      return;
    }
    if (!isValidEmail(quoteForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!isValidMobile(quoteForm.phone)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    const newQuote = {
      id: 'Q-' + Math.floor(1000 + Math.random() * 9000),
      name: quoteForm.name,
      company: quoteForm.company || 'Personalized Gift Request',
      email: quoteForm.email,
      phone: quoteForm.phone || 'Not provided',
      quantity: quoteForm.quantity || '10-25 Units',
      notes: quoteForm.notes || 'Personalized Gift Custom Branding Quote',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'New',
    };

    try {
      const existingQuotes = JSON.parse(localStorage.getItem('corporate_quotes') || '[]');
      const updatedQuotes = [newQuote, ...existingQuotes];
      localStorage.setItem('corporate_quotes', JSON.stringify(updatedQuotes));
      window.dispatchEvent(new Event('corporate_quotes_updated'));
    } catch (err) {
      console.warn('Failed to save quote to storage:', err);
    }

    setQuoteSubmitted(true);
    toast.success('Quote request submitted! Our specialist will contact you within 1 business hour.');
    setTimeout(() => {
      setShowQuoteModal(false);
      setQuoteSubmitted(false);
      setQuoteForm({ name: '', email: '', phone: '', quantity: '10-25', notes: '' });
    }, 2500);
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
                      onClick={() => handleCategorySelect(cat.id)}
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
                <div style={{ position: 'relative', width: '100%', marginBottom: '1.25rem', height: '24px', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="50"
                    value={minPrice}
                    onChange={(e) => {
                      const val = Math.min(Number(e.target.value), Number(maxPrice) - 50);
                      setMinPrice(val.toString());
                    }}
                    className={styles.rangeInput}
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="50"
                    value={maxPrice}
                    onChange={(e) => {
                      const val = Math.max(Number(e.target.value), Number(minPrice) + 50);
                      setMaxPrice(val.toString());
                    }}
                    className={styles.rangeInput}
                  />
                  <div style={{ position: 'relative', width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: `${Math.min(100, Math.max(0, (Number(minPrice) / 10000) * 100))}%`,
                        right: `${Math.min(100, Math.max(0, 100 - (Number(maxPrice) / 10000) * 100))}%`,
                        top: 0,
                        bottom: 0,
                        background: '#d99b26',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>

                <div className={styles.priceInputs}>
                  <div className={styles.priceInputBox}>
                    <span>₹</span>
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>
                  <span className={styles.toText}>to</span>
                  <div className={styles.priceInputBox}>
                    <span>₹</span>
                    <input
                      type="number"
                      min="0"
                      max="10000"
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

            <button type="button" onClick={handleApplyFilters} className={styles.applyFiltersBtn}>Apply Filters</button>
          </aside>

          {/* Right Product Grid Area */}
          <main className={styles.contentArea}>
            {/* Top Toolbar */}
            <div className={styles.contentHeader}>
              <div className={styles.titleGroup}>
                <h2>All Products</h2>
                <p>Showing 1–{displayProducts.length} of {displayProducts.length} products</p>
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



            {/* Product Cards Grid */}
            <div className={`${styles.productGrid} ${viewMode === 'list' ? styles.productListMode : ''}`}>
              {displayProducts.map((prod) => (
                <div key={prod.id} className={styles.card}>
                  <div className={styles.cardImageWrapper}>
                    <Link to={ROUTES.PRODUCT_PATH(prod.slug)} className={styles.imageLink}>
                      <img src={prod.image} alt={prod.name} className={styles.cardImage} />
                    </Link>
                    {prod.discount && (
                      <span className={styles.discountBadge}>-{prod.discount}</span>
                    )}
                    {/* Floating Top Right Wishlist Button */}
                    <button
                      className={styles.topRightWishlistBtn}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        dispatch(addToWishlist({ id: prod.id, name: prod.name, price: prod.price, image: prod.image, slug: prod.slug }));
                      }}
                      aria-label="Add to wishlist"
                      title="Add to Wishlist"
                    >
                      ♡
                    </button>
                  </div>

                  <div className={styles.cardContent}>
                    <Link to={ROUTES.PRODUCT_PATH(prod.slug)} className={styles.cardTitle}>
                      {prod.name}
                    </Link>

                    <div className={styles.cardRatingRow}>
                      <span className={styles.stars}>★★★★★</span>
                      <span className={styles.reviewsCount}>({prod.reviewsCount})</span>
                    </div>

                    <div className={styles.cardPriceRow}>
                      <span className={styles.cardPrice}>₹{prod.price.toLocaleString('en-IN')}.00</span>
                      {prod.comparePrice && (
                        <span className={styles.comparePrice}>₹{prod.comparePrice.toLocaleString('en-IN')}.00</span>
                      )}
                    </div>

                    <div className={styles.cardActionsRow}>
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
                        Add to Cart
                      </button>
                      <button
                        className={styles.buyNowBtn}
                        onClick={() => {
                          dispatch(
                            addToCart({
                              id: prod.id,
                              name: prod.name,
                              price: prod.price,
                              image: prod.image,
                              slug: prod.slug,
                              quantity: 1,
                            })
                          );
                          toast.success(`Proceeding to checkout with ${prod.name}...`);
                          navigate('/checkout');
                        }}
                        aria-label="Buy Now"
                      >
                        Buy Now
                      </button>
                      <ThreeDotMenu
                        productUrl={ROUTES.PRODUCT_PATH(prod.slug)}
                        productName={prod.name}
                        productImage={prod.image}
                      />
                    </div>
                  </div>
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
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
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
