import { createClient } from "@supabase/supabase-js";

const configuredSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseUrl = configuredSupabaseUrl && /^https?:\/\//i.test(configuredSupabaseUrl)
  ? configuredSupabaseUrl
  : "https://henry-atelier.invalid";
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || "henry-atelier-preview";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: "pkce",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ── Products ──────────────────────────────────────────
export async function fetchProducts(category?: string) {
  let query = supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) console.error("fetchProducts:", error);
  return data ?? [];
}

export async function fetchProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error) console.error("fetchProductById:", error);
  return data;
}

export async function createProductDB(product: {
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  image_url: string;
  images?: string[];
  stock?: number;
  featured?: boolean;
  notes_top?: string;
  notes_heart?: string;
  notes_base?: string;
  fixation?: string;
  projection?: string;
  gender?: string;
  volume_ml?: number;
}) {
  const { data, error } = await supabase.from("products").insert([product]).select().single();
  if (error) throw error;
  return data;
}

export async function updateProductDB(id: string, product: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("products")
    .update({ ...product, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProductDB(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

// ── Orders ────────────────────────────────────────────
export async function createOrderDB(order: {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  customer_zip?: string;
  user_id?: string;
  items: unknown[];
  subtotal: number;
  shipping?: number;
  discount?: number;
  total: number;
  payment_method?: string;
  coupon_code?: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from("orders")
    .insert([{ ...order, status: "pending", payment_status: "pending" }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchOrders(userId?: string) {
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) console.error("fetchOrders:", error);
  return data ?? [];
}

export async function fetchAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) console.error("fetchAllOrders:", error);
  return data ?? [];
}

export async function updateOrderStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Contacts ──────────────────────────────────────────
export async function createContactDB(contact: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const { data, error } = await supabase.from("contacts").insert([contact]).select().single();
  if (error) throw error;
  return data;
}

export async function fetchContactsDB() {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) console.error("fetchContactsDB:", error);
  return data ?? [];
}

export async function deleteContactDB(id: string) {
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw error;
}

// ── Settings ──────────────────────────────────────────
export async function fetchSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("settings").select("*");
  if (error) {
    console.error("fetchSettings:", error);
    return {};
  }
  return Object.fromEntries((data ?? []).map((row: { key: string; value: string }) => [row.key, row.value]));
}

export async function upsertSetting(key: string, value: string) {
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}

export async function upsertSettings(settings: Record<string, string>) {
  const rows = Object.entries(settings)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }));

  if (rows.length === 0) return;

  console.log("[upsertSettings] Salvando", rows.length, "configurações...");

  const { error } = await supabase
    .from("settings")
    .upsert(rows, { onConflict: "key" });

  if (error) {
    console.error("[upsertSettings] Erro:", error.message, error.code, error.details);
    throw new Error(error.message ?? "Erro ao salvar configurações");
  }

  console.log("[upsertSettings] Configurações salvas com sucesso!");
}

// ── Coupons ───────────────────────────────────────────
export async function validateCoupon(code: string, orderTotal: number) {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("active", true)
    .single();
  if (error || !data) return null;
  if (data.min_order && orderTotal < data.min_order) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  if (data.max_uses && data.uses_count >= data.max_uses) return null;
  return data as {
    id: string;
    code: string;
    type: "percent" | "fixed";
    value: number;
    min_order: number;
  };
}

// ── Reviews ───────────────────────────────────────────
export async function fetchProductReviews(productId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("approved", true)
    .order("created_at", { ascending: false });
  if (error) console.error("fetchProductReviews:", error);
  return data ?? [];
}

export async function createReviewDB(review: {
  product_id: string;
  name: string;
  email?: string;
  rating: number;
  comment?: string;
}) {
  const { data, error } = await supabase.from("reviews").insert([review]).select().single();
  if (error) throw error;
  return data;
}

// ── Banners ───────────────────────────────────────────
export async function fetchBanners() {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) console.error("fetchBanners:", error);
  return data ?? [];
}
