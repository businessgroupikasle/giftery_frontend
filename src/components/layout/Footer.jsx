import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebookF, 
  FaInstagram, 
  FaLinkedinIn, 
  FaYoutube, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaEnvelope,
  FaChevronRight
} from 'react-icons/fa';
import { ROUTES } from '@constants/routes';
import styles from './Footer.module.css';

const GiftLogoSvg = () => (
  <div style={{ display: 'inline-flex', flexDirection: 'column', justifyContent: 'center', lineHeight: '1.15' }}>
    <span style={{
      fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
      fontSize: '1.85rem',
      fontWeight: '800',
      color: '#ffffff',
      letterSpacing: '0.06em',
      lineHeight: '1',
    }}>
      GIFTERYS
    </span>
    <span style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.62rem',
      fontWeight: '800',
      color: '#ea580c',
      letterSpacing: '0.12em',
      marginTop: '5px',
      textTransform: 'uppercase',
    }}>
      CREATING MEMORIES FOR BRAND
    </span>
  </div>
);

const DEFAULT_LOGO_URL = '/images/store-logo.png';

const corporateLinks = [
  { name: 'All Corporate Gifts', path: ROUTES.CORPORATE_GIFTS },
  { name: 'Work Anniversary Gifts', path: ROUTES.CORPORATE_GIFTS },
  { name: 'Diaries & Notebooks', path: ROUTES.CORPORATE_GIFTS },
  { name: 'Apparel', path: ROUTES.CORPORATE_GIFTS },
  { name: 'Drinkware', path: ROUTES.CORPORATE_GIFTS },
  { name: 'Lifestyle', path: ROUTES.CORPORATE_GIFTS },
  { name: 'Tech Accessories', path: ROUTES.CORPORATE_GIFTS },
  { name: 'Bags & Travel', path: ROUTES.CORPORATE_GIFTS },
  { name: 'Office Essentials', path: ROUTES.CORPORATE_GIFTS },
  { name: 'Awards & Trophies', path: ROUTES.CORPORATE_GIFTS },
  { name: 'Eco Friendly Gifts', path: ROUTES.CORPORATE_GIFTS },
];

const toysLinks = [
  { name: 'All Toys', path: ROUTES.TOYS },
  { name: 'Educational Toys', path: ROUTES.TOYS },
  { name: 'Soft Toys', path: ROUTES.TOYS },
  { name: 'Remote Control Toys', path: ROUTES.TOYS },
  { name: 'Building Blocks', path: ROUTES.TOYS },
  { name: 'Dolls & Doll Houses', path: ROUTES.TOYS },
  { name: 'Ride On Toys', path: ROUTES.TOYS },
  { name: 'Outdoor Toys', path: ROUTES.TOYS },
  { name: 'Board Games', path: ROUTES.TOYS },
];

