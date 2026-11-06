import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PrivateImage from '@components/PrivateImage';
import { ROUTES } from '@constants/routes';
import { customizationService } from '@services/customizationService';
import { resolveCustomizationConfig } from '@pages/Customize/designModel';
import styles from './Product.module.css';

const STATUS_LABEL = { DRAFT: 'Draft', SAVED: 'Saved', ORDERED: 'Ordered' };

/** Replaces the old inline editor: opens the studio and lists this customer's designs for the product. */
export default function CustomizeEntry({ product, isAuthenticated, userId }) {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const config = resolveCustomizationConfig(product);
  const path = ROUTES.CUSTOMIZE_PATH(product.slug || product.id);

  useEffect(() => {
    let cancelled = false;
    setDesigns([]);
    if (!isAuthenticated || !userId || !product.id || !config.enabled) return undefined;
    customizationService.listDesigns({ productId: product.id })
      .then((rows) => { if (!cancelled) setDesigns(rows); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isAuthenticated, userId, product.id, config.enabled]);

  if (!config.enabled) return null;

  const start = () => {
    if (!isAuthenticated) toast.info('Please sign in to customize this product.');
    navigate(path);
  };

  const remove = async (design) => {
    try {
      await customizationService.deleteDesign(design.id);
      setDesigns((current) => current.filter((entry) => entry.id !== design.id));
      toast.success('Design deleted.');
    } catch (error) {
      toast.error(error.message || 'This design could not be deleted.');
    }
  };

  return (
    <section className={styles.customizeEntry} aria-labelledby="customize-entry-title">
      <div className={styles.customizeEntryIntro}>
        <div>
          <h2 id="customize-entry-title">Customize This Product</h2>
          <p>Personalize your product with your own designs.</p>
          <p>Add logos, text, stickers, images and other creative elements.</p>
        </div>
        <button type="button" className={styles.customizeStartBtn} onClick={start}>Start Customizing</button>
      </div>
      {designs.length > 0 && (
        <div className={styles.savedDesigns}>
          <h3>Your saved designs</h3>
          <ul>
            {designs.map((design) => (
              <li key={design.id}>
                {design.previewAssetId
                  ? <PrivateImage assetId={design.previewAssetId} alt={`${design.name} preview`} className={styles.savedDesignThumb} />
                  : <span className={styles.savedDesignThumb} aria-hidden="true" />}
                <div className={styles.savedDesignInfo}>
                  <strong>{design.name}</strong>
                  <small>{STATUS_LABEL[design.status] || design.status}</small>
                  <span>
                    <Link to={ROUTES.CUSTOMIZE_PATH(product.slug || product.id, design.id)}>Edit</Link>
                    <button type="button" onClick={() => remove(design)} aria-label={`Delete ${design.name}`}>Delete</button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
