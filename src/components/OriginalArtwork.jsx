import { useEffect, useState } from 'react';
import env from '@config/env';
import { getToken } from '@utils/storage';

export default function OriginalArtwork({ assetId, className }) {
  const [artwork, setArtwork] = useState({ id: null, url: '', error: false });

  useEffect(() => {
    const controller = new AbortController();
    let url;
    const token = getToken();
    if (!assetId || !token) {
      setArtwork({ id: assetId, url: '', error: true });
      return () => controller.abort();
    }
    setArtwork({ id: assetId, url: '', error: false });
    fetch(`${env.API_BASE_URL.replace(/\/$/, '')}/api/customizations/assets/${encodeURIComponent(assetId)}`, {
      headers: { Authorization: `Bearer ${token}` }, credentials: 'include', signal: controller.signal,
    }).then((response) => {
      if (!response.ok || !/^image\/(png|jpeg|webp)(?:;|$)/i.test(response.headers.get('content-type') || '')) throw new Error('Artwork unavailable');
      return response.blob();
    }).then((blob) => {
      if (controller.signal.aborted) return;
      url = URL.createObjectURL(blob);
      setArtwork({ id: assetId, url, error: false });
    }).catch(() => {
      if (!controller.signal.aborted) setArtwork({ id: assetId, url: '', error: true });
    });
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [assetId]);

  if (artwork.id !== assetId || (!artwork.url && !artwork.error)) return <span>Loading original artwork...</span>;
  if (artwork.error) return <span>Original artwork unavailable.</span>;
  return <a className={className} href={artwork.url} target="_blank" rel="noopener noreferrer">Open original artwork</a>;
}
