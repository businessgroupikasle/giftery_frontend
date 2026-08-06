import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Layout from '@components/layout/Layout';
import StarRating from '@components/product/StarRating';
import Spinner from '@components/ui/Spinner';
import { addToCart } from '@store/slices/cartSlice';
import useWishlist from '@hooks/useWishlist';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import { ROUTES } from '@constants/routes';
import { toast } from 'react-toastify';
import styles from './Product.module.css';

/* ── Fallback Master Products Dataset (for rich catalog fallback by slug) ── */
const MASTER_PRODUCTS = [
  {
    id: 'cg-101',
    name: 'Executive Kinetic Desk Gyro Sculpture',
    slug: 'executive-kinetic-desk-gyro-sculpture',
    categoryName: 'Corporate Gifts',
    categorySlug: 'corporate-gifts',
    subcategory: 'Executive Gifts',
    badge: 'BEST SELLER',
    rating: 4.8,
    reviewsCount: 49,
    salesCount: '250+ sold',
    price: 1499,
    comparePrice: 1999,
    discount: '25% OFF',
    inStock: true,
    minOrder: 10,
    shortDescription: 'Make a lasting first impression with our Executive Kinetic Desk Gyro Sculpture. Perfect for onboarding new executives and luxury corporate gifting.',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    ],
    highlights: [
      'Perfect for executive desk decoration and employee onboarding',
      'High-grade aircraft aluminum & stainless steel construction',
      'Custom laser engraving available for corporate branding',
      'Bulk pricing available for bulk corporate orders',
    ],
    specifications: {
      material: 'Premium Aircraft Aluminum, Stainless Steel',
      color: 'Matte Black with Gold Accents',
      branding: 'Laser Engraving / Screen Printing',
      usage: 'Executive Gifting, Desktop Accent',
    },
  },
  {
    id: 'cg-102',
    name: '3D Wooden Mechanical Gear Clock Puzzle',
    slug: '3d-wooden-mechanical-gear-clock-puzzle',
    categoryName: 'Corporate Gifts',
    categorySlug: 'corporate-gifts',
    subcategory: 'Desk Accessories',
    badge: 'TRENDING',
    rating: 4.9,
    reviewsCount: 81,
    salesCount: '180+ sold',
    price: 2199,
    comparePrice: 2799,
    discount: '21% OFF',
    inStock: true,
    minOrder: 5,
    shortDescription: 'Exquisite handcrafted 3D wooden gear clock puzzle. Combines mechanical art with functional quartz timekeeping.',
    images: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    ],
    highlights: [
      'Laser-cut precision natural Linden plywood',
      'Fully functional clock mechanism included',
      'Engraved corporate logo plate option',
    ],
    specifications: {
      material: 'Eco-Friendly Plywood & Quartz Mechanism',
      color: 'Natural Wood Grain & Gold Details',
      branding: 'Custom Engraved Nameplate',
      usage: 'Office Decor, Team Building Gift',
    },
  },
];

const parseImagesArray = (imgs, fallbackImg) => {
  if (!imgs) return fallbackImg ? [fallbackImg] : [];
  if (Array.isArray(imgs)) {
    const cleaned = imgs.map(i => String(i).trim()).filter(Boolean);
    return cleaned.length > 0 ? cleaned : (fallbackImg ? [fallbackImg] : []);
  }
  if (typeof imgs === 'string') {
    const trimmed = imgs.trim();
    if (!trimmed) return fallbackImg ? [fallbackImg] : [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.map(i => String(i).trim()).filter(Boolean);
          if (cleaned.length > 0) return cleaned;
        }
      } catch (e) {
        // fail-through
      }
    }
    const splitted = trimmed.split(',').map(s => s.trim()).filter(Boolean);
    return splitted.length > 0 ? splitted : (fallbackImg ? [fallbackImg] : []);
  }
  return fallbackImg ? [fallbackImg] : [];
};

