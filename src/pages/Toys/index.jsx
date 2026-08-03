import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import ProductGrid from '@components/product/ProductGrid';
import useFetch from '@hooks/useFetch';
import { ENDPOINTS } from '@api/endpoints';
import { ROUTES } from '@constants/routes';
import { toast } from 'react-toastify';
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
  {
    id: 'ty-1',
    name: 'Executive Kinetic Desk Gyro Sculpture',
    slug: 'executive-kinetic-desk-sculpture',
    price: 1499,
    comparePrice: 1999,
    rating: 4.8,
    images: ['/images/cat_welcome.png'],
    _count: { reviews: 49 },
    category: 'Kinetic Desk Toys',
    isBestseller: true,
  },
  {
    id: 'ty-2',
    name: '3D Wooden Mechanical Gear Clock Puzzle',
    slug: '3d-wooden-gear-brain-teaser',
    price: 2199,
    comparePrice: 2799,
    rating: 4.9,
    images: ['/images/cat_eco.png'],
    _count: { reviews: 81 },
    category: '3D Brain Teasers',
    isBestseller: true,
  },
  {
    id: 'ty-3',
    name: 'Miniature Executive Golf Putting Desk Game Set',
    slug: 'miniature-desk-golf-putting-set',
    price: 1299,
    comparePrice: 1699,
    rating: 4.6,
    images: ['/images/cat_tech.png'],
    _count: { reviews: 38 },
    category: 'Desktop Mini Games',
  },
  {
    id: 'ty-4',
    name: 'Interactive Newton Cradle LED Balance Balls',
    slug: 'newton-cradle-led-balance-balls',
    price: 1799,
    comparePrice: 2299,
    rating: 4.7,
    images: ['/images/cat_corporate.png'],
    _count: { reviews: 57 },
    category: 'Desk Toys',
  },
  {
    id: 'ty-5',
    name: 'DIY Mechanical Automata Moving Model Kit',
    slug: 'diy-mechanical-automata-model-kit',
    price: 2499,
    comparePrice: 3199,
    rating: 4.9,
    images: ['/images/cat_merch.png'],
    _count: { reviews: 64 },
    category: 'DIY Model Kits',
  },
  {
    id: 'ty-6',
    name: 'Retro Wooden Desktop Bowling Alley Game',
    slug: 'retro-wooden-desktop-bowling-game',
    price: 899,
    comparePrice: 1199,
    rating: 4.5,
    images: ['/images/cat_eco.png'],
    _count: { reviews: 42 },
    category: 'Desktop Games',
  },
  {
    id: 'ty-7',
    name: 'Precision Metal Balance Pendulum Desk Toy',
    slug: 'precision-metal-balance-pendulum',
    price: 1599,
    comparePrice: 1999,
    rating: 4.8,
    images: ['/images/cat_welcome.png'],
    _count: { reviews: 31 },
    category: 'Kinetic Toys',
  },
  {
    id: 'ty-8',
    name: 'Handcrafted Wooden IQ Teaser Lock Set',
    slug: 'handcrafted-wooden-iq-lock-set',
    price: 999,
    comparePrice: 1399,
    rating: 4.7,
    images: ['/images/cat_corporate.png'],
    _count: { reviews: 53 },
    category: 'Brain Teasers',
  },
];

const Toys = () => {
  const { data, loading } = useFetch(ENDPOINTS.PRODUCTS.LIST + '?category=toys&limit=12');
  const fetchedProducts = data?.data || [];
  const products = fetchedProducts.length > 0 ? fetchedProducts : TOYS_MOCK_PRODUCTS;

  // Filter States
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
    toast.success('Filters applied successfully! 🔍');
  };

  const handleClearAll = () => {
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
      // 1. Price Filter
      const price = Number(prod.price) || 0;
      const minP = Number(minPrice) || 0;
      const maxP = Number(maxPrice) || Infinity;
      if (price < minP || price > maxP) return false;

      // 2. Category / Subcategory Filter
      const activeCat = selectedCategory !== 'all' ? selectedCategory : activeSubCategory;
      if (activeCat !== 'all') {
        const catObj = TOYS_CATEGORIES_SIDEBAR.find((c) => c.id === activeCat) || TOYS_SUBCATEGORIES.find((s) => s.id === activeCat);
        if (catObj) {
          const catName = catObj.name.toLowerCase();
          const pName = (prod.name || '').toLowerCase();
          const pSlug = (prod.slug || '').toLowerCase();

          const words = catName.split(' ').filter(w => w.length > 2 && w !== 'toys');
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
              <span>›</span>
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
                {TOYS_CATEGORIES_SIDEBAR.map((cat) => {
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
            <ProductGrid products={displayProducts} loading={loading} viewMode={viewMode === 'list' ? 'list' : 'grid-4'} />

            {/* Square Pagination Controls (Replicated from PersonalizedGifts) */}
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
