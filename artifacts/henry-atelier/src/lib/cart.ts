import type { CartItem, Product } from "@/types";

const CART_KEY = "ha_cart";

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (raw) return JSON.parse(raw) as CartItem[];
  } catch {
    // ignore
  }
  return [];
}

function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(product: Product): CartItem[] {
  const items = getCart();
  const existing = items.find((i) => i.product.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    items.push({ product, quantity: 1 });
  }
  saveCart(items);
  return [...items];
}

export function removeFromCart(productId: string): CartItem[] {
  const items = getCart().filter((i) => i.product.id !== productId);
  saveCart(items);
  return [...items];
}

export function updateQuantity(productId: string, quantity: number): CartItem[] {
  let items = getCart();
  if (quantity <= 0) {
    items = items.filter((i) => i.product.id !== productId);
  } else {
    const item = items.find((i) => i.product.id === productId);
    if (item) item.quantity = quantity;
  }
  saveCart(items);
  return [...items];
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
