const DEFAULT_CACHE_TTL_MS = 5000;

export const stableSerialize = (value) => {
  if (value === undefined) return '';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`).join(',')}}`;
};

export const parseRetryAfter = (value, now = Date.now()) => {
  if (value === undefined || value === null || value === '') return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds * 1000);
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return null;
  return Math.max(0, timestamp - now);
};

export const waitFor = (delay, signal) => new Promise((resolve, reject) => {
  if (signal?.aborted) {
    reject(Object.assign(new Error('Request cancelled'), { code: 'ERR_CANCELED' }));
    return;
  }
  const timer = setTimeout(resolve, delay);
  signal?.addEventListener('abort', () => {
    clearTimeout(timer);
    reject(Object.assign(new Error('Request cancelled'), { code: 'ERR_CANCELED' }));
  }, { once: true });
});

export class GetRequestStore {
  constructor(cacheTtlMs = DEFAULT_CACHE_TTL_MS) {
    this.cacheTtlMs = cacheTtlMs;
    this.inFlight = new Map();
    this.cache = new Map();
  }

  run(key, loader, cacheable = false) {
    const cached = this.cache.get(key);
    if (cacheable && cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.value);
    if (cached) this.cache.delete(key);
    if (this.inFlight.has(key)) return this.inFlight.get(key);

    const request = Promise.resolve().then(loader).then((value) => {
      if (cacheable) this.cache.set(key, { value, expiresAt: Date.now() + this.cacheTtlMs });
      return value;
    }).finally(() => this.inFlight.delete(key));
    this.inFlight.set(key, request);
    return request;
  }

  clear() {
    this.cache.clear();
  }
}
