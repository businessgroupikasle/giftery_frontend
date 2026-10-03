import { Link } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import { ROUTES } from '@constants/routes';
import styles from './Forbidden.module.css';

const Forbidden = () => (
  <Layout>
    <main className={styles.page}>
      <p className={styles.code}>403</p>
      <h1>Access denied</h1>
      <p>You do not have permission to view this page.</p>
      <Link className={styles.homeLink} to={ROUTES.HOME}>Return home</Link>
    </main>
  </Layout>
);

export default Forbidden;
