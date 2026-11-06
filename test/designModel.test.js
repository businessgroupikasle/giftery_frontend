import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addElement, applyTemplate, createEmptyDesign, createImageElement, createStickerElement, createTextElement, designHasContent, duplicateElement,
  emptyInstructions, historyReducer, initialHistory, loadDesign, MAX_ELEMENTS, missingOptions, moveLayer, normalizeRotation, removeElement,
  replaceElementAsset, resolveCustomizationConfig, scaleElement, studioSteps, updateElement, FONT_FAMILIES,
} from '../src/pages/Customize/designModel.js';
import { getShape, getSticker, PATTERNS, searchStickers, SHAPES, STICKERS, STICKER_CATEGORIES, TEMPLATES } from '../src/pages/Customize/studioLibrary.js';
import { customizationInvoiceLines, describeCustomization, summarizeCustomization } from '../src/utils/customizationSummary.js';

test('product configuration defaults to everything enabled and rejects negative charges', () => {
  const standard = resolveCustomizationConfig({});
  assert.equal(standard.enabled, true);
  assert.equal(standard.chargePerUnit, 0);
  assert.deepEqual(standard.variants, { sizes: [], colors: [], materials: [] });
  assert.equal(resolveCustomizationConfig({ customizationConfig: { enabled: false } }).enabled, false);
  assert.equal(resolveCustomizationConfig({ customizationConfig: { chargePerUnit: -1 } }).chargePerUnit, 0);
  assert.equal(resolveCustomizationConfig({ customizationConfig: { chargePerUnit: 40, tools: { text: false } } }).tools.text, false);
});

test('only steps the product supports are offered', () => {
  assert.equal(studioSteps(resolveCustomizationConfig({}).tools).length, 8);
  const textOnly = { uploads: false, text: true, stickers: false, graphics: false, templates: false, background: false };
  assert.deepEqual(studioSteps(textOnly).map((step) => step.id), ['product', 'text', 'preview', 'instructions', 'review']);
  assert.ok(studioSteps({ ...textOnly, graphics: true }).some((step) => step.id === 'stickers'));
});

test('uploaded images are placed without distortion', () => {
  const wide = createImageElement('logo', { id: 'a', width: 400, height: 100 }, 40);
  assert.equal(wide.width, 40);
  assert.equal(wide.height, 10);
  assert.equal(wide.keepAspect, true);
  const tall = createImageElement('logo', { id: 'b', width: 100, height: 400 }, 40);
  assert.equal(tall.height, 40);
  assert.equal(tall.width, 10);
  const unknown = createImageElement('graphic', { id: 'c' }, 40);
  assert.equal(unknown.width, unknown.height);
});

test('replacing an image keeps its position and rotation and never stretches the new one', () => {
  let design = createEmptyDesign();
  const logo = { ...createImageElement('logo', { id: 'old', width: 100, height: 100 }, 30), x: 20, y: 70, rotation: 33 };
  design = addElement(design, logo);
  design = replaceElementAsset(design, logo.id, { id: 'new', width: 200, height: 100 });
  const [replaced] = design.elements;
  assert.deepEqual([replaced.assetId, replaced.x, replaced.y, replaced.rotation], ['new', 20, 70, 33]);
  assert.equal(replaced.width / replaced.height, 2);
});

test('element updates stay within the limits the server accepts', () => {
  const element = createTextElement('name');
  let design = addElement(createEmptyDesign(), element);
  design = updateElement(design, element.id, { x: 900, y: -900, width: 0, rotation: 725, opacity: 7, fontSize: 500 });
  const [updated] = design.elements;
  assert.deepEqual([updated.x, updated.y, updated.width, updated.rotation, updated.opacity, updated.fontSize], [150, -50, 1, 5, 1, 40]);
  assert.equal(normalizeRotation(180), 180);
  assert.equal(normalizeRotation(-180), 180);
  assert.equal(normalizeRotation(-190), 170);
});

test('scaling text scales its font and box together', () => {
  const scaled = scaleElement({ type: 'text', width: 40, height: 12, fontSize: 5 }, 2);
  assert.deepEqual(scaled, { width: 80, height: 24, fontSize: 10 });
  assert.equal(scaleElement({ type: 'logo', width: 40, height: 20 }, 0.5).height, 10);
  assert.equal(scaleElement({ type: 'logo', width: 40, height: 20 }, 0.5).fontSize, undefined);
});

