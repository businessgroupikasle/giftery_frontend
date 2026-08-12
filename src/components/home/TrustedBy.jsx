import styles from './TrustedBy.module.css';

const TRUSTED_LOGOS = [
  {
    id: 'psg-cas',
    name: 'PSG College of Arts & Science',
    src: '/uploads/psg_cas_logo.png',
  },
  {
    id: 'psg-imsr',
    name: 'PSG Institute of Medical Sciences & Research',
    src: '/uploads/psg_imsr_logo.png',
  },
  {
    id: 'sree-ranga',
    name: 'Sree Ranga Diagnostics',
    src: '/uploads/sree_ranga_diagnostics_logo.png',
  },
  {
    id: 'bank-of-india',
    name: 'Bank of India',
    src: '/uploads/bank_of_india_logo.png',
  },
  {
    id: 'biozyme-tea',
    name: 'Biozyme Tea+',
    src: '/uploads/biozyme_tea_logo.png',
  },
  {
    id: 'unicon',
    name: 'Unicon',
    src: '/uploads/unicon_logo.png',
  },
  {
    id: 'biostadt',
    name: 'Biostadt India',
    src: '/uploads/biostadt_logo.png',
  },
  {
    id: 'annai-hotels',
    name: 'Annai Hotels',
    src: '/uploads/annai_hotels_logo.png',
  },
  {
    id: 'dhaanish-itech',
    name: 'DAIT Dhaanish iTech Coimbatore',
    src: '/uploads/dait_dhaanish_logo.png',
  },
  {
    id: 'atna-technologies',
    name: 'ATNA Technologies',
    src: '/uploads/atna_technologies_logo.png',
  },
  {
    id: 'psg-im',
    name: 'PSG Institute of Management',
    src: '/uploads/psg_im_logo.png',
  },
];

// Duplicate array 4 times for continuous smooth infinite marquee loop animation
const LOGO_TICKER = [...TRUSTED_LOGOS, ...TRUSTED_LOGOS, ...TRUSTED_LOGOS, ...TRUSTED_LOGOS];

const TrustedBy = () => {
  return (
    <section className={styles.trustedSection}>
      <div className={styles.trustedContainer}>
        <h3 className={styles.trustedTitle}>
          Trusted by Leading Institutions & Businesses Across India
        </h3>

        {/* Animated Marquee / Infinite Ticker Track */}
        <div className={styles.tickerWrapper}>
          <div className={styles.tickerFadeLeft} />
          <div className={styles.tickerTrack}>
            {LOGO_TICKER.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className={styles.logoItem} title={item.name}>
                <img
                  src={item.src}
                  alt={item.name}
                  className={styles.logoImg}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <div className={styles.tickerFadeRight} />
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
