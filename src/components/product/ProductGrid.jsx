import ProductCard from './ProductCard';
import { PageSpinner } from '@components/ui/Spinner';
import styles from './ProductGrid.module.css';

const ProductGrid = ({ products = [], loading = false, emptyMessage = 'No products found.' }) => {
  if (loading) return <PageSpinner />;

  if (!products.length) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🔍</span>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
