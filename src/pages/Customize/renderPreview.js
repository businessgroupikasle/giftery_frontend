/**
 * renderPreview.js — Paints a design onto a canvas using the same percentages as the live
 * stage, producing the mockup image stored with the design and shown through checkout and admin.
 */
import { getImageUrl } from '@utils/imageUrl';
import { PATTERN_TILE_PERCENT, patternDataUrl, shapeDataUrl, stickerDataUrl } from './studioLibrary';

const SIZE = 1000;
const percent = (value) => (value / 100) * SIZE;

const loadImage = (src, crossOrigin = false) => new Promise((resolve, reject) => {
  const image = new Image();
  if (crossOrigin) image.crossOrigin = 'anonymous';
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('An image in this design could not be loaded.'));
  image.src = src;
});

const fontString = (element) => `${element.italic ? 'italic ' : ''}${element.bold ? '700' : '400'} ${percent(element.fontSize)}px "${element.fontFamily}"`;

const wrapLines = (context, value, maxWidth) => {
  const lines = [];
  value.split('\n').forEach((paragraph) => {
    let line = '';
    paragraph.split(/\s+/).filter(Boolean).forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (line && context.measureText(next).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });
    lines.push(line);
  });
  return lines;
};

const drawContained = (context, image, x, y, width, height) => {
  const scale = Math.min(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
};

const drawCovering = (context, image, x, y, width, height) => {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
};

const tracePanel = (context, background, inset = 0) => {
  const width = percent(background.width) - inset * 2;
  const height = percent(background.height) - inset * 2;
  const left = percent(background.x) - width / 2;
  const top = percent(background.y) - height / 2;
  context.beginPath();
  if (background.shape === 'circle') {
    context.ellipse(percent(background.x), percent(background.y), width / 2, height / 2, 0, 0, Math.PI * 2);
  } else {
    const radius = background.shape === 'rounded' ? Math.max(0, percent(6) - inset) : 0;
    context.moveTo(left + radius, top);
    context.arcTo(left + width, top, left + width, top + height, radius);
    context.arcTo(left + width, top + height, left, top + height, radius);
    context.arcTo(left, top + height, left, top, radius);
    context.arcTo(left, top, left + width, top, radius);
    context.closePath();
  }
};

const drawBackground = async (context, background, getAssetUrl) => {
  const hasFill = background.color || background.imageAssetId || background.pattern;
  const borderWidth = background.borderStyle === 'none' ? 0 : percent(background.borderWidth * 0.2);
  if (!hasFill && !borderWidth) return;
  const left = percent(background.x - background.width / 2);
  const top = percent(background.y - background.height / 2);
  const width = percent(background.width);
  const height = percent(background.height);

  context.save();
  tracePanel(context, background);
  context.clip();
  context.globalAlpha = background.opacity;
  if (background.color) {
    context.fillStyle = background.color;
    context.fillRect(left, top, width, height);
  }
  if (background.imageAssetId) {
    const url = getAssetUrl(background.imageAssetId);
    if (!url) throw new Error('The background image is still loading. Try again in a moment.');
    drawCovering(context, await loadImage(url), left, top, width, height);
  }
  if (background.pattern) {
    const tile = await loadImage(patternDataUrl(background.pattern, background.patternColor));
    const tileSize = percent(PATTERN_TILE_PERCENT);
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = tileSize;
    tileCanvas.height = tileSize;
    tileCanvas.getContext('2d').drawImage(tile, 0, 0, tileSize, tileSize);
    context.fillStyle = context.createPattern(tileCanvas, 'repeat');
    context.fillRect(left, top, width, height);
  }
  context.restore();

  if (borderWidth) {
    context.save();
    context.strokeStyle = background.borderColor;
    const dash = { dashed: [borderWidth * 3, borderWidth * 2], dotted: [0.01, borderWidth * 2] }[background.borderStyle] || [];
    context.setLineDash(dash);
    context.lineCap = background.borderStyle === 'dotted' ? 'round' : 'butt';
    if (background.borderStyle === 'double') {
      const line = borderWidth / 3;
      context.lineWidth = line;
      tracePanel(context, background, line / 2);
      context.stroke();
      tracePanel(context, background, borderWidth - line / 2);
      context.stroke();
    } else {
      context.lineWidth = borderWidth;
      tracePanel(context, background, borderWidth / 2);
      context.stroke();
    }
    context.restore();
  }
};

const drawText = (context, element) => {
  const fontSize = percent(element.fontSize);
  const padding = fontSize * 0.15;
  const boxWidth = percent(element.width);
  const lineHeight = fontSize * 1.2;
  context.font = fontString(element);
  const lines = wrapLines(context, element.text, boxWidth - padding * 2);
  const boxHeight = lines.length * lineHeight + padding * 2;

  if (element.backgroundColor) {
    context.fillStyle = element.backgroundColor;
    context.fillRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight);
  }
  context.textBaseline = 'middle';
  context.textAlign = element.align;
  const anchor = { left: -boxWidth / 2 + padding, center: 0, right: boxWidth / 2 - padding }[element.align];
  lines.forEach((line, index) => {
    const y = -boxHeight / 2 + padding + lineHeight * (index + 0.5);
    if (element.outlineColor && element.outlineWidth > 0) {
      context.strokeStyle = element.outlineColor;
      context.lineWidth = percent(element.outlineWidth * 0.1);
      context.lineJoin = 'round';
      context.strokeText(line, anchor, y);
    }
    context.fillStyle = element.color;
    context.fillText(line, anchor, y);
  });
};

