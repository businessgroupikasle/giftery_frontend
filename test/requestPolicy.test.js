import test from 'node:test';
import assert from 'node:assert/strict';
import { GetRequestStore, parseRetryAfter, stableSerialize } from '../src/api/requestPolicy.js';

test('deduplicates identical concurrent GET work', async () => {
  const store = new GetRequestStore();
  let calls = 0;
  const loader = async () => { calls += 1; return { ok: true }; };
  const [first, second] = await Promise.all([store.run('user-a|/products', loader), store.run('user-a|/products', loader)]);
  assert.equal(calls, 1);
  assert.deepEqual(first, second);
});

test('keeps authenticated-user request scopes isolated', async () => {
  const store = new GetRequestStore();
  let calls = 0;
  await Promise.all([
    store.run('user-a|/wishlist', async () => ++calls),
    store.run('user-b|/wishlist', async () => ++calls),
  ]);
  assert.equal(calls, 2);
});

test('clears cached GET values after invalidation', async () => {
  const store = new GetRequestStore(1000);
  let calls = 0;
  const loader = async () => ++calls;
  assert.equal(await store.run('anonymous|/products', loader, true), 1);
  assert.equal(await store.run('anonymous|/products', loader, true), 1);
  store.clear();
  assert.equal(await store.run('anonymous|/products', loader, true), 2);
});

test('parses Retry-After seconds and HTTP dates', () => {
  assert.equal(parseRetryAfter('2', 0), 2000);
  assert.equal(parseRetryAfter('Thu, 01 Jan 1970 00:00:03 GMT', 1000), 2000);
  assert.equal(parseRetryAfter('invalid', 0), null);
});

test('normalizes parameter ordering for request keys', () => {
  assert.equal(stableSerialize({ page: 1, sort: 'new' }), stableSerialize({ sort: 'new', page: 1 }));
});
