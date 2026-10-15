import { createContext, useContext, useMemo, useState } from 'react';
const CartContext = createContext(null);
const readCart = () => { try { return JSON.parse(localStorage.getItem('artisan-cart') || '[]'); } catch { return []; } };
export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const save = (next) => { setItems(next); localStorage.setItem('artisan-cart', JSON.stringify(next)); };
  const addItem = (product, quantity = 1) => {
    const current = items.find((item) => item._id === product._id);
    if ((current?.quantity || 0) + quantity > product.stock) throw new Error('That quantity exceeds available stock');
    save(current ? items.map((item) => item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item) : [...items, { ...product, quantity }]);
  };
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) return save(items.filter((item) => item._id !== id));
    const target = items.find((item) => item._id === id);
    if (target && quantity > target.stock) throw new Error('That quantity exceeds available stock');
    save(items.map((item) => item._id === id ? { ...item, quantity } : item));
  };
  const value = useMemo(() => ({ items, addItem, updateQuantity, removeItem: (id) => save(items.filter((item) => item._id !== id)), clearCart: () => save([]), count: items.reduce((n, item) => n + item.quantity, 0), total: items.reduce((n, item) => n + item.quantity * item.price, 0) }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
