import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import ProductGrid from '@components/product/ProductGrid';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import { ROUTES } from '@constants/routes';
import styles from './Categories.module.css';

const CATEGORY_DETAILS = {
  'corporate-gifts': {
    title: 'Corporate Gifts Collection',
    subtitle: 'Premium executive hampers, leather sets, and customized luxury gifts for your valued clients.',
    banner: '/images/cat_corporate.png',
    theme: 'dark',
  },
  'welcome-kits': {
    title: 'Employee Welcome Kits',
    subtitle: 'Thoughtful onboarding hampers with custom backpacks, drinkware, and journals for new hires.',
    banner: '/images/cat_welcome.png',
    theme: 'light',
  },
  'custom-merchandise': {
    title: 'Custom Branded Merchandise',
    subtitle: 'High-quality apparel, polo shirts, caps, and swag customized with your company logo.',
    banner: '/images/cat_merch.png',
    theme: 'gold',
  },
  'tech-gifts': {
    title: 'Tech & Electronics Gifts',
    subtitle: 'Innovative gadgets, wireless headphones, Bluetooth speakers, and power banks.',
    banner: '/images/cat_tech.png',
    theme: 'light',
  },
  'eco-gifts': {
    title: 'Eco Friendly Sustainable Gifts',
    subtitle: 'Environmentally responsible gifts featuring natural jute, bamboo, and recycled paper.',
    banner: '/images/cat_eco.png',
    theme: 'light',
  },
  'personalized-gifts': {
    title: 'Personalized Gifts Collection',
    subtitle: 'Laser engraved pens, custom logo diaries, photo frames, and bespoke branded hampers.',
    banner: '/images/cat_merch.png',
    theme: 'gold',
  },
  'toys': {
    title: 'Toys & Executive Desk Games',
    subtitle: 'Educational puzzles, executive desk fidgets, wooden brain teasers, and fun games.',
    banner: '/images/cat_welcome.png',
    theme: 'light',
  },
  'electronics': {
    title: 'Electronics & Gadgets',
    subtitle: 'Premium electronics and smart devices for corporate and personal gifting.',
    banner: '/images/cat_tech.png',
    theme: 'dark',
  },
  'clothing': {
    title: 'Fashion & Apparel',
    subtitle: 'Stylish corporate clothing, jackets, shirts, and custom apparel.',
    banner: '/images/cat_merch.png',
    theme: 'gold',
  },
  'home-kitchen': {
    title: 'Home & Living',
    subtitle: 'Elegant cookware, ceramic mug sets, and home decor items.',
    banner: '/images/cat_eco.png',
    theme: 'light',
  },
  'sports-outdoors': {
    title: 'Sports & Outdoors',
    subtitle: 'Premium yoga mats, activewear, running shoes, and fitness gear.',
    banner: '/images/cat_welcome.png',
    theme: 'light',
  },
};

const ALL_COLLECTIONS = [
  { id: 'corporate-gifts', name: 'Corporate Gifts', emoji: '💼', count: '120+ Products', desc: 'Executive hampers & leather sets', link: `${ROUTES.CATEGORIES}/corporate-gifts` },
  { id: 'personalized-gifts', name: 'Personalized Gifts', emoji: '🖊️', count: '110+ Products', desc: 'Custom engraved pens, mugs & diaries', link: `${ROUTES.CATEGORIES}/personalized-gifts` },
  { id: 'toys', name: 'Toys & Desk Games', emoji: '🧩', count: '65+ Products', desc: 'Executive desk games & puzzles', link: `${ROUTES.CATEGORIES}/toys` },
  { id: 'welcome-kits', name: 'Employee Welcome Kits', emoji: '🎒', count: '85+ Products', desc: 'Onboarding backpacks & journals', link: `${ROUTES.CATEGORIES}/welcome-kits` },
  { id: 'custom-merchandise', name: 'Custom Merchandise', emoji: '👔', count: '200+ Products', desc: 'Custom polos, caps & swag', link: `${ROUTES.CATEGORIES}/custom-merchandise` },
  { id: 'tech-gifts', name: 'Tech Gifts', emoji: '🎧', count: '150+ Products', desc: 'Wireless gadgets & accessories', link: `${ROUTES.CATEGORIES}/tech-gifts` },
  { id: 'eco-gifts', name: 'Eco Friendly Gifts', emoji: '🌿', count: '90+ Products', desc: 'Sustainable jute & bamboo gifts', link: `${ROUTES.CATEGORIES}/eco-gifts` },
];

