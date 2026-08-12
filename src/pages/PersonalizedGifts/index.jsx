import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Layout from '@components/layout/Layout';
import Pagination from '../../components/common/Pagination';
import ProductCard from '@components/product/ProductCard';
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
        let extracted = [];
        if (Array.isArray(res)) extracted = res;
        else if (res?.data && Array.isArray(res.data)) extracted = res.data;
        else if (res?.data?.data && Array.isArray(res.data.data)) extracted = res.data.data;
        else if (res?.data?.products && Array.isArray(res.data.products)) extracted = res.data.products;
        else if (res?.products && Array.isArray(res.products)) extracted = res.products;
        apiProducts = extracted;
      } catch (err) {
        console.warn('Fallback to catalog products:', err.message);
      }

      const deletedIds = new Set(JSON.parse(localStorage.getItem('giftery_deleted_products') || '[]'));
      const localProds = JSON.parse(localStorage.getItem('giftery_products') || '[]');
      const combinedMap = new Map();

      localProds.forEach(p => {
        const idStr = String(p.id || '');
        const slugStr = String(p.slug || '');
        if ((idStr || slugStr) && !deletedIds.has(idStr) && !deletedIds.has(slugStr)) {
          combinedMap.set(idStr || slugStr, p);
        }
      });

      apiProducts.forEach(p => {
        const idStr = String(p.id || '');
        const slugStr = String(p.slug || '');
        if ((idStr || slugStr) && !deletedIds.has(idStr) && !deletedIds.has(slugStr)) {
          if (!combinedMap.has(idStr) && !combinedMap.has(slugStr)) {
            combinedMap.set(idStr || slugStr, p);
          }
        }
      });

      const combined = Array.from(combinedMap.values());
      localStorage.setItem('giftery_products', JSON.stringify(combined));

      if (combined.length > 0) {
        const formatted = combined
          .map((p) => {
            const imgList = Array.isArray(p.images)
              ? p.images
              : (typeof p.images === 'string' ? p.images.split(',').map(s => s.trim()) : [p.image || '/placeholder.jpg']);
            const catName = (p.category?.name || p.categoryName || '').toLowerCase();
            const catSlug = (p.category?.slug || p.categorySlug || '').toLowerCase();
            const subCatName = (p.subCategory?.name || p.subCategoryName || '').toLowerCase();
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
              categoryId: p.categoryId || null,
              subCategoryId: p.subCategoryId || null,
              categoryName: p.category?.name || p.categoryName || '',
              categorySlug: p.category?.slug || p.categorySlug || '',
              subCategoryName: p.subCategory?.name || p.subCategoryName || '',
              _catName: catName,
              _catSlug: catSlug,
              _subCatName: subCatName,
            };
          })
          // ── PAGE RESTRICTION: Only show Personalized Gifts products ──
          .filter(p => {
            const c = `${p._catName} ${p._catSlug} ${p._subCatName}`.trim();
            if ((c.includes('corporate') || c.includes('toy')) && !c.includes('personal')) {
              return false;
            }
            if (c) {
              return c.includes('personal') || c.includes('photo') || c.includes('frame') || c.includes('acrylic') ||
                     c.includes('caricature') || c.includes('clock') || c.includes('engrav') || c.includes('custom') ||
                     c.includes('monogram') || c.includes('keepsake');
            }
            const n = (p.name || '').toLowerCase();
            if (n.includes('corporate') || n.includes('onboarding') || n.includes('desk gyro')) return false;
            return true;
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

  // ── Dynamic Categories built from real DB products ──────────────
  const dynamicCategories = (() => {
    if (liveProducts.length === 0) return CATEGORIES_DATA;
    const catMap = new Map();
    liveProducts.forEach(p => {
      // Use subCategoryId for granular filtering, or categoryId if no sub
      const filterId = p.subCategoryId || p.categoryId;
      const filterName = p.subCategoryName || p.categoryName;
      if (filterId && filterName) {
        const existing = catMap.get(filterId);
        if (existing) existing.count += 1;
        else catMap.set(filterId, { id: filterId, name: filterName, count: 1 });
      }
    });
    return [{ id: 'all', name: 'All Products', count: liveProducts.length }, ...Array.from(catMap.values())];
  })();

  const categoriesForFilter = dynamicCategories;

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
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
    toast.success('Filters applied successfully!');
  };

  const handleClearAll = () => {
    setSearchQuery('');
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
      // 0. Keyword / Name / Tags Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const name = (prod.name || '').toLowerCase();
        const desc = (prod.description || '').toLowerCase();
        const catName = (prod.categoryName || prod.category?.name || '').toLowerCase();
        const subCatName = (prod.subCategoryName || prod.subCategory?.name || '').toLowerCase();
        const tagsStr = Array.isArray(prod.tags) ? prod.tags.join(' ').toLowerCase() : (prod.tags || '').toLowerCase();
        const slug = (prod.slug || '').toLowerCase();

        const matches =
          name.includes(query) ||
          desc.includes(query) ||
          catName.includes(query) ||
          subCatName.includes(query) ||
          tagsStr.includes(query) ||
          slug.includes(query);

        if (!matches) return false;
      }
      // 1. Price Filter
      const price = Number(prod.price) || 0;
      const minP = Number(minPrice) || 0;
      const maxP = Number(maxPrice) || Infinity;
      if (price < minP || price > maxP) return false;

      // 2. Category / Subcategory Filter
      const activeCat = selectedCategory !== 'all' ? selectedCategory : activeSubCategory;
      if (activeCat !== 'all') {
        if (prod.categoryId === activeCat || prod.subCategoryId === activeCat) return true;
        
        const catObj = categoriesForFilter.find(c => c.id === activeCat);
        if (catObj) {
          const catName = catObj.name.toLowerCase();
          const pName = (prod.name || '').toLowerCase();
          const pSlug = (prod.slug || '').toLowerCase();
          const pCat = (prod.categoryName || '').toLowerCase();
          
          const words = catName.split(' ').filter(w => w.length > 3 && w !== 'gifts' && w !== 'personalized');
          return words.some(w => pName.includes(w) || pSlug.includes(w) || pCat.includes(w));
        }
        return false;
      }
      
      // 3. Occasion Filter
      if (selectedOccasions.length > 0) {
        const pOccasions = Array.isArray(prod.occasions) ? prod.occasions.map(o => o.toLowerCase()) : [];
        const pTags = Array.isArray(prod.tags) ? prod.tags.map(t => t.toLowerCase()) : [];
        const pStr = `${(prod.name || '').toLowerCase()} ${(prod.description || '').toLowerCase()}`;
        
        const hasMatch = selectedOccasions.some(occ => {
          const occLower = occ.toLowerCase();
          return pOccasions.includes(occLower) || pTags.includes(occLower) || pStr.includes(occLower);
        });
        if (!hasMatch) return false;
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

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.max(1, Math.ceil(displayProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = displayProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
                <span>/</span>
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
                {categoriesForFilter.map((cat) => {
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
                <p>Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, displayProducts.length)} of {displayProducts.length} products</p>
              </div>

              <div className={styles.controlGroup}>
                <div className={styles.searchBoxWrapper}>
                  <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name, tag, category..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className={styles.searchInputBar}
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} className={styles.clearSearchBtn} aria-label="Clear Search">
                      ✕
                    </button>
                  )}
                </div>

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
              {paginatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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
