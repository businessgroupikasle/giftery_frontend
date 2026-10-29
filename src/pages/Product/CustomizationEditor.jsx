import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import axiosInstance from '@api/axiosInstance';
import { getImageUrl } from '@utils/imageUrl';
import styles from './CustomizationEditor.module.css';

const FONTS = ['Arial', 'Georgia', 'Verdana'];
const textFont = (text) => FONTS.includes(text.font) ? text.font : 'Arial';
const textSize = (text) => text.fontSize ?? text.width * 0.125;

const initialDesign = (productImage) => ({
  version: 1, productImage, imageAssetId: null,
  image: { x: 50, y: 45, width: 30, rotation: 0 },
  text: { value: '', color: '#111111', font: 'Arial', fontSize: 5, x: 50, y: 65, width: 40, rotation: 0 },
});

const validDesign = (design) => {
  const layer = (value) => value && typeof value === 'object' && ['x', 'y', 'width', 'rotation'].every((key) => Number.isFinite(value[key]));
  return design && typeof design === 'object' && !Array.isArray(design)
    && typeof design.productImage === 'string' && (design.imageAssetId == null || typeof design.imageAssetId === 'string')
    && layer(design.image) && layer(design.text) && typeof design.text.value === 'string'
    && typeof design.text.color === 'string' && (design.text.fontSize == null || Number.isFinite(design.text.fontSize));
};

const loadImage = (src, crossOrigin = false) => new Promise((resolve, reject) => {
  const image = new Image();
  if (crossOrigin) image.crossOrigin = 'anonymous';
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('The product image or artwork could not be loaded for preview.'));
  image.src = src;
});

const makePreview = async (design, artworkUrl) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 1000;
  const context = canvas.getContext('2d');
  let background;
  try { background = await loadImage(getImageUrl(design.productImage), true); }
  catch { throw new Error('The selected product image could not be exported. Choose another gallery image or contact support.'); }
  const scale = Math.max(1000 / background.width, 1000 / background.height);
  context.drawImage(background, (1000 - background.width * scale) / 2, (1000 - background.height * scale) / 2, background.width * scale, background.height * scale);
  if (design.imageAssetId) {
    if (!artworkUrl) throw new Error('Artwork is still loading. Try again.');
    const image = await loadImage(artworkUrl);
    const width = design.image.width * 10;
    const height = width * image.height / image.width;
    context.save();
    context.translate(design.image.x * 10, design.image.y * 10);
    context.rotate(design.image.rotation * Math.PI / 180);
    context.drawImage(image, -width / 2, -height / 2, width, height);
    context.restore();
  }
  if (design.text.value) {
    const text = design.text;
    const fontSize = textSize(text) * 10;
    context.save();
    context.translate(text.x * 10, text.y * 10);
    context.rotate(text.rotation * Math.PI / 180);
    context.font = `700 ${fontSize}px ${textFont(text)}`;
    context.fillStyle = text.color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const lines = [];
    let line = '';
    for (const word of text.value.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (line && context.measureText(next).width > text.width * 10) { lines.push(line); line = word; }
      else line = next;
    }
    if (line) lines.push(line);
    lines.forEach((value, index) => context.fillText(value, 0, (index - (lines.length - 1) / 2) * fontSize * 1.1, text.width * 10));
    context.restore();
  }
  return new Promise((resolve, reject) => {
    try { canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not create the preview image.')), 'image/png'); }
    catch { reject(new Error('The selected product image does not permit preview export. Choose another gallery image or contact support.')); }
  });
};

