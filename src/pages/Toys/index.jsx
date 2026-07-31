import Layout from '@components/layout/Layout';
import ProductGrid from '@components/product/ProductGrid';
import useFetch from '@hooks/useFetch';
import { ENDPOINTS } from '@api/endpoints';
import styles from './Toys.module.css';

const TOYS_MOCK_PRODUCTS = [
  {
    id: 'ty-1',
    name: 'Executive Kinetic Desk Sculptures & Fidget Toy',
    slug: 'executive-kinetic-desk-sculpture',
    price: 34.99,
    comparePrice: 44.99,
    rating: 4.8,
    images: ['/images/cat_welcome.png'],
    _count: { reviews: 29 }
  },
  {
    id: 'ty-2',
    name: '3D Wooden Mechanical Gear Brain Teaser Puzzle',
    slug: '3d-wooden-gear-brain-teaser',
    price: 42.50,
    comparePrice: 55.00,
    rating: 4.9,
    images: ['/images/cat_eco.png'],
    _count: { reviews: 51 }
  },
  {
    id: 'ty-3',
    name: 'Miniature Executive Golf Putting Desk Game Set',
    slug: 'miniature-desk-golf-putting-set',
    price: 28.00,
    comparePrice: 35.00,
    rating: 4.6,
    images: ['/images/cat_tech.png'],
    _count: { reviews: 18 }
  },
  {
    id: 'ty-4',
    name: 'Interactive Newton Cradle LED Balance Balls',
    slug: 'newton-cradle-led-balance-balls',
    price: 39.99,
    comparePrice: 49.99,
    rating: 4.7,
    images: ['/images/cat_corporate.png'],
    _count: { reviews: 37 }
  }
];

const Toys = () => {
  const { data, loading } = useFetch(ENDPOINTS.PRODUCTS.LIST + '?category=toys&limit=12');
  const fetchedProducts = data?.data || [];
  
  const products = fetchedProducts.length > 0 ? fetchedProducts : TOYS_MOCK_PRODUCTS;

  return (
    <Layout>
      {/* Hero Section — Full-Bleed Background Image */}
      <section className={styles.hero}>
        {/* Background toys product image */}
        <img
          src="/images/toys_hero_bg.png"
          alt="Premium Toys Collection"
          className={styles.heroBgImage}
        />
        {/* Dark left→right gradient overlay */}
        <div className={styles.heroOverlay} />

        <div className={styles.heroInner}>
          <div className={styles.breadcrumb}>
            <a href="/">Home</a>
            <span>›</span>
            <span className={styles.breadcrumbActive}>Toys</span>
          </div>

          <h1 className={styles.title}>Toys Collection</h1>
          <p className={styles.subtitle}>
            Explore our wide range of fun, safe and educational toys for every age. Inspire creativity, learning and endless happiness with every play.
          </p>
        </div>
      </section>

      {/* Feature Strip */}
      <section className={styles.featuresStrip}>
        <div className={styles.stripGrid}>
          <div className={styles.stripCard}>
            <div className={styles.stripIcon}>⚙️</div>
            <h3 className={styles.stripTitle}>Kinetic Desk Toys</h3>
            <p className={styles.stripDesc}>Soothing optical illusion gyros & balance balls.</p>
          </div>
          <div className={styles.stripCard}>
            <div className={styles.stripIcon}>🧩</div>
            <h3 className={styles.stripTitle}>3D Brain Teasers</h3>
            <p className={styles.stripDesc}>Challenging wooden & metal lock puzzles.</p>
          </div>
          <div className={styles.stripCard}>
            <div className={styles.stripIcon}>⛳</div>
            <h3 className={styles.stripTitle}>Mini Desk Games</h3>
            <p className={styles.stripDesc}>Desktop bowling, mini golf & basketball sets.</p>
          </div>
          <div className={styles.stripCard}>
            <div className={styles.stripIcon}>🤖</div>
            <h3 className={styles.stripTitle}>DIY Model Kits</h3>
            <p className={styles.stripDesc}>Assembleable mechanical clocks & automata.</p>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <div id="catalog" className="container section">
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Toys & Games Catalog</h2>
            <p className={styles.sectionSubtitle}>Discover desk toys, brain teasers, and educational games.</p>
          </div>
        </div>

        <ProductGrid products={products} loading={loading} />
      </div>
    </Layout>
  );
};

export default Toys;
