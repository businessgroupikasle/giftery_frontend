import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser, seedStorage } from './helpers/app.js';

test('customer can review and download a detailed invoice', async ({ page }) => {
  await seedAuthenticatedUser(page);
  await seedStorage(page, {
    giftery_orders: [{
      id: 'order-1001',
      orderId: 'ORD-1001',
      createdAt: '2026-10-03T08:00:00.000Z',
      status: 'CONFIRMED',
      customerEmail: 'test@example.com',
      paymentMethod: 'razorpay',
      paymentStatus: 'PAID',
      transactionId: 'pay_1001',
      subtotal: 1598,
      discountAmount: 100,
      shippingFee: 0,
      totalAmount: 1498,
      items: [{ id: 'toy-1', name: 'Cuddly Teddy Bear', price: 799, quantity: 2, sku: 'TEDDY-01', variant: 'Large - Brown', image: '/placeholder-product.png' }],
      shippingAddress: {
        fullName: 'Test User', email: 'test@example.com', phone: '9876543210',
        addressLine1: '12 Gift Street', city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641001', country: 'India',
      },
    }],
  });
  await mockApi(page);
  await page.goto('/orders');

  await page.getByRole('button', { name: /view details/i }).click();
  const invoice = page.getByRole('dialog', { name: /tax invoice/i });
  await expect(invoice).toBeVisible();
  await expect(invoice).toContainText('Product Details');
  await expect(invoice).toContainText('Unit Price');
  await expect(invoice).toContainText('Line Total');
  await expect(invoice).toContainText('Cuddly Teddy Bear');
  await expect(invoice).toContainText('SKU: TEDDY-01');
  await expect(invoice).toContainText('Variant: Large - Brown');
  await expect(invoice).toContainText('₹1,598.00');
  await expect(invoice).toContainText('-₹100.00');
  await expect(invoice).toContainText('₹1,498.00');
  await expect(invoice).toContainText('RAZORPAY');
  await expect(invoice).toContainText('pay_1001');

  const downloadPromise = page.waitForEvent('download');
  await invoice.getByRole('button', { name: /download invoice/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^invoice-.*\.html$/);
});
