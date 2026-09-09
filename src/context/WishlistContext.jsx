import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { readStorage, writeStorage } from '../utils/storage.js';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'wishlist';

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => readStorage(STORAGE_KEY, []));

  const persist = useCallback((nextItems) => {
    setItems(nextItems);
    writeStorage(STORAGE_KEY, nextItems);
    return nextItems;
  }, []);

  const isWishlisted = useCallback(
    (productId) => items.some((item) => item.id === productId),
    [items],
  );

  const toggleItem = useCallback(
    (product) => {
      if (!product?.id) {
        return items;
      }
      const exists = items.some((item) => item.id === product.id);
      return persist(exists ? items.filter((item) => item.id !== product.id) : [...items, product]);
    },
    [items, persist],
  );

  const replaceItems = useCallback((nextItems) => persist(nextItems), [persist]);
  const removeItem = useCallback(
    (productId) => persist(items.filter((item) => item.id !== productId)),
    [items, persist],
  );

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      isWishlisted,
      toggleItem,
      replaceItems,
      removeItem,
    }),
    [items, isWishlisted, toggleItem, replaceItems, removeItem],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
