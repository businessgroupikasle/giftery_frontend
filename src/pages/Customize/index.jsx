import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiCornerUpLeft, FiCornerUpRight, FiEye, FiEyeOff, FiImage, FiLayers, FiMaximize, FiMinus, FiMonitor, FiPlus, FiRotateCcw, FiSmartphone, FiType, FiUpload, FiLayout, FiStar, FiHexagon } from 'react-icons/fi';
import Spinner from '@components/ui/Spinner';
import axiosInstance from '@api/axiosInstance';
import { ENDPOINTS } from '@api/endpoints';
import { ROUTES } from '@constants/routes';
import env from '@config/env';
import { addToCart } from '@store/slices/cartSlice';
import { customizationService } from '@services/customizationService';
import { getImageUrl } from '@utils/imageUrl';
import { getToken } from '@utils/storage';
import {
  ACCEPTED_IMAGE_TYPES, MAX_FILE_BYTES, MAX_REFERENCE_IMAGES,
  addElement, applyTemplate, createEmptyDesign, createImageElement, createShapeElement, createStickerElement, createTextElement,
  defaultBackground, designHasContent, duplicateElement, emptyInstructions, historyReducer, initialHistory, loadDesign, missingOptions,
  moveLayer, parseGallery, removeElement, replaceElementAsset, resolveCustomizationConfig, studioSteps, updateElement,
} from './designModel';
import DesignCanvas from './DesignCanvas';
import PropertiesPanel from './PropertiesPanel';
import { BackgroundDesignPanel, GraphicsPanel, LayersPanel, StickersPanel, TemplatesPanel, TextPanel, UploadsPanel } from './StudioPanels';
import { InstructionsStep, ProductStep, ReviewStep } from './StudioSteps';
import { renderDesignPreview } from './renderPreview';
import useAssetUrls from './useAssetUrls';
import styles from './Customize.module.css';

const AUTOSAVE_DELAY_MS = 1200;
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
const EXTRA_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Dancing+Script:wght@400;700&display=swap';

const TABS = [
  { id: 'uploads', label: 'Uploads', icon: FiUpload, tool: 'uploads' },
  { id: 'text', label: 'Text', icon: FiType, tool: 'text' },
  { id: 'stickers', label: 'Stickers', icon: FiStar, tool: 'stickers' },
  { id: 'graphics', label: 'Graphics', icon: FiHexagon, tool: 'graphics' },
  { id: 'templates', label: 'Templates', icon: FiLayout, tool: 'templates' },
  { id: 'background', label: 'Background', icon: FiImage, tool: 'background' },
  { id: 'layers', label: 'Layers', icon: FiLayers, tool: null },
];

const firstAvailableTab = (stepId, tools) => ({
  logo: 'uploads',
  text: 'text',
  stickers: tools.stickers ? 'stickers' : 'graphics',
  background: tools.background ? 'background' : 'templates',
  preview: 'layers',
}[stepId] || null);

const SAVE_LABELS = {
  idle: 'Not saved yet',
  dirty: 'Unsaved changes',
  saving: 'Saving…',
  saved: 'Draft saved to your account',
  error: 'Could not save. Retrying on your next change.',
  conflict: 'Edited elsewhere. Reload to continue.',
};

const validateFile = (file) => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type) && !/\.(png|jpe?g|svg)$/i.test(file.name)) return `${file.name}: choose a PNG, JPG, JPEG or SVG file.`;
  if (file.size > MAX_FILE_BYTES) return `${file.name}: the file must be 5 MB or smaller.`;
  return null;
};