const Categories = () => {
  const { slug } = useParams();
  const activeCategory = slug
    ? CATEGORY_DETAILS[slug] || {
        title: slug.replace(/-/g, ' ').toUpperCase(),
        subtitle: 'Browse curated items in this collection.',
        banner: '/images/corporate_gifting_banner.png',
      }
    : null;

  const [liveProducts, setLiveProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategoryProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(ENDPOINTS.PRODUCTS.LIST + '?limit=1000');
      let apiProds = [];
      if (Array.isArray(res)) apiProds = res;
      else if (res?.data && Array.isArray(res.data)) apiProds = res.data;
      else if (res?.data?.data && Array.isArray(res.data.data)) apiProds = res.data.data;
      else if (res?.data?.products && Array.isArray(res.data.products)) apiProds = res.data.products;
      else if (res?.products && Array.isArray(res.products)) apiProds = res.products;

      setLiveProducts(apiProds.filter(p => p.isActive !== false));
    } catch (e) {
      console.warn('Category products fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoryProducts();
    window.addEventListener('products_updated', loadCategoryProducts);
    return () => {
      window.removeEventListener('products_updated', loadCategoryProducts);
    };
  }, []);

    const products = slug
    ? liveProducts.filter(p => {
        const pCatSlug = p.category?.slug || p.categorySlug;
        const pCatParentSlug = p.category?.parent?.slug;
        return pCatSlug === slug || pCatParentSlug === slug;
      })
    : liveProducts;

  return (
    <Layout>
      {activeCategory ? (
        /* Dedicated Category Landing Page */
        <div className={styles.categoryPage}>
          <div className={styles.heroBanner}>
            <div className={styles.heroContainer}>
              <div className={styles.heroText}>
                <Link to={ROUTES.CATEGORIES} className={styles.backLink}>
                  &larr; Back to All Categories
                </Link>
                <h1 className={styles.categoryTitle}>{activeCategory.title}</h1>
                <p className={styles.categorySubtitle}>{activeCategory.subtitle}</p>
                <div className={styles.heroBadge}>✨ Verified GIFTERY Collection</div>
              </div>
              <div className={styles.heroImgWrapper}>
                <img src={activeCategory.banner} alt={activeCategory.title} className={styles.heroImg} />
              </div>
            </div>
          </div>

          <div className="container section">
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.headerSub}>EXCLUSIVELY CURATED</span>
                <h2 className={styles.headerTitle}>{activeCategory.title} Items</h2>
              </div>
              <Link to={ROUTES.SHOP} className={styles.viewShopBtn}>
                Filter All Products &rarr;
              </Link>
            </div>
            <ProductGrid products={products} loading={loading} />
          </div>
        </div>
      ) : (
        /* Categories Overview Gallery Page */
        <div className={styles.overviewPage}>
          <div className={styles.headerBanner}>
            <div className="container">
              <span className={styles.subheading}>GIFTERY COLLECTIONS</span>
              <h1 className={styles.mainTitle}>Explore Our Gift Categories</h1>
              <p className={styles.mainDesc}>
                Browse our curated selection of corporate gifts, personalized items, desk toys, welcome kits, custom apparel, and tech gadgets.
              </p>
            </div>
          </div>

          <div className="container section">
            <div className={styles.grid}>
              {ALL_COLLECTIONS.map((col) => (
                <Link key={col.id} to={col.link} className={styles.collectionCard}>
                  <div className={styles.cardEmoji}>{col.emoji}</div>
                  <div className={styles.cardInfo}>
                    <span className={styles.cardBadge}>{col.count}</span>
                    <h3 className={styles.cardName}>{col.name}</h3>
                    <p className={styles.cardDesc}>{col.desc}</p>
                  </div>
                  <div className={styles.cardArrow}>&rarr;</div>
                </Link>
              ))}
            </div>

            <div className={styles.allProductsHeader}>
              <h2>All Available Products</h2>
              <Link to={ROUTES.SHOP} className={styles.viewShopBtn}>
                Open Full Shop Catalog &rarr;
              </Link>
            </div>
            <ProductGrid products={products} loading={loading} />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Categories;
