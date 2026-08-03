import { useState, useRef, useEffect } from 'react';
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
  {
    id: 'cg-101',
    name: 'Executive Kinetic Desk Gyro Sculpture',
    price: 1499,
    comparePrice: 1999,
    rating: 4.8,
    reviewsCount: 49,
    discount: '25%',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80',
    slug: 'executive-kinetic-desk-gyro-sculpture',
  },
  {
    id: 'cg-102',
    name: '3D Wooden Mechanical Gear Clock Puzzle',
    price: 2199,
    comparePrice: 2799,
    rating: 4.9,
    reviewsCount: 81,
    discount: '21%',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80',
    slug: '3d-wooden-mechanical-gear-clock-puzzle',
  },
  {
    id: 'cg-103',
    name: 'Miniature Executive Golf Putting Desk Game Set',
    price: 1299,
    comparePrice: 1699,
    rating: 4.7,
    reviewsCount: 38,
    discount: '24%',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    slug: 'miniature-executive-golf-putting-desk-game-set',
  },
  {
    id: 'cg-104',
    name: 'Interactive Newton Cradle LED Balance Balls',
    price: 1799,
    comparePrice: 2299,
    rating: 4.8,
    reviewsCount: 57,
    discount: '22%',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80',
    slug: 'interactive-newton-cradle-led-balance-balls',
  },
  {
    id: 'cg-105',
    name: 'DIY Mechanical Automata Moving Model Kit',
    price: 2499,
    comparePrice: 3199,
    rating: 4.9,
    reviewsCount: 84,
    discount: '22%',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80',
    slug: 'diy-mechanical-automata-moving-model-kit',
  },
  {
    id: 'cg-106',
    name: 'Retro Wooden Desktop Bowling Alley Game',
    price: 899,
    comparePrice: 1199,
    rating: 4.6,
    reviewsCount: 42,
    discount: '25%',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80',
    slug: 'retro-wooden-desktop-bowling-alley-game',
  },
  {
    id: 'cg-107',
    name: 'Precision Metal Balance Pendulum Desk Toy',
    price: 1599,
    comparePrice: 1999,
    rating: 4.7,
    reviewsCount: 31,
    discount: '20%',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80',
    slug: 'precision-metal-balance-pendulum-desk-toy',
  },
  {
    id: 'cg-108',
    name: 'Handcrafted Wooden IQ Teaser Lock Set',
    price: 999,
    comparePrice: 1399,
    rating: 4.8,
    reviewsCount: 53,
    discount: '29%',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80',
    slug: 'handcrafted-wooden-iq-teaser-lock-set',
  },
];

const CorporateGifts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const carouselRef = useRef(null);

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
          const pCategory = (prod.category?.name || prod.categoryName || '').toLowerCase();

          // Check if category words match product name, slug, or category name
          const words = catName.split(' ').filter(w => w.length > 2 && w !== 'and' && w !== 'kit' && w !== 'kits');
          const isMatch = words.some(w => pName.includes(w) || pSlug.includes(w) || pCategory.includes(w));

          if (!isMatch && prod.categoryId !== activeCat) {
            // Soft match
          }
        }
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
                <span>›</span>
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
