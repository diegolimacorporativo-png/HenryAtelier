// ── Product ───────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  imageUrl: string;
  image_url?: string;
  images?: string[];
  stock?: number;
  featured?: boolean;
  sku?: string;
  // Fragrance
  notes_top?: string;
  notes_heart?: string;
  notes_base?: string;
  fixation?: string;
  projection?: string;
  similar_to?: string;
  volume_ml?: number;
  gender?: string;
  brand?: string;
}

// ── Cart ──────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

// ── Customer / Auth ───────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface AdminUser {
  email: string;
  role: "admin";
}

export type AuthState =
  | { type: "customer"; user: Customer }
  | { type: "admin"; user: AdminUser }
  | { type: "none" };

// ── Order ─────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "registered"
  | "paid"
  | "processing"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "canceled"
  | "refunded";

export interface Order {
  id: string;
  order_number?: string;
  customerName: string;
  customer_name?: string;
  customerEmail: string;
  customer_email?: string;
  customerPhone: string;
  customer_phone?: string;
  customerAddress: string;
  customer_address?: string;
  items: CartItem[];
  subtotal?: number;
  shipping?: number;
  discount?: number;
  total: number;
  status: OrderStatus | "pendente" | "confirmado" | "enviado" | "entregue" | "cancelado";
  payment_method?: string;
  coupon_code?: string;
  tracking_code?: string;
  whatsapp_sent?: boolean;
  createdAt: string;
  created_at?: string;
}

// ── DB Order (from Supabase) ──────────────────────────
export interface DBOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  customer_zip?: string;
  user_id?: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: string;
  payment_method?: string;
  payment_status?: string;
  coupon_code?: string;
  notes?: string;
  tracking_code?: string;
  whatsapp_sent?: boolean;
  created_at: string;
  updated_at?: string;
}

// ── Contact ───────────────────────────────────────────
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  read?: boolean;
  replied?: boolean;
  createdAt: string;
  created_at?: string;
}

// ── Settings ──────────────────────────────────────────
export interface AppSettings {
  whatsapp_phone: string;
  contact_email: string;
  contact_phone: string;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  store_name?: string;
  store_tagline?: string;
  pix_discount?: string;
  free_shipping_above?: string;
  address?: string;
  business_hours?: string;
  primary_color?: string;
  // Legacy support
  whatsappPhone?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// ── Coupon ────────────────────────────────────────────
export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_order?: number;
  max_uses?: number;
  uses_count?: number;
  active?: boolean;
  expires_at?: string;
}

// ── Review ────────────────────────────────────────────
export interface Review {
  id: string;
  product_id: string;
  name: string;
  email?: string;
  rating: number;
  comment?: string;
  approved?: boolean;
  created_at: string;
}

// ── Banner ────────────────────────────────────────────
export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  button_text?: string;
  active?: boolean;
  sort_order?: number;
}
