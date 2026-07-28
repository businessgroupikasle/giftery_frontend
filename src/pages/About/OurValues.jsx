import styles from './About.module.css';

const OUR_VALUES = [
  {
    id: 'quality',
    title: 'Quality First',
    desc: 'We never compromise on the quality of our products.',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="1.8">
        <polygon points="6 3 18 3 22 9 12 22 2 9 6 3"></polygon>
        <line x1="11" y1="3" x2="8" y2="9"></line>
        <line x1="13" y1="3" x2="16" y2="9"></line>
        <line x1="2" y1="9" x2="22" y2="9"></line>
        <line x1="12" y1="22" x2="8" y2="9"></line>
        <line x1="12" y1="22" x2="16" y2="9"></line>
      </svg>
    ),
  },
  {
    id: 'customer',
    title: 'Customer Centric',
    desc: 'Your satisfaction is at the heart of everything we do.',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
  },
  {
    id: 'innovation',
    title: 'Innovation',
    desc: 'We continuously innovate to bring fresh ideas to life.',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="1.8">
        <path d="M9 18h6"></path>
        <path d="M10 22h4"></path>
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.55.6 2.95 1.5 4 .76.76 1.23 1.52 1.41 2.5"></path>
      </svg>
    ),
  },
  {
    id: 'integrity',
    title: 'Integrity',
    desc: 'Honest, transparent and ethical in all our dealings.',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <polyline points="9 12 11 14 15 10"></polyline>
      </svg>
    ),
  },
  {
    id: 'sustainability',
    title: 'Sustainability',
    desc: 'Eco-conscious choices for a better tomorrow.',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#e5c158" strokeWidth="1.8">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7 0 4.4-3.6 8-8 8z"></path>
        <path d="M11 20v-7"></path>
      </svg>
    ),
  },
];

const OurValues = () => {
  return (
    <section className={styles.valuesSection}>
      <div className={styles.valuesContainer}>
        <span className={styles.valuesSubheading}>OUR VALUES</span>
        <h2 className={styles.valuesTitle}>The Principles That Define Us</h2>

        <div className={styles.valuesGrid}>
          {OUR_VALUES.map((val) => (
            <div key={val.id} className={styles.valueItem}>
              <div className={styles.blackBadge}>{val.icon}</div>
              <h3 className={styles.valueTitle}>{val.title}</h3>
              <p className={styles.valueDesc}>{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurValues;
