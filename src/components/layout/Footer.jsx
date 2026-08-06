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
  <svg className={styles.brandLogoSvg} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 12V36" stroke="url(#goldGradFooter)" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="6" y="17" width="28" height="19" rx="2" stroke="url(#goldGradFooter)" strokeWidth="2.2" fill="url(#goldGradFooter)" fillOpacity="0.15" />
    <rect x="4" y="12" width="32" height="5" rx="1.5" fill="url(#goldGradFooter)" stroke="url(#goldGradFooter)" strokeWidth="1.5" />
    <path d="M20 12C20 12 16 4 11 4C7.5 4 6 6.5 7 9.5C8 12 20 12 20 12Z" stroke="url(#goldGradFooter)" strokeWidth="2" strokeLinejoin="round" fill="url(#goldGradFooter)" fillOpacity="0.25" />
    <path d="M20 12C20 12 24 4 29 4C32.5 4 34 6.5 33 9.5C32 12 20 12 20 12Z" stroke="url(#goldGradFooter)" strokeWidth="2" strokeLinejoin="round" fill="url(#goldGradFooter)" fillOpacity="0.25" />
    <defs>
      <linearGradient id="goldGradFooter" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F7D58B" />
        <stop offset="0.5" stopColor="#DFA843" />
        <stop offset="1" stopColor="#B8832A" />
      </linearGradient>
    </defs>
  </svg>
);

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Column 1: Brand Header & Social */}
          <div className={styles.brandCol}>
            <Link to={ROUTES.HOME} className={styles.brandLink}>
              <GiftLogoSvg />
              <div className={styles.brandTextGroup}>
                <h2 className={styles.brandTitle}>GIFTERYS</h2>
                <span className={styles.brandSubtitle}>CREATING MEMORIES FOR BRAND</span>
              </div>
            </Link>

            <p className={styles.brandDescription}>
              Helping businesses create lasting impressions through premium customised gifting solutions.
            </p>

            <div className={styles.socialIcons}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={styles.socialBtn}>
                <FaFacebookF />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.socialBtn}>
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={styles.socialBtn}>
                <FaLinkedinIn />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={styles.socialBtn}>
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
              {/* <li><Link to={ROUTES.CORPORATE}><FaChevronRight className={styles.chevron} /> Solutions</Link></li>
              <li><Link to={ROUTES.CORPORATE}><FaChevronRight className={styles.chevron} /> Industries</Link></li>
              <li><Link to={ROUTES.GALLERY || '/gallery'}><FaChevronRight className={styles.chevron} /> Gallery</Link></li> */}
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
              <li><Link to={ROUTES.CORPORATE}><FaChevronRight className={styles.chevron} /> All Corporate Gifts</Link></li>
              <li><Link to={ROUTES.CORPORATE}><FaChevronRight className={styles.chevron} /> Work Anniversary Gifts</Link></li>
              <li><Link to={ROUTES.CORPORATE}><FaChevronRight className={styles.chevron} /> Diaries &amp; Notebooks</Link></li>
              <li><Link to={ROUTES.CORPORATE}><FaChevronRight className={styles.chevron} /> Apparel</Link></li>
              <li><Link to={ROUTES.CORPORATE}><FaChevronRight className={styles.chevron} /> Drinkware</Link></li>
              <li><Link to={ROUTES.CORPORATE}><FaChevronRight className={styles.chevron} /> Lifestyle</Link></li>
              <li><Link to={ROUTES.CORPORATE}><FaChevronRight className={styles.chevron} /> Tech Accessories</Link></li>
              <li><Link to={ROUTES.CORPORATE}><FaChevronRight className={styles.chevron} /> Bags &amp; Travel</Link></li>
              <li><Link to={ROUTES.CORPORATE}><FaChevronRight className={styles.chevron} /> Office Essentials</Link></li>
              <li><Link to={ROUTES.CORPORATE}><FaChevronRight className={styles.chevron} /> Awards &amp; Trophies</Link></li>
              <li><Link to={ROUTES.CORPORATE}><FaChevronRight className={styles.chevron} /> Eco Friendly Gifts</Link></li>
            </ul>
          </div>

          {/* Column 5: PERSONALIZED GIFTS */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>PERSONALIZED GIFTS</h3>
            <ul className={styles.linkList}>
              <li><Link to={ROUTES.PERSONALIZED}><FaChevronRight className={styles.chevron} /> All Personalized Gifts</Link></li>
              <li><Link to={ROUTES.PERSONALIZED}><FaChevronRight className={styles.chevron} /> Photo Frames</Link></li>
              <li><Link to={ROUTES.PERSONALIZED}><FaChevronRight className={styles.chevron} /> Acrylic Frames</Link></li>
              <li><Link to={ROUTES.PERSONALIZED}><FaChevronRight className={styles.chevron} /> Caricatures</Link></li>
              <li><Link to={ROUTES.PERSONALIZED}><FaChevronRight className={styles.chevron} /> Clocks</Link></li>
              <li><Link to={ROUTES.PERSONALIZED}><FaChevronRight className={styles.chevron} /> Wooden Photo Engraving</Link></li>
            </ul>
          </div>

          {/* Column 6: TOYS */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>TOYS</h3>
            <ul className={styles.linkList}>
              <li><Link to={ROUTES.TOYS}><FaChevronRight className={styles.chevron} /> All Toys</Link></li>
              <li><Link to={ROUTES.TOYS}><FaChevronRight className={styles.chevron} /> Educational Toys</Link></li>
              <li><Link to={ROUTES.TOYS}><FaChevronRight className={styles.chevron} /> Soft Toys</Link></li>
              <li><Link to={ROUTES.TOYS}><FaChevronRight className={styles.chevron} /> Remote Control Toys</Link></li>
              <li><Link to={ROUTES.TOYS}><FaChevronRight className={styles.chevron} /> Building Blocks</Link></li>
              <li><Link to={ROUTES.TOYS}><FaChevronRight className={styles.chevron} /> Dolls &amp; Doll Houses</Link></li>
              <li><Link to={ROUTES.TOYS}><FaChevronRight className={styles.chevron} /> Ride On Toys</Link></li>
              <li><Link to={ROUTES.TOYS}><FaChevronRight className={styles.chevron} /> Outdoor Toys</Link></li>
              <li><Link to={ROUTES.TOYS}><FaChevronRight className={styles.chevron} /> Board Games</Link></li>
            </ul>
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
