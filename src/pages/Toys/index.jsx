import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Layout from '@components/layout/Layout';
import Pagination from '../../components/common/Pagination';
import { addToCart } from '@store/slices/cartSlice';
import { addToWishlist } from '@store/slices/wishlistSlice';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import { ROUTES } from '@constants/routes';
import { toast } from 'react-toastify';
import ProductCard from '@components/product/ProductCard';
import ThreeDotMenu from '@components/product/ThreeDotMenu';
import styles from './Toys.module.css';

const TOYS_SUBCATEGORIES = [
  { id: 'all', name: 'All Toys' },
  { id: '0-2-years', name: '0 – 2 Years' },
  { id: '3-5-years', name: '3 – 5 Years' },
  { id: '6-8-years', name: '6 – 8 Years' },
  { id: '9-12-years', name: '9 – 12 Years' },
  { id: 'teens', name: 'Teens' },
  { id: 'educational-toys', name: 'Educational Toys' },
  { id: 'rc-toys', name: 'Remote Control Toys' },
  { id: 'soft-toys', name: 'Soft Toys' },
  { id: 'building-blocks', name: 'Building Blocks' },
  { id: 'dolls', name: 'Dolls' },
  { id: 'cars-bikes', name: 'Cars & Bikes' },
  { id: 'outdoor-toys', name: 'Outdoor Toys' },
];

