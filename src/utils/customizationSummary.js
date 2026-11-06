/**
 * customizationSummary.js — Reads a saved customization snapshot into plain display data
 * for the cart, checkout, order history, invoice and admin views.
 */
import { getShape, getSticker, PATTERNS } from '../pages/Customize/studioLibrary.js';

export const REVIEW_STATUS_LABELS = {
  PENDING_REVIEW: 'Pending Review',
  DESIGN_APPROVED: 'Design Approved',
  IN_PROGRESS: 'Customization in Progress',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
};

const OPTION_LABELS = [['size', 'Size'], ['color', 'Colour'], ['material', 'Material']];
const INSTRUCTION_LABELS = [
  ['requirements', 'Special requirements'],
  ['delivery', 'Delivery instructions'],
  ['preferredDesign', 'Preferred design'],
  ['notes', 'Additional notes'],
];

const textLabel = { heading: 'Heading', name: 'Name', message: 'Message', company: 'Company', description: 'Description', custom: 'Text' };

const backgroundLines = (background) => {
  if (!background) return [];
  const lines = [];
  if (background.color) lines.push(`Colour ${background.color}`);
  if (background.imageAssetId) lines.push('Custom image');
  if (background.pattern) lines.push(`${PATTERNS.find((pattern) => pattern.id === background.pattern)?.name || background.pattern} pattern`);
  if (background.borderStyle && background.borderStyle !== 'none') lines.push(`${background.borderStyle} border`);
  return lines;
};

const assetName = (assets, id, fallback) => assets.find((asset) => asset.id === id)?.originalName || fallback;

export const describeCustomization = (snapshot) => {
  const data = snapshot && typeof snapshot === 'object' ? snapshot : {};
  const elements = Array.isArray(data.elements) ? data.elements : [];
  const assets = Array.isArray(data.assets) ? data.assets : [];
  const instructions = data.instructions || {};
  const legacyText = typeof data.text?.value === 'string' && data.text.value.trim() ? [{ label: 'Text', value: data.text.value, font: data.text.font || null, color: data.text.color || null }] : [];

  return {
    name: data.name || null,
    options: OPTION_LABELS.filter(([key]) => data.options?.[key]).map(([key, label]) => ({ label, value: data.options[key] })),
    logos: elements.filter((element) => element.type === 'logo').map((element) => ({ assetId: element.assetId, name: assetName(assets, element.assetId, 'Logo') })),
    uploadedGraphics: elements.filter((element) => element.type === 'graphic').map((element) => ({ assetId: element.assetId, name: assetName(assets, element.assetId, 'Graphic') })),
    texts: [...elements.filter((element) => element.type === 'text' && element.text?.trim()).map((element) => ({
      label: textLabel[element.role] || 'Text',
      value: element.text,
      font: element.fontFamily,
      color: element.color,
    })), ...legacyText],
    stickers: elements.filter((element) => element.type === 'sticker').map((element) => getSticker(element.stickerId)?.name || element.stickerId),
    graphics: elements.filter((element) => element.type === 'shape').map((element) => getShape(element.shapeId)?.name || element.shapeId),
    background: backgroundLines(data.background),
    instructions: INSTRUCTION_LABELS.filter(([key]) => instructions[key]?.trim()).map(([key, label]) => ({ label, value: instructions[key].trim() })),
    references: (instructions.referenceAssetIds || []).map((id) => ({ assetId: id, name: assetName(assets, id, 'Reference image') })),
    assets,
    backgroundAssetId: data.background?.imageAssetId || null,
    legacyImageAssetId: data.imageAssetId || null,
    previewAssetId: data.previewAssetId || null,
    includesProductImage: data.previewInfo?.includesProductImage ?? null,
  };
};

/** Short phrase for compact places such as cart rows, e.g. "Size: M · 2 logos · 1 text". */
export const summarizeCustomization = (snapshot) => {
  const info = describeCustomization(snapshot);
  const count = (items, singular, plural = `${singular}s`) => (items.length ? `${items.length} ${items.length === 1 ? singular : plural}` : null);
  return [
    ...info.options.map((option) => `${option.label}: ${option.value}`),
    count(info.logos, 'logo'),
    count(info.texts, 'text element'),
    count(info.stickers, 'sticker'),
    count([...info.graphics, ...info.uploadedGraphics], 'graphic'),
    info.background.length ? 'custom background' : null,
    info.instructions.length ? 'special instructions' : null,
  ].filter(Boolean).join(' · ');
};

/** Plain-text lines for the printable invoice. */
export const customizationInvoiceLines = (snapshot) => {
  const info = describeCustomization(snapshot);
  return [
    info.name ? `Design: ${info.name}` : null,
    ...info.options.map((option) => `${option.label}: ${option.value}`),
    ...info.logos.map((logo) => `Logo: ${logo.name}`),
    ...info.uploadedGraphics.map((graphic) => `Graphic: ${graphic.name}`),
    ...info.texts.map((entry) => `${entry.label}: ${entry.value}`),
    info.stickers.length ? `Stickers: ${info.stickers.join(', ')}` : null,
    info.graphics.length ? `Graphics: ${info.graphics.join(', ')}` : null,
    info.background.length ? `Background: ${info.background.join(', ')}` : null,
    ...info.instructions.map((entry) => `${entry.label}: ${entry.value}`),
  ].filter(Boolean);
};
