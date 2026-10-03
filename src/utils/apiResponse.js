const ENVELOPE_KEYS = new Set(['data', 'success', 'message', 'status', 'statusCode', 'meta']);

export const unwrapApiData = (response) => {
  let value = response;

  while (value && typeof value === 'object' && !Array.isArray(value) && 'data' in value) {
    const keys = Object.keys(value);
    const isEnvelope = keys.every((key) => ENVELOPE_KEYS.has(key));
    if (!isEnvelope) break;
    value = value.data;
  }

  return value;
};