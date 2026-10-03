/**
 * analytics.js — Google Analytics 4 (GA4) & Google Tag Manager (GTM) Tracking Utility
 * Provides methods for page views, user interactions, and standard e-commerce events.
 */

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-GIFTERY2026';
const GTM_ID = import.meta.env.VITE_GTM_ID || 'GTM-GIFTERY1';

/**
 * Initialize Google Analytics / GTM if not already present on window
 */
export const initAnalytics = () => {
  if (typeof window === 'undefined') return;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  // Configure default measurement ID if gtag is loaded
  if (typeof window.gtag === 'function') {
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      send_page_view: false, // We handle manual SPA page views on route changes
    });
  }
};

/**
 * Track SPA Page Views
 * @param {string} path - current URL path
 * @param {string} title - document title
 */
export const trackPageView = (path = window.location.pathname, title = document.title) => {
  if (typeof window === 'undefined') return;

  // Push to GTM dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'page_view',
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });

  // Call gtag directly if defined
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
      page_location: window.location.href,
    });
  }
};

/**
 * Track Custom Events
 * @param {string} eventName - name of the event
 * @param {Object} eventParams - extra parameters
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...eventParams,
  });

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  }
};

/**
 * Standard E-Commerce Event Trackers
 */
export const trackEcommerce = {
  // 1. View Item (Product Detail Page)
  viewItem: (product) => {
    if (!product) return;
    trackEvent('view_item', {
      currency: 'INR',
      value: product.price || 0,
      items: [
        {
          item_id: String(product.id || product._id || ''),
          item_name: product.name || '',
          item_category: product.category || 'Gifts',
          price: product.price || 0,
          quantity: 1,
        },
      ],
    });
  },

  // 2. Add to Cart
  addToCart: (product, quantity = 1) => {
    if (!product) return;
    trackEvent('add_to_cart', {
      currency: 'INR',
      value: (product.price || 0) * quantity,
      items: [
        {
          item_id: String(product.id || product._id || ''),
          item_name: product.name || '',
          item_category: product.category || 'Gifts',
          price: product.price || 0,
          quantity,
        },
      ],
    });
  },

  // 3. Remove from Cart
  removeFromCart: (product, quantity = 1) => {
    if (!product) return;
    trackEvent('remove_from_cart', {
      currency: 'INR',
      value: (product.price || 0) * quantity,
      items: [
        {
          item_id: String(product.id || product._id || ''),
          item_name: product.name || '',
          item_category: product.category || 'Gifts',
          price: product.price || 0,
          quantity,
        },
      ],
    });
  },

  // 4. Begin Checkout
  beginCheckout: (items = [], totalValue = 0) => {
    trackEvent('begin_checkout', {
      currency: 'INR',
      value: totalValue,
      items: items.map((item) => ({
        item_id: String(item.id || item.productId || ''),
        item_name: item.name || '',
        item_category: item.category || 'Gifts',
        price: item.price || 0,
        quantity: item.quantity || 1,
      })),
    });
  },

  // 5. Purchase Complete
  purchase: (orderId, totalValue, items = []) => {
    trackEvent('purchase', {
      transaction_id: orderId,
      currency: 'INR',
      value: totalValue,
      items: items.map((item) => ({
        item_id: String(item.id || item.productId || ''),
        item_name: item.name || '',
        price: item.price || 0,
        quantity: item.quantity || 1,
      })),
    });
  },

  // 6. Search
  search: (searchTerm) => {
    trackEvent('search', {
      search_term: searchTerm,
    });
  },
};

export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackEcommerce,
};
