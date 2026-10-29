export const createCartQueue = () => {
  let tail = Promise.resolve();
  return (operation) => {
    const result = tail.then(operation);
    tail = result.catch(() => {});
    return result;
  };
};

const stableValue = (value) => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
};

export const cartsMatch = (localItems, serverItems) => {
  const signature = (item) => JSON.stringify(stableValue({
    productId: String(item.productId),
    quantity: Number(item.quantity),
    price: Number(item.price),
    customization: item.customization || null,
  }));
  const local = localItems.map(signature).sort();
  const server = serverItems.map(signature).sort();
  return local.length === server.length && local.every((value, index) => value === server[index]);
};

export const checkoutItems = (isBuyNow, items) => isBuyNow ? { items } : {};
