import Layout from '@components/layout/Layout';
import styles from './NotFound.module.css';
import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes';

const NotFound = () => (
  <Layout>
    <div className={styles.container}>
      <div className={styles.decorativeElements}>
        <svg className={styles.gift1} viewBox="0 0 200 240">
          <defs>
            <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#1a1a1a', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#000000', stopOpacity: 1}} />
            </linearGradient>
            <linearGradient id="ribbonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#FFD700', stopOpacity: 1}} />
              <stop offset="50%" style={{stopColor: '#D4AF37', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#B8860B', stopOpacity: 1}} />
            </linearGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="100" cy="210" rx="70" ry="15" fill="rgba(0,0,0,0.2)" />

          {/* Box Front Face */}
          <rect x="30" y="80" width="140" height="120" fill="url(#boxGradient)" stroke="#0a0a0a" strokeWidth="2" />

          {/* Box Top Face */}
          <polygon points="30,80 50,60 190,60 170,80" fill="#2a2a2a" stroke="#0a0a0a" strokeWidth="2" />

          {/* Box Right Face */}
          <polygon points="170,80 190,60 190,180 170,200" fill="#0f0f0f" stroke="#0a0a0a" strokeWidth="2" />

          {/* Horizontal Gold Ribbon */}
          <rect x="30" y="125" width="140" height="18" fill="url(#ribbonGradient)" stroke="#9c7e28" strokeWidth="1" />

          {/* Vertical Gold Ribbon */}
          <rect x="92" y="60" width="16" height="140" fill="url(#ribbonGradient)" stroke="#9c7e28" strokeWidth="1" />

          {/* Ribbon Shine Effect */}
          <rect x="30" y="125" width="140" height="6" fill="#FFE55C" opacity="0.6" />
          <rect x="92" y="60" width="5" height="140" fill="#FFE55C" opacity="0.5" />

          {/* Bow - Top Loop Left */}
          <ellipse cx="70" cy="55" rx="18" ry="24" fill="#D4AF37" stroke="#9c7e28" strokeWidth="1.5" transform="rotate(-25 70 55)" />

          {/* Bow - Top Loop Right */}
          <ellipse cx="130" cy="55" rx="18" ry="24" fill="#D4AF37" stroke="#9c7e28" strokeWidth="1.5" transform="rotate(25 130 55)" />

          {/* Bow - Center Knot */}
          <circle cx="100" cy="58" r="12" fill="#FFD700" stroke="#9c7e28" strokeWidth="1" />
          <circle cx="100" cy="58" r="10" fill="#D4AF37" stroke="none" />

          {/* Bow - Tail Left */}
          <path d="M 75 70 Q 65 80 70 95 Q 72 100 75 98" fill="#D4AF37" stroke="#9c7e28" strokeWidth="1" />

          {/* Bow - Tail Right */}
          <path d="M 125 70 Q 135 80 130 95 Q 128 100 125 98" fill="#D4AF37" stroke="#9c7e28" strokeWidth="1" />

          {/* Shine on bow */}
          <ellipse cx="95" cy="48" rx="8" ry="5" fill="#FFE55C" opacity="0.7" />
          <ellipse cx="105" cy="48" rx="8" ry="5" fill="#FFE55C" opacity="0.7" />

          {/* Sparkle accents around gift */}
          <circle cx="20" cy="100" r="2" fill="#D4AF37" opacity="0.8" />
          <circle cx="180" cy="120" r="2.5" fill="#D4AF37" opacity="0.7" />
          <circle cx="25" cy="170" r="1.5" fill="#D4AF37" opacity="0.6" />
        </svg>

        <svg className={styles.sparkle1} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="3" fill="#D4AF37"/>
          <circle cx="50" cy="50" r="8" fill="none" stroke="#D4AF37" strokeWidth="1"/>
        </svg>

        <svg className={styles.sparkle2} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="2" fill="#D4AF37"/>
        </svg>

        <svg className={styles.star} viewBox="0 0 100 100">
          <polygon points="50,10 61,40 92,40 67,60 78,90 50,70 22,90 33,60 8,40 39,40" fill="#D4AF37" opacity="0.6"/>
        </svg>

        {/* Tilted Wrapped Gift on Right */}
        <svg className={styles.giftTilted} viewBox="0 0 200 200">
          <defs>
            <linearGradient id="tiltedBoxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#1a1a1a', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#000000', stopOpacity: 1}} />
            </linearGradient>
          </defs>

          {/* Shadow for tilted box */}
          <ellipse cx="100" cy="190" rx="50" ry="12" fill="rgba(0,0,0,0.15)" />

          {/* Tilted Box - rotated appearance */}
          <g transform="translate(100, 80) rotate(-15)">
            {/* Box face */}
            <rect x="-40" y="-40" width="80" height="80" fill="url(#tiltedBoxGradient)" stroke="#0a0a0a" strokeWidth="2" />

            {/* Box top */}
            <polygon points="-40,-40 -30,-50 50,-50 40,-40" fill="#2a2a2a" stroke="#0a0a0a" strokeWidth="2" />

            {/* Box right side */}
            <polygon points="40,-40 50,-50 50,30 40,40" fill="#0f0f0f" stroke="#0a0a0a" strokeWidth="2" />

            {/* Gold ribbon horizontal */}
            <rect x="-40" y="-8" width="80" height="12" fill="#D4AF37" stroke="#9c7e28" strokeWidth="1" />

            {/* Gold ribbon vertical */}
            <rect x="-6" y="-50" width="12" height="90" fill="#D4AF37" stroke="#9c7e28" strokeWidth="1" />
          </g>

          {/* Flying ribbon streaks */}
          <path d="M 140 60 Q 160 40 180 30" stroke="#D4AF37" strokeWidth="3" fill="none" opacity="0.7" strokeLinecap="round" />
          <path d="M 150 70 Q 170 55 190 40" stroke="#D4AF37" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />
        </svg>
      </div>

      <div className={styles.content}>
        <div className={styles.errorCode}>
          <span className={styles.four404}>4</span>
          <span className={styles.zero404}>0</span>
          <span className={styles.four404}>4</span>
        </div>

        <h1 className={styles.title}>
          <span className={styles.oops}>Oops!</span>
          <span className={styles.subtitle}> This Page Is Missing</span>
        </h1>

        <p className={styles.description}>
          Looks like the page you're looking for<br />
          has been moved, removed, or never existed.
        </p>

        <Link to={ROUTES.HOME} className={styles.homeBtn}>
           Back to Home <span className={styles.arrow}>→</span>
        </Link>

        <div className={styles.noteCard}>
          <p>Let's find the <em>perfect gift</em> instead!</p>
          <span className={styles.heart}>❤️</span>
        </div>
      </div>
    </div>
  </Layout>
);

export default NotFound;
