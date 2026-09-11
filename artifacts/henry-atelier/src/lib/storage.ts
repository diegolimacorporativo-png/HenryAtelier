import type { Product, Order, ContactMessage, AppSettings } from "@/types";
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CONTACTS,
  DEFAULT_SETTINGS,
} from "@/constants";

const PRODUCTS_KEY = "ha_products";
const ORDERS_KEY = "ha_orders";
const CONTACTS_KEY = "ha_contacts";
const SETTINGS_KEY = "ha_settings";

// ---- Products ----
export function getProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (raw) return JSON.parse(raw) as Product[];
  } catch { /* ignore */ }
  const initial = INITIAL_PRODUCTS;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initial));
  return initial;
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function createProduct(product: Omit<Product, "id">): Product {
  const products = getProducts();
  const newProduct: Product = { ...product, id: `p-${Date.now()}` };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id: string, data: Partial<Product>): Product | null {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...data };
  saveProducts(products);
  return products[idx];
}

export function deleteProduct(id: string): void {
  const products = getProducts().filter((p) => p.id !== id);
  saveProducts(products);
}

// ---- Orders ----
export function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) return JSON.parse(raw) as Order[];
  } catch { /* ignore */ }
  const initial = INITIAL_ORDERS;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(initial));
  return initial;
}

export function saveOrder(order: Omit<Order, "id" | "createdAt">): Order {
  const orders = getOrders();
  const newOrder: Order = {
    ...order,
    id: `ord-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return newOrder;
}

// ---- Contacts ----
export function getContacts(): ContactMessage[] {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY);
    if (raw) return JSON.parse(raw) as ContactMessage[];
  } catch { /* ignore */ }
  const initial = INITIAL_CONTACTS;
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(initial));
  return initial;
}

export function saveContact(contact: Omit<ContactMessage, "id" | "createdAt">): ContactMessage {
  const contacts = getContacts();
  const newContact: ContactMessage = {
    ...contact,
    id: `c-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  contacts.unshift(newContact);
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  return newContact;
}

export function deleteContact(id: string): void {
  const contacts = getContacts().filter((c) => c.id !== id);
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

// ---- Settings ----
export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as AppSettings;
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
