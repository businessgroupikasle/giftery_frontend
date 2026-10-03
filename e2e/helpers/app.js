export const mockApi = async (page, options = {}) => {
  const {
    maintenanceMode = false,
    products = [],
    product = null,
    orderStatus = 200,
    order = { id: 'order-1001', orderId: 'ORD-1001', status: 'PENDING' },
  } = options;

  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (path.endsWith('/settings')) {
      await route.fulfill({ json: { maintenanceMode, storeName: 'GIFTERY' } });
      return;
    }

    if (/\/products\/[^/]+$/.test(path) && product) {
      await route.fulfill({ json: { product } });
      return;
    }

    if (path.endsWith('/products')) {
      await route.fulfill({ json: { products } });
      return;
    }

    if (path.endsWith('/orders') && route.request().method() === 'POST') {
      await route.fulfill({
        status: orderStatus,
        json: orderStatus >= 400 ? { message: 'Order service unavailable' } : { order },
      });
      return;
    }

    if (path.includes('/auth/login')) {
      await route.fulfill({ status: 401, json: { message: 'Invalid username or password.' } });
      return;
    }

    await route.fulfill({ json: { data: [] } });
  });
};

export const seedStorage = async (page, values) => {
  await page.addInitScript((entries) => {
    Object.entries(entries).forEach(([key, value]) => {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    });
  }, values);
};

export const seedAuthenticatedUser = async (page, role = 'USER') => {
  await seedStorage(page, {
    ec_access_token: 'test-access-token',
    ec_user: { id: 'user-1', name: 'Test User', email: 'test@example.com', role },
  });
};

export const seedCart = async (page, items) => {
  await seedStorage(page, {
    giftery_cart_state: {
      items,
      totalQuantity: items.length,
      totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    },
  });
};

export const collectPageErrors = (page) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
};