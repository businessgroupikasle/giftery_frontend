import { useMemo, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PrivateImage from '@components/PrivateImage';
import { customizationService } from '@services/customizationService';
import { describeCustomization, REVIEW_STATUS_LABELS, summarizeCustomization } from '@utils/customizationSummary';
import styles from './CustomizationDetails.module.css';

const STATUS_CLASS = {
  PENDING_REVIEW: styles.statusPending,
  DESIGN_APPROVED: styles.statusApproved,
  IN_PROGRESS: styles.statusProgress,
  COMPLETED: styles.statusCompleted,
  REJECTED: styles.statusRejected,
};

export const CustomizationStatus = ({ status }) => (status
  ? <span className={`${styles.status} ${STATUS_CLASS[status] || ''}`}>{REVIEW_STATUS_LABELS[status] || status}</span>
  : null);

const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const extensionFor = (mimeType) => ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[mimeType] || 'png');

const downloadName = (asset, fallback) => {
  const name = asset?.originalName || fallback;
  const extension = extensionFor(asset?.mimeType);
  // An SVG upload is delivered here as its rendered PNG.
  return /\.svg$/i.test(name) ? name.replace(/\.svg$/i, `.${extension}`) : (/\.[a-z0-9]+$/i.test(name) ? name : `${name}.${extension}`);
};

/** Downloads a private file with the signed-in user's permissions. */
export const AssetDownload = ({ assetId, asset, label, vector = false }) => {
  const [busy, setBusy] = useState(false);
  const handle = async () => {
    setBusy(true);
    try {
      const blob = await customizationService.fetchAssetBlob(assetId, vector ? { source: 1 } : undefined);
      saveBlob(blob, vector ? (asset?.originalName || 'artwork.svg') : downloadName(asset, label));
    } catch (error) {
      toast.error(error.message || 'This file could not be downloaded.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <button type="button" className={styles.download} disabled={busy} onClick={handle}>
      <FiDownload aria-hidden="true" /> {busy ? 'Downloading…' : `Download ${label}`}
    </button>
  );
};

const AssetRow = ({ item, assets, kindLabel, allowDownload }) => {
  const asset = assets.find((entry) => entry.id === item.assetId);
  return (
    <li className={styles.assetRow}>
      <PrivateImage assetId={item.assetId} alt={item.name} className={styles.assetThumb} />
      <div className={styles.assetMeta}>
        <strong>{item.name}</strong>
        <small>{kindLabel}{asset?.width && asset?.height ? ` · ${asset.width} × ${asset.height} px` : ''}</small>
        {allowDownload && (
          <span className={styles.assetActions}>
            <AssetDownload assetId={item.assetId} asset={asset} label="image" />
            {asset?.hasVectorSource && <AssetDownload assetId={item.assetId} asset={asset} label="original SVG" vector />}
          </span>
        )}
      </div>
    </li>
  );
};

const Group = ({ title, children }) => (
  <div className={styles.group}>
    <h5>{title}</h5>
    {children}
  </div>
);

/**
 * Shows what a customer customized. `compact` is a one-line summary for cart and checkout rows;
 * the full view is for order history and the admin panel.
 */
export default function CustomizationDetails({ customization, compact = false, charge = 0, status, statusNote, allowDownload = true, showPreview = false }) {
  const info = useMemo(() => describeCustomization(customization), [customization]);
  if (!customization) return null;

  if (compact) {
    const summary = summarizeCustomization(customization);
    return (
      <div className={styles.compact} data-testid="customization-summary">
        <strong>Customized{info.name ? `: ${info.name}` : ''}</strong>
        {summary && <span>{summary}</span>}
        {charge > 0 && <span>Includes ₹{Number(charge).toLocaleString('en-IN')} customization per unit</span>}
      </div>
    );
  }

  const uploads = [
    ...info.logos.map((item) => ({ item, kindLabel: 'Logo' })),
    ...info.uploadedGraphics.map((item) => ({ item, kindLabel: 'Graphic' })),
    ...(info.backgroundAssetId ? [{ item: { assetId: info.backgroundAssetId, name: info.assets.find((asset) => asset.id === info.backgroundAssetId)?.originalName || 'Background image' }, kindLabel: 'Background' }] : []),
    ...(info.legacyImageAssetId ? [{ item: { assetId: info.legacyImageAssetId, name: 'Artwork' }, kindLabel: 'Artwork' }] : []),
  ].filter((entry, index, all) => all.findIndex((other) => other.item.assetId === entry.item.assetId) === index);

  return (
    <div className={styles.details} data-testid="customization-details">
      <div className={styles.heading}>
        <strong>{info.name || 'Customized product'}</strong>
        <CustomizationStatus status={status} />
      </div>
      {statusNote && <p className={styles.note}>{statusNote}</p>}

      {showPreview && info.previewAssetId && (
        <Group title="Design preview">
          <PrivateImage assetId={info.previewAssetId} alt="Design preview" className={styles.previewImage} />
          {allowDownload && <AssetDownload assetId={info.previewAssetId} asset={{ originalName: 'design-preview', mimeType: 'image/jpeg' }} label="preview" />}
          <p className={styles.disclaimer}>
            Visual mockup, not a print proof.
            {info.includesProductImage === false ? ' The product photo could not be included in this preview.' : ''}
          </p>
        </Group>
      )}

      {info.options.length > 0 && (
        <Group title="Selected options">
          <p className={styles.plain}>{info.options.map((option) => `${option.label}: ${option.value}`).join(' · ')}</p>
        </Group>
      )}

      {uploads.length > 0 && (
        <Group title="Uploaded logos and images">
          <ul className={styles.assetList}>
            {uploads.map(({ item, kindLabel }) => <AssetRow key={item.assetId} item={item} kindLabel={kindLabel} assets={info.assets} allowDownload={allowDownload} />)}
          </ul>
        </Group>
      )}

      {info.texts.length > 0 && (
        <Group title="Custom text">
          <ul className={styles.textList}>
            {info.texts.map((entry, index) => (
              <li key={`${entry.label}-${index}`}>
                <strong>{entry.label}:</strong> {entry.value}
                {(entry.font || entry.color) && <small> ({[entry.font, entry.color].filter(Boolean).join(', ')})</small>}
              </li>
            ))}
          </ul>
        </Group>
      )}

      {info.stickers.length > 0 && <Group title="Stickers"><p className={styles.plain}>{info.stickers.join(', ')}</p></Group>}
      {info.graphics.length > 0 && <Group title="Graphics"><p className={styles.plain}>{info.graphics.join(', ')}</p></Group>}
      {info.background.length > 0 && <Group title="Background and border"><p className={styles.plain}>{info.background.join(', ')}</p></Group>}

      {info.instructions.length > 0 && (
        <Group title="Special instructions">
          <dl className={styles.instructionList}>
            {info.instructions.map((entry) => (
              <div key={entry.label}>
                <dt>{entry.label}</dt>
                <dd>{entry.value}</dd>
              </div>
            ))}
          </dl>
        </Group>
      )}

      {info.references.length > 0 && (
        <Group title="Reference images">
          <ul className={styles.assetList}>
            {info.references.map((item) => <AssetRow key={item.assetId} item={item} kindLabel="Reference" assets={info.assets} allowDownload={allowDownload} />)}
          </ul>
        </Group>
      )}
    </div>
  );
}
