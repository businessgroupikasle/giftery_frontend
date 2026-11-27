import test from 'node:test';
import assert from 'node:assert/strict';
import { dateRangeToBounds, describeDateRange } from '../src/utils/dateRange.js';

const now = new Date(2026, 10, 27, 15, 30); // 27 Nov 2026, 3:30 pm local

test('presets match the dashboard filter day boundaries', () => {
  assert.deepEqual(dateRangeToBounds('Today', now), { from: new Date(2026, 10, 27), to: new Date(2026, 10, 27, 23, 59, 59, 999) });
  assert.deepEqual(dateRangeToBounds('Yesterday', now), { from: new Date(2026, 10, 26), to: new Date(new Date(2026, 10, 27).getTime() - 1) });
  assert.deepEqual(dateRangeToBounds('Last 30 Days', now), { from: new Date(now.getTime() - 30 * 864e5), to: now });
  assert.deepEqual(dateRangeToBounds('This Month', now), { from: new Date(2026, 10, 1), to: new Date(2026, 10, 27, 23, 59, 59, 999) });
  assert.deepEqual(dateRangeToBounds('Last Month', now), { from: new Date(2026, 9, 1), to: new Date(2026, 10, 0, 23, 59, 59, 999) });
});

test('custom ranges cover whole local days', () => {
  assert.deepEqual(dateRangeToBounds('2026-11-01 - 2026-11-15', now), { from: new Date(2026, 10, 1), to: new Date(2026, 10, 15, 23, 59, 59, 999) });
  assert.deepEqual(dateRangeToBounds({ startDate: '2026-11-03', endDate: '' }, now), { from: new Date(2026, 10, 3) });
});

test('no filter, or an unfinished custom range, means all time', () => {
  for (const range of [undefined, null, '', 'All Time', 'Custom Range', 'nonsense']) {
    assert.deepEqual(dateRangeToBounds(range, now), {}, String(range));
  }
  assert.equal(describeDateRange('Custom Range'), 'All time');
  assert.equal(describeDateRange('Last 7 Days'), 'Last 7 Days');
  assert.equal(describeDateRange('2026-11-01 - 2026-11-15'), '2026-11-01 – 2026-11-15');
});