function Studio({ slug }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const designIdParam = searchParams.get('design');
  const { ensure: ensureAsset, getUrl: getAssetUrl } = useAssetUrls();

  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [product, setProduct] = useState(null);
  const [row, setRow] = useState(null);
  const [history, dispatchHistory] = useReducer(historyReducer, initialHistory(createEmptyDesign()));
  const design = history.present;
  const [name, setName] = useState('My design');
  const [quantity, setQuantity] = useState(1);
  const [options, setOptions] = useState({});
  const [instructions, setInstructions] = useState(emptyInstructions);
  const [assets, setAssets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [showGuides, setShowGuides] = useState(true);
  const [devicePreview, setDevicePreview] = useState('desktop');
  const [saveState, setSaveState] = useState('idle');
  const [uploading, setUploading] = useState(false);
  const [working, setWorking] = useState(null);

  const config = useMemo(() => resolveCustomizationConfig(product), [product]);
  const gallery = useMemo(() => parseGallery(product?.images), [product]);
  const steps = useMemo(() => studioSteps(config.tools), [config]);
  const stepId = steps.some((step) => step.id === searchParams.get('step')) ? searchParams.get('step') : 'product';
  const stepIndex = steps.findIndex((step) => step.id === stepId);
  const tabs = useMemo(() => TABS.filter((tab) => !tab.tool || config.tools[tab.tool]), [config]);
  const currentTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : firstAvailableTab(stepId, config.tools) || 'layers';
  const selected = design.elements.find((element) => element.id === selectedId) || null;
  const isEditorStep = ['logo', 'text', 'stickers', 'background', 'preview'].includes(stepId);
  const maxStock = Number.isFinite(Number(product?.stock)) ? Number(product.stock) : 0;

  const setStep = useCallback((id) => {
    setSearchParams((current) => { const next = new URLSearchParams(current); next.set('step', id); return next; }, { replace: true });
    setActiveTab(null);
    window.scrollTo?.({ top: 0 });
  }, [setSearchParams]);

  // ── Load the product and any saved design ──
  const loaded = useRef(false);
  useEffect(() => {
    let cancelled = false;
    loaded.current = false;
    setStatus('loading');
    (async () => {
      const response = await axiosInstance.get(`${ENDPOINTS.PRODUCTS.LIST}/${slug}`);
      const data = response.product || response.data?.product || response.data?.data || response.data;
      if (!data?.id) throw Object.assign(new Error('This product could not be found.'), { status: 404 });
      const images = parseGallery(data.images);
      const productConfig = resolveCustomizationConfig(data);
      if (!productConfig.enabled) throw new Error('This product cannot be customized.');
      let saved = null;
      if (designIdParam) {
        saved = await customizationService.getDesign(designIdParam);
        if (saved.productId !== data.id) throw new Error('This design belongs to a different product.');
      }
      const library = await customizationService.listAssets().catch(() => []);
      if (cancelled) return;
      setProduct(data);
      setAssets(library);
      if (saved) {
        const opened = loadDesign(saved.design, images);
        dispatchHistory({ type: 'load', design: opened });
        setRow(saved);
        rowRef.current = saved;
        setName(saved.name);
        setQuantity(saved.quantity || 1);
        setOptions(saved.options || {});
        setInstructions({ ...emptyInstructions(), ...saved.instructions });
        setSaveState('saved');
      } else {
        dispatchHistory({ type: 'load', design: createEmptyDesign(images[0]) });
        setQuantity(Math.max(1, data.minOrder || 1));
      }
      setStatus('ready');
    })().catch((error) => {
      if (cancelled) return;
      setLoadError(error.status === 404 ? 'This product or design could not be found in your account.' : error.message || 'The studio could not be loaded.');
      setStatus('error');
    });
    return () => { cancelled = true; };
    // A design created during this session updates the URL without needing a reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Extra display fonts are only needed inside the studio.
  useEffect(() => {
    if (document.querySelector(`link[href="${EXTRA_FONTS_URL}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = EXTRA_FONTS_URL;
    document.head.appendChild(link);
  }, []);

  // Fetch every private image the design and library use.
  useEffect(() => {
    if (status !== 'ready') return;
    const ids = new Set(assets.map((asset) => asset.id));
    design.elements.forEach((element) => { if (element.assetId) ids.add(element.assetId); });
    if (design.background.imageAssetId) ids.add(design.background.imageAssetId);
    instructions.referenceAssetIds.forEach((id) => ids.add(id));
    ids.forEach((id) => { ensureAsset(id).catch(() => {}); });
  }, [status, assets, design, instructions.referenceAssetIds, ensureAsset]);

  // ── Autosave: drafts go to the customer's account, so they survive refreshes and new sessions ──
  const rowRef = useRef(null);
  const dirty = useRef(false);
  const inFlight = useRef(null);
  const conflicted = useRef(false);
  const latest = useRef(null);
  const productIdRef = useRef(null);
  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;
  latest.current = { name: name.trim() || 'My design', quantity, options, instructions, design };
  productIdRef.current = product?.id;

  const persist = useCallback(async () => {
    while (inFlight.current) {
      await inFlight.current.catch(() => {});
    }
    if (!dirty.current) return rowRef.current;
    if (conflicted.current) throw new Error(SAVE_LABELS.conflict);
    dirty.current = false;
    setSaveState('saving');
    const payload = latest.current;
    const request = rowRef.current
      ? customizationService.updateDesign(rowRef.current.id, { expectedRevision: rowRef.current.revision, ...payload })
      : customizationService.createDesign({ productId: productIdRef.current, ...payload });
    inFlight.current = request;
    try {
      const saved = await request;
      const isNew = !rowRef.current;
      rowRef.current = saved;
      setRow(saved);
      if (isNew) setSearchParamsRef.current((current) => { const next = new URLSearchParams(current); next.set('design', saved.id); return next; }, { replace: true });
    } catch (error) {
      dirty.current = true;
      if (error.status === 409) conflicted.current = true;
      setSaveState(error.status === 409 ? 'conflict' : 'error');
      throw error;
    } finally {
      inFlight.current = null;
    }
    if (dirty.current) return persist();
    setSaveState('saved');
    return rowRef.current;
  }, []);

  useEffect(() => {
    if (status !== 'ready') return undefined;
    if (!loaded.current) { loaded.current = true; return undefined; }
    dirty.current = true;
    setSaveState((current) => (current === 'conflict' ? current : 'dirty'));
    const timer = setTimeout(() => {
      persist().catch((error) => toast.error(error.message || SAVE_LABELS.error, { toastId: 'studio-autosave' }));
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status, design, name, quantity, options, instructions, persist]);

  // Leaving the studio inside the app, or closing the tab, still saves pending work.
  useEffect(() => {
    const flushWithKeepalive = () => {
      if (!dirty.current || conflicted.current || !productIdRef.current || inFlight.current) return;
      const existing = rowRef.current;
      const path = existing ? ENDPOINTS.CUSTOMIZATIONS.DESIGN(existing.id) : ENDPOINTS.CUSTOMIZATIONS.DESIGNS;
      const body = JSON.stringify(existing ? { expectedRevision: existing.revision, ...latest.current } : { productId: productIdRef.current, ...latest.current });
      if (body.length > 60000) return;
      fetch(`${env.API_BASE_URL}/api/v1${path}`, {
        method: existing ? 'PUT' : 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body,
      }).catch(() => {});
      dirty.current = false;
    };
    const warnIfUnsafe = (event) => {
      if (dirty.current && JSON.stringify(latest.current).length > 60000) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('pagehide', flushWithKeepalive);
    window.addEventListener('beforeunload', warnIfUnsafe);
    return () => {
      window.removeEventListener('pagehide', flushWithKeepalive);
      window.removeEventListener('beforeunload', warnIfUnsafe);
      if (dirty.current) persist().catch(() => {});
    };
  }, [persist]);

  // ── Design changes ──
  const change = useCallback((update, groupKey) => dispatchHistory({ type: 'change', update, groupKey }), []);
  const endGroup = useCallback(() => dispatchHistory({ type: 'endGroup' }), []);
  const changeElement = useCallback((id, patch, groupKey) => change((current) => updateElement(current, id, patch), groupKey), [change]);

  const place = useCallback((element) => {
    if (design.elements.length >= 60) { toast.error('A design can hold at most 60 elements.'); return; }
    change((current) => addElement(current, element));
    setSelectedId(element.id);
  }, [change, design.elements.length]);

  const removeSelected = useCallback((id) => {
    change((current) => removeElement(current, id));
    setSelectedId((current) => (current === id ? null : current));
  }, [change]);

  const resetDesign = () => {
    change((current) => ({ ...current, elements: [], background: defaultBackground() }));
    setSelectedId(null);
    toast.info('Design reset. Use Undo to bring it back.');
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target.isContentEditable) return;
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        dispatchHistory({ type: event.shiftKey ? 'redo' : 'undo' });
      } else if (modifier && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        dispatchHistory({ type: 'redo' });
      } else if (selectedId && (event.key === 'Delete' || event.key === 'Backspace')) {
        event.preventDefault();
        removeSelected(selectedId);
      } else if (selectedId && event.key.startsWith('Arrow')) {
        event.preventDefault();
        const step = event.shiftKey ? 5 : 1;
        const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
        change((current) => {
          const element = current.elements.find((entry) => entry.id === selectedId);
          return element ? updateElement(current, selectedId, { x: element.x + delta[0], y: element.y + delta[1] }) : current;
        }, `nudge-${selectedId}`);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId, change, removeSelected]);

  // ── Uploads ──
  const uploadOne = useCallback(async (file, kind) => {
    const problem = validateFile(file);
    if (problem) throw new Error(problem);
    const asset = await customizationService.uploadAsset(file, kind);
    await ensureAsset(asset.id).catch(() => {});
    return asset;
  }, [ensureAsset]);

  const uploadMany = async (files, kind) => {
    setUploading(true);
    const results = await Promise.allSettled(files.map((file) => uploadOne(file, kind)));
    setUploading(false);
    results.forEach((result, index) => {
      if (result.status === 'rejected') toast.error(result.reason?.message || `${files[index].name} could not be uploaded.`);
    });
    const uploaded = results.filter((result) => result.status === 'fulfilled').map((result) => result.value);
    setAssets((current) => [...uploaded, ...current]);
    return uploaded;
  };

  const uploadAndPlace = async (files, kind) => {
    const uploaded = await uploadMany(files, kind);
    uploaded.forEach((asset, index) => {
      const element = createImageElement(kind === 'LOGO' ? 'logo' : 'graphic', asset);
      place({ ...element, x: 50 + index * 4, y: 50 + index * 4 });
    });
  };

  const replaceSelected = async (file) => {
    const kind = selected?.type === 'logo' ? 'LOGO' : 'GRAPHIC';
    const [asset] = await uploadMany([file], kind);
    if (asset) change((current) => replaceElementAsset(current, selectedId, asset));
  };

  const deleteAsset = async (asset) => {
    if (design.elements.some((element) => element.assetId === asset.id) || design.background.imageAssetId === asset.id) {
      toast.error('Remove this image from your design before deleting it.');
      return;
    }
    try {
      await customizationService.deleteAsset(asset.id);
      setAssets((current) => current.filter((entry) => entry.id !== asset.id));
    } catch (error) {
      toast.error(error.message || 'This image could not be deleted.');
    }
  };

  const addReferences = async (files) => {
    const room = MAX_REFERENCE_IMAGES - instructions.referenceAssetIds.length;
    if (files.length > room) toast.info(`You can attach up to ${MAX_REFERENCE_IMAGES} reference images.`);
    const uploaded = await uploadMany(files.slice(0, Math.max(0, room)), 'REFERENCE');
    if (uploaded.length) setInstructions((current) => ({ ...current, referenceAssetIds: [...current.referenceAssetIds, ...uploaded.map((asset) => asset.id)] }));
  };

  // ── Saving with a preview, and purchasing ──
  const finalize = useCallback(async () => {
    const missing = missingOptions(config, options);
    if (missing.length) {
      setStep('product');
      throw new Error(`Please select a ${missing[0]} first.`);
    }
    if (!designHasContent(design, instructions)) throw new Error('Add a logo, text, sticker or instructions before saving.');
    const saved = await persist();
    if (saved.status !== 'DRAFT' && saved.previewAssetId && !dirty.current) return saved;
    const assetIds = [...design.elements.map((element) => element.assetId), design.background.imageAssetId].filter(Boolean);
    await Promise.all(assetIds.map((id) => ensureAsset(id)));
    const urls = new Map(await Promise.all(assetIds.map(async (id) => [id, await ensureAsset(id)])));
    const { blob, includesProductImage } = await renderDesignPreview(design, (id) => urls.get(id) || null);
    const finalized = await customizationService.finalizeDesign(saved.id, { blob, includesProductImage, revision: saved.revision });
    rowRef.current = finalized;
    setRow(finalized);
    setSaveState('saved');
    return finalized;
  }, [config, options, design, instructions, persist, ensureAsset, setStep]);

  const withWork = (label, action) => async () => {
    setWorking(label);
    try {
      await action();
    } catch (error) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setWorking(null);
    }
  };

  const checkStock = () => {
    if (maxStock <= 0) throw new Error('This product is currently out of stock.');
    if (quantity > maxStock) throw new Error(`Only ${maxStock} units are available.`);
  };

  const unitPrice = (Number(product?.price) || 0) + config.chargePerUnit;

  const handleSave = withWork('save', async () => {
    await finalize();
    toast.success('Customization saved to your account.');
  });

  const handleAddToCart = withWork('cart', async () => {
    checkStock();
    const saved = await finalize();
    await dispatch(addToCart({ id: product.id, productId: product.id, quantity, customizationId: saved.id })).unwrap()
      .catch((error) => { throw new Error(typeof error === 'string' ? error : error?.message || 'Could not add this design to the cart.'); });
    toast.success('Customized product added to your cart.');
    navigate(ROUTES.CART);
  });

  const handleBuyNow = withWork('buy', async () => {
    checkStock();
    const saved = await finalize();
    navigate(ROUTES.CHECKOUT, { state: { buyNowItem: {
      id: saved.id,
      productId: product.id,
      customizationId: saved.id,
      name: product.name,
      price: unitPrice,
      customizationCharge: config.chargePerUnit,
      comparePrice: null,
      image: gallery[0] || null,
      slug: product.slug,
      sku: product.sku || '',
      quantity,
      maxStock,
      isCustomized: true,
      customization: { ...saved.design, customizationId: saved.id, name: saved.name, options: saved.options, instructions: saved.instructions, previewAssetId: saved.previewAssetId, previewInfo: saved.previewInfo },
    } } });
  });

  if (status === 'loading') {
    return <div className={styles.centerScreen}><Spinner size="lg" /><p>Opening the customization studio…</p></div>;
  }
  if (status === 'error') {
    return (
      <div className={styles.centerScreen}>
        <h1>We could not open this design</h1>
        <p role="alert">{loadError}</p>
        <Link className={styles.primaryButton} to={ROUTES.PRODUCT_PATH(slug)}>Back to product</Link>
      </div>
    );
  }

  const logoLibrary = assets.filter((asset) => asset.kind === 'LOGO');
  const graphicLibrary = assets.filter((asset) => asset.kind === 'GRAPHIC');
  const panelForTab = {
    uploads: <UploadsPanel assets={logoLibrary} getAssetUrl={getAssetUrl} uploading={uploading} onUpload={uploadAndPlace} onUse={(asset) => place(createImageElement('logo', asset))} onDelete={deleteAsset} />,
    text: <TextPanel onAdd={(role) => place(createTextElement(role))} textElements={design.elements.filter((element) => element.type === 'text')} selectedId={selectedId} onSelect={setSelectedId} />,
    stickers: <StickersPanel onAdd={(id) => place(createStickerElement(id))} />,
    graphics: <GraphicsPanel onAddShape={(id) => place(createShapeElement(id))} assets={graphicLibrary} getAssetUrl={getAssetUrl} uploading={uploading} onUpload={uploadAndPlace} onUse={(asset) => place(createImageElement('graphic', asset))} onDelete={deleteAsset} />,
    templates: <TemplatesPanel onApply={(template) => { change((current) => applyTemplate(current, template, config.tools)); setSelectedId(null); }} />,
    background: (
      <BackgroundDesignPanel
        background={design.background}
        onChange={(patch) => change((current) => ({ ...current, background: { ...current.background, ...patch } }), `background-${Object.keys(patch).join()}`)}
        getAssetUrl={getAssetUrl}
        uploading={uploading}
        onUploadImage={async (file) => {
          const [asset] = await uploadMany([file], 'BACKGROUND');
          if (asset) change((current) => ({ ...current, background: { ...current.background, imageAssetId: asset.id } }));
        }}
        onReset={resetDesign}
      />
    ),
    layers: (
      <LayersPanel
        elements={design.elements}
        assets={assets}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onMove={(id, direction) => change((current) => moveLayer(current, id, direction))}
        onToggle={(id) => change((current) => ({ ...current, elements: current.elements.map((element) => (element.id === id ? { ...element, hidden: !element.hidden } : element)) }))}
        onDelete={removeSelected}
      />
    ),
  };

  const zoomBy = (direction) => setZoom((current) => {
    const index = ZOOM_LEVELS.findIndex((level) => level >= current);
    return ZOOM_LEVELS[Math.min(ZOOM_LEVELS.length - 1, Math.max(0, index + direction))];
  });

  return (
    <div className={styles.studio}>
      <header className={styles.topBar}>
        <Link to={ROUTES.PRODUCT_PATH(product.slug)} className={styles.backLink}><FiArrowLeft aria-hidden="true" /> <span>Back to product</span></Link>
        <input className={styles.nameInput} value={name} maxLength={80} aria-label="Design name" onChange={(event) => setName(event.target.value)} />
        <span className={`${styles.saveBadge} ${styles[`save_${saveState}`] || ''}`} role="status" data-testid="save-status">{SAVE_LABELS[saveState]}</span>
        {saveState === 'conflict' && <button type="button" className={styles.linkButton} onClick={() => window.location.reload()}>Reload</button>}
      </header>

      <nav className={styles.stepper} aria-label="Customization steps">
        <ol>
          {steps.map((step, index) => (
            <li key={step.id}>
              <button
                type="button"
                className={`${styles.stepButton} ${step.id === stepId ? styles.stepActive : ''} ${index < stepIndex ? styles.stepDone : ''}`}
                aria-current={step.id === stepId ? 'step' : undefined}
                onClick={() => setStep(step.id)}
              >
                <span className={styles.stepNumber}>{index + 1}</span>
                <span className={styles.stepLabel}>{step.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <main className={styles.stepContent}>
        {stepId === 'product' && (
          <ProductStep product={product} gallery={gallery} design={design} config={config} options={options} quantity={quantity} maxStock={maxStock}
            onOptions={setOptions} onQuantity={setQuantity} onImage={(image) => change((current) => ({ ...current, productImage: image }))} />
        )}

        {isEditorStep && (
          <div className={styles.editorGrid}>
            <aside className={styles.leftSidebar} aria-label="Design tools">
              <div className={styles.tabList} role="tablist">
                {tabs.map((tab) => (
                  <button type="button" key={tab.id} role="tab" aria-selected={currentTab === tab.id} className={`${styles.tabButton} ${currentTab === tab.id ? styles.tabActive : ''}`} onClick={() => setActiveTab(tab.id)}>
                    <tab.icon aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
              <div className={styles.tabPanel} role="tabpanel">{panelForTab[currentTab]}</div>
            </aside>

            <section className={styles.canvasColumn} aria-label="Product preview">
              <div className={styles.canvasToolbar}>
                <div className={styles.toolGroup}>
                  <button type="button" aria-label="Undo" title="Undo (Ctrl+Z)" disabled={!history.past.length} onClick={() => dispatchHistory({ type: 'undo' })}><FiCornerUpLeft aria-hidden="true" /></button>
                  <button type="button" aria-label="Redo" title="Redo (Ctrl+Y)" disabled={!history.future.length} onClick={() => dispatchHistory({ type: 'redo' })}><FiCornerUpRight aria-hidden="true" /></button>
                  <button type="button" aria-label="Reset design" title="Reset design" onClick={resetDesign}><FiRotateCcw aria-hidden="true" /></button>
                </div>
                <div className={styles.toolGroup}>
                  <button type="button" aria-label="Zoom out" disabled={zoom <= ZOOM_LEVELS[0]} onClick={() => zoomBy(-1)}><FiMinus aria-hidden="true" /></button>
                  <button type="button" className={styles.zoomValue} aria-label="Reset zoom" title="Reset zoom" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
                  <button type="button" aria-label="Zoom in" disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]} onClick={() => zoomBy(1)}><FiPlus aria-hidden="true" /></button>
                  <button type="button" aria-label="Fit to view" title="Fit to view" onClick={() => setZoom(1)}><FiMaximize aria-hidden="true" /></button>
                </div>
                <div className={styles.toolGroup}>
                  <button type="button" aria-label={showGuides ? 'Hide design guide' : 'Show design guide'} aria-pressed={!showGuides} title="Toggle design guide" onClick={() => setShowGuides((value) => !value)}>{showGuides ? <FiEye aria-hidden="true" /> : <FiEyeOff aria-hidden="true" />}</button>
                  <button type="button" aria-label="Desktop preview" aria-pressed={devicePreview === 'desktop'} className={devicePreview === 'desktop' ? styles.toggleActive : ''} onClick={() => setDevicePreview('desktop')}><FiMonitor aria-hidden="true" /></button>
                  <button type="button" aria-label="Mobile preview" aria-pressed={devicePreview === 'mobile'} className={devicePreview === 'mobile' ? styles.toggleActive : ''} onClick={() => setDevicePreview('mobile')}><FiSmartphone aria-hidden="true" /></button>
                </div>
              </div>

              <div className={styles.canvasScroller}>
                <div className={`${styles.stageSizer} ${devicePreview === 'mobile' ? styles.stageMobile : ''}`} style={{ '--studio-zoom': zoom }}>
                  <DesignCanvas
                    design={design}
                    getAssetUrl={getAssetUrl}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onChange={changeElement}
                    onGestureEnd={endGroup}
                    showGuides={showGuides}
                  />
                </div>
              </div>

              <p className={styles.mockupNotice}>Visual mockup only. Placement and proportions are illustrative, not a print proof or a guarantee of the printable area. Our team reviews every design before production.</p>

              {gallery.length > 1 && (
                <div className={styles.galleryStrip} role="group" aria-label="Product gallery images">
                  {gallery.map((image, index) => (
                    <button type="button" key={image} className={design.productImage === image ? styles.galleryActive : ''} aria-label={`Show gallery image ${index + 1}`} aria-pressed={design.productImage === image} onClick={() => change((current) => ({ ...current, productImage: image }))}>
                      <img src={getImageUrl(image)} alt="" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/product-placeholder.svg'; }} />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <aside className={styles.rightSidebar} aria-label="Element properties">
              <PropertiesPanel
                element={selected}
                uploading={uploading}
                onChange={(patch, groupKey) => changeElement(selected.id, patch, groupKey)}
                onDelete={() => removeSelected(selected.id)}
                onDuplicate={() => change((current) => duplicateElement(current, selected.id))}
                onMoveLayer={(direction) => change((current) => moveLayer(current, selected.id, direction))}
                onReplace={replaceSelected}
              />
            </aside>
          </div>
        )}

        {stepId === 'instructions' && (
          <InstructionsStep instructions={instructions} onChange={setInstructions} getAssetUrl={getAssetUrl} uploading={uploading} onAddReferences={addReferences} assets={assets} />
        )}

        {stepId === 'review' && (
          <ReviewStep
            product={product} design={design} row={row} name={name} options={options} quantity={quantity} instructions={instructions} config={config} assets={assets}
            getAssetUrl={getAssetUrl} working={working} outOfStock={maxStock <= 0}
            onEdit={() => setStep(steps.find((step) => step.id === 'preview')?.id || 'product')}
            onSave={handleSave} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow}
          />
        )}
      </main>

      <footer className={styles.stepFooter}>
        <button type="button" className={styles.secondaryButton} disabled={stepIndex === 0} onClick={() => setStep(steps[stepIndex - 1].id)}>Previous</button>
        <span className={styles.footerStep}>Step {stepIndex + 1} of {steps.length}: {steps[stepIndex].label}</span>
        <button type="button" className={styles.primaryButton} disabled={stepIndex === steps.length - 1} onClick={() => setStep(steps[stepIndex + 1].id)}>Next</button>
      </footer>
    </div>
  );
}

/** Keyed by account so one customer's in-memory design can never carry over to another. */
export default function Customize() {
  const { slug } = useParams();
  const userId = useSelector((state) => state.auth.user?.id);
  return <Studio key={`${slug}:${userId || 'pending'}`} slug={slug} />;
}
