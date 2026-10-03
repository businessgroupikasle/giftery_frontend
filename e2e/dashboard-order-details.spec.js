import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser, seedStorage } from './helpers/app.js';

test('dashboard order details shows the complete product and invoice data', async ({ page }) => {
  await seedAuthenticatedUser(page, 'SUPER_ADMIN');
  await seedStorage(page, {
    giftery_cleaned_mock_v2: 'true',
    giftery_orders: [{
      id: 'admin-order-1001',
      orderId: 'ORD-1001',
      createdAt: '2026-10-03T08:00:00.000Z',
      status: 'PROCESSING',
      customerName: 'Sivakumar',
      customerEmail: 'siva@example.com',
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'PENDING',
      subtotal: 1598,
      discountAmount: 100,
      shippingFee: 99,
      totalAmount: 1597,
      items: [{
        id: 'toy-1', name: 'Cuddly Teddy Bear', sku: 'TEDDY-01',
        variant: 'Large - Brown', price: 799, quantity: 2,
        image: '/placeholder-product.png',
      }],
      shippingAddress: {
        fullName: 'Sivakumar', phone: '9798161616', addressLine1: 'AABB',
        city: 'Coimbatore', state: 'Tamil Nadu', pincode: '644001', country: 'India',
      },
    }],
  });
  await mockApi(page);
  await page.goto('/dashboard');

  await page.getByText('Orders', { exact: true }).first().click();
  await page.getByTitle('View Details').click();

  const invoice = page.getByRole('dialog', { name: /tax invoice/i });
  await expect(invoice).toBeVisible();
  await expect(invoice).toContainText('Cuddly Teddy Bear');
  await expect(invoice).toContainText('SKU: TEDDY-01');
  await expect(invoice).toContainText('Variant: Large - Brown');
  await expect(invoice).toContainText('Unit Price');
  await expect(invoice).toContainText('Line Total');
  await expect(invoice).toContainText('CASH ON DELIVERY');
  await expect(invoice).toContainText('Sivakumar');
  await expect(invoice).toContainText('1,597.00');
});
