import { clearGetCache } from '@api/axiosInstance';

// Pages refetch on the window 'products_updated' event, but window events stay
// inside one tab. This bridge relays the event to other open tabs (e.g. admin
// saves in the dashboard tab -> storefront tab refreshes its product lists).
const EVENT = 'products_updated';
const CHANNEL = 'giftery-products-sync';

export const initProductsSync = () => {
  if (typeof window === 'undefined' || typeof window.BroadcastChannel === 'undefined') return;

  const channel = new window.BroadcastChannel(CHANNEL);

  window.addEventListener(EVENT, (event) => {
    if (event.detail?.fromOtherTab) return;
    channel.postMessage({ type: EVENT });
  });

  channel.onmessage = ({ data }) => {
    if (data?.type !== EVENT) return;
    clearGetCache();
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { fromOtherTab: true } }));
  };
};
