import { useCallback, useEffect, useRef, useState } from 'react';
import { customizationService } from '@services/customizationService';

/**
 * Private artwork needs the customer's token, so it is fetched as a blob and shown through
 * an object URL. URLs are cached per asset for the life of the studio.
 */
export default function useAssetUrls() {
  const cache = useRef(new Map());
  const [, rerender] = useState(0);

  const ensure = useCallback((id) => {
    const known = cache.current.get(id);
    if (known) return known.promise;
    const entry = { url: null, promise: null };
    entry.promise = customizationService.fetchAssetBlob(id).then((blob) => {
      entry.url = URL.createObjectURL(blob);
      rerender((count) => count + 1);
      return entry.url;
    }).catch((error) => {
      cache.current.delete(id);
      throw error;
    });
    cache.current.set(id, entry);
    return entry.promise;
  }, []);

  const getUrl = useCallback((id) => cache.current.get(id)?.url || null, []);

  useEffect(() => () => {
    cache.current.forEach((entry) => { if (entry.url) URL.revokeObjectURL(entry.url); });
    cache.current.clear();
  }, []);

  return { ensure, getUrl };
}
