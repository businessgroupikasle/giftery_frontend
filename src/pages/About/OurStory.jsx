import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import styles from './About.module.css';

const OurStory = () => {
  return (
    <section className={styles.storySection}>
      <div className={styles.storyContainer}>
        {/* Left Copy */}
        <div>
          <span className={styles.storySubheading}>OUR STORY</span>
          <h2 className={styles.storyTitle}>
            Crafting Meaningful<br />Experiences Since Day One
          </h2>
          <p className={styles.storyText}>
            Giftery, was born out of a simple idea – gifts can do more than just impress, they can build relationships, strengthen bonds and create memories that last.
          </p>
          <p className={styles.storyText}>
            From a small team with a big vision, we have grown into a trusted partner for 1000+ businesses across India, delivering high-quality, customized gifts for every occasion.
          </p>
          <Link to={ROUTES.SHOP} className={styles.journeyBtn}>
            OUR JOURNEY &rarr;
          </Link>
        </div>

        {/* Right 4 Cards Grid */}
        <div className={styles.storyCardsGrid}>
          {/* Card 1: Happy Clients */}
          <div className={styles.storyCard}>
            <div className={styles.cardIconBadge}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c58b29" strokeWidth="1.8">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className={styles.cardHighlight}>1000+</div>
            <h3 className={styles.cardTitle}>Happy Clients</h3>
            <p className={styles.cardSubtitle}>Trusted by leading brands across industries</p>
          </div>

          {/* Card 2: Products */}
          <div className={styles.storyCard}>
            <div className={styles.cardIconBadge}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c58b29" strokeWidth="1.8">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div className={styles.cardHighlight}>5000+</div>
            <h3 className={styles.cardTitle}>Products</h3>
            <p className={styles.cardSubtitle}>Wide range of premium gifting solutions</p>
          </div>

          {/* Card 3: PAN India Delivery */}
          <div className={styles.storyCard}>
            <div className={styles.cardIconBadge}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c58b29" strokeWidth="1.8">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div className={styles.cardHighlight}>PAN India</div>
            <h3 className={styles.cardTitle}>Delivery</h3>
            <p className={styles.cardSubtitle}>Delivering smiles across every pincode</p>
          </div>

          {/* Card 4: Customization */}
          <div className={styles.storyCard}>
            <div className={styles.cardIconBadge}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c58b29" strokeWidth="1.8">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </div>
            <div className={styles.cardHighlight}>100%</div>
            <h3 className={styles.cardTitle}>Customization</h3>
            <p className={styles.cardSubtitle}>Tailored to match your brand perfectly</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
