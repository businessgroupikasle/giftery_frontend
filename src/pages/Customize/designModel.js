/**
 * designModel.js — Plain data helpers for the customization studio.
 * Positions and sizes are percentages of the square preview stage, so a design renders
 * identically at any screen size and in the exported preview image.
 * Keep the lists below in step with backend/src/validations/customizationValidation.js.
 */

export const FONT_FAMILIES = ['Montserrat', 'Playfair Display', 'Arial', 'Georgia', 'Verdana', 'Times New Roman', 'Courier New', 'Impact', 'Dancing Script', 'Bebas Neue'];
export const BORDER_STYLES = ['none', 'solid', 'dashed', 'dotted', 'double'];
export const MAX_ELEMENTS = 60;
export const MAX_REFERENCE_IMAGES = 5;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
export const ACCEPTED_IMAGE_INPUT = '.png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml';

export const TEXT_ROLES = {
  heading: { label: 'Custom heading', placeholder: 'Your heading', fontFamily: 'Playfair Display', fontSize: 8, bold: true, width: 70, y: 28 },
  name: { label: 'Name', placeholder: 'Your name', fontFamily: 'Montserrat', fontSize: 6, bold: true, width: 60, y: 44 },
  message: { label: 'Message', placeholder: 'Your message', fontFamily: 'Georgia', fontSize: 4.5, bold: false, width: 60, y: 58 },
  company: { label: 'Company name', placeholder: 'Company name', fontFamily: 'Montserrat', fontSize: 4.5, bold: true, width: 60, y: 70 },
  description: { label: 'Custom description', placeholder: 'Add a short description', fontFamily: 'Arial', fontSize: 3.2, bold: false, width: 60, y: 80 },
};

export const DEFAULT_TOOLS = { uploads: true, text: true, stickers: true, graphics: true, templates: true, background: true };

/** Products without an explicit configuration offer every tool, no options and no charge. */
export const resolveCustomizationConfig = (product) => {
  const config = product?.customizationConfig;
  const hasConfig = config && typeof config === 'object';
  return {
    enabled: !hasConfig || config.enabled !== false,
    tools: { ...DEFAULT_TOOLS, ...(hasConfig ? config.tools : null) },
    variants: { sizes: [], colors: [], materials: [], ...(hasConfig ? config.variants : null) },
    chargePerUnit: hasConfig && Number.isFinite(config.chargePerUnit) && config.chargePerUnit > 0 ? config.chargePerUnit : 0,
  };
};

const round = (value) => Math.round(value * 100) / 100;
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const normalizeRotation = (degrees) => {
  const wrapped = ((degrees + 180) % 360 + 360) % 360 - 180;
  return round(wrapped === -180 ? 180 : wrapped);
};

