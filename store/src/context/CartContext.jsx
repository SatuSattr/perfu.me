import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'perfu.me:cart';

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
    // migrate old /assets/products → /storage/products (deleted static)
    let migrated = false;
    const out = raw.map((it) => {
      if (it.image && it.image.startsWith('/assets/products')) {
        migrated = true;
        return { ...it, image: it.image.replace('/assets/products', '/storage/products') };
      }
      return it;
    });
    if (migrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
    }
    return out;
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

  const addItem = useCallback((item, opts = {}) => {
    const current = load();
    const key = JSON.stringify(item.selectedOptions ?? {});
    const maxStock = opts.maxStock ?? item.maxStock ?? null;
    const existing = current.find((i) => i.id === item.id && JSON.stringify(i.selectedOptions ?? {}) === key);
    if (existing) {
      const nextQty = existing.qty + (item.qty ?? 1);
      existing.qty = maxStock ? Math.min(nextQty, maxStock) : nextQty;
      if (maxStock) existing.maxStock = maxStock;
    } else {
      const entry = { ...item, qty: maxStock ? Math.min(item.qty ?? 1, maxStock) : (item.qty ?? 1) };
      if (maxStock) entry.maxStock = maxStock;
      current.push(entry);
    }
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
      const max = found.maxStock ?? null;
      let next = Math.max(1, qty);
      if (max) next = Math.min(next, max);
      found.qty = next;
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
