import { useEffect, useState } from 'react';
import env from '@config/env';
import { getToken } from '@utils/storage';
import { getImageUrl } from '@utils/imageUrl';

const placeholder = (label) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" fill="#f1f5f9"/><text x="80" y="75" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#475569"><tspan x="80">Preview</tspan><tspan x="80" dy="20">${label}</tspan></text></svg>`)}`;

const PrivateImage = ({ assetId, customized = false, src, alt, className }) => {
  const [preview, setPreview] = useState({ id: null, url: '', status: 'loading' });

  useEffect(() => {
    setPreview({ id: assetId, url: '', status: assetId ? 'loading' : 'error' });
    const token = getToken();
    if (!assetId) return undefined;
    if (!token) {
      setPreview({ id: assetId, url: '', status: 'error' });
      return undefined;
    }

    const controller = new AbortController();
    let objectUrl;
    fetch(`${env.API_BASE_URL.replace(/\/$/, '')}/api/customizations/assets/${encodeURIComponent(assetId)}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
      signal: controller.signal,
    }).then((response) => {
      if (!response.ok) throw new Error('Private image unavailable');
      return response.blob();
    }).then((blob) => {
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(blob);
      setPreview({ id: assetId, url: objectUrl, status: 'ready' });
    }).catch(() => {
      if (!controller.signal.aborted) setPreview({ id: assetId, url: '', status: 'error' });
    });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [assetId]);

  const isPrivate = customized || Boolean(assetId);
  const status = preview.id === assetId ? preview.status : 'loading';
  const image = isPrivate ? (status === 'ready' ? preview.url : placeholder(status === 'loading' ? 'loading' : 'unavailable')) : getImageUrl(src);
  return <img className={className} src={image} alt={isPrivate && status !== 'ready' ? `Preview ${status === 'loading' ? 'loading' : 'unavailable'} for ${alt || 'customized product'}` : alt} onError={(event) => {
    if (isPrivate) {
      setPreview({ id: assetId, url: '', status: 'error' });
      return;
    }
    event.currentTarget.onerror = null;
    event.currentTarget.src = '/images/product-placeholder.svg';
  }} />;
};

export default PrivateImage;
