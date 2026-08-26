import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import ProductGrid from '@components/product/ProductGrid';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import styles from './Shop.module.css';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'featured', label: 'Featured' },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [liveProducts, setLiveProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const loadAllProducts = async () => {
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
      console.warn('Shop products fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllProducts();
    window.addEventListener('products_updated', loadAllProducts);
    return () => {
      window.removeEventListener('products_updated', loadAllProducts);
    };
  }, []);

  // Filter & Sort Logic
  const filteredProducts = liveProducts.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = p.name?.toLowerCase().includes(q);
      const catMatch = p.categoryName?.toLowerCase().includes(q) || p.category?.name?.toLowerCase().includes(q);
      if (!nameMatch && !catMatch) return false;
    }
    if (minPrice && Number(p.price) < Number(minPrice)) return false;
    if (maxPrice && Number(p.price) > Number(maxPrice)) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'price_asc') return Number(a.price) - Number(b.price);
    if (sort === 'price_desc') return Number(b.price) - Number(a.price);
    if (sort === 'rating') return Number(b.rating || 0) - Number(a.rating || 0);
    if (sort === 'featured') return (b.featured || b.isFeatured ? 1 : 0) - (a.featured || a.isFeatured ? 1 : 0);
    return 0; // newest
  });

  const setParam = (key, val) => {
    setSearchParams((prev) => { prev.set(key, val); return prev; });
  };

  return (
    <Layout>
      <div className="container section">
        <div className={styles.header}>
          <h1 className={styles.title}>All Products</h1>
          <p className={styles.count}>{sortedProducts.length} products</p>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            aria-label="Search products"
          />
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            aria-label="Sort by"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className={styles.priceRange}>
            <input
              type="number" placeholder="Min ₹" min={0}
              value={minPrice}
              onChange={(e) => setParam('minPrice', e.target.value)}
              className={styles.priceInput}
            />
            <span>–</span>
            <input
              type="number" placeholder="Max ₹" min={0}
              value={maxPrice}
              onChange={(e) => setParam('maxPrice', e.target.value)}
              className={styles.priceInput}
            />
          </div>
        </div>

        <ProductGrid products={sortedProducts} loading={loading} />
      </div>
    </Layout>
  );
};

export default Shop;
