import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// import { Helmet } from 'react-helmet';
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
import styles from './CorporateGifts.module.css';

const SUBCATEGORIES_DATA = [
  { id: 'all', name: 'All Products' },
  { id: 'onboarding', name: 'Onboarding Kit' },
  { id: 'work-anniversary', name: 'Work Anniversary Kit' },
  { id: 'employee-anniversary', name: 'Employee Anniversary Kit' },
  { id: 'diaries', name: 'Diaries & Notebooks' },
  { id: 'drinkware', name: 'Drinkware' },
  { id: 'apparel', name: 'Apparel' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'backpacks', name: 'Backpacks' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'trophies', name: 'Trophies & Awards' },
  { id: 'caps', name: 'Caps' },
  { id: 'umbrellas', name: 'Umbrellas' },
  { id: 'card-holders', name: 'Card Holders' },
  { id: 'premium-gifts', name: 'Premium Gifts' },
  { id: 'cups-mugs', name: 'Cups & Mugs' },
  { id: 'keychains', name: 'Keychains' },
];

const SubCategoryIcon = ({ type }) => {
  const stroke = "#334155";
  const gold = "#D97706";
  const goldLight = "#FEF3C7";

  switch (type) {
    case 'onboarding':
      return (
        <svg width="54" height="54" viewBox="0 0 48 48" fill="none">
          <rect x="6" y="22" width="36" height="20" rx="2" stroke={stroke} strokeWidth="2.2" fill="#FFFFFF"/>
          <path d="M6 26L24 16L42 26" stroke={stroke} strokeWidth="2.2"/>
          <rect x="14" y="10" width="10" height="12" rx="1.5" fill={goldLight} stroke={gold} strokeWidth="1.8"/>
          <rect x="28" y="8" width="6" height="14" rx="2" fill={gold} stroke={stroke} strokeWidth="1.8"/>
        </svg>
      );
    case 'work-anniversary':
    case 'employee-anniversary':
    case 'anniversary-updated':
      return (
        <svg width="54" height="54" viewBox="0 0 48 48" fill="none">
          <rect x="10" y="8" width="28" height="32" rx="3" stroke={stroke} strokeWidth="2.2" fill="#FFFFFF"/>
          <circle cx="24" cy="22" r="8" fill={goldLight} stroke={gold} strokeWidth="2"/>
          <polygon points="24,17 25.5,20.5 29,21 26.5,23.5 27.5,27 24,25 20.5,27 21.5,23.5 19,21 22.5,20.5" fill={gold}/>
        </svg>
      );
    case 'diaries':
      return (
        <svg width="54" height="54" viewBox="0 0 48 48" fill="none">
          <rect x="12" y="8" width="24" height="32" rx="2.5" stroke={stroke} strokeWidth="2.2" fill="#FFFFFF"/>
          <line x1="18" y1="8" x2="18" y2="40" stroke={gold} strokeWidth="3"/>
          <rect x="28" y="20" width="8" height="8" rx="1.5" fill={gold} stroke={stroke} strokeWidth="1.8"/>
        </svg>
      );
    case 'drinkware':
      return (
        <svg width="54" height="54" viewBox="0 0 48 48" fill="none">
          <rect x="10" y="14" width="10" height="26" rx="4" stroke={stroke} strokeWidth="2.2" fill="#FFFFFF"/>
          <path d="M12 10H18V14H12V10Z" fill={gold} stroke={stroke} strokeWidth="1.8"/>
          <path d="M26 22H36V34C36 37 34 39 30 39C26 39 26 37 26 34V22Z" fill={goldLight} stroke={stroke} strokeWidth="2.2"/>
          <path d="M36 25C39 25 40 27 40 29.5C40 32 39 34 36 34" stroke={stroke} strokeWidth="2.2"/>
        </svg>
      );
    case 'apparel':
      return (
        <svg width="54" height="54" viewBox="0 0 48 48" fill="none">
          <path d="M14 12L8 18L13 24L17 21V38H31V21L35 24L40 18L34 12L24 16L14 12Z" stroke={stroke} strokeWidth="2.2" fill="#FFFFFF"/>
          <path d="M19 14L24 20L29 14" stroke={gold} strokeWidth="2" fill={goldLight}/>
          <rect x="29" y="24" width="4" height="2" fill={gold}/>
        </svg>
      );
    case 'electronics':
      return (
        <svg width="54" height="54" viewBox="0 0 48 48" fill="none">
          <path d="M12 26C12 18 17 12 24 12C31 12 36 18 36 26" stroke={stroke} strokeWidth="2.5" strokeLinecap="round"/>
          <rect x="10" y="24" width="6" height="12" rx="3" fill={gold} stroke={stroke} strokeWidth="2"/>
          <rect x="32" y="24" width="6" height="12" rx="3" fill={gold} stroke={stroke} strokeWidth="2"/>
          <rect x="19" y="36" width="10" height="6" rx="2" fill={goldLight} stroke={stroke} strokeWidth="1.8"/>
        </svg>
      );
    case 'backpacks':
      return (
        <svg width="54" height="54" viewBox="0 0 48 48" fill="none">
          <path d="M18 14C18 10 20 8 24 8C28 8 30 10 30 14" stroke={stroke} strokeWidth="2"/>
          <rect x="12" y="14" width="24" height="26" rx="6" stroke={stroke} strokeWidth="2.2" fill="#FFFFFF"/>
          <rect x="16" y="26" width="16" height="11" rx="3" fill={gold} stroke={stroke} strokeWidth="2"/>
        </svg>
      );
    case 'accessories':
      return (
        <svg width="54" height="54" viewBox="0 0 48 48" fill="none">
          <rect x="10" y="16" width="28" height="20" rx="3" stroke={stroke} strokeWidth="2.2" fill="#FFFFFF"/>
          <path d="M30 22H38V30H30C28 30 28 22 30 22Z" fill={gold} stroke={stroke} strokeWidth="2"/>
          <circle cx="33" cy="26" r="1.5" fill="#FFFFFF"/>
        </svg>
      );
    case 'trophies':
    case 'trophy':
      return (
        <svg width="54" height="54" viewBox="0 0 48 48" fill="none">
          <path d="M14 12H34V22C34 27.5 29.5 32 24 32C18.5 32 14 27.5 14 22V12Z" fill={goldLight} stroke={stroke} strokeWidth="2.2"/>
          <path d="M14 16H8C8 22 12 24 14 24" stroke={stroke} strokeWidth="2.2"/>
          <path d="M34 16H40C40 22 36 24 34 24" stroke={stroke} strokeWidth="2.2"/>
          <path d="M24 32V38M16 38H32" stroke={stroke} strokeWidth="2.5" strokeLinecap="round"/>
          <polygon points="24,16 25.5,19.5 29,20 26.5,22 27.5,25.5 24,23.5 20.5,25.5 21.5,22 19,20 22.5,19.5" fill={gold}/>
        </svg>
      );
    case 'caps':
    case 'cap':
      return (
        <svg width="54" height="54" viewBox="0 0 48 48" fill="none">
          <path d="M12 28C12 20 17 14 26 14C33 14 36 18 36 28H12Z" stroke={stroke} strokeWidth="2.2" fill="#FFFFFF"/>
          <path d="M10 28C10 28 22 32 38 27L42 30C34 35 14 33 10 28Z" fill={gold} stroke={stroke} strokeWidth="2"/>
        </svg>
      );
    case 'umbrellas':
    case 'umbrella':
      return (
        <svg width="54" height="54" viewBox="0 0 48 48" fill="none">
          <path d="M10 24C10 16 16 10 24 10C32 10 38 16 38 24H10Z" fill={goldLight} stroke={stroke} strokeWidth="2.2"/>
          <path d="M17 24C17 20 20 24 24 24C28 24 31 20 31 24" stroke={gold} strokeWidth="2"/>
          <line x1="24" y1="24" x2="24" y2="38" stroke={stroke} strokeWidth="2.5"/>
          <path d="M24 38C24 40.5 26 41 27.5 40" stroke={stroke} strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      );
    case 'card-holders':
      return (
        <svg width="54" height="54" viewBox="0 0 48 48" fill="none">
          <rect x="10" y="16" width="28" height="18" rx="2" stroke={stroke} strokeWidth="2.2" fill="#FFFFFF"/>
          <path d="M10 21H38" stroke={stroke} strokeWidth="2"/>
          <rect x="14" y="25" width="20" height="4" rx="1" fill={gold}/>
        </svg>
      );
    case 'premium-gifts':
      return (
        <svg width="54" height="54" viewBox="0 0 48 48" fill="none">
          <rect x="10" y="20" width="28" height="18" rx="2" stroke={stroke} strokeWidth="2.2" fill="#FFFFFF"/>
          <rect x="8" y="14" width="32" height="6" rx="1.5" fill={goldLight} stroke={stroke} strokeWidth="2"/>
          <line x1="24" y1="14" x2="24" y2="38" stroke={gold} strokeWidth="3"/>
          <path d="M18 10C16 6 22 6 24 14C26 6 32 6 30 10Z" fill={gold} stroke={stroke} strokeWidth="1.8"/>
        </svg>
      );
    case 'cups-mugs':
    case 'cups':
      return (
        <svg width="54" height="54" viewBox="0 0 48 48" fill="none">
          <rect x="12" y="16" width="20" height="20" rx="4" stroke={stroke} strokeWidth="2.2" fill="#FFFFFF"/>
          <path d="M32 20H37C39 20 40 22 40 25C40 28 39 30 37 30H32" stroke={stroke} strokeWidth="2.2"/>
          <path d="M17 10C17 12 19 12 19 14" stroke={gold} strokeWidth="2" strokeLinecap="round"/>
          <path d="M22 10C22 12 24 12 24 14" stroke={gold} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case 'keychains':
      return (
        <svg width="54" height="54" viewBox="0 0 48 48" fill="none">
          <circle cx="28" cy="14" r="6" stroke={stroke} strokeWidth="2.2" fill="#FFFFFF"/>
          <line x1="26" y1="19.5" x2="22" y2="28" stroke={stroke} strokeWidth="2"/>
          <path d="M16 28L22 23L28 28V38H16V28Z" fill={gold} stroke={stroke} strokeWidth="2"/>
          <rect x="20" y="32" width="4" height="6" fill="#FFFFFF"/>
        </svg>
      );
    default:
      return null;
  }
};

const CATEGORIES_DATA = [
  { id: 'all', name: 'All Products', count: 168 },
  { id: 'onboarding', name: 'Onboarding Kit', count: 32 },
  { id: 'work-anniversary', name: 'Work Anniversary Kit', count: 24 },
  { id: 'employee-anniversary', name: 'Employee Anniversary Kit', count: 28 },
  { id: 'diaries', name: 'Diaries & Notebooks', count: 35 },
  { id: 'drinkware', name: 'Drinkware', count: 42 },
  { id: 'apparel', name: 'Apparel', count: 22 },
  { id: 'electronics', name: 'Electronics', count: 28 },
  { id: 'backpacks', name: 'Backpacks', count: 19 },
  { id: 'accessories', name: 'Accessories', count: 31 },
  { id: 'trophies', name: 'Trophies & Awards', count: 16 },
  { id: 'caps', name: 'Caps', count: 14 },
  { id: 'umbrellas', name: 'Umbrellas', count: 12 },
  { id: 'card-holders', name: 'Card Holders', count: 18 },
  { id: 'premium-gifts', name: 'Premium Gifts', count: 25 },
  { id: 'cups-mugs', name: 'Cups & Mugs', count: 30 },
  { id: 'keychains', name: 'Keychains', count: 20 },
];

const OCCASIONS_DATA = [
  { id: 'appreciation', label: 'Employee Appreciation', count: 34 },
  { id: 'onboarding', label: 'Welcome Onboarding', count: 27 },
  { id: 'festival', label: 'Festival Gifts', count: 21 },
  { id: 'client', label: 'Client Gifting', count: 16 },
  { id: 'annual', label: 'Annual Celebrations', count: 23 },
];

const PRODUCTS_LIST = [
];

const CorporateGifts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  // Live Products State from Database
  // Live Products State from PostgreSQL Database via API
  const [liveProducts, setLiveProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveProducts = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(ENDPOINTS.PRODUCTS.LIST + '?limit=200');
        let extracted = [];
        if (Array.isArray(res)) extracted = res;
        else if (res?.data && Array.isArray(res.data)) extracted = res.data;
        else if (res?.data?.data && Array.isArray(res.data.data)) extracted = res.data.data;
        else if (res?.data?.products && Array.isArray(res.data.products)) extracted = res.data.products;
        else if (res?.products && Array.isArray(res.products)) extracted = res.products;

        const formatted = extracted
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
              stock: p.stock !== undefined ? p.stock : 0,
              rating: p.rating || 4.8,
              reviewsCount: p.reviewsCount || p._count?.reviews || 24,
              discount: p.comparePrice ? `${Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)}%` : null,
              images: imgList,
              image: imgList[0] || '/placeholder.jpg',
              slug: p.slug || p.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              categoryId: p.categoryId || null,
              subCategoryId: p.subCategoryId || null,
              categoryName: p.category?.name || p.categoryName || 'Corporate Gifts',
              categorySlug: p.category?.slug || p.categorySlug || 'corporate-gifts',
              subCategoryName: p.subCategory?.name || p.subCategoryName || '',
              _catName: catName,
              _catSlug: catSlug,
              _subCatName: subCatName,
            };
          })
          // ── PAGE RESTRICTION: Only show Corporate Gifts products ──
          .filter(p => {
            const c = `${p._catName} ${p._catSlug} ${p._subCatName}`.trim();
            if ((c.includes('toy') || c.includes('personalized')) && !c.includes('corporate')) {
              return false;
            }
            if (c) {
              return c.includes('corporate') || c.includes('office') || c.includes('business') || c.includes('executive') ||
                     c.includes('onboarding') || c.includes('anniversary') || c.includes('diaries') || c.includes('drinkware') ||
                     c.includes('apparel') || c.includes('electronics') || c.includes('backpack') || c.includes('troph') ||
                     c.includes('cap') || c.includes('umbrella') || c.includes('card') || c.includes('keychain') || c.includes('mug');
            }
            const n = (p.name || '').toLowerCase();
            if (n.includes('toy') || n.includes('photo frame') || n.includes('acrylic') || n.includes('caricature')) return false;
            return true;
          });
        setLiveProducts(formatted);
      } catch (err) {
        console.warn('Live Corporate Gifts fetch note:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveProducts();
    window.addEventListener('products_updated', fetchLiveProducts);
    return () => window.removeEventListener('products_updated', fetchLiveProducts);
  }, []);

  // Base raw products catalog from PostgreSQL
  const rawProducts = liveProducts;

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

      // 2. Category / Subcategory Filter — match by real DB IDs first, then name fallback
      const activeCat = selectedCategory !== 'all' ? selectedCategory : activeSubCategory;
      if (activeCat !== 'all') {
        // Direct ID match (works for live DB products)
        if (prod.categoryId === activeCat || prod.subCategoryId === activeCat) return true;
        // Name-based fallback (works for mock/static products)
        const catObj = categoriesForFilter.find(c => c.id === activeCat);
        if (catObj) {
          const catName = catObj.name.toLowerCase();
          const pName = (prod.name || '').toLowerCase();
          const pSlug = (prod.slug || '').toLowerCase();
          const pCat = (prod.categoryName || '').toLowerCase();
          const words = catName.split(' ').filter(w => w.length > 2 && !['and', 'kit', 'kits', 'all', 'products'].includes(w));
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
      return (b.rating || 0) - (a.rating || 0); // Default: popularity
    });

  // Carousel Scroll Handler
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Quote Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    quantity: '50-100',
    notes: '',
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
      company: quoteForm.company || 'Individual / StartUp',
      email: quoteForm.email,
      phone: quoteForm.phone || 'Not provided',
      quantity: quoteForm.quantity || '50-100 Units',
      notes: quoteForm.notes || 'Corporate Gift Quote Request from Website CTA',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'New',
    };

    try {
      const existingQuotes = JSON.parse(localStorage.getItem('corporate_quotes') || '[]');
      const updatedQuotes = [newQuote, ...existingQuotes];
      localStorage.setItem('corporate_quotes', JSON.stringify(updatedQuotes));
      window.dispatchEvent(new Event('corporate_quotes_updated'));
    } catch (err) {
      console.warn('Failed to save corporate quote to storage:', err);
    }

    setQuoteSubmitted(true);
    toast.success('Quote request submitted! Our team will contact you within 1 business hour.');
    setTimeout(() => {
      setShowQuoteModal(false);
      setQuoteSubmitted(false);
      setQuoteForm({ name: '', company: '', email: '', phone: '', quantity: '50-100', notes: '' });
    }, 2500);
  };

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.max(1, Math.ceil(displayProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = displayProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <Layout>
      <div className={styles.pageContainer}>
        {/* Top Dark Header Banner — Full-Bleed Background Image */}
        <div className={styles.topBanner}>
          {/* Background product image */}
          <img
            src="/images/corporate_hero_bg.png"
            alt="Premium Corporate Gift Collection"
            className={styles.heroBgImage}
          />
          {/* Dark left→right gradient overlay */}
          <div className={styles.heroOverlay} />

          <div className={styles.topBannerInner}>
            <div className={styles.bannerMain}>
              <div className={styles.breadcrumb}>
                <Link to={ROUTES.HOME}>Home</Link>
                <span>/</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>Corporate Gifts</span>
              </div>
              <h1 className={styles.bannerTitle}>Corporate Gifts Collection</h1>
              <p className={styles.bannerSubtitle}>
                Explore our wide range of premium corporate gifts designed to strengthen relationships and leave a lasting impression.
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
            <div className={styles.pagination}>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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
                  Our corporate manager will reach out within 1 business hour.
                </p>
              </div>
            ) : (
              <>
                <h3 className={styles.modalTitle}>Request a Corporate Quote</h3>
                <p className={styles.modalDesc}>
                  Get customized pricing, bulk tier discounts, and logo placement assistance.
                </p>

                <form onSubmit={handleQuoteSubmit} className={styles.modalForm}>
                  <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={quoteForm.name}
                      onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                      className={styles.formControl}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Company Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Innovations"
                      value={quoteForm.company}
                      onChange={(e) => setQuoteForm({ ...quoteForm, company: e.target.value })}
                      className={styles.formControl}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Work Email</label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
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
                    <label>Estimated Units</label>
                    <select
                      value={quoteForm.quantity}
                      onChange={(e) => setQuoteForm({ ...quoteForm, quantity: e.target.value })}
                      className={styles.formControl}
                    >
                      <option value="25-50">25 – 50 Units</option>
                      <option value="50-100">50 – 100 Units</option>
                      <option value="100-500">100 – 500 Units</option>
                      <option value="500+">500+ Units (Custom)</option>
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

export default CorporateGifts;
