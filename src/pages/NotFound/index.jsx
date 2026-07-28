import Layout from '@components/layout/Layout';
import styles from './NotFound.module.css';
import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes';

const NotFound = () => (
  <Layout>
    <div className={styles.page}>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.msg}>Oops! The page you're looking for doesn't exist or has been moved.</p>
      <div className={styles.actions}>
        <Link to={ROUTES.HOME} className={styles.homeBtn}>← Go Home</Link>
        <Link to={ROUTES.SHOP} className={styles.shopBtn}>Browse Shop</Link>
      </div>
    </div>
  </Layout>
);

export default NotFound;
