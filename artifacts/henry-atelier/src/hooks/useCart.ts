import { useState, useCallback, useEffect } from "react";
import type { CartItem, Product } from "@/types";
import {
  getCart,
  addToCart as doAdd,
  removeFromCart as doRemove,
  updateQuantity as doUpdate,
  clearCart as doClear,
  getCartTotal,
  getCartCount,
} from "@/lib/cart";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return getCart();
    } catch {
      return [];
    }
  });

  // Sync cart from localStorage on window focus (cross-tab support)
  useEffect(() => {
    const handleFocus = () => {
      try {
        setItems(getCart());
      } catch {
        // ignore
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const addToCart = useCallback((product: Product) => {
    const updated = doAdd(product);
    setItems(updated);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    const updated = doRemove(productId);
    setItems(updated);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const updated = doUpdate(productId, quantity);
    setItems(updated);
  }, []);

  const clearCart = useCallback(() => {
    doClear();
    setItems([]);
  }, []);

  const total = getCartTotal(items);
  const count = getCartCount(items);

  return { items, total, count, addToCart, removeFromCart, updateQuantity, clearCart };
}
