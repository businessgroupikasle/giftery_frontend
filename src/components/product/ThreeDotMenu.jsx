import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './ThreeDotMenu.module.css';

const ThreeDotMenu = ({ productUrl, productName, productImage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const menuRef = useRef(null);

  const fullUrl = window.location.origin + productUrl;
  const shareText = `Check out ${productName} on Giftery!`;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowShareOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWhatsAppShare = (e) => {
    e.stopPropagation();
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${fullUrl}`)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookShare = (e) => {
    e.stopPropagation();
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
  };

  const handleInstagramShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fullUrl);
    toast.success('✓ Product link copied! Redirecting to Instagram...');
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <button
        type="button"
        className={styles.threeDotBtn}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="More Options"
        title="More Options"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <Link
            to={productUrl}
            className={styles.menuItem}
            onClick={() => setIsOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>View Details</span>
          </Link>

          <button
            type="button"
            className={styles.menuItem}
            onClick={(e) => {
              e.stopPropagation();
              setShowShareOptions(!showShareOptions);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>Share Product</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.6 }}>
              {showShareOptions ? '▲' : '▼'}
            </span>
          </button>

          {showShareOptions && (
            <div className={styles.shareBox}>
              <span className={styles.shareTitle}>Share via</span>
              <div className={styles.shareIcons}>
                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className={`${styles.socialBtn} ${styles.whatsapp}`}
                  title="Share on WhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </button>

                {/* Instagram */}
                <button
                  type="button"
                  onClick={handleInstagramShare}
                  className={`${styles.socialBtn} ${styles.instagram}`}
                  title="Share link for Instagram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={handleFacebookShare}
                  className={`${styles.socialBtn} ${styles.facebook}`}
                  title="Share on Facebook"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThreeDotMenu;