export const newElementId = () => `el_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const defaultBackground = () => ({
  x: 50, y: 50, width: 70, height: 70, shape: 'rect', color: null, opacity: 1, imageAssetId: null,
  pattern: null, patternColor: '#dfa843', borderStyle: 'none', borderWidth: 2, borderColor: '#b8832a',
});

export const createEmptyDesign = (productImage = null) => ({
  version: 2,
  productImage: productImage || null,
  elements: [],
  background: defaultBackground(),
});

const base = { rotation: 0, opacity: 1 };

export const createTextElement = (role = 'custom', overrides = {}) => {
  const preset = TEXT_ROLES[role] || TEXT_ROLES.name;
  return {
    ...base,
    id: newElementId(),
    type: 'text',
    role: TEXT_ROLES[role] ? role : 'custom',
    text: preset.placeholder,
    x: 50,
    y: preset.y,
    width: preset.width,
    height: 12,
    fontFamily: preset.fontFamily,
    fontSize: preset.fontSize,
    bold: preset.bold,
    italic: false,
    align: 'center',
    color: '#111111',
    backgroundColor: null,
    outlineColor: null,
    outlineWidth: 0,
    ...overrides,
  };
};

/** Places an uploaded image without distorting it, fitting its longest edge to `edge` percent of the stage. */
export const createImageElement = (type, asset, edge = 30) => {
  const ratio = asset.width && asset.height ? asset.width / asset.height : 1;
  return {
    ...base,
    id: newElementId(),
    type,
    assetId: asset.id,
    keepAspect: true,
    x: 50,
    y: 50,
    width: round(ratio >= 1 ? edge : edge * ratio),
    height: round(ratio >= 1 ? edge / ratio : edge),
  };
};

export const createStickerElement = (stickerId, overrides = {}) => ({
  ...base, id: newElementId(), type: 'sticker', stickerId, x: 50, y: 50, width: 22, height: 22, ...overrides,
});

export const createShapeElement = (shapeId, color = '#dfa843', overrides = {}) => ({
  ...base, id: newElementId(), type: 'shape', shapeId, color, x: 50, y: 50, width: 26, height: 26, ...overrides,
});

const clampGeometry = (element) => ({
  ...element,
  x: round(clamp(element.x, -50, 150)),
  y: round(clamp(element.y, -50, 150)),
  width: round(clamp(element.width, 1, 300)),
  height: round(clamp(element.height, 1, 300)),
  rotation: normalizeRotation(element.rotation),
  opacity: round(clamp(element.opacity, 0, 1)),
  ...(element.type === 'text' ? { fontSize: round(clamp(element.fontSize, 0.5, 40)) } : {}),
});

export const updateElement = (design, id, patch) => ({
  ...design,
  elements: design.elements.map((element) => (element.id === id ? clampGeometry({ ...element, ...patch }) : element)),
});

export const addElement = (design, element) => (design.elements.length >= MAX_ELEMENTS
  ? design
  : { ...design, elements: [...design.elements, clampGeometry(element)] });

export const removeElement = (design, id) => ({ ...design, elements: design.elements.filter((element) => element.id !== id) });

export const duplicateElement = (design, id) => {
  const source = design.elements.find((element) => element.id === id);
  if (!source || design.elements.length >= MAX_ELEMENTS) return design;
  return addElement(design, { ...source, id: newElementId(), x: source.x + 4, y: source.y + 4 });
};

/** Later elements draw on top. `direction` is +1 to bring forward and -1 to send back. */
export const moveLayer = (design, id, direction) => {
  const index = design.elements.findIndex((element) => element.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= design.elements.length) return design;
  const elements = [...design.elements];
  [elements[index], elements[target]] = [elements[target], elements[index]];
  return { ...design, elements };
};

/** Scales around the element's centre. Text scales its font and box together. */
export const scaleElement = (origin, factor) => ({
  width: clamp(origin.width * factor, 1, 300),
  height: clamp(origin.height * factor, 1, 300),
  ...(origin.type === 'text' ? { fontSize: clamp(origin.fontSize * factor, 0.5, 40) } : {}),
});

/** Swaps an image for a new upload, keeping its centre, rotation and longest edge, without distortion. */
export const replaceElementAsset = (design, id, asset) => {
  const element = design.elements.find((entry) => entry.id === id);
  if (!element?.assetId) return design;
  const fitted = createImageElement(element.type, asset, Math.max(element.width, element.height));
  return updateElement(design, id, { assetId: asset.id, width: fitted.width, height: fitted.height });
};

const finite = (value, fallback) => (Number.isFinite(value) ? value : fallback);

/** Opens a design saved by the earlier single-image editor in the current format. */
const upgradeLegacyDesign = (legacy) => {
  const elements = [];
  if (legacy.imageAssetId) {
    const image = legacy.image || {};
    const width = finite(image.width, 30);
    elements.push({
      ...base, id: newElementId(), type: 'logo', assetId: legacy.imageAssetId, keepAspect: true,
      x: finite(image.x, 50), y: finite(image.y, 45), width, height: width, rotation: finite(image.rotation, 0),
    });
  }
  if (typeof legacy.text?.value === 'string' && legacy.text.value.trim()) {
    const text = legacy.text;
    elements.push(createTextElement('custom', {
      text: text.value.slice(0, 500),
      x: finite(text.x, 50),
      y: finite(text.y, 65),
      width: finite(text.width, 40),
      rotation: finite(text.rotation, 0),
      fontFamily: FONT_FAMILIES.includes(text.font) ? text.font : 'Arial',
      fontSize: finite(text.fontSize, finite(text.width, 40) * 0.125),
      color: /^#[0-9a-f]{6}$/i.test(text.color || '') ? text.color : '#111111',
      bold: true,
    }));
  }
  return { ...createEmptyDesign(legacy.productImage), elements: elements.map(clampGeometry) };
};

/** Turns stored JSON into an editable design, keeping it on an image that still belongs to the product. */
export const loadDesign = (raw, gallery = []) => {
  let design;
  if (raw?.version === 2 && Array.isArray(raw.elements)) {
    design = { ...createEmptyDesign(raw.productImage), ...raw, background: { ...defaultBackground(), ...raw.background } };
  } else if (raw && typeof raw === 'object' && !Array.isArray(raw) && (raw.imageAssetId || raw.text)) {
    design = upgradeLegacyDesign(raw);
  } else {
    design = createEmptyDesign(gallery[0]);
  }
  if (!gallery.includes(design.productImage)) design = { ...design, productImage: gallery[0] || null };
  return design;
};

export const backgroundIsSet = (background) => Boolean(
  background && (background.color || background.imageAssetId || background.pattern || background.borderStyle !== 'none'),
);

export const instructionsHaveText = (instructions) => ['requirements', 'delivery', 'preferredDesign', 'notes'].some((key) => instructions?.[key]?.trim());

export const designHasContent = (design, instructions) => design.elements.length > 0 || backgroundIsSet(design.background) || instructionsHaveText(instructions);

export const emptyInstructions = () => ({ requirements: '', delivery: '', preferredDesign: '', notes: '', referenceAssetIds: [] });

/** Options the product requires that the customer has not chosen yet. */
export const missingOptions = (config, options) => [
  ['size', 'sizes'], ['color', 'colors'], ['material', 'materials'],
].filter(([key, list]) => config.variants[list].length > 0 && !options?.[key]).map(([key]) => key);

export const parseGallery = (images) => {
  if (Array.isArray(images)) return images.map((image) => String(image).trim()).filter(Boolean);
  return [];
};

/** Which studio steps the product supports, in order. */
export const studioSteps = (tools) => [
  { id: 'product', label: 'Product', show: true },
  { id: 'logo', label: 'Logo', show: tools.uploads },
  { id: 'text', label: 'Text', show: tools.text },
  { id: 'stickers', label: 'Stickers', show: tools.stickers || tools.graphics },
  { id: 'background', label: 'Design', show: tools.background || tools.templates },
  { id: 'preview', label: 'Preview', show: true },
  { id: 'instructions', label: 'Instructions', show: true },
  { id: 'review', label: 'Review', show: true },
].filter((step) => step.show);

// ── Undo / redo ──
const MAX_HISTORY = 100;

export const initialHistory = (present) => ({ past: [], present, future: [], groupKey: null });

/**
 * Undo history for the design. Consecutive changes sharing a `groupKey`
 * (one drag, or typing in one field) undo as a single step.
 */
export const historyReducer = (state, action) => {
  switch (action.type) {
    case 'load':
      return initialHistory(action.design);
    case 'change': {
      const next = typeof action.update === 'function' ? action.update(state.present) : action.update;
      if (next === state.present) return state;
      if (action.groupKey && action.groupKey === state.groupKey) return { ...state, present: next, future: [] };
      return { past: [...state.past, state.present].slice(-MAX_HISTORY), present: next, future: [], groupKey: action.groupKey || null };
    }
    case 'endGroup':
      return state.groupKey ? { ...state, groupKey: null } : state;
    case 'undo': {
      if (!state.past.length) return state;
      return { past: state.past.slice(0, -1), present: state.past[state.past.length - 1], future: [state.present, ...state.future], groupKey: null };
    }
    case 'redo': {
      if (!state.future.length) return state;
      return { past: [...state.past, state.present], present: state.future[0], future: state.future.slice(1), groupKey: null };
    }
    default:
      return state;
  }
};

/**
 * Applies a starter template. Uploaded logos and graphics stay on top of it, and anything the
 * product does not support is left out so the design remains valid for that product.
 */
export const applyTemplate = (design, template, tools = DEFAULT_TOOLS) => {
  const items = template.items.flatMap((item) => {
    const common = { x: item.x ?? 50, y: item.y ?? 50, rotation: item.rotation ?? 0 };
    if (item.kind === 'text' && tools.text) {
      const { kind: _kind, role, value, ...overrides } = item;
      return [createTextElement(role, { text: value, ...overrides })];
    }
    if (item.kind === 'sticker' && tools.stickers) return [createStickerElement(item.stickerId, { ...common, width: item.size, height: item.size })];
    if (item.kind === 'shape' && tools.graphics) return [createShapeElement(item.shapeId, item.color, { ...common, width: item.size, height: item.size })];
    return [];
  });
  return {
    ...design,
    background: tools.background ? { ...defaultBackground(), ...template.background } : design.background,
    elements: [...items, ...design.elements.filter((element) => element.type === 'logo' || element.type === 'graphic')].map(clampGeometry),
  };
};
