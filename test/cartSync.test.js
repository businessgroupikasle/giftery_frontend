import test from 'node:test';
import assert from 'node:assert/strict';
import { cartsMatch, checkoutItems, createCartQueue } from '../src/store/slices/cartSync.js';

test('cart operations execute in order even when an operation fails', async () => {
  const enqueue = createCartQueue();
  const events = [];
  let release;
  const first = enqueue(async () => {
    events.push('first start');
    await new Promise((resolve) => { release = resolve; });
    events.push('first end');
    throw new Error('failed');
  });
  const second = enqueue(async () => { events.push('second'); });
  await Promise.resolve();
  assert.deepEqual(events, ['first start']);
  release();
  await assert.rejects(first);
  await second;
  assert.deepEqual(events, ['first start', 'first end', 'second']);
});

test('cart comparison includes quantity, price and customization snapshots', () => {
  const item = { productId: 'p', quantity: 2, price: 50, customization: { text: { value: 'A' }, previewAssetId: 'asset' } };
  assert.equal(cartsMatch([item], [{ ...item, customization: { previewAssetId: 'asset', text: { value: 'A' } } }]), true);
  assert.equal(cartsMatch([item], [{ ...item, quantity: 1 }]), false);
  assert.equal(cartsMatch([item], [{ ...item, price: 51 }]), false);
  assert.equal(cartsMatch([item], [{ ...item, customization: null }]), false);
  assert.equal(cartsMatch([item], []), false);
});

test('cart checkout omits items while buy now sends its item snapshot', () => {
  const items = [{ productId: 'p', customization: { text: 'Gift' } }];
  assert.deepEqual(checkoutItems(false, items), {});
  assert.deepEqual(checkoutItems(true, items), { items });
});