test('layers reorder, duplicate and remove without touching neighbours', () => {
  const [a, b] = [createStickerElement('general-star'), createStickerElement('general-sun')];
  let design = addElement(addElement(createEmptyDesign(), a), b);
  assert.equal(moveLayer(design, b.id, 1), design, 'the top layer cannot move further forward');
  assert.deepEqual(moveLayer(design, b.id, -1).elements.map((element) => element.id), [b.id, a.id]);
  design = duplicateElement(design, a.id);
  assert.equal(design.elements.length, 3);
  assert.notEqual(design.elements[2].id, a.id);
  assert.equal(design.elements[2].x, a.x + 4);
  assert.deepEqual(removeElement(design, b.id).elements.map((element) => element.id), [a.id, design.elements[2].id]);
});

test('the element limit is enforced', () => {
  let design = createEmptyDesign();
  for (let index = 0; index < MAX_ELEMENTS + 5; index += 1) design = addElement(design, createStickerElement('general-star'));
  assert.equal(design.elements.length, MAX_ELEMENTS);
  assert.equal(duplicateElement(design, design.elements[0].id), design);
});

test('undo and redo walk history, and a gesture counts as one step', () => {
  const start = createEmptyDesign();
  const element = createTextElement('name');
  const add = (state) => historyReducer(state, { type: 'change', update: (design) => addElement(design, element) });
  const move = (state, x) => historyReducer(state, { type: 'change', groupKey: 'drag', update: (design) => updateElement(design, element.id, { x }) });

  let state = add(initialHistory(start));
  state = move(move(move(state, 10), 20), 30);
  assert.equal(state.past.length, 2, 'three drag updates are one undo step');
  assert.equal(state.present.elements[0].x, 30);

  state = historyReducer(state, { type: 'endGroup' });
  state = move(state, 40);
  assert.equal(state.past.length, 3, 'a new gesture is a new step');

  state = historyReducer(state, { type: 'undo' });
  assert.equal(state.present.elements[0].x, 30);
  state = historyReducer(state, { type: 'undo' });
  assert.equal(state.present.elements[0].x, element.x);
  state = historyReducer(state, { type: 'redo' });
  assert.equal(state.present.elements[0].x, 30);
  assert.equal(historyReducer(initialHistory(start), { type: 'undo' }).present, start);

  const branched = move(state, 55);
  assert.equal(branched.future.length, 0, 'editing after undo clears redo');
});

test('saved designs open safely, including ones from the earlier editor', () => {
  const legacy = {
    version: 1, productImage: '/a.png', imageAssetId: 'logo-1', previewAssetId: 'p',
    image: { x: 10, y: 20, width: 30, rotation: 5 },
    text: { value: 'Hello', color: '#ff0000', font: 'Georgia', fontSize: 6, x: 50, y: 60, width: 40, rotation: 0 },
  };
  const opened = loadDesign(legacy, ['/a.png']);
  assert.equal(opened.version, 2);
  assert.deepEqual(opened.elements.map((element) => element.type), ['logo', 'text']);
  assert.equal(opened.elements[0].assetId, 'logo-1');
  assert.equal(opened.elements[1].text, 'Hello');
  assert.equal(opened.elements[1].fontFamily, 'Georgia');
  assert.equal(loadDesign({ ...legacy, text: { ...legacy.text, font: 'Comic Sans' } }, ['/a.png']).elements[1].fontFamily, 'Arial');

  assert.equal(loadDesign(null, ['/a.png']).productImage, '/a.png');
  assert.deepEqual(loadDesign([], ['/a.png']).elements, []);
  assert.equal(loadDesign({ version: 2, elements: [], productImage: '/removed.png' }, ['/a.png']).productImage, '/a.png', 'moves off a gallery image that no longer exists');
  assert.equal(loadDesign({ version: 2, elements: [], productImage: '/a.png' }, []).productImage, null);
  assert.equal(loadDesign({ version: 2, elements: [] }, []).background.borderStyle, 'none');
});

test('required options and empty designs are detected', () => {
  const config = resolveCustomizationConfig({ customizationConfig: { variants: { sizes: ['S'], colors: ['Red'] } } });
  assert.deepEqual(missingOptions(config, {}), ['size', 'color']);
  assert.deepEqual(missingOptions(config, { size: 'S', color: 'Red' }), []);
  const empty = createEmptyDesign();
  assert.equal(designHasContent(empty, emptyInstructions()), false);
  assert.equal(designHasContent(empty, { ...emptyInstructions(), notes: 'Call me' }), true);
  assert.equal(designHasContent(empty, { ...emptyInstructions(), notes: '   ' }), false);
  assert.equal(designHasContent({ ...empty, background: { ...empty.background, color: '#ffffff' } }, emptyInstructions()), true);
  assert.equal(designHasContent(addElement(empty, createStickerElement('general-star')), emptyInstructions()), true);
});