const SubCategoryIcon = ({ type }) => {
  const stroke = "#1e293b";
  const gold = "#dfa843";
  const bg = "#fffbeb";

  switch (type) {
    case '0-2-years':
    case '3-5-years':
    case '6-8-years':
    case '9-12-years':
    case 'teens':
      return (
        <svg width="50" height="50" viewBox="0 0 54 54" fill="none">
          <circle cx="27" cy="27" r="18" stroke={stroke} strokeWidth="2.5" fill="#FFFFFF"/>
          <circle cx="27" cy="27" r="8" fill={bg} stroke={gold} strokeWidth="2"/>
          <path d="M27 9V15M27 39V45M9 27H15M39 27H45" stroke={gold} strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      );
    case 'educational-toys':
      return (
        <svg width="50" height="50" viewBox="0 0 54 54" fill="none">
          <rect x="10" y="14" width="34" height="26" rx="4" fill="#FEF3C7" stroke={stroke} strokeWidth="2.5"/>
          <path d="M18 20L27 34L36 20" stroke={gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'rc-toys':
    case 'cars-bikes':
      return (
        <svg width="50" height="50" viewBox="0 0 54 54" fill="none">
          <path d="M14 38L22 14H32L40 38H14Z" stroke={stroke} strokeWidth="2.5" fill="#FFFFFF"/>
          <circle cx="27" cy="24" r="4" fill={gold}/>
          <circle cx="22" cy="33" r="2.5" fill={stroke}/>
          <circle cx="32" cy="33" r="2.5" fill={stroke}/>
        </svg>
      );
    case 'building-blocks':
      return (
        <svg width="50" height="50" viewBox="0 0 54 54" fill="none">
          <rect x="12" y="12" width="14" height="14" rx="3" fill={bg} stroke={stroke} strokeWidth="2.5"/>
          <rect x="28" y="12" width="14" height="14" rx="3" fill="#FFFFFF" stroke={gold} strokeWidth="2.5"/>
          <rect x="12" y="28" width="14" height="14" rx="3" fill="#FFFFFF" stroke={gold} strokeWidth="2.5"/>
          <rect x="28" y="28" width="14" height="14" rx="3" fill={bg} stroke={stroke} strokeWidth="2.5"/>
        </svg>
      );
    case 'soft-toys':
    case 'dolls':
      return (
        <svg width="50" height="50" viewBox="0 0 54 54" fill="none">
          <circle cx="27" cy="22" r="10" stroke={stroke} strokeWidth="2.5" fill="#FFFFFF"/>
          <circle cx="20" cy="12" r="4" fill={gold}/>
          <circle cx="34" cy="12" r="4" fill={gold}/>
          <path d="M17 32C17 38 22 42 27 42C32 42 37 38 37 32" fill={bg} stroke={stroke} strokeWidth="2.5"/>
        </svg>
      );
    case 'outdoor-toys':
      return (
        <svg width="50" height="50" viewBox="0 0 54 54" fill="none">
          <circle cx="27" cy="27" r="14" stroke={stroke} strokeWidth="2.5" fill={bg}/>
          <path d="M27 10V14M27 40V44M10 27H14M40 27H44M15 15L18 18M36 36L39 39M15 39L18 36M36 18L39 15" stroke={gold} strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="27" cy="27" r="5" fill={gold}/>
        </svg>
      );
    default:
      return (
        <svg width="50" height="50" viewBox="0 0 54 54" fill="none">
          <path d="M27 10L33 22H45L35 30L39 42L27 34L15 42L19 30L9 22H21L27 10Z" fill={bg} stroke={gold} strokeWidth="2.5" strokeLinejoin="round"/>
        </svg>
      );
  }
};

const TOYS_CATEGORIES_SIDEBAR = [
  { id: 'all', name: 'All Toys', count: 180 },
  { id: '0-2-years', name: '0 – 2 Years', count: 35 },
  { id: '3-5-years', name: '3 – 5 Years', count: 42 },
  { id: '6-8-years', name: '6 – 8 Years', count: 38 },
  { id: '9-12-years', name: '9 – 12 Years', count: 29 },
  { id: 'teens', name: 'Teens', count: 24 },
  { id: 'educational-toys', name: 'Educational Toys', count: 48 },
  { id: 'rc-toys', name: 'Remote Control Toys', count: 31 },
  { id: 'soft-toys', name: 'Soft Toys', count: 26 },
  { id: 'building-blocks', name: 'Building Blocks', count: 37 },
  { id: 'dolls', name: 'Dolls', count: 22 },
  { id: 'cars-bikes', name: 'Cars & Bikes', count: 33 },
  { id: 'outdoor-toys', name: 'Outdoor Toys', count: 20 },
];

const TARGET_AUDIENCE_DATA = [
  { id: 'executive', label: 'Executive Office & Desk', count: 35 },
  { id: 'adults', label: 'Adult Puzzle Enthusiasts', count: 40 },
  { id: 'teens', label: 'Teens & STEM Learners', count: 28 },
  { id: 'corporate', label: 'Corporate Gifting & Event Favors', count: 32 },
  { id: 'kids', label: 'Kids Educational Games', count: 22 },
];

const TOYS_MOCK_PRODUCTS = [

];

const Toys = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Live Products State from Database & LocalStorage
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
          // ── PAGE RESTRICTION: Only show Toys products ──
          .filter(p => {
            const c = `${p._catName} ${p._catSlug} ${p._subCatName}`.trim();
            if ((c.includes('corporate') || c.includes('personalized')) && !c.includes('toy')) {
              return false;
            }
            if (c) {
              return c.includes('toy') || c.includes('game') || c.includes('puzzle') || c.includes('kid') ||
                     c.includes('doll') || c.includes('block') || c.includes('car') || c.includes('bike') ||
                     c.includes('year') || c.includes('robot') || c.includes('stem') || c.includes('rc');
            }
            const n = (p.name || '').toLowerCase();
            if (n.includes('corporate') || n.includes('onboarding') || n.includes('photo frame')) return false;
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
  const products = liveProducts.length > 0 ? liveProducts : TOYS_MOCK_PRODUCTS;

  // ── Dynamic Categories built from real DB products ──────────────
  const dynamicCategories = (() => {
    if (liveProducts.length === 0) return TOYS_CATEGORIES_SIDEBAR;
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
    return [{ id: 'all', name: 'All Toys', count: liveProducts.length }, ...Array.from(catMap.values())];
  })();

  const categoriesForFilter = dynamicCategories;

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minPrice, setMinPrice] = useState('100');
  const [maxPrice, setMaxPrice] = useState('5000');
  const [selectedAudience, setSelectedAudience] = useState([]);
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
    quantity: '25-50',
    notes: '',
  });

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setActiveSubCategory(catId);
  };

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newQuote = {
      id: 'Q-' + Math.floor(1000 + Math.random() * 9000),
      name: quoteForm.name,
      company: quoteForm.company || 'Toys & Games Bulk Request',
      email: quoteForm.email,
      phone: quoteForm.phone || 'Not provided',
      quantity: quoteForm.quantity || '25-50 Units',
      notes: quoteForm.notes || 'Corporate Toys & Games Quote Request',
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
    toast.success('Quote request submitted! Our toys specialist will contact you within 1 business hour.');
    setTimeout(() => {
      setShowQuoteModal(false);
      setQuoteSubmitted(false);
      setQuoteForm({ name: '', email: '', phone: '', quantity: '25-50', notes: '' });
    }, 2500);
  };

  const toggleAudience = (id) => {
    setSelectedAudience((prev) =>
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
    setSelectedAudience([]);
    toast.info('Filters cleared');
  };

  // Filtered & Sorted Products computation
  const displayProducts = products
    .filter((prod) => {
      // 0. Keyword / Name / Tags Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const name = (prod.name || '').toLowerCase();
        const desc = (prod.description || '').toLowerCase();
        const catName = (prod.categoryName || prod.category?.name || prod.category || '').toLowerCase();
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
          
          const words = catName.split(' ').filter(w => w.length > 2 && w !== 'toys' && w !== 'games');
          return words.some(w => pName.includes(w) || pSlug.includes(w) || pCat.includes(w));
        }
        return false;
      }
      
      // 3. Audience Filter
      if (selectedAudience.length > 0) {
        const pAudience = Array.isArray(prod.audience) ? prod.audience.map(a => a.toLowerCase()) : [];
        const pTags = Array.isArray(prod.tags) ? prod.tags.map(t => t.toLowerCase()) : [];
        const pStr = `${(prod.name || '').toLowerCase()} ${(prod.description || '').toLowerCase()}`;
        
        // Match things like "Toddlers (2-4 Yrs)" to "toddler" or "2-4"
        const hasMatch = selectedAudience.some(aud => {
          const audLower = aud.toLowerCase();
          const cleanAud = audLower.split(' (')[0].trim(); // "toddlers"
          return pAudience.includes(audLower) || pTags.includes(cleanAud) || pStr.includes(cleanAud);
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

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.max(1, Math.ceil(displayProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = displayProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <Layout>
      <div className={styles.pageContainer}>
        {/* Preserved Toys Hero Section */}
        <section className={styles.hero}>
          <img
            src="/images/toys_hero_bg.png"
            alt="Premium Toys Collection"
            className={styles.heroBgImage}
          />
          <div className={styles.heroOverlay} />

          <div className={styles.heroInner}>
            <div className={styles.breadcrumb}>
              <Link to={ROUTES.HOME}>Home</Link>
              <span>/</span>
              <span className={styles.breadcrumbActive}>Toys & Games</span>
            </div>

            <h1 className={styles.title}>Toys & Desk Games Collection</h1>
            <p className={styles.subtitle}>
              Explore our curated range of kinetic desk toys, 3D mechanical brain teasers, mini desktop games & educational STEM kits for every age.
            </p>
          </div>
        </section>



        {/* Main Workspace (Replicated Sidebar + Product Listing Grid) */}
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

            {/* Section 3: Target Audience / Category */}
            <div className={styles.filterSection}>
              <div className={styles.sectionTitleRow}>
                <span>Target Use</span>
                <span className={styles.toggleIcon}>−</span>
              </div>
              <div className={styles.checkboxList}>
                {TARGET_AUDIENCE_DATA.map((aud) => (
                  <label key={aud.id} className={styles.checkboxItem}>
                    <div className={styles.checkboxLeft}>
                      <input
                        type="checkbox"
                        checked={selectedAudience.includes(aud.id)}
                        onChange={() => toggleAudience(aud.id)}
                        className={styles.checkboxInput}
                      />
                      <span>{aud.label}</span>
                    </div>
                    <span className={styles.itemCount}>({aud.count})</span>
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
                <h2>Toys & Games Catalog</h2>
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

        {/* Quote Request Modal Popup (Replicated from PersonalizedGifts) */}
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
                    Our toys & desk games specialist will contact you within 1 business hour.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className={styles.modalTitle}>Request Corporate Toys Quote</h3>
                  <p className={styles.modalDesc}>
                    Get special tier pricing on desk kinetic sculptures, wooden puzzles, and executive games.
                  </p>

                  <form onSubmit={handleQuoteSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                      <label>Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vikram Sharma"
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
                        placeholder="vikram@example.com"
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
                        <option value="10-25">10 – 25 Units</option>
                        <option value="25-100">25 – 100 Units</option>
                        <option value="100-500">100 – 500 Units</option>
                        <option value="500+">500+ Units (Custom Logo)</option>
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
      </div>
    </Layout>
  );
};

export default Toys;
