import Header from './Header';
import Footer from './Footer';
import styles from './Layout.module.css';

const Layout = ({ children }) => (
  <div className={styles.layout}>
    <Header />
    <main className={styles.main} id="main-content">
      {children}
    </main>
    <Footer />
  </div>
);

export default Layout;