test('templates keep logos, respect product limits and only use real library items', () => {
  const logo = createImageElement('logo', { id: 'mine', width: 10, height: 10 });
  const design = addElement(addElement(createEmptyDesign(), logo), createTextElement('name'));
  const template = TEMPLATES.find((entry) => entry.id === 'birthday-bash');
  const applied = applyTemplate(design, template);
  assert.ok(applied.elements.some((element) => element.assetId === 'mine'));
  assert.ok(applied.elements.some((element) => element.text === 'Happy Birthday'));
  assert.equal(applied.elements.at(-1).assetId, 'mine', 'logos stay on top');
  assert.equal(applied.background.color, template.background.color);

  const limited = applyTemplate(design, template, { uploads: true, text: true, stickers: false, graphics: false, templates: true, background: false });
  assert.equal(limited.elements.some((element) => element.type === 'sticker'), false);
  assert.equal(limited.background.color, null);

  for (const entry of TEMPLATES) {
    for (const item of entry.items) {
      if (item.kind === 'sticker') assert.ok(getSticker(item.stickerId), `${entry.id}: ${item.stickerId}`);
      if (item.kind === 'shape') assert.ok(getShape(item.shapeId), `${entry.id}: ${item.shapeId}`);
      if (item.fontFamily) assert.ok(FONT_FAMILIES.includes(item.fontFamily), `${entry.id}: ${item.fontFamily}`);
    }
    if (entry.background.pattern) assert.ok(PATTERNS.some((pattern) => pattern.id === entry.background.pattern), entry.id);
  }
});

test('the sticker library covers each category, searches, and uses server-valid IDs', () => {
  const idFormat = /^[a-z0-9-]{1,40}$/;
  for (const category of STICKER_CATEGORIES) assert.ok(STICKERS.filter((sticker) => sticker.category === category).length >= 5, category);
  for (const item of [...STICKERS, ...SHAPES]) assert.match(item.id, idFormat);
  assert.equal(new Set(STICKERS.map((sticker) => sticker.id)).size, STICKERS.length);
  assert.ok(searchStickers('cake', 'All').some((sticker) => sticker.id === 'birthday-cake'));
  assert.deepEqual(searchStickers('cake', 'Love'), []);
  assert.deepEqual(searchStickers('no such sticker', 'All'), []);
  assert.equal(searchStickers('', 'Kids').length, STICKERS.filter((sticker) => sticker.category === 'Kids').length);
});

test('customization summaries read current and earlier snapshots', () => {
  const snapshot = {
    version: 2,
    name: 'Team mug',
    options: { size: 'M', material: 'Steel' },
    elements: [
      { type: 'logo', assetId: 'a1' },
      { type: 'text', role: 'company', text: 'Acme', fontFamily: 'Arial', color: '#000000' },
      { type: 'text', role: 'name', text: '   ' },
      { type: 'sticker', stickerId: 'general-star' },
      { type: 'shape', shapeId: 'divider' },
    ],
    background: { color: '#ffffff', pattern: 'dots', borderStyle: 'dashed', imageAssetId: null },
    instructions: { requirements: 'Be careful', delivery: '', referenceAssetIds: ['r1'] },
    assets: [{ id: 'a1', originalName: 'acme.png' }, { id: 'r1', originalName: 'ref.jpg' }],
    previewAssetId: 'p1',
  };
  const info = describeCustomization(snapshot);
  assert.deepEqual(info.options, [{ label: 'Size', value: 'M' }, { label: 'Material', value: 'Steel' }]);
  assert.deepEqual(info.logos, [{ assetId: 'a1', name: 'acme.png' }]);
  assert.equal(info.texts.length, 1, 'blank text is left out');
  assert.equal(info.texts[0].label, 'Company');
  assert.deepEqual(info.stickers, ['Star']);
  assert.deepEqual(info.graphics, ['Divider']);
  assert.deepEqual(info.background, ['Colour #ffffff', 'Dots pattern', 'dashed border']);
  assert.deepEqual(info.instructions, [{ label: 'Special requirements', value: 'Be careful' }]);
  assert.deepEqual(info.references, [{ assetId: 'r1', name: 'ref.jpg' }]);
  assert.equal(summarizeCustomization(snapshot), 'Size: M · Material: Steel · 1 logo · 1 text element · 1 sticker · 1 graphic · custom background · special instructions');
  assert.ok(customizationInvoiceLines(snapshot).includes('Company: Acme'));

  const legacy = describeCustomization({ version: 1, imageAssetId: 'old', text: { value: 'Hello', font: 'Arial', color: '#111111' }, previewAssetId: 'p' });
  assert.equal(legacy.legacyImageAssetId, 'old');
  assert.equal(legacy.texts[0].value, 'Hello');
  assert.doesNotThrow(() => describeCustomization(null));
  assert.equal(summarizeCustomization({ text: { value: 'Hi' } }), '1 text element');
});
