import type { Product, Order, ContactMessage, AppSettings } from "@/types";

// Legacy localStorage products (fallback only)
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_CONTACTS: ContactMessage[] = [];

export const DEFAULT_SETTINGS: AppSettings = {
  whatsapp_phone: "5511999999999",
  contact_email: "contato@henryatelier.com.br",
  contact_phone: "(11) 99999-9999",
  instagram_url: "https://instagram.com/henryatelier",
  // Legacy
  whatsappPhone: "5511999999999",
  contactEmail: "contato@henryatelier.com.br",
  contactPhone: "(11) 99999-9999",
};

export const AROMAS = [
  { name: "Baunilha", icon: "01" },
  { name: "Lavanda Suave", icon: "02" },
  { name: "Canela & Maçã", icon: "03" },
  { name: "Capim Limão", icon: "04" },
  { name: "Coco & Açúcar", icon: "05" },
  { name: "Algodão", icon: "06" },
  { name: "Flor de Cerejeira", icon: "07" },
];

export const CATEGORY_LABELS: Record<string, string> = {
  atelier: "Linha Atelier",
  aromas: "Aromas",
  "henry-home": "Henry Home",
  "don-henry": "Don Henry",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  registered: "Registrado",
  paid: "Pago",
  processing: "Processando",
  shipped: "Enviado",
  in_transit: "Em Trânsito",
  delivered: "Entregue",
  canceled: "Cancelado",
  refunded: "Reembolsado",
};
