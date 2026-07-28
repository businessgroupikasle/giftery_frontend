/**
 * messages.js — App-wide UI message constants
 */
export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Welcome back! You are now logged in.',
    LOGOUT_SUCCESS: 'You have been logged out.',
    REGISTER_SUCCESS: 'Account created successfully!',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  },
  CART: {
    ADDED: 'Item added to cart!',
    REMOVED: 'Item removed from cart.',
    CLEARED: 'Cart cleared.',
    EMPTY: 'Your cart is empty.',
  },
  WISHLIST: {
    ADDED: 'Added to wishlist!',
    REMOVED: 'Removed from wishlist.',
  },
  ORDER: {
    PLACED: 'Order placed successfully!',
    CANCELLED: 'Order has been cancelled.',
  },
  GENERIC: {
    ERROR: 'Something went wrong. Please try again.',
    LOADING: 'Loading...',
    NO_RESULTS: 'No results found.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
  },
};
