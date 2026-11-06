import { useEffect, useMemo } from 'react';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { getImageUrl } from '@utils/imageUrl';
import { describeCustomization } from '@utils/customizationSummary';
import DesignCanvas from './DesignCanvas';
import { DropZone } from './StudioPanels';
import { MAX_REFERENCE_IMAGES, missingOptions } from './designModel';
import styles from './Customize.module.css';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TOOL_LABELS = {
  uploads: 'Logo uploads',
  text: 'Custom text',
  stickers: 'Stickers',
  graphics: 'Graphics',
  templates: 'Design templates',
  background: 'Backgrounds and borders',
};

const OptionGroup = ({ label, name, values, selected, onSelect }) => (values.length > 0 ? (
  <div className={styles.field}>
    <span className={styles.fieldLabel}>{label}<span className={styles.required}> required</span></span>
    <div className={styles.chipRow} role="radiogroup" aria-label={label}>
      {values.map((value) => (
        <button type="button" key={value} role="radio" aria-checked={selected === value} className={`${styles.optionChip} ${selected === value ? styles.chipActive : ''}`} onClick={() => onSelect(name, value)}>{value}</button>
      ))}
    </div>
  </div>
) : null);

export const ProductStep = ({ product, gallery, design, config, options, quantity, maxStock, onOptions, onQuantity, onImage }) => {
  const minQuantity = Math.max(1, product.minOrder || 1);
  const { sizes, colors, materials } = config.variants;
  const hasVariants = sizes.length + colors.length + materials.length > 0;
  const setOption = (key, value) => onOptions((current) => ({ ...current, [key]: value }));
  const setQuantity = (value) => {
    const bounded = Math.min(Math.max(maxStock, minQuantity), Math.max(minQuantity, Math.floor(value) || minQuantity));
    onQuantity(bounded);
  };
  const tools = Object.entries(config.tools).filter(([, enabled]) => enabled).map(([tool]) => TOOL_LABELS[tool]);

  return (
    <div className={styles.twoColumn}>
      <div>
        <div className={styles.productPhoto}>
          <img src={getImageUrl(design.productImage)} alt={product.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/product-placeholder.svg'; }} />
        </div>
        {gallery.length > 1 && (
          <div className={styles.galleryStrip} role="group" aria-label="Product gallery images">
            {gallery.map((image, index) => (
              <button type="button" key={image} className={design.productImage === image ? styles.galleryActive : ''} aria-label={`Show gallery image ${index + 1}`} aria-pressed={design.productImage === image} onClick={() => onImage(image)}>
                <img src={getImageUrl(image)} alt="" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/product-placeholder.svg'; }} />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className={styles.card}>
        <h1 className={styles.stepTitle}>{product.name}</h1>
        <p className={styles.priceLine}>
          {money(product.price)}
          {config.chargePerUnit > 0 && <span> + {money(config.chargePerUnit)} customization per unit</span>}
        </p>
        <OptionGroup label="Size" name="size" values={sizes} selected={options.size} onSelect={setOption} />
        <OptionGroup label="Colour" name="color" values={colors} selected={options.color} onSelect={setOption} />
        <OptionGroup label="Material" name="material" values={materials} selected={options.material} onSelect={setOption} />
        {!hasVariants && <p className={styles.panelNote}>This product has no size, colour or material options to choose.</p>}
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Quantity <em>{maxStock} in stock</em></span>
          <div className={styles.stepperBox}>
            <button type="button" aria-label="Decrease quantity" disabled={quantity <= minQuantity} onClick={() => setQuantity(quantity - 1)}><FiMinus aria-hidden="true" /></button>
            <input type="number" aria-label="Quantity" min={minQuantity} max={maxStock} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
            <button type="button" aria-label="Increase quantity" disabled={quantity >= maxStock} onClick={() => setQuantity(quantity + 1)}><FiPlus aria-hidden="true" /></button>
          </div>
          {maxStock <= 0 && <p className={styles.errorText}>This product is out of stock. You can still save a design for later.</p>}
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Available for this product</span>
          <ul className={styles.toolList}>{tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
        </div>
      </div>
    </div>
  );
};

const INSTRUCTION_FIELDS = [
  ['requirements', 'Special customization requirements', 'Anything specific about how this should be made'],
  ['delivery', 'Delivery-related instructions', 'Delivery dates, packaging or address notes'],
  ['preferredDesign', 'Preferred design description', 'Describe the look you have in mind'],
  ['notes', 'Additional notes', 'Anything else our team should know'],
];

export const InstructionsStep = ({ instructions, onChange, getAssetUrl, uploading, onAddReferences, assets }) => (
  <div className={`${styles.card} ${styles.narrowCard}`}>
    <h1 className={styles.stepTitle}>Additional instructions</h1>
    <p className={styles.panelNote}>Optional. These notes stay with your order and are visible to our design team.</p>
    {INSTRUCTION_FIELDS.map(([key, label, placeholder]) => (
      <label className={styles.field} key={key}>
        <span className={styles.fieldLabel}>{label}</span>
        <textarea rows="3" maxLength={2000} value={instructions[key]} placeholder={placeholder} onChange={(event) => onChange((current) => ({ ...current, [key]: event.target.value }))} />
      </label>
    ))}
    <div className={styles.field}>
      <span className={styles.fieldLabel}>Reference images <em>{instructions.referenceAssetIds.length} of {MAX_REFERENCE_IMAGES}</em></span>
      {instructions.referenceAssetIds.length < MAX_REFERENCE_IMAGES && (
        <DropZone label="Upload reference images" hint="PNG, JPG, JPEG or SVG up to 5 MB each." disabled={uploading} onFiles={onAddReferences} testId="reference-dropzone" />
      )}
      {uploading && <p className={styles.panelNote} role="status">Uploading…</p>}
      <div className={styles.assetGrid}>
        {instructions.referenceAssetIds.map((id) => {
          const asset = assets.find((entry) => entry.id === id);
          return (
            <div className={styles.assetTile} key={id}>
              <span className={styles.assetStatic}>{getAssetUrl(id) ? <img src={getAssetUrl(id)} alt={asset?.originalName || 'Reference'} /> : '…'}</span>
              <button type="button" className={styles.assetDelete} aria-label={`Remove ${asset?.originalName || 'reference image'}`} onClick={() => onChange((current) => ({ ...current, referenceAssetIds: current.referenceAssetIds.filter((entry) => entry !== id) }))}>×</button>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const SummaryRow = ({ label, children }) => (
  <div className={styles.summaryRow}>
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
);

export const ReviewStep = ({ product, design, row, name, options, quantity, instructions, config, assets, getAssetUrl, working, outOfStock, onEdit, onSave, onAddToCart, onBuyNow }) => {
  const info = useMemo(() => describeCustomization({ ...design, name, options, instructions, assets }), [design, name, options, instructions, assets]);
  const missing = missingOptions(config, options);
  const unit = Number(product.price) || 0;
  const charge = config.chargePerUnit;
  const total = (unit + charge) * quantity;
  const busy = Boolean(working);
  const isSaved = row && row.status !== 'DRAFT';

  useEffect(() => { window.scrollTo?.({ top: 0 }); }, []);

  return (
    <div className={styles.twoColumn}>
      <div>
        <div className={styles.reviewStage}>
          <DesignCanvas design={design} getAssetUrl={getAssetUrl} readOnly selectedId={null} onSelect={() => {}} onChange={() => {}} />
        </div>
        <p className={styles.mockupNotice}>Visual mockup only. Not a print proof, and it does not confirm exact print placement or dimensions. Our team reviews every design before production.</p>
      </div>
      <div className={styles.card}>
        <h1 className={styles.stepTitle}>Review your customization</h1>
        <dl className={styles.summaryList}>
          <SummaryRow label="Design">{name}</SummaryRow>
          <SummaryRow label="Product">{product.name}</SummaryRow>
          {info.options.length > 0 && <SummaryRow label="Options">{info.options.map((option) => `${option.label}: ${option.value}`).join(', ')}</SummaryRow>}
          {missing.length > 0 && <SummaryRow label="Options"><span className={styles.errorText}>Select a {missing.join(' and ')} on step 1.</span></SummaryRow>}
          <SummaryRow label="Quantity">{quantity}</SummaryRow>
          {info.logos.length > 0 && <SummaryRow label="Logos">{info.logos.map((logo) => logo.name).join(', ')}</SummaryRow>}
          {info.texts.length > 0 && (
            <SummaryRow label="Text">
              <ul>{info.texts.map((entry, index) => <li key={`${entry.label}-${index}`}><strong>{entry.label}:</strong> {entry.value}</li>)}</ul>
            </SummaryRow>
          )}
          {info.stickers.length > 0 && <SummaryRow label="Stickers">{info.stickers.join(', ')}</SummaryRow>}
          {(info.graphics.length > 0 || info.uploadedGraphics.length > 0) && <SummaryRow label="Graphics">{[...info.graphics, ...info.uploadedGraphics.map((graphic) => graphic.name)].join(', ')}</SummaryRow>}
          {info.background.length > 0 && <SummaryRow label="Design settings">{info.background.join(', ')}</SummaryRow>}
          {info.instructions.map((entry) => <SummaryRow key={entry.label} label={entry.label}>{entry.value}</SummaryRow>)}
          {info.references.length > 0 && <SummaryRow label="Reference images">{info.references.map((reference) => reference.name).join(', ')}</SummaryRow>}
          <SummaryRow label="Product price">{money(unit)} per unit</SummaryRow>
          <SummaryRow label="Customization charge">{charge > 0 ? `${money(charge)} per unit` : 'No extra charge'}</SummaryRow>
          <SummaryRow label="Updated total"><strong data-testid="review-total">{money(total)}</strong></SummaryRow>
        </dl>
        <p className={styles.panelNote}>{isSaved ? 'This version is saved to your account.' : 'Save to create your design preview. Adding to the cart saves it automatically.'}</p>
        <div className={styles.reviewActions}>
          <button type="button" className={styles.secondaryButton} disabled={busy} onClick={onEdit}>Edit Design</button>
          <button type="button" className={styles.secondaryButton} disabled={busy} onClick={onSave}>{working === 'save' ? 'Saving…' : 'Save Customization'}</button>
          <button type="button" className={styles.primaryButton} disabled={busy || outOfStock} onClick={onAddToCart}>{working === 'cart' ? 'Adding…' : 'Add to Cart'}</button>
          <button type="button" className={styles.darkButton} disabled={busy || outOfStock} onClick={onBuyNow}>{working === 'buy' ? 'Preparing…' : 'Buy Now'}</button>
        </div>
      </div>
    </div>
  );
};