const Product = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState('1');
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    setQuantityInput(String(quantity));
  }, [quantity]);

  // Fetch Product from LocalStorage or Backend by Slug, with master dataset fallback
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchProduct = async () => {
      // 1. Check LocalStorage for custom saved products
      const localProducts = JSON.parse(localStorage.getItem('giftery_products') || '[]');
      const normalizedSlug = slug ? slug.toLowerCase().trim() : '';
      const localFound = localProducts.find(p => (
        p.slug === normalizedSlug ||
        p.id === slug ||
        (p.name && p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === normalizedSlug)
      ));

      if (localFound && isMounted) {
        setProduct(localFound);
        const imgs = parseImagesArray(localFound.images || localFound.image, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80');
        setSelectedImage(imgs[0]);
        setQuantity(localFound.minOrder || 1);
        setLoading(false);
        return;
      }

      // 2. Fetch from Backend API
      try {
        const res = await axiosInstance.get(`${ENDPOINTS.PRODUCTS.LIST}/${slug}`);
        const data = res.data?.product || res.data?.data || res.data;
        if (data && isMounted) {
          setProduct(data);
          const imgs = parseImagesArray(data.images || data.image, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80');
          setSelectedImage(imgs[0]);
          setQuantity(data.minOrder || 1);
        }
      } catch (err) {
        console.warn(`Product API fetch for slug "${slug}" fallback to dataset:`, err.message);
        // Fallback to Master Dataset
        const found = MASTER_PRODUCTS.find(p => p.slug === slug) || MASTER_PRODUCTS[0];
        if (isMounted) {
          setProduct({ ...found, name: found.slug === slug ? found.name : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) });
          const imgs = parseImagesArray(found.images || found.image);
          setSelectedImage(imgs[0]);
          setQuantity(found.minOrder || 1);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Related Products from Live Catalog
    const fetchLiveRelated = async () => {
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
      } catch (err) {}

      const localProducts = JSON.parse(localStorage.getItem('giftery_products') || '[]');
      const combined = [...localProducts];
      apiProducts.forEach(ap => {
        if (!combined.find(c => c.id === ap.id || c.slug === ap.slug)) combined.push(ap);
      });

      if (combined.length > 0 && isMounted) {
        const normalizedSlug = slug ? slug.toLowerCase().trim() : '';
        const filtered = combined
          .filter(p => p.slug !== normalizedSlug && p.id !== slug)
          .slice(0, 4)
          .map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: Array.isArray(p.images) ? p.images[0] : (p.image || '/placeholder.jpg'),
            slug: p.slug,
          }));
        setRelatedProducts(filtered);
      }
    };

    fetchProduct();
    fetchLiveRelated();

    window.addEventListener('products_updated', () => {
      fetchProduct();
      fetchLiveRelated();
    });
    return () => {
      isMounted = false;
      window.removeEventListener('products_updated', fetchProduct);
    };
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <Spinner size="lg" />
          <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>Loading product details...</p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className={styles.errorContainer}>
          <h2>Product Not Found</h2>
          <p>The product you are looking for does not exist or has been removed.</p>
          <Link to={ROUTES.CORPORATE_GIFTS} className={styles.backBtn}>← Back to Corporate Gifts</Link>
        </div>
      </Layout>
    );
  }

  const {
    id,
    name,
    price,
    comparePrice = product.comparePrice ? Number(product.comparePrice) : null,
    discount = comparePrice && price && comparePrice > price ? `${Math.round(((comparePrice - price) / comparePrice) * 100)}% OFF` : null,
    rating = product.rating ? Number(product.rating) : 4.8,
    reviewsCount = product.reviewsCount ? Number(product.reviewsCount) : 0,
    salesCount = product.salesCount || null,
    badge = product.featured ? 'FEATURED' : (product.tags ? String(product.tags).split(',')[0].trim() : null),
    description = product.description || '',
    shortDescription = description,
    category,
    categoryName = category?.name || product.categoryName || 'Corporate Gifts',
    subcategory = product.subcategory || 'Gifts',
    images,
    specifications = product.specifications || null,
    customization = product.customization || null,
    shippingReturns = product.shippingReturns || null,
    minOrder = product.minOrder || 1,
    inStock = product.stock !== undefined ? Number(product.stock) > 0 : true,
  } = product;

  const maxStock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : 9999;

  const getCategoryLink = (catName) => {
    if (!catName) return ROUTES.CORPORATE_GIFTS;
    const lower = String(catName).toLowerCase();
    if (lower.includes('toy')) return ROUTES.TOYS;
    if (lower.includes('personal') || lower.includes('frame') || lower.includes('photo') || lower.includes('acrylic') || lower.includes('caricature')) return ROUTES.PERSONALIZED_GIFTS;
    return ROUTES.CORPORATE_GIFTS;
  };

  const renderSpecificationsTable = (specContent) => {
    if (!specContent) {
      return (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '10px', fontStyle: 'italic' }}>
          No technical specifications provided for this product yet.
        </div>
      );
    }

    let rows = [];

    if (typeof specContent === 'object' && !Array.isArray(specContent)) {
      rows = Object.entries(specContent).map(([k, v]) => ({ key: k, value: String(v) }));
    } else if (typeof specContent === 'string') {
      const trimmed = specContent.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (typeof parsed === 'object' && !Array.isArray(parsed)) {
            rows = Object.entries(parsed).map(([k, v]) => ({ key: k, value: String(v) }));
          }
        } catch (e) {}
      }

      if (rows.length === 0) {
        const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
        lines.forEach((line) => {
          if (line.includes(':')) {
            const parts = line.split(':');
            const key = parts[0].trim();
            const val = parts.slice(1).join(':').trim();
            rows.push({ key, value: val });
          } else if (line.includes('-') && !line.startsWith('-')) {
            const parts = line.split('-');
            const key = parts[0].trim();
            const val = parts.slice(1).join('-').trim();
            rows.push({ key, value: val });
          } else {
            rows.push({ key: 'Feature / Spec', value: line.replace(/^[•\-\*]\s*/, '') });
          }
        });
      }
    }

    if (rows.length === 0) {
      return <p style={{ color: '#475569', lineHeight: '1.7' }}>{String(specContent)}</p>;
    }

    return (
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.82rem', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px', width: '35%' }}>
                Specification Feature
              </th>
              <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.82rem', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Details & Material Info
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                  borderBottom: idx === rows.length - 1 ? 'none' : '1px solid #f1f5f9',
                }}
              >
                <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', borderRight: '1px solid #f1f5f9', textTransform: 'capitalize' }}>
                  {row.key}
                </td>
                <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.88rem', fontWeight: '500', color: '#475569', lineHeight: '1.5' }}>
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const galleryImages = parseImagesArray(images || product?.image, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80');

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedLogo(file.name);
      toast.success(`Uploaded: ${file.name}`);
    }
  };

  const handleIncreaseQty = () => {
    if (quantity >= maxStock) {
      toast.error(`Only ${maxStock} units available in stock! Cannot add more.`);
      return;
    }
    setQuantity(q => q + 1);
  };

  const handleDecreaseQty = () => {
    setQuantity(q => Math.max(minOrder || 1, q - 1));
  };

  const handleQtyInputChange = (e) => {
    const rawVal = e.target.value;
    setQuantityInput(rawVal);

    if (rawVal === '') return;

    const val = parseInt(rawVal, 10);
    if (!isNaN(val)) {
      if (val > maxStock) {
        toast.error(`Only ${maxStock} units available in stock!`);
        setQuantity(maxStock);
        setQuantityInput(String(maxStock));
      } else if (val >= 1) {
        setQuantity(val);
      }
    }
  };

  const handleQtyInputBlur = () => {
    const val = parseInt(quantityInput, 10);
    if (isNaN(val) || val < 1) {
      const fallback = minOrder || 1;
      setQuantity(fallback);
      setQuantityInput(String(fallback));
    } else if (val > maxStock) {
      toast.error(`Only ${maxStock} units available in stock!`);
      setQuantity(maxStock);
      setQuantityInput(String(maxStock));
    } else {
      setQuantity(val);
      setQuantityInput(String(val));
    }
  };

  const handleAddToCart = () => {
    if (maxStock <= 0) {
      toast.error('Sorry, this product is currently out of stock!');
      return;
    }
    if (quantity > maxStock) {
      toast.error(`Only ${maxStock} units available in stock! Adjusted quantity to ${maxStock}.`);
      setQuantity(maxStock);
      dispatch(addToCart({
        id: id || slug,
        name,
        price,
        image: selectedImage || galleryImages[0],
        slug,
        quantity: maxStock,
        logo: uploadedLogo,
        maxStock,
      }));
      return;
    }
    dispatch(addToCart({
      id: id || slug,
      name,
      price,
      image: selectedImage || galleryImages[0],
      slug,
      quantity,
      logo: uploadedLogo,
      maxStock,
    }));
    toast.success(`Added ${quantity} x ${name} to Cart!`);
  };

  const handleWishlistToggle = () => {
    addToWishlist({ id: id || slug, name, price, slug, image: selectedImage || galleryImages[0], comparePrice });
    toast.success('Added to Wishlist!');
  };

  const handleRequestQuote = () => {
    toast.success(`Quote request for ${name} submitted! Our team will contact you.`);
  };

  return (
    <Layout>
      <div className={styles.pageWrapper}>
        <div className={styles.container}>

          {/* ── 1. BREADCRUMBS ── */}
          <nav className={styles.breadcrumb}>
            <Link to={ROUTES.HOME}>Home</Link>
            <span className={styles.sep}>/</span>
            <Link to={getCategoryLink(categoryName)}>{categoryName || 'Corporate Gifts'}</Link>
            <span className={styles.sep}>/</span>
            <span className={styles.activeBreadcrumb}>{name}</span>
          </nav>

          {/* ── 2. TOP PRODUCT SECTION ── */}
          <div className={styles.productTopGrid}>

            {/* Left: Gallery Column */}
            <div className={styles.galleryColumn}>
              {/* Thumbnails list */}
              <div className={styles.thumbnailsList}>
                <button type="button" className={styles.thumbScrollNav}>∧</button>
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.thumbBtn} ${selectedImage === imgUrl ? styles.thumbActive : ''}`}
                    onClick={() => setSelectedImage(imgUrl)}
                  >
                    <img src={imgUrl} alt={`${name} thumb ${idx + 1}`} />
                  </button>
                ))}
                <button type="button" className={styles.thumbScrollNav}>∨</button>
              </div>

              {/* Main Image Box */}
              <div className={styles.mainImageBox}>
                <img src={selectedImage || galleryImages[0]} alt={name} className={styles.mainImg} />
                <button type="button" className={styles.wishlistOverlayBtn} onClick={handleWishlistToggle} aria-label="Add to wishlist">
                  ♡
                </button>
              </div>
            </div>

            {/* Right: Info Header & Purchase Options */}
            <div className={styles.infoColumn}>
              {/* Badge */}
              {badge && <div className={styles.badgePill}>{badge}</div>}

              {/* Product Title */}
              <h1 className={styles.productTitle}>{name}</h1>

              {/* Rating & Sold Bar */}
              <div className={styles.ratingSoldRow}>
                <div className={styles.starsRow}>
                  <span className={styles.goldStars}>★★★★☆</span>
                  <span className={styles.ratingNum}>{rating}</span>
                  <span className={styles.reviewsText}>({reviewsCount} reviews)</span>
                </div>
                {salesCount && (
                  <>
                    <span className={styles.dividerPipe}>|</span>
                    <span className={styles.soldBadge}>{salesCount}</span>
                  </>
                )}
              </div>

              {/* Pricing Box */}
              <div className={styles.pricingRow}>
                <span className={styles.currentPrice}>₹{price?.toLocaleString('en-IN')}.00</span>
                {comparePrice && <span className={styles.comparePrice}>₹{comparePrice?.toLocaleString('en-IN')}.00</span>}
                {discount && <span className={styles.discountBadge}>{discount}</span>}
              </div>
              <p className={styles.taxSubtext}>Inclusive of all taxes</p>

              {/* Short Summary Description */}
              {shortDescription && <p className={styles.shortSummary}>{shortDescription}</p>}

              {/* Quantity Stepper & Stock Info */}
              <div className={styles.quantitySection}>
                <h4 className={styles.sectionLabel}>
                  Quantity <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>(Stock: {maxStock})</span>
                </h4>
                <div className={styles.qtyRow}>
                  <div className={styles.stepperBox}>
                    <button type="button" onClick={handleDecreaseQty}>-</button>
                    <input
                      type="number"
                      value={quantityInput}
                      onChange={handleQtyInputChange}
                      onBlur={handleQtyInputBlur}
                      min="1"
                      max={maxStock}
                    />
                    <button type="button" onClick={handleIncreaseQty} disabled={quantity >= maxStock}>+</button>
                  </div>
                  {minOrder > 1 && <span className={styles.minOrderNote}>Minimum Order: {minOrder} Units</span>}
                  <span className={styles.inStockBadge} style={{ color: inStock ? '#059669' : '#dc2626' }}>
                    {inStock ? `✓ ${maxStock} In Stock` : '✕ Out of Stock'}
                  </span>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className={styles.ctaButtonGroup}>
                <button
                  type="button"
                  className={styles.addToCartGoldBtn}
                  onClick={handleAddToCart}
                  disabled={maxStock <= 0}
                  style={{ opacity: maxStock <= 0 ? 0.6 : 1, cursor: maxStock <= 0 ? 'not-allowed' : 'pointer' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  <span>{maxStock <= 0 ? 'OUT OF STOCK' : 'ADD TO CART'}</span>
                </button>
                <button type="button" className={styles.requestQuoteOutlineBtn} onClick={handleRequestQuote}>
                  REQUEST QUOTE
                </button>
              </div>

            </div>
          </div>

          {/* ── 3. TRUST & VALUE BADGES BAR ── */}
          <div className={styles.trustBadgesGrid}>
            <div className={styles.trustItem}>
              <div className={styles.trustIconCircle}>⭐</div>
              <div>
                <strong className={styles.trustTitle}>Premium Quality</strong>
                <p className={styles.trustDesc}>Finest Materials</p>
              </div>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustIconCircle}>🎨</div>
              <div>
                <strong className={styles.trustTitle}>Custom Branding</strong>
                <p className={styles.trustDesc}>Your Logo Here</p>
              </div>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustIconCircle}>📦</div>
              <div>
                <strong className={styles.trustTitle}>Secure Packaging</strong>
                <p className={styles.trustDesc}>Safe & Elegant</p>
              </div>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustIconCircle}>🚚</div>
              <div>
                <strong className={styles.trustTitle}>Pan India Delivery</strong>
                <p className={styles.trustDesc}>Fast & Reliable</p>
              </div>
            </div>
          </div>

          <div className={styles.securityRow}>
            <div className={styles.securityItem}>
              <span className={styles.secIcon}>💳</span>
              <span><strong>Secure Payment</strong> 100% Protected</span>
            </div>
            <div className={styles.securityItem}>
              <span className={styles.secIcon}>🔄</span>
              <span><strong>Easy Returns</strong> 7 Day Returns</span>
            </div>
            <div className={styles.securityItem}>
              <span className={styles.secIcon}>🎧</span>
              <span><strong>Dedicated Support</strong> 24/7 Support</span>
            </div>
          </div>

          {/* ── 4. DETAILS & RELATED PRODUCTS SPLIT ── */}
          <div className={styles.detailsSplitGrid}>

            {/* Left: Tabbed Description & Specs */}
            <div className={styles.tabContentCard}>
              {/* Tab Headers */}
              <div className={styles.tabsHeaderNav}>
                {['description', 'specifications'].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    className={`${styles.tabNavBtn} ${activeTab === tab ? styles.tabNavActive : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Tab Content Body */}
              <div className={styles.tabBodyContainer}>
                {activeTab === 'description' && (
                  <div>
                    <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.75', whiteSpace: 'pre-line' }}>
                      {description ? (
                        description
                      ) : (
                        <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No description provided for this product.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div className={styles.tabSectionBox}>
                    <h4 style={{ marginBottom: '1rem', color: '#1e293b', fontSize: '1.1rem', fontWeight: '800' }}>
                      Product Specifications & Technical Details
                    </h4>
                    {renderSpecificationsTable(specifications)}
                  </div>
                )}
              </div>
            </div>

            {/* Right: "You May Also Like" Related Products Grid */}
            <div className={styles.relatedProductsColumn}>
              <div className={styles.relatedHeaderRow}>
                <h3 className={styles.relatedTitle}>You May Also Like</h3>
                <Link to={ROUTES.CORPORATE_GIFTS} className={styles.viewAllLink}>View All →</Link>
              </div>

              <div className={styles.relatedGrid}>
                {relatedProducts.map(rel => (
                  <div key={rel.id} className={styles.relCard} onClick={() => navigate(ROUTES.PRODUCT_PATH(rel.slug))}>
                    <div className={styles.relImgBox}>
                      <img src={rel.image} alt={rel.name} />
                    </div>
                    <div className={styles.relInfo}>
                      <h4 className={styles.relName}>{rel.name}</h4>
                      <div className={styles.relPriceRow}>
                        <span className={styles.relPrice}>₹{rel.price?.toLocaleString('en-IN')}.00</span>
                        <button type="button" className={styles.miniCartBtn} onClick={(e) => { e.stopPropagation(); dispatch(addToCart({ id: rel.id, name: rel.name, price: rel.price, image: rel.image, slug: rel.slug })); toast.success(`Added ${rel.name}`); }}>
                          🛒
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── 5. BOTTOM VALUE HIGHLIGHTS BANNER ── */}
          <div className={styles.bottomHighlightsBanner}>
            <div className={styles.bannerHighlightCard}>
              <span className={styles.bannerIcon}>🎁</span>
              <div>
                <strong>Bulk Discounts</strong>
                <p>Special pricing on orders over 50+ units</p>
              </div>
            </div>
            <div className={styles.bannerHighlightCard}>
              <span className={styles.bannerIcon}>🎨</span>
              <div>
                <strong>Custom Branding</strong>
                <p>Add your logo & brand identity</p>
              </div>
            </div>
            <div className={styles.bannerHighlightCard}>
              <span className={styles.bannerIcon}>⭐</span>
              <div>
                <strong>Premium Quality</strong>
                <p>Finest materials guaranteed</p>
              </div>
            </div>
            <div className={styles.bannerHighlightCard}>
              <span className={styles.bannerIcon}>🚚</span>
              <div>
                <strong>On-time Delivery</strong>
                <p>Pan India delivery you can trust</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Product;
