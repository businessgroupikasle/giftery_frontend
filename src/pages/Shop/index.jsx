import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import ProductGrid from '@components/product/ProductGrid';
import Pagination from '@components/common/Pagination';
import useFetch from '@hooks/useFetch';
import useDebounce from '@hooks/useDebounce';
import { ENDPOINTS } from '@api/endpoints';
import styles from './Shop.module.css';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'featured',   label: 'Featured' },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 350);

  const page    = searchParams.get('page')   || '1';
  const sort    = searchParams.get('sort')   || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const query = new URLSearchParams({
    page, sort, limit: '12',
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
  }).toString();

  const { data, loading } = useFetch(`${ENDPOINTS.PRODUCTS.LIST}?${query}`);
  const products = Array.isArray(data?.data) ? data.data : (data?.data?.data || []);
  const meta = data?.data?.meta || data?.meta;

  const setParam = (key, val) => {
    setSearchParams((prev) => { prev.set(key, val); return prev; });
  };

  return (
    <Layout>
      <div className="container section">
        <div className={styles.header}>
          <h1 className={styles.title}>All Products</h1>
          <p className={styles.count}>{meta?.total ?? 0} products</p>
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
              type="number" placeholder="Min $" min={0}
              value={minPrice}
              onChange={(e) => setParam('minPrice', e.target.value)}
              className={styles.priceInput}
            />
            <span>–</span>
            <input
              type="number" placeholder="Max $" min={0}
              value={maxPrice}
              onChange={(e) => setParam('maxPrice', e.target.value)}
              className={styles.priceInput}
            />
          </div>
        </div>

        <ProductGrid products={products} loading={loading} />

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(p) => setParam('page', String(p))}
          />
        )}
      </div>
    </Layout>
  );
};

export default Shop;
