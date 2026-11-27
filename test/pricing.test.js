import test from 'node:test';
import assert from 'node:assert/strict';
import { getPriceSavings } from '../src/utils/formatters.js';

test('calculates savings amount and rounded discount percentage', () => {
  assert.deepEqual(getPriceSavings(750, 1000), { amount: 250, percentage: 25 });
  assert.deepEqual(getPriceSavings('799.50', '999.50'), { amount: 200, percentage: 20 });
});

test('does not expose savings without a genuine higher compare price', () => {
  assert.equal(getPriceSavings(750, null), null);
  assert.equal(getPriceSavings(750, ''), null);
  assert.equal(getPriceSavings(750, 750), null);
  assert.equal(getPriceSavings(750, 700), null);
  assert.equal(getPriceSavings(-1, 1000), null);
  assert.equal(getPriceSavings(750, 'not-a-price'), null);
});