const Footer = () => {
  const [showMoreCorporate, setShowMoreCorporate] = useState(false);
  const [showMoreToys, setShowMoreToys] = useState(false);

  const [customLogo, setCustomLogo] = useState(() => {
    try {
      return localStorage.getItem('giftery_store_logo') || null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const handleLogoUpdate = () => {
      try {
        const logo = localStorage.getItem('giftery_store_logo');
        setCustomLogo(logo || null);
      } catch (e) {}
    };

    window.addEventListener('store_logo_updated', handleLogoUpdate);
    window.addEventListener('store_settings_updated', handleLogoUpdate);
    window.addEventListener('storage', handleLogoUpdate);

    return () => {
      window.removeEventListener('store_logo_updated', handleLogoUpdate);
      window.removeEventListener('store_settings_updated', handleLogoUpdate);
      window.removeEventListener('storage', handleLogoUpdate);
    };
  }, []);

  const visibleCorporate = showMoreCorporate ? corporateLinks : corporateLinks.slice(0, 7);
  const visibleToys = showMoreToys ? toysLinks : toysLinks.slice(0, 7);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Column 1: Brand Header & Social */}
          <div className={styles.brandCol}>
            <Link to={ROUTES.HOME} className={styles.brandLink}>
              <img
                src={customLogo || DEFAULT_LOGO_URL}
                alt="GIFTERY Logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_LOGO_URL;
                }}
                style={{ height: '80px', maxWidth: '340px', objectFit: 'contain' }}
              />
            </Link>

            <p className={styles.brandDescription}>
              Helping businesses create lasting impressions through premium customised gifting solutions.
            </p>

            <div className={styles.socialIcons}>
              <a href="https://www.facebook.com/giftery2023" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={styles.socialBtn}>
                <FaFacebookF />
              </a>
              <a href="https://www.instagram.com/giftery.india/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.socialBtn}>
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={styles.socialBtn}>
                <FaLinkedinIn />
              </a>
              <a href="https://www.youtube.com/@gifteryindia" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={styles.socialBtn}>
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Column 2: QUICK LINKS */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>QUICK LINKS</h3>
            <ul className={styles.linkList}>
              <li><Link to={ROUTES.HOME}><FaChevronRight className={styles.chevron} /> Home</Link></li>
              <li><Link to={ROUTES.ABOUT}><FaChevronRight className={styles.chevron} /> About Us</Link></li>
              <li><Link to={ROUTES.SHOP}><FaChevronRight className={styles.chevron} /> Products</Link></li>
              <li><Link to={ROUTES.FAQ || '/faq'}><FaChevronRight className={styles.chevron} /> FAQs</Link></li>
              <li><Link to={ROUTES.CONTACT}><FaChevronRight className={styles.chevron} /> Contact Us</Link></li>
              <li><Link to={ROUTES.TERMS}><FaChevronRight className={styles.chevron} /> Terms &amp; Conditions</Link></li>
              <li><Link to={ROUTES.PRIVACY}><FaChevronRight className={styles.chevron} /> Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 3: CORPORATE GIFTS */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>CORPORATE GIFTS</h3>
            <ul className={styles.linkList}>
              {visibleCorporate.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.path}><FaChevronRight className={styles.chevron} /> {item.name}</Link>
                </li>
              ))}
            </ul>
            {corporateLinks.length > 7 && (
              <button
                type="button"
                onClick={() => setShowMoreCorporate(!showMoreCorporate)}
                className={styles.toggleMoreBtn}
              >
                {showMoreCorporate ? '– View Less' : `+ View ${corporateLinks.length - 7} More`}
              </button>
            )}
          </div>

          {/* Column 4: PERSONALIZED GIFTS */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>PERSONALIZED GIFTS</h3>
            <ul className={styles.linkList}>
              <li><Link to={ROUTES.PERSONALIZED_GIFTS}><FaChevronRight className={styles.chevron} /> All Personalized Gifts</Link></li>
              <li><Link to={ROUTES.PERSONALIZED_GIFTS}><FaChevronRight className={styles.chevron} /> Photo Frames</Link></li>
              <li><Link to={ROUTES.PERSONALIZED_GIFTS}><FaChevronRight className={styles.chevron} /> Acrylic Frames</Link></li>
              <li><Link to={ROUTES.PERSONALIZED_GIFTS}><FaChevronRight className={styles.chevron} /> Caricatures</Link></li>
              <li><Link to={ROUTES.PERSONALIZED_GIFTS}><FaChevronRight className={styles.chevron} /> Clocks</Link></li>
              <li><Link to={ROUTES.PERSONALIZED_GIFTS}><FaChevronRight className={styles.chevron} /> Wooden Photo Engraving</Link></li>
            </ul>
          </div>

          {/* Column 5: TOYS */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>TOYS</h3>
            <ul className={styles.linkList}>
              {visibleToys.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.path}><FaChevronRight className={styles.chevron} /> {item.name}</Link>
                </li>
              ))}
            </ul>
            {toysLinks.length > 7 && (
              <button
                type="button"
                onClick={() => setShowMoreToys(!showMoreToys)}
                className={styles.toggleMoreBtn}
              >
                {showMoreToys ? '– View Less' : `+ View ${toysLinks.length - 7} More`}
              </button>
            )}
          </div>

          {/* Column 7: STORE INFORMATION */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>STORE INFORMATION</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <FaMapMarkerAlt className={styles.infoIcon} />
                <span>Ramanathapuram, Coimbatore, Tamil Nadu 641045</span>
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

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            Copyright © {new Date().getFullYear()} <span className={styles.goldHighlight}>Giftery</span> | Crafted And Maintained By <span className={styles.goldHighlight}>Ikaslé Business Group</span>
          </div>

          <div className={styles.paymentSection}>
            <span className={styles.weAcceptLabel}>We Accept</span>
            <div className={styles.paymentMethods}>
              <span className={`${styles.payCard} ${styles.payVisa}`}>VISA</span>
              <span className={`${styles.payCard} ${styles.payDiscover}`}>DISCOVER</span>
              <span className={`${styles.payCard} ${styles.payAmex}`}>AMERICAN EXPRESS</span>
              <span className={`${styles.payCard} ${styles.payMastercard}`}>MasterCard</span>
              <span className={`${styles.payCard} ${styles.payGiropay}`}>giropay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
