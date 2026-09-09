import { readStorage, writeStorage } from './storage.js';

const KEY = 'recently-viewed';
const LIMIT = 8;

export function getRecentlyViewedIds() {
  return readStorage(KEY, []);
}

export function recordRecentlyViewed(productId) {
  if (!productId) {
    return getRecentlyViewedIds();
  }

  const next = [productId, ...getRecentlyViewedIds().filter((id) => id !== productId)].slice(
    0,
    LIMIT,
  );
  writeStorage(KEY, next);
  return next;
}