export default function CustomizationEditor({ productId, productImage, onImageChange, isAuthenticated, requireAuth, onChange, editorKey, onAddToCart, adding, outOfStock }) {
  const [design, setDesign] = useState(() => initialDesign(productImage));
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [operationError, setOperationError] = useState(false);
  const [artworkError, setArtworkError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [message, setMessage] = useState('');
  const [artwork, setArtwork] = useState(null);
  const [selected, setSelected] = useState('text');
  const [preview, setPreview] = useState(false);
  const stage = useRef(null);
  const drag = useRef(null);
  const revision = useRef(0);
  const edited = useRef(false);
  const galleryEdited = useRef(false);
  const currentImage = useRef(productImage);
  currentImage.current = productImage;
  const mounted = useRef(true);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated) return undefined;
    setBusy(true);
    setLoadError(false);
    axiosInstance.get(`/customizations/drafts/${encodeURIComponent(productId)}`)
      .then((response) => {
        const draft = response.data;
        if (cancelled || draft == null) return;
        if (!validDesign(draft.design)) throw new Error('Saved draft is invalid.');
        if (edited.current) throw new Error('Unsaved changes prevent restoring the saved draft.');
        const imageChanged = galleryEdited.current;
        if (imageChanged) {
          setDesign({ ...draft.design, productImage: currentImage.current });
          setSaved(false);
          setMessage('Saved draft restored with your selected image. Unsaved changes.');
        } else {
          setDesign(draft.design);
          setSaved(true);
          onImageChange(draft.design.productImage);
          setMessage('Saved draft restored.');
        }
      })
      .catch((error) => { if (!cancelled) { setLoadError(true); setMessage(`Could not load draft: ${error.message}`); } })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [productId, isAuthenticated, loadAttempt]);

  useEffect(() => {
    if (design.productImage !== productImage) {
      revision.current += 1;
      galleryEdited.current = true;
      setDesign((current) => ({ ...current, productImage }));
      setSaved(false);
    }
  }, [productImage]);

  useEffect(() => {
    let cancelled = false;
    let url;
    setArtwork(null);
    setArtworkError(false);
    if (design.imageAssetId && isAuthenticated) {
      axiosInstance.get(`/customizations/assets/${encodeURIComponent(design.imageAssetId)}`, { responseType: 'blob' })
        .then((blob) => {
          if (!cancelled) { url = URL.createObjectURL(blob); setArtwork({ id: design.imageAssetId, url }); }
        })
        .catch((error) => { if (!cancelled) { setArtworkError(true); setMessage(`Could not load artwork: ${error.message}`); } });
    }
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [design.imageAssetId, isAuthenticated]);

  const artworkUrl = artwork?.id === design.imageAssetId ? artwork.url : '';
  const blocked = busy || loadError || operationError || artworkError || Boolean(design.imageAssetId && !artworkUrl);
  useLayoutEffect(() => {
    onChange({ editorKey, design, saved, blocked, hasCustomization: Boolean(design.imageAssetId || design.text.value.trim()) });
  }, [design, saved, blocked, editorKey, onChange]);

  const update = (patch) => {
    revision.current += 1;
    edited.current = true;
    setDesign((current) => ({ ...current, ...patch }));
    setSaved(false);
    setMessage('Unsaved changes');
  };
  const updateLayer = (layer, patch) => update({ [layer]: { ...design[layer], ...(layer === 'text' ? { fontSize: textSize(design.text) } : {}), ...patch } });

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !requireAuth()) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setOperationError(true);
      setMessage('Choose a PNG, JPEG or WebP image up to 5 MB.');
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const response = await axiosInstance.post('/customizations/assets', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      update({ imageAssetId: response.data.id });
      setOperationError(false);
      setSelected('image');
    } catch (error) {
      setOperationError(true); setMessage(`Artwork upload failed: ${error.message}`);
    } finally { setBusy(false); }
  };

  const save = async () => {
    if (!requireAuth() || loadError || artworkError) return;
    const savingRevision = revision.current;
    setBusy(true);
    try {
      let savedDesign = design;
      if (design.imageAssetId || design.text.value.trim()) {
        const blob = await makePreview(design, artworkUrl);
        if (!mounted.current) return;
        const form = new FormData();
        form.append('image', blob, 'preview.png');
        const response = await axiosInstance.post('/customizations/assets', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (!mounted.current) return;
        savedDesign = { ...design, previewAssetId: response.data.id };
      }
      await axiosInstance.put(`/customizations/drafts/${encodeURIComponent(productId)}`, { design: savedDesign });
      if (revision.current === savingRevision) { setDesign(savedDesign); setSaved(true); edited.current = false; galleryEdited.current = false; setOperationError(false); setMessage('Draft saved.'); }
      else setMessage('Draft saved, but newer changes are unsaved.');
    } catch (error) { setOperationError(true); setMessage(`Draft not saved: ${error.message}`); }
    finally { setBusy(false); }
  };

  const startDrag = (event, layer) => {
    if (preview || busy || loadError) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelected(layer);
    drag.current = { layer, x: event.clientX, y: event.clientY, origin: design[layer] };
  };
  const moveDrag = (event) => {
    if (!drag.current || !stage.current) return;
    const { layer, x, y, origin } = drag.current;
    const rect = stage.current.getBoundingClientRect();
    updateLayer(layer, { x: Math.max(0, Math.min(100, origin.x + (event.clientX - x) / rect.width * 100)), y: Math.max(0, Math.min(100, origin.y + (event.clientY - y) / rect.height * 100)) });
  };
  const layerStyle = (layer) => ({ left: `${layer.x}%`, top: `${layer.y}%`, width: `${layer.width}%`, transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)` });
  const layer = design[selected];

  return (
    <section className={styles.editor} aria-labelledby="customization-title">
      <div className={styles.heading}><div><span className={styles.eyebrow}>MAKE IT YOURS</span><h2 id="customization-title">Customize your gift </h2><p>Place your artwork and text on the selected product image.</p></div><span className={styles.mockup}>Illustrative mockup, not a production proof</span></div>
      <div className={styles.layout}>
        <div className={styles.stage} ref={stage}>
          <img className={styles.background} src={getImageUrl(productImage)} alt="Selected product mockup" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/product-placeholder.svg'; }} />
          {artworkUrl && <div className={`${styles.layer} ${!preview && selected === 'image' ? styles.selected : ''}`} style={layerStyle(design.image)} onPointerDown={(event) => startDrag(event, 'image')} onPointerMove={moveDrag} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}><img src={artworkUrl} alt="Your artwork" draggable="false" /></div>}
          {design.text.value && <div className={`${styles.layer} ${styles.textLayer} ${!preview && selected === 'text' ? styles.selected : ''}`} style={{ ...layerStyle(design.text), color: design.text.color, fontFamily: textFont(design.text), fontSize: `${textSize(design.text)}cqw` }} onPointerDown={(event) => startDrag(event, 'text')} onPointerMove={moveDrag} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>{design.text.value}</div>}
        </div>
        <div className={styles.controls}>
          <label className={styles.upload}>Upload artwork <input type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} disabled={busy || loadError} /><small>PNG, JPEG or WebP, maximum 5 MB. Stored privately.</small></label>
          {design.imageAssetId && <button type="button" className={styles.link} disabled={busy || loadError} onClick={() => { update({ imageAssetId: null }); setOperationError(false); setSelected('text'); }}>Remove artwork</button>}
          <fieldset disabled={busy || loadError} className={styles.fields}>
          <label>Personalized text <input type="text" maxLength={100} value={design.text.value} onChange={(event) => updateLayer('text', { value: event.target.value })} placeholder="Add a name or message" /></label>
          <label>Text color <input type="color" value={design.text.color} onChange={(event) => updateLayer('text', { color: event.target.value })} /></label>
          <label>Font <select value={textFont(design.text)} onChange={(event) => updateLayer('text', { font: event.target.value })}>{FONTS.map((font) => <option key={font} value={font}>{font}</option>)}</select></label>
          <label>Text size: {textSize(design.text)}%<input type="range" min="0.625" max="20" step="0.125" value={textSize(design.text)} onChange={(event) => updateLayer('text', { fontSize: Number(event.target.value) })} /></label>
          <div className={styles.layerButtons} aria-label="Select layer"><button type="button" aria-pressed={selected === 'text'} onClick={() => setSelected('text')}>Text</button><button type="button" aria-pressed={selected === 'image'} disabled={!design.imageAssetId} onClick={() => setSelected('image')}>Artwork</button></div>
          <p className={styles.hint}>Drag a layer on the mockup or use the controls below.</p>
          {[['x', 'Horizontal position', 0, 100], ['y', 'Vertical position', 0, 100], ['width', selected === 'text' ? 'Text box width' : 'Artwork size', 5, 100], ['rotation', 'Rotation', -180, 180]].map(([key, label, min, max]) => <label key={key}>{label}: {layer[key]}{key === 'rotation' ? '°' : '%'}<input type="range" min={min} max={max} value={layer[key]} onChange={(event) => updateLayer(selected, { [key]: Number(event.target.value) })} /></label>)}
          </fieldset>
          <div className={styles.actions}><button type="button" onClick={() => setPreview(!preview)} disabled={busy || loadError}>{preview ? 'Edit design' : 'Preview design'}</button><button type="button" onClick={save} disabled={busy || loadError || artworkError || Boolean(design.imageAssetId && !artworkUrl)}>{busy ? 'Working...' : 'Save draft'}</button></div>
          <div className={styles.actions}><button type="button" onClick={onAddToCart} disabled={blocked || !saved || !(design.imageAssetId || design.text.value.trim()) || adding || outOfStock}>{adding ? 'Adding...' : 'Add saved design to cart'}</button></div>
          {loadError && <button type="button" className={styles.link} onClick={() => { setBusy(true); setLoadAttempt((value) => value + 1); }}>Retry loading draft</button>}
          {operationError && !loadError && <button type="button" className={`${styles.link} ${styles.discard}`} disabled={busy} onClick={() => { update(initialDesign(productImage)); setOperationError(false); setSelected('text'); setMessage('Customization discarded.'); }}>Discard customization</button>}
          <p className={saved ? `${styles.status} ${styles.statusSaved}` : (operationError || loadError || artworkError) ? `${styles.status} ${styles.statusError}` : styles.status} role="status">{message || (saved ? 'Draft saved.' : 'Sign in to save your draft.')}</p>
        </div>
      </div>
    </section>
  );
}
