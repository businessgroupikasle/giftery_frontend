import { test, expect } from '@playwright/test';
import { mockApi, seedAuthenticatedUser, seedCart } from './helpers/app.js';

const item = {
  id: 'product-1', productId: 'product-1', name: 'Gift Box', price: 1000,
  quantity: 1, image: '/placeholder-product.png', maxStock: 10,
};

const fillDeliveryAddress = async (page, phone = '9876543210') => {
  await page.locator('input[name="fullName"]').fill('Test Customer');
  await page.locator('input[name="email"]').fill('customer@example.com');
  await page.locator('input[name="phone"]').fill(phone);
  await page.locator('input[name="pincode"]').fill('600001');
  await page.locator('input[name="addressLine1"]').fill('12 Test Street');
  await page.locator('input[name="city"]').fill('Chennai');
  await page.locator('input[name="state"]').fill('Tamil Nadu');
};

const mockServerCartCheckout = async (page, { orderStatus = 200, order } = {}) => {
  const serverProduct = { id: item.productId, name: item.name, price: item.price, stock: item.maxStock, images: [item.image] };
  let items = [{ id: 'cart-item-1', productId: item.productId, product: serverProduct, quantity: item.quantity }];
  const requests = { orders: [], deletes: 0 };
  await mockApi(page);
  await page.route('**/api/v1/cart', async (route) => {
    if (route.request().method() === 'DELETE') requests.deletes += 1;
    await route.fulfill({ json: { success: true, data: { cart: { items } } } });
  });
  await page.route('**/api/v1/orders', async (route) => {
    requests.orders.push({ body: route.request().postDataJSON(), authorization: route.request().headers().authorization });
    if (orderStatus >= 400) {
      await route.fulfill({ status: orderStatus, json: { message: 'Order service unavailable' } });
      return;
    }
    items = [];
    await route.fulfill({ json: { success: true, data: { order } } });
  });
  return requests;
};

test.describe('Checkout validation and order integrity', () => {
  test('blocks invalid delivery phone numbers', async ({ page }) => {
    await seedCart(page, [item]);
    await mockApi(page);
    await page.goto('/checkout');
    await fillDeliveryAddress(page, '12345');
    await page.getByRole('button', { name: /proceed to payment/i }).click();

    await expect(page.getByText(/valid 10-digit mobile number/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Delivery Address Information/i })).toBeVisible();
  });

  test('creates a COD order only after backend confirmation', async ({ page }) => {
    await seedAuthenticatedUser(page);
    await seedCart(page, [item]);
    const requests = await mockServerCartCheckout(page, { order: { id: 'db-order-1', orderId: 'ORD-2026-0001', status: 'PENDING' } });
    await page.goto('/checkout');
    await fillDeliveryAddress(page);
    await page.getByRole('button', { name: /proceed to payment/i }).click();
    await page.getByText('Cash on Delivery (COD)', { exact: true }).click();
    await page.getByRole('button', { name: /place order via cod/i }).click();

    await expect(page.getByRole('heading', { name: /Thank You For Your Order/i })).toBeVisible();
    await expect(page.getByText(/ORD-2026-0001/)).toBeVisible();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('giftery_orders'))[0].id)).toBe('db-order-1');
    expect(requests.orders).toHaveLength(1);
    expect(requests.orders[0].authorization).toBe('Bearer test-access-token');
    expect(requests.orders[0].body).not.toHaveProperty('items');
    expect(requests.deletes).toBe(0);
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('giftery_cart_state'))?.items)).toEqual([]);
  });

  test('keeps the cart when backend order creation fails', async ({ page }) => {
    await seedAuthenticatedUser(page);
    await seedCart(page, [item]);
    const requests = await mockServerCartCheckout(page, { orderStatus: 503 });
    await page.goto('/checkout');
    await fillDeliveryAddress(page);
    await page.getByRole('button', { name: /proceed to payment/i }).click();
    await page.getByText('Cash on Delivery (COD)', { exact: true }).click();
    await page.getByRole('button', { name: /place order via cod/i }).click();

    await expect(page.getByText(/Order service unavailable/i).first()).toBeVisible();
    expect(requests.orders).toHaveLength(1);
    expect(requests.orders[0].body).not.toHaveProperty('items');
    expect(requests.deletes).toBe(0);
    const persistedCart = await page.evaluate(() => JSON.parse(localStorage.getItem('giftery_cart_state')));
    expect(persistedCart.items).toHaveLength(1);
    await expect(page.getByRole('heading', { name: /Select Payment Option/i })).toBeVisible();
  });
});
