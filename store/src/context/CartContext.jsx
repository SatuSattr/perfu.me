import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'perfu.me:cart';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}
function save(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('perfu:cart', { detail: cart }));
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => load());

  useEffect(() => {
    const handler = (e) => setCart(e.detail ?? load());
    window.addEventListener('perfu:cart', handler);
    const onStorage = (e) => { if (e.key === STORAGE_KEY) setCart(load()); };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('perfu:cart', handler);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const cartCount = cart.reduce((s, i) => s + (i.qty ?? 1), 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const addItem = useCallback((item) => {
    const current = load();
    const key = JSON.stringify(item.selectedOptions ?? {});
    const existing = current.find((i) => i.id === item.id && JSON.stringify(i.selectedOptions ?? {}) === key);
    if (existing) existing.qty += item.qty;
    else current.push(item);
    save(current);
    setCart([...current]);
  }, []);

  const removeItem = useCallback((target) => {
    const current = load().filter((i) => !(i.id === target.id && JSON.stringify(i.selectedOptions) === JSON.stringify(target.selectedOptions)));
    save(current);
    setCart(current);
  }, []);

  const updateQty = useCallback((target, qty) => {
    const current = load();
    const found = current.find((i) => i.id === target.id && JSON.stringify(i.selectedOptions) === JSON.stringify(target.selectedOptions));
    if (found) {
      found.qty = Math.max(1, qty);
      save(current);
      setCart([...current]);
    }
  }, []);

  const clear = useCallback(() => {
    save([]);
    setCart([]);
  }, []);

  return (
    <CartContext.Provider value={{ cart, cartCount, subtotal, addItem, removeItem, updateQty, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
