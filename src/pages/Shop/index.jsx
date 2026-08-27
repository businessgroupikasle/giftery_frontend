import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import ProductGrid from '@components/product/ProductGrid';
import Pagination from '@components/common/Pagination';
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
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const [liveProducts, setLiveProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1, limit: 24 });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 24,
        sort,
      };

      if (search.trim()) params.search = search.trim();
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await axiosInstance.get(ENDPOINTS.PRODUCTS.LIST, { params });
      const body = res.data || res;
      const productList = Array.isArray(body.data)
        ? body.data
        : (Array.isArray(body.products) ? body.products : (Array.isArray(body) ? body : []));

      setLiveProducts(productList.filter(p => p.isActive !== false));

      if (body.meta) {
        setMeta(body.meta);
      } else {
        setMeta({
          total: productList.length,
          page: currentPage,
          limit: 24,
          totalPages: Math.ceil(productList.length / 24) || 1,
        });
      }
    } catch (e) {
      console.warn('Shop products fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, sort, minPrice, maxPrice]);

  useEffect(() => {
    loadProducts();
    window.addEventListener('products_updated', loadProducts);
    return () => {
      window.removeEventListener('products_updated', loadProducts);
    };
  }, [loadProducts]);

  const setParam = (key, val) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val === '' || val === null || val === undefined) {
        next.delete(key);
      } else {
        next.set(key, val);
      }
      if (key !== 'page') {
        next.set('page', '1');
      }
      return next;
    });
  };

  const handlePageChange = (newPage) => {
    setParam('page', String(newPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="container section">
        <div className={styles.header}>
          <h1 className={styles.title}>All Products</h1>
          <p className={styles.count}>
            Showing {Math.min((currentPage - 1) * 24 + 1, meta.total || 0)}–{Math.min(currentPage * 24, meta.total || 0)} of {meta.total || liveProducts.length} products
          </p>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setParam('search', e.target.value)}
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

        <ProductGrid products={liveProducts} loading={loading} />

        {/* Scalable Server Pagination Component */}
        {!loading && meta.totalPages > 1 && (
          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={meta.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Shop;
