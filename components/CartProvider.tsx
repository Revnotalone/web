"use client";
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import type { CartItem } from "@/lib/types";

const KEY = "aipi-cart";
type Ctx = {
  items: CartItem[]; count: number; subtotal: number;
  add: (i: Omit<CartItem, "key">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void; clear: () => void;
};
const CartCtx = createContext<Ctx>(null as unknown as Ctx);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setItems(JSON.parse(raw)); } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items, ready]);

  const add = useCallback((i: Omit<CartItem, "key">) => {
    const key = [i.id, i.size, i.color].join("|");
    setItems((prev) => {
      const ex = prev.find((p) => p.key === key);
      if (ex) return prev.map((p) => (p.key === key ? { ...p, qty: Math.min(p.max, p.qty + i.qty) } : p));
      return [...prev, { ...i, key }];
    });
  }, []);
  const setQty = (key: string, qty: number) =>
    setItems((p) => p.map((x) => (x.key === key ? { ...x, qty: Math.max(1, Math.min(x.max, qty)) } : x)));
  const remove = (key: string) => setItems((p) => p.filter((x) => x.key !== key));
  const clear = () => setItems([]);

  const count = items.reduce((a, b) => a + b.qty, 0);
  const subtotal = items.reduce((a, b) => a + b.qty * b.price, 0);
  return <CartCtx.Provider value={{ items, count, subtotal, add, setQty, remove, clear }}>{children}</CartCtx.Provider>;
}
