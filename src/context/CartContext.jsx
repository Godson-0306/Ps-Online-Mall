import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { calculateCartTotals } from '../utils/cartModel.js';
import { readStorage, writeStorage } from '../utils/storage.js';

const CartContext = createContext(null);
const STORAGE_KEY = 'cart';

function itemKey(productId, color, size) {
  return `${productId}::${color || 'Default'}::${size || 'One Size'}`;
}

function normalizeItem(item) {
  return {
    id: item.id || itemKey(item.productId || item.product?.id, item.color, item.size),
    productId: item.productId || item.product?.id,
    product: item.product,
    quantity: Math.max(1, Number(item.quantity) || 1),
    color: item.color || item.product?.colors?.[0] || 'Default',
    size: item.size || item.product?.sizes?.[0] || 'One Size',
    saved: Boolean(item.saved),
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStorage(STORAGE_KEY, []).map(normalizeItem));

  const persist = useCallback((nextItems) => {
    const normalized = nextItems.map(normalizeItem);
    setItems(normalized);
    writeStorage(STORAGE_KEY, normalized);
    return normalized;
  }, []);

  const addItem = useCallback(
    (product, { quantity = 1, color, size } = {}) => {
      const selectedColor = color || product.colors?.[0] || 'Default';
      const selectedSize = size || product.sizes?.[0] || 'One Size';
      const id = itemKey(product.id, selectedColor, selectedSize);
      const existing = items.find((item) => item.id === id);
      const next = existing
        ? items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + quantity, saved: false } : item,
          )
        : [
            ...items,
            normalizeItem({
              id,
              productId: product.id,
              product,
              quantity,
              color: selectedColor,
              size: selectedSize,
            }),
          ];
      persist(next);
      return next;
    },
    [items, persist],
  );

  const updateQuantity = useCallback(
    (id, quantity) => {
      persist(
        items.map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item,
        ),
      );
    },
    [items, persist],
  );

  const removeItem = useCallback(
    (id) => {
      persist(items.filter((item) => item.id !== id));
    },
    [items, persist],
  );

  const saveForLater = useCallback(
    (id) => {
      persist(items.map((item) => (item.id === id ? { ...item, saved: true } : item)));
    },
    [items, persist],
  );

  const replaceItems = useCallback(
    (nextItems) => persist(nextItems),
    [persist],
  );

  const clearCart = useCallback(() => persist([]), [persist]);

  const activeItems = useMemo(() => items.filter((item) => !item.saved), [items]);
  const count = useMemo(
    () => activeItems.reduce((total, item) => total + item.quantity, 0),
    [activeItems],
  );

  const value = useMemo(
    () => ({
      items,
      activeItems,
      count,
      addItem,
      updateQuantity,
      removeItem,
      saveForLater,
      replaceItems,
      clearCart,
      totalsFor: (coupon) => calculateCartTotals(activeItems, coupon),
    }),
    [
      items,
      activeItems,
      count,
      addItem,
      updateQuantity,
      removeItem,
      saveForLater,
      replaceItems,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
