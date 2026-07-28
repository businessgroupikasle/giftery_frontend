import Layout from '@components/layout/Layout';
import useFetch from '@hooks/useFetch';
import { ENDPOINTS } from '@api/endpoints';
import ProductGrid from '@components/product/ProductGrid';
import styles from './Wishlist.module.css';

const Wishlist = () => {
  const { data, loading } = useFetch(ENDPOINTS.WISHLIST.GET);
  const items = data?.wishlist?.items || [];
  const products = items.map((i) => i.product);

  return (
    <Layout>
      <div className={`container section ${styles.page}`}>
        <h1 className={styles.title}>My Wishlist</h1>
        <ProductGrid products={products} loading={loading} emptyMessage="Your wishlist is empty. Start adding products you love!" />
      </div>
    </Layout>
  );
};

export default Wishlist;
