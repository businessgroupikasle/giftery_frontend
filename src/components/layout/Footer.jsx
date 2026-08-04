import { Link } from 'react-router-dom';
import { 
  FaFacebookF, 
  FaInstagram, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaGift
} from 'react-icons/fa';
import { ROUTES } from '@constants/routes';
import styles from './Footer.module.css';

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Brand Column */}
        <div className={styles.brandCol}>
          <Link to={ROUTES.HOME} className={styles.logoBadge}>
            <div className={styles.logoIcon}>
              <FaGift />
            </div>
            <div className={styles.logoTextGroup}>
              <span className={styles.logoTitle}>GIFTERY</span>
              <span className={styles.logoSubtitle}>CREATING MEMORIES FOR BRAND</span>
            </div>
          </Link>
          
          <p className={styles.brandDescription}>
            Helping businesses create lasting impressions through premium customised gifting solutions.
          </p>

          <div className={styles.socialIcons}>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Facebook" 
              className={styles.socialBtn}
            >
              <FaFacebookF />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Instagram" 
              className={styles.socialBtn}
            >
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Quick Link Column */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Quick Link</h3>
          <ul className={styles.linkList}>
            <li><Link to={ROUTES.HOME}>Home</Link></li>
            <li><Link to={ROUTES.ABOUT}>About Us</Link></li>
            <li><Link to={ROUTES.CONTACT}>Contact Us</Link></li>
            <li><Link to={ROUTES.TERMS}>Terms &amp; Conditions</Link></li>
            <li><Link to={ROUTES.PRIVACY}>Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Categories Column */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Categories</h3>
          <ul className={styles.linkList}>
            <li><Link to={`${ROUTES.SHOP}?category=corporate`}>Corporate Gifts</Link></li>
            <li><Link to={`${ROUTES.SHOP}?category=personalized`}>Personalized Gifts</Link></li>
            <li><Link to={`${ROUTES.SHOP}?category=toys`}>Toys</Link></li>
          </ul>
        </div>

        {/* Store Information Column */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Store Information</h3>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <FaMapMarkerAlt className={styles.infoIcon} />
              <span>Ramanathapuram, Coimbatore,Tamil Nadu 641045</span>
            </div>
            <div className={styles.infoItem}>
              <FaPhoneAlt className={styles.infoIcon} />
              <a href="tel:+917010121945">+91 70101 21945</a>
            </div>
            <div className={styles.infoItem}>
              <FaEnvelope className={styles.infoIcon} />
              <a href="mailto:giftery2023@gmail.com">giftery2023@gmail.com</a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Payments */}
      <div className={styles.bottomBar}>
        <div className={styles.copyright}>
          Copyright © {new Date().getFullYear()} <strong>Giftery</strong> | Crafted And Maintained By <strong>Ikaslé Business Group</strong>
        </div>
        
        <div className={styles.paymentMethods}>
          {/* Payment Card Badges styled to match the reference UI */}
          <span className={`${styles.payCard} ${styles.payVisa}`}>VISA</span>
          <span className={`${styles.payCard} ${styles.payDiscover}`}>DISCOVER</span>
          <span className={`${styles.payCard} ${styles.payAmex}`}>AMERICAN EXPRESS</span>
          <span className={`${styles.payCard} ${styles.payMastercard}`}>MasterCard</span>
          <span className={`${styles.payCard} ${styles.payGiropay}`}>giropay</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
