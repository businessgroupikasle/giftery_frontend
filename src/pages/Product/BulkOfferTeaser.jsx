import { useEffect, useRef, useState } from 'react';
import { FiArrowRight, FiX } from 'react-icons/fi';
import BulkOrderInquiry from './BulkOrderInquiry';
import { BULK_MIN_QUANTITY } from './bulkInquiryForm';
import styles from './BulkOfferTeaser.module.css';

/**
 * Compact 10% bulk offer shown inside the product card. Its button opens the full
 * bulk order inquiry (offer banner + form) in a popup. The popup stays mounted while
 * closed, so anything the customer typed is still there when they reopen it.
 * Render it with `key={product.id}` so another product starts a fresh form.
 */
const BulkOfferTeaser = ({ product, user }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const closeRef = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      // Hand focus back to the button that opened the popup.
      if (wasOpen.current) triggerRef.current?.focus();
      wasOpen.current = false;
      return undefined;
    }
    wasOpen.current = true;
    closeRef.current?.focus();

    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <div className={styles.teaser}>
        <div className={styles.badge} aria-hidden="true">
          <span className={styles.badgeValue}>10%</span>
          <span className={styles.badgeOff}>OFF</span>
        </div>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>Special Bulk Order Offer</span>
          <p className={styles.headline}>
            Get <strong>10% OFF</strong> on bulk orders of {BULK_MIN_QUANTITY}+ units
          </p>
          <p className={styles.note}>Minimum {BULK_MIN_QUANTITY} units. Our team confirms bulk pricing &amp; eligibility.</p>
        </div>
        <button
          ref={triggerRef}
          type="button"
          className={styles.openBtn}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          Bulk Order Inquiry <FiArrowRight aria-hidden="true" />
        </button>
      </div>

      <div className={styles.overlay} hidden={!open} onClick={() => setOpen(false)}>
        <div
          className={styles.dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-order-title"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            ref={closeRef}
            type="button"
            className={styles.closeBtn}
            onClick={() => setOpen(false)}
            aria-label="Close bulk order inquiry"
          >
            <FiX aria-hidden="true" />
          </button>
          <BulkOrderInquiry product={product} user={user} />
        </div>
      </div>
    </>
  );
};

export default BulkOfferTeaser;
