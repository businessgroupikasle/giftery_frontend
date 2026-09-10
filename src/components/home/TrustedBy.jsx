import psgCasLogo from '@assets/trusted-logos/psg_cas_logo.png';
import psgImsrLogo from '@assets/trusted-logos/psg_imsr_logo.png';
import sreeRangaLogo from '@assets/trusted-logos/sree_ranga_diagnostics_logo.png';
import bankOfIndiaLogo from '@assets/trusted-logos/bank_of_india_logo.png';
import biozymeTeaLogo from '@assets/trusted-logos/biozyme_tea_logo.png';
import uniconLogo from '@assets/trusted-logos/unicon_logo.png';
import biostadtLogo from '@assets/trusted-logos/biostadt_logo.png';
import annaiHotelsLogo from '@assets/trusted-logos/annai_hotels_logo.png';
import daitDhaanishLogo from '@assets/trusted-logos/dait_dhaanish_logo.png';
import atnaTechnologiesLogo from '@assets/trusted-logos/atna_technologies_logo.png';
import psgImLogo from '@assets/trusted-logos/psg_im_logo.png';
import styles from './TrustedBy.module.css';

const TRUSTED_LOGOS = [
  {
    id: 'psg-cas',
    name: 'PSG College of Arts & Science',
    src: psgCasLogo,
  },
  {
    id: 'psg-imsr',
    name: 'PSG Institute of Medical Sciences & Research',
    src: psgImsrLogo,
  },
  {
    id: 'sree-ranga',
    name: 'Sree Ranga Diagnostics',
    src: sreeRangaLogo,
  },
  {
    id: 'bank-of-india',
    name: 'Bank of India',
    src: bankOfIndiaLogo,
  },
  {
    id: 'biozyme-tea',
    name: 'Biozyme Tea+',
    src: biozymeTeaLogo,
  },
  {
    id: 'unicon',
    name: 'Unicon',
    src: uniconLogo,
  },
  {
    id: 'biostadt',
    name: 'Biostadt India',
    src: biostadtLogo,
  },
  {
    id: 'annai-hotels',
    name: 'Annai Hotels',
    src: annaiHotelsLogo,
  },
  {
    id: 'dhaanish-itech',
    name: 'DAIT Dhaanish iTech Coimbatore',
    src: daitDhaanishLogo,
  },
  {
    id: 'atna-technologies',
    name: 'ATNA Technologies',
    src: atnaTechnologiesLogo,
  },
  {
    id: 'psg-im',
    name: 'PSG Institute of Management',
    src: psgImLogo,
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

