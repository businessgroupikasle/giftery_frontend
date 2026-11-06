import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '@components/layout/Layout';
import PrivateImage from '@components/PrivateImage';
import Spinner from '@components/ui/Spinner';
import { ROUTES } from '@constants/routes';
import { customizationService } from '@services/customizationService';
import { formatDate } from '@utils/formatters';
import { getImageUrl } from '@utils/imageUrl';
import styles from './MyDesigns.module.css';

const STATUS_LABEL = { DRAFT: 'Draft', SAVED: 'Saved', ORDERED: 'Ordered' };

const MyDesigns = () => {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    customizationService.listDesigns({ limit: 100 })
      .then((rows) => { if (!cancelled) { setDesigns(rows); setStatus('ready'); } })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, []);

  const duplicate = async (design) => {
    try {
      const copy = await customizationService.duplicateDesign(design.id);
      navigate(ROUTES.CUSTOMIZE_PATH(design.product.slug, copy.id));
    } catch (error) {
      toast.error(error.message || 'This design could not be duplicated.');
    }
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
    <Layout>
      <div className={`container section ${styles.page}`}>
        <h1 className={styles.title}>My Designs</h1>
        {status === 'loading' && <Spinner />}
        {status === 'error' && <p role="alert">Your designs could not be loaded. Please refresh the page.</p>}
        {status === 'ready' && designs.length === 0 && (
          <p className={styles.empty}>You have no saved designs yet. Open a product and choose Start Customizing to create one.</p>
        )}
        <ul className={styles.grid}>
          {designs.map((design) => (
            <li key={design.id} className={styles.card}>
              {design.previewAssetId
                ? <PrivateImage assetId={design.previewAssetId} alt={`${design.name} preview`} className={styles.thumb} />
                : <img src={getImageUrl(design.product?.images?.[0])} alt={design.product?.name || ''} className={styles.thumb} />}
              <div className={styles.info}>
                <strong>{design.name}</strong>
                <Link to={ROUTES.PRODUCT_PATH(design.product?.slug)}>{design.product?.name}</Link>
                <small>{STATUS_LABEL[design.status] || design.status} · Updated {formatDate(design.updatedAt)}</small>
                <div className={styles.actions}>
                  <Link className={styles.primary} to={ROUTES.CUSTOMIZE_PATH(design.product?.slug, design.id)}>Edit</Link>
                  <button type="button" onClick={() => duplicate(design)}>Duplicate</button>
                  <button type="button" className={styles.danger} onClick={() => remove(design)}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default MyDesigns;
