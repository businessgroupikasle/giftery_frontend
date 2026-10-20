import env from '@config/env';
const readImageValue = (image) => {
  if (typeof image === 'string') return image;
  if (!image || typeof image !== 'object') return '';
  return image.url || image.secure_url || image.path || image.src || '';
};

/**
 * getImageUrl — Normalizes any image URL/path into a web-accessible URL
 *
 * Uses existing environment configuration:
 * import.meta.env.VITE_API_BASE_URL or env.API_BASE_URL (fallback: http://localhost:5000)
 *
 * @param {string} image - Image URL or relative path
 * @param {string} [fallback='/images/product-placeholder.svg'] - Fallback image
 * @returns {string} Fully resolved image URL
 */
export const getImageUrl = (image, fallback = '/images/product-placeholder.svg') => {
  const rawValue = readImageValue(image);
  if (!rawValue) return fallback;

  const trimmed = rawValue.trim().replace(/\\/g, '/');
  if (!trimmed) return fallback;

  if (trimmed.startsWith('//')) return `${window.location.protocol}${trimmed}`;
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;

  // Files bundled with the frontend remain on the frontend origin.
  if (trimmed.startsWith('/images/') || trimmed.startsWith('images/')) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || env.API_BASE_URL || 'http://localhost:5000')
    .replace(/\/$/, '');
  const uploadBaseUrl = (import.meta.env.VITE_CDN_URL || env.CDN_URL || `${apiBaseUrl}/uploads`)
    .replace(/\/$/, '');
  const withoutLeadingSlash = trimmed.replace(/^\/+/, '');

  // Explicit backend-root paths already include their public directory.
  if (/^(uploads|public)\//i.test(withoutLeadingSlash)) {
    return `${apiBaseUrl}/${withoutLeadingSlash.replace(/^public\//i, '')}`;
  }

  // Bare filenames and relative subdirectories are uploaded media paths.
  return `${uploadBaseUrl}/${withoutLeadingSlash}`;
};

/**
 * getProductThumbnail — Safely extracts the first valid thumbnail image from a product object
 *
 * Handles:
 * - product.images (Array of string URLs)
 * - product.images (JSON string or comma/||| separated string)
 * - product.image / product.imageUrl (string)
 *
 * @param {object} product - Product record
 * @param {string} [fallback='/images/product-placeholder.svg'] - Fallback image
 * @returns {string} Fully resolved image URL
 */
export const getProductThumbnail = (product, fallback = '/images/product-placeholder.svg') => {
  if (!product) return fallback;

  // 1. Array of images
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images.map(readImageValue).find(Boolean);
    if (first) return getImageUrl(first, fallback);
  }

  // 2. String of images (JSON array or delimited string)
  if (typeof product.images === 'string' && product.images.trim()) {
    const trimmed = product.images.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed.map(readImageValue).find(Boolean);
          if (first) return getImageUrl(first, fallback);
        }
      } catch (e) {}
    }

    const separator = trimmed.includes('|||') ? '|||' : ',';
    const first = trimmed.split(separator).map(s => s.trim()).filter(Boolean)[0];
    if (first) return getImageUrl(first, fallback);
  }

  // 3. Single image property
  const singleImage = readImageValue(product.image) || readImageValue(product.imageUrl) || readImageValue(product.thumbnail);
  if (singleImage) return getImageUrl(singleImage, fallback);

  return fallback;
};

export default getImageUrl;
