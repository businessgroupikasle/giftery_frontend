import { test, expect } from '@playwright/test';
import { mockApi, seedCart, seedStorage } from './helpers/app.js';

test('cart pricing follows dashboard shipping and GST settings', async ({ page }) => {
  await seedStorage(page, {
    store_basic_settings: {
      freeShippingThreshold: '999',
      standardShippingFee: '99',
      taxPercentage: '18',
    },
  });
  await seedCart(page, [{ id: 'product-1', name: 'Premium Gift', price: 1299, quantity: 1 }]);
  await mockApi(page);
  await page.goto('/cart');

  const summary = page.getByText('Order Summary').locator('..');
  await expect(summary).toContainText('Subtotal (1 Items)');
  await expect(summary).toContainText('₹1,299.00');
  await expect(summary).toContainText('Shipping');
  await expect(summary).toContainText('FREE');
  await expect(summary).toContainText('GST (18%)');
  await expect(summary).toContainText('₹233.82');
});

test('cart applies the dashboard standard fee below its free-shipping threshold', async ({ page }) => {
  await seedStorage(page, {
    store_basic_settings: {
      freeShippingThreshold: '999',
      standardShippingFee: '99',
      taxPercentage: '18',
    },
  });
  await seedCart(page, [{ id: 'product-1', name: 'Small Gift', price: 799, quantity: 1 }]);
  await mockApi(page);
  await page.goto('/cart');

  const summary = page.getByText('Order Summary').locator('..');
  await expect(summary).toContainText('₹99');
  await expect(summary).toContainText('₹1,041.82');
  await expect(summary).toContainText('GST (18%)');
});
