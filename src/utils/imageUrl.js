import env from '@config/env';

/**
 * getImageUrl — Normalizes any image URL/path into a web-accessible URL
 *
 * Uses existing environment configuration:
 * import.meta.env.VITE_API_BASE_URL or env.API_BASE_URL (fallback: http://localhost:5000)
 *
 * @param {string} image - Image URL or relative path
 * @param {string} [fallback='/placeholder-product.png'] - Fallback image
 * @returns {string} Fully resolved image URL
 */
export const getImageUrl = (image, fallback = '/placeholder-product.png') => {
  if (!image || typeof image !== 'string') return fallback;

  const trimmed = image.trim();
  if (!trimmed) return fallback;

  // If already absolute URL, base64, or blob URL
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Local frontend public assets in /images/...
  if (trimmed.startsWith('/images/') || trimmed.startsWith('images/')) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  // Backend API Base URL from existing environment config
  const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || env.API_BASE_URL || 'http://localhost:5000';
  const baseUrl = rawBaseUrl.replace(/\/$/, '');
  const imagePath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return `${baseUrl}${imagePath}`;
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
 * @param {string} [fallback='/placeholder-product.png'] - Fallback image
 * @returns {string} Fully resolved image URL
 */
export const getProductThumbnail = (product, fallback = '/placeholder-product.png') => {
  if (!product) return fallback;

  // 1. Array of images
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images.find(img => typeof img === 'string' && img.trim());
    if (first) return getImageUrl(first, fallback);
  }

  // 2. String of images (JSON array or delimited string)
  if (typeof product.images === 'string' && product.images.trim()) {
    const trimmed = product.images.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed.find(img => typeof img === 'string' && img.trim());
          if (first) return getImageUrl(first, fallback);
        }
      } catch (e) {}
    }

    const separator = trimmed.includes('|||') ? '|||' : ',';
    const first = trimmed.split(separator).map(s => s.trim()).filter(Boolean)[0];
    if (first) return getImageUrl(first, fallback);
  }

  // 3. Single image property
  if (product.image && typeof product.image === 'string' && product.image.trim()) {
    return getImageUrl(product.image, fallback);
  }
  if (product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.trim()) {
    return getImageUrl(product.imageUrl, fallback);
  }

  return fallback;
};

export default getImageUrl;