const elementImageSource = (element, getAssetUrl) => {
  if (element.type === 'sticker') return stickerDataUrl(element.stickerId);
  if (element.type === 'shape') return shapeDataUrl(element.shapeId, element.color);
  return getAssetUrl(element.assetId);
};

const drawElement = async (context, element, getAssetUrl) => {
  context.save();
  context.translate(percent(element.x), percent(element.y));
  context.rotate((element.rotation * Math.PI) / 180);
  context.globalAlpha = element.opacity;
  if (element.type === 'text') {
    drawText(context, element);
  } else {
    const source = elementImageSource(element, getAssetUrl);
    if (!source) throw new Error('An uploaded image is still loading. Try again in a moment.');
    const image = await loadImage(source);
    const width = percent(element.width);
    const height = percent(element.height);
    if (element.keepAspect === false || element.type === 'shape') context.drawImage(image, -width / 2, -height / 2, width, height);
    else drawContained(context, image, -width / 2, -height / 2, width, height);
  }
  context.restore();
};

/**
 * @returns {Promise<{ blob: Blob, includesProductImage: boolean }>}
 * `includesProductImage` is false when the product photo's host forbids export, in which
 * case the design is drawn on a neutral background rather than failing the customer's save.
 */
export const renderDesignPreview = async (design, getAssetUrl) => {
  await Promise.all(design.elements
    .filter((element) => element.type === 'text' && !element.hidden)
    .map((element) => document.fonts?.load?.(fontString(element), element.text).catch(() => null)));

  const paint = async (withProductImage) => {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, SIZE, SIZE);
    if (withProductImage && design.productImage) {
      drawContained(context, await loadImage(getImageUrl(design.productImage), true), 0, 0, SIZE, SIZE);
    } else {
      context.fillStyle = '#f1f5f9';
      context.fillRect(0, 0, SIZE, SIZE);
    }
    await drawBackground(context, design.background, getAssetUrl);
    for (const element of design.elements) {
      if (!element.hidden) await drawElement(context, element, getAssetUrl);
    }
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create the design preview.'))), 'image/jpeg', 0.9);
    });
  };

  if (design.productImage) {
    try {
      return { blob: await paint(true), includesProductImage: true };
    } catch (error) {
      if (error.name !== 'SecurityError' && !/could not be loaded/.test(error.message)) throw error;
    }
  }
  return { blob: await paint(false), includesProductImage: false };
};
