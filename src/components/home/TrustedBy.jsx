import styles from './TrustedBy.module.css';

const TRUSTED_LOGOS = [
  {
    id: 'annai',
    name: 'Annai Hotels & Resorts',
    logo: (
      <svg width="170" height="60" viewBox="0 0 170 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M28 12C28 12 22 20 16 23C22 26 28 34 28 34" stroke="#b47833" strokeWidth="3" strokeLinecap="round"/>
        <path d="M16 19C16 19 24 24 16 29" stroke="#b47833" strokeWidth="2.5" strokeLinecap="round"/>
        <text x="44" y="30" fontFamily="'Cinzel', Georgia, serif" fontSize="17" fontWeight="800" fill="#7a4b19" letterSpacing="1.5">ANNAI</text>
        <text x="44" y="44" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="#a07038" letterSpacing="2.5">HOTELS & RESORTS</text>
      </svg>
    ),
  },
  {
    id: 'biostadt',
    name: 'Biostadt India',
    logo: (
      <svg width="180" height="52" viewBox="0 0 180 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="10" width="176" height="32" rx="16" fill="#e11d48"/>
        <path d="M24 5C24 5 30 10 27 16" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round"/>
        <text x="34" y="32" fontFamily="'Arial Black', sans-serif" fontSize="19" fontWeight="900" fontStyle="italic" fill="#ffffff" letterSpacing="0.8">BIOSTADT</text>
      </svg>
    ),
  },
  {
    id: 'biozyme',
    name: 'Biozyme Tea+',
    logo: (
      <svg width="170" height="60" viewBox="0 0 170 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 15C20 15 26 9 32 15" stroke="#eab308" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M14 21C14 21 8 27 14 33" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M38 21C38 21 44 27 38 33" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round"/>
        <text x="48" y="30" fontFamily="'Trebuchet MS', sans-serif" fontSize="18" fontWeight="900" fill="#1f2937">BIOZYME</text>
        <text x="48" y="45" fontFamily="sans-serif" fontSize="11" fontWeight="800" fill="#15803d" letterSpacing="1.5">TEA +</text>
      </svg>
    ),
  },
  {
    id: 'boi',
    name: 'Bank of India',
    logo: (
      <svg width="190" height="54" viewBox="0 0 190 54" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="14" width="186" height="28" fill="#0284c7" rx="4"/>
        <polygon points="152,6 157,20 172,20 160,29 165,43 152,34 139,43 144,29 132,20 147,20" fill="#ea580c"/>
        <text x="12" y="33" fontFamily="sans-serif" fontSize="15" fontWeight="900" fill="#ffffff" letterSpacing="0.8">Bank of India</text>
      </svg>
    ),
  },
  {
    id: 'ranga',
    name: 'Ranga Diagnostics',
    logo: (
      <svg width="175" height="60" viewBox="0 0 175 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="87" cy="24" rx="75" ry="16" fill="#15803d"/>
        <text x="35" y="29" fontFamily="sans-serif" fontSize="14" fontWeight="900" fill="#ffffff" letterSpacing="1.5">RANGA</text>
        <text x="30" y="52" fontFamily="sans-serif" fontSize="10" fontWeight="800" fill="#166534" letterSpacing="2">DIAGNOSTICS</text>
      </svg>
    ),
  },
  {
    id: 'kmch',
    name: 'KMCH Medical Institution',
    logo: (
      <svg width="80" height="64" viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 8L64 8L56 56L40 61L24 56L16 8Z" stroke="#1e40af" strokeWidth="3" fill="#f8fafc"/>
        <circle cx="40" cy="26" r="10" stroke="#1e40af" strokeWidth="2.5" fill="none"/>
        <path d="M28 42H52" stroke="#1e40af" strokeWidth="2.5"/>
        <path d="M40 19V33" stroke="#1e40af" strokeWidth="2.5"/>
        <path d="M33 26H47" stroke="#1e40af" strokeWidth="2.5"/>
      </svg>
    ),
  },
  {
    id: 'psg',
    name: 'PSG Institutions',
    logo: (
      <svg width="80" height="64" viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8H62V48L40 58L18 48V8Z" fill="#1e3a8a" stroke="#1d4ed8" strokeWidth="2.5"/>
        <text x="26" y="32" fontFamily="sans-serif" fontSize="14" fontWeight="900" fill="#ffffff">PSG</text>
        <text x="22" y="44" fontFamily="sans-serif" fontSize="8" fontWeight="800" fill="#93c5fd">SINCE 1926</text>
      </svg>
    ),
  },
];

// Duplicate array 3 times for continuous infinite loop animation
const LOGO_TICKER = [...TRUSTED_LOGOS, ...TRUSTED_LOGOS, ...TRUSTED_LOGOS];

const TrustedBy = () => {
  return (
    <section className={styles.trustedSection}>
      <div className={styles.trustedContainer}>
        <h3 className={styles.trustedTitle}>
          Trusted by Businesses, Institutions & Organizations Across India
        </h3>

        {/* Animated Marquee / Infinite Ticker Track */}
        <div className={styles.tickerWrapper}>
          <div className={styles.tickerFadeLeft} />
          <div className={styles.tickerTrack}>
            {LOGO_TICKER.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className={styles.logoItem} title={item.name}>
                {item.logo}
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
