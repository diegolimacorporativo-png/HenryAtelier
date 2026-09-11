import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, ShoppingCart, Mail, Settings, Plus, Edit2, Trash2,
  X, Check, Lock, Shield, ExternalLink, TrendingUp, Users,
  Instagram, Facebook, Phone, Globe, ChevronDown, BarChart2,
  RefreshCw, Eye, EyeOff, Search,
} from "lucide-react";
import type { Product, DBOrder, ContactMessage, AppSettings } from "@/types";
import {
  fetchProducts, createProductDB, updateProductDB, deleteProductDB,
  fetchAllOrders, updateOrderStatus,
  fetchContactsDB, deleteContactDB,
  fetchSettings, upsertSettings,
} from "@/lib/supabase";
import { CATEGORY_LABELS } from "@/constants";
import { toast } from "sonner";
import ImageUploader from "@/components/features/ImageUploader";

type AdminTab = "dashboard" | "products" | "orders" | "contacts" | "settings";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente", registered: "Registrado", paid: "Pago",
  processing: "Processando", shipped: "Enviado", in_transit: "Em Trânsito",
  delivered: "Entregue", canceled: "Cancelado", refunded: "Reembolsado",
  pendente: "Pendente", confirmado: "Confirmado", enviado: "Enviado",
  entregue: "Entregue", cancelado: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800", registered: "bg-blue-50 text-blue-700",
  paid: "bg-green-100 text-green-800", processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700", in_transit: "bg-orange-100 text-orange-700",
  delivered: "bg-green-200 text-green-900", canceled: "bg-red-100 text-red-700",
  refunded: "bg-stone-100 text-stone-600",
  pendente: "bg-yellow-100 text-yellow-800", confirmado: "bg-blue-100 text-blue-800",
  enviado: "bg-purple-100 text-purple-800", entregue: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

const ALL_STATUSES = ["pending", "registered", "paid", "processing", "shipped", "in_transit", "delivered", "canceled", "refunded"];

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  original_price: string;
  category: string;
  imageUrl: string;
  stock: string;
  featured: boolean;
  notes_top: string;
  notes_heart: string;
  notes_base: string;
  fixation: string;
  projection: string;
  gender: string;
  volume_ml: string;
}

const defaultProductForm: ProductFormData = {
  name: "", description: "", price: "", original_price: "",
  category: "atelier", imageUrl: "", stock: "0", featured: false,
  notes_top: "", notes_heart: "", notes_base: "",
  fixation: "", projection: "", gender: "Unissex", volume_ml: "",
};

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductFormData>(defaultProductForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showFragrance, setShowFragrance] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [prods, ords, conts, setts] = await Promise.all([
      fetchProducts(),
      fetchAllOrders(),
      fetchContactsDB(),
      fetchSettings(),
    ]);
    setProducts(prods.map((p: Record<string, unknown>) => ({ ...p, imageUrl: (p.image_url as string) ?? "" } as unknown as Product)));
    setOrders(ords as DBOrder[]);
    setContacts(conts.map((c: Record<string, unknown>) => ({ ...c, createdAt: c.created_at as string } as unknown as ContactMessage)));
    setSettings(setts);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  // ── Dashboard Stats ───────────────────────────────
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const ordersThisMonth = orders.filter((o) => {
    const d = new Date(o.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "pendente").length;

  // ── Product CRUD ─────────────────────────────────
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setProductForm(defaultProductForm);
    setShowFragrance(false);
    setShowProductForm(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description ?? "",
      price: product.price.toFixed(2),
      original_price: product.original_price?.toFixed(2) ?? "",
      category: product.category,
      imageUrl: product.image_url ?? product.imageUrl ?? "",
      stock: String(product.stock ?? 0),
      featured: product.featured ?? false,
      notes_top: product.notes_top ?? "",
      notes_heart: product.notes_heart ?? "",
      notes_base: product.notes_base ?? "",
      fixation: product.fixation ?? "",
      projection: product.projection ?? "",
      gender: product.gender ?? "Unissex",
      volume_ml: product.volume_ml ? String(product.volume_ml) : "",
    });
    setShowProductForm(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.description || !productForm.price || !productForm.imageUrl) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const price = parseFloat(productForm.price.replace(",", "."));
    if (isNaN(price) || price <= 0) { toast.error("Digite um preço válido."); return; }
    const data = {
      name: productForm.name,
      description: productForm.description,
      price,
      original_price: productForm.original_price ? parseFloat(productForm.original_price.replace(",", ".")) : undefined,
      category: productForm.category,
      image_url: productForm.imageUrl,
      stock: parseInt(productForm.stock) || 0,
      featured: productForm.featured,
      notes_top: productForm.notes_top || undefined,
      notes_heart: productForm.notes_heart || undefined,
      notes_base: productForm.notes_base || undefined,
      fixation: productForm.fixation || undefined,
      projection: productForm.projection || undefined,
      gender: productForm.gender || undefined,
      volume_ml: productForm.volume_ml ? parseInt(productForm.volume_ml) : undefined,
    };
    setSavingProduct(true);
    try {
      if (editingProduct) {
        await updateProductDB(editingProduct.id, data);
        toast.success("Produto atualizado!");
      } else {
        await createProductDB(data);
        toast.success("Produto criado!");
      }
      await loadAll();
      setShowProductForm(false);
    } catch {
      toast.error("Erro ao salvar produto.");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProductDB(id);
      setProducts((p) => p.filter((x) => x.id !== id));
      setDeleteConfirm(null);
      toast.success("Produto removido.");
    } catch { toast.error("Erro ao remover produto."); }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await deleteContactDB(id);
      setContacts((c) => c.filter((x) => x.id !== id));
      toast.success("Mensagem removida.");
    } catch { toast.error("Erro ao remover."); }
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      await updateOrderStatus(id, status);
      setOrders((ords) => ords.map((o) => o.id === id ? { ...o, status } : o));
      toast.success("Status atualizado!");
    } catch { toast.error("Erro ao atualizar status."); }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await upsertSettings(settings);
      toast.success("Configurações salvas com sucesso!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido ao salvar";
      console.error("[Admin] handleSaveSettings erro:", msg);
      toast.error(`Erro ao salvar: ${msg}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchSearch = !orderSearch || o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) || o.order_number?.includes(orderSearch);
    const matchStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart2 size={17} /> },
    { id: "products", label: "Produtos", icon: <Package size={17} /> },
    { id: "orders", label: "Pedidos", icon: <ShoppingCart size={17} /> },
    { id: "contacts", label: "Contatos", icon: <Mail size={17} /> },
    { id: "settings", label: "Config.", icon: <Settings size={17} /> },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-stone-950 text-white px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-xl">Painel Admin</h1>
          <p className="text-stone-400 text-xs mt-0.5">Henry Atelier & Don Henry</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadAll} className="text-stone-400 hover:text-white p-2 transition-colors" title="Atualizar">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-stone-400 hover:text-white text-sm transition-colors">
            <ExternalLink size={15} /> Ver Site
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-stone-100 px-2 sm:px-6">
        <div className="flex gap-0 sm:gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? "border-gold text-stone-900" : "border-transparent text-stone-500 hover:text-stone-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-stone-500 text-sm">Carregando...</span>
        </div>
      )}

      {!loading && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">

          {/* ── DASHBOARD ── */}
          {activeTab === "dashboard" && (
            <div>
              <h2 className="font-playfair text-2xl text-stone-900 mb-6">Dashboard</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Receita Total", value: `R$ ${totalRevenue.toFixed(2).replace(".", ",")}`, icon: <TrendingUp size={20} className="text-gold" />, bg: "bg-white" },
                  { label: "Total de Pedidos", value: String(orders.length), icon: <ShoppingCart size={20} className="text-blue-500" />, bg: "bg-white" },
                  { label: "Este Mês", value: String(ordersThisMonth), icon: <BarChart2 size={20} className="text-purple-500" />, bg: "bg-white" },
                  { label: "Pendentes", value: String(pendingOrders), icon: <Users size={20} className="text-orange-500" />, bg: pendingOrders > 0 ? "bg-orange-50 border border-orange-100" : "bg-white" },
                ].map((stat) => (
                  <div key={stat.label} className={`${stat.bg} p-5 shadow-sm`}>
                    <div className="flex items-center justify-between mb-2">
                      {stat.icon}
                    </div>
                    <p className="text-2xl font-bold text-stone-900 font-mono">{stat.value}</p>
                    <p className="text-stone-500 text-xs mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white shadow-sm p-5">
                <h3 className="font-playfair text-lg text-stone-900 mb-4">Pedidos Recentes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-100">
                        {["Pedido", "Cliente", "Total", "Status"].map((h) => (
                          <th key={h} className="text-left px-3 py-2 text-xs text-stone-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50">
                          <td className="px-3 py-3 font-mono text-xs text-stone-500">{order.order_number}</td>
                          <td className="px-3 py-3 text-sm text-stone-800">{order.customer_name}</td>
                          <td className="px-3 py-3 text-sm text-gold font-semibold">R$ {order.total.toFixed(2).replace(".", ",")}</td>
                          <td className="px-3 py-3">
                            <span className={`text-xs px-2 py-1 font-medium ${STATUS_COLORS[order.status] ?? "bg-stone-100 text-stone-600"}`}>
                              {STATUS_LABELS[order.status] ?? order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-stone-400 text-sm">Nenhum pedido ainda.</td></tr>}
                    </tbody>
                  </table>
                </div>
                {orders.length > 5 && (
                  <button onClick={() => setActiveTab("orders")} className="mt-4 text-gold text-sm hover:underline">Ver todos os pedidos →</button>
                )}
              </div>
            </div>
          )}

          {/* ── PRODUCTS TAB ── */}
          {activeTab === "products" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-playfair text-2xl text-stone-900">Produtos ({products.length})</h2>
                <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-gold transition-colors">
                  <Plus size={16} /> Novo Produto
                </button>
              </div>
              <div className="bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-100 bg-stone-50">
                        {["Produto", "Categoria", "Preço", "Estoque", "Ações"].map((h, i) => (
                          <th key={h} className={`text-left px-4 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium ${i > 1 && i < 4 ? "hidden md:table-cell" : ""}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={product.image_url ?? product.imageUrl} alt={product.name} className="w-10 h-10 object-cover bg-beige-light flex-shrink-0" />
                              <div>
                                <p className="font-medium text-stone-900 text-sm">{product.name}</p>
                                {product.featured && <span className="text-xs text-gold">Destaque</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1">{CATEGORY_LABELS[product.category] ?? product.category}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <span className="text-gold font-semibold font-mono text-sm">R$ {product.price.toFixed(2).replace(".", ",")}</span>
                              {product.original_price && (
                                <p className="text-stone-400 text-xs line-through">R$ {product.original_price.toFixed(2).replace(".", ",")}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className={`text-xs font-mono ${(product.stock ?? 0) <= 5 ? "text-red-500" : "text-stone-600"}`}>{product.stock ?? 0}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => handleOpenEdit(product)} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors" title="Editar">
                                <Edit2 size={15} />
                              </button>
                              {deleteConfirm === product.id ? (
                                <>
                                  <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-50 transition-colors"><Check size={15} /></button>
                                  <button onClick={() => setDeleteConfirm(null)} className="p-2 text-stone-400 hover:bg-stone-100 transition-colors"><X size={15} /></button>
                                </>
                              ) : (
                                <button onClick={() => setDeleteConfirm(product.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-stone-400">Nenhum produto cadastrado.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS TAB ── */}
          {activeTab === "orders" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="font-playfair text-2xl text-stone-900">Pedidos ({filteredOrders.length})</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Buscar pedido..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pl-8 pr-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-gold w-40 sm:w-48"
                    />
                  </div>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white"
                  >
                    <option value="all">Todos status</option>
                    {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>
              <div className="bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-100 bg-stone-50">
                        {["Pedido", "Cliente", "Total", "Status", "Ação"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs text-stone-500 uppercase tracking-wide font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-mono text-xs text-stone-600 font-medium">{order.order_number}</p>
                            <p className="text-stone-400 text-xs">{new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-stone-900 text-sm">{order.customer_name}</p>
                            <p className="text-stone-400 text-xs">{order.customer_email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gold font-semibold text-sm font-mono">R$ {order.total.toFixed(2).replace(".", ",")}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 font-medium ${STATUS_COLORS[order.status] ?? "bg-stone-100 text-stone-600"}`}>
                              {STATUS_LABELS[order.status] ?? order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="border border-stone-200 px-2 py-1.5 text-xs focus:outline-none focus:border-gold bg-white"
                            >
                              {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-stone-400">Nenhum pedido encontrado.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── CONTACTS TAB ── */}
          {activeTab === "contacts" && (
            <div>
              <h2 className="font-playfair text-2xl text-stone-900 mb-6">Mensagens ({contacts.length})</h2>
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium text-stone-900">{contact.name}</p>
                          <span className="text-stone-400 text-xs">{new Date(contact.createdAt ?? contact.created_at ?? "").toLocaleDateString("pt-BR")}</span>
                        </div>
                        <p className="text-gold text-sm mb-2">{contact.email}</p>
                         {contact.phone && <p className="text-stone-500 text-xs mb-2">Telefone: {contact.phone}</p>}
                        <p className="text-stone-600 text-sm leading-relaxed">{contact.message}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a href={`mailto:${contact.email}?subject=Re: Contato Henry Atelier`} className="p-2 text-stone-400 hover:text-gold hover:bg-stone-50 transition-colors" title="Responder">
                          <Mail size={16} />
                        </a>
                        <button onClick={() => handleDeleteContact(contact.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Deletar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {contacts.length === 0 && <div className="bg-white p-12 text-center text-stone-400">Nenhuma mensagem de contato.</div>}
              </div>
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === "settings" && (
            <div className="max-w-2xl">
              <h2 className="font-playfair text-2xl text-stone-900 mb-6">Configurações</h2>

              {/* Empresa */}
              <div className="bg-white p-6 shadow-sm mb-5">
                <h3 className="font-playfair text-lg text-stone-900 mb-4">Dados da Empresa</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "store_name", label: "Nome da Loja", icon: null, placeholder: "Henry Atelier" },
                    { key: "store_tagline", label: "Tagline", icon: null, placeholder: "Aroma para todos os dias" },
                    { key: "address", label: "Endereço", icon: null, placeholder: "Rua, número - Cidade" },
                    { key: "business_hours", label: "Horário de Funcionamento", icon: null, placeholder: "Seg-Sex 9h às 18h" },
                  ].map((f) => (
                    <div key={f.key} className={f.key === "store_tagline" || f.key === "address" || f.key === "business_hours" ? "sm:col-span-2" : ""}>
                      <label className="block text-xs text-stone-500 mb-1">{f.label}</label>
                      <input type="text" value={settings[f.key] ?? ""} onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })} placeholder={f.placeholder} className="w-full border border-stone-200 px-3 py-2.5 text-stone-900 focus:outline-none focus:border-gold text-sm" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Contato */}
              <div className="bg-white p-6 shadow-sm mb-5">
                <h3 className="font-playfair text-lg text-stone-900 mb-4">Contato & WhatsApp</h3>
                <div className="space-y-3">
                  {[
                     { key: "whatsapp_phone", label: "WhatsApp (com DDI)", placeholder: "5511999999999", note: "Exemplo: 5511999999999" },
                     { key: "contact_email", label: "E-mail de Contato", placeholder: "contato@henryatelier.com.br" },
                     { key: "contact_phone", label: "Telefone de Contato", placeholder: "(11) 99999-9999" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm text-stone-600 mb-1.5">{f.label}</label>
                      <input type="text" value={settings[f.key] ?? ""} onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })} placeholder={f.placeholder} className="w-full border border-stone-200 px-4 py-3 text-stone-900 focus:outline-none focus:border-gold text-sm" />
                      {f.note && <p className="text-xs text-stone-400 mt-1">{f.note}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="bg-white p-6 shadow-sm mb-5">
                <h3 className="font-playfair text-lg text-stone-900 mb-4">Redes Sociais</h3>
                <div className="space-y-3">
                  {[
                    { key: "instagram_url", label: "Instagram", icon: <Instagram size={16} />, placeholder: "https://instagram.com/henryatelier" },
                    { key: "facebook_url", label: "Facebook", icon: <Facebook size={16} />, placeholder: "https://facebook.com/henryatelier" },
                    { key: "tiktok_url", label: "TikTok", icon: <Globe size={16} />, placeholder: "https://tiktok.com/@henryatelier" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm text-stone-600 mb-1.5 flex items-center gap-2">{f.icon} {f.label}</label>
                      <input type="url" value={settings[f.key] ?? ""} onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })} placeholder={f.placeholder} className="w-full border border-stone-200 px-4 py-3 text-stone-900 focus:outline-none focus:border-gold text-sm" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Promoções */}
              <div className="bg-white p-6 shadow-sm mb-5">
                <h3 className="font-playfair text-lg text-stone-900 mb-4">Promoções & Frete</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-stone-600 mb-1.5">Desconto PIX (%)</label>
                    <input type="number" min={0} max={30} value={settings.pix_discount ?? "5"} onChange={(e) => setSettings({ ...settings, pix_discount: e.target.value })} className="w-full border border-stone-200 px-4 py-3 text-stone-900 focus:outline-none focus:border-gold text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-stone-600 mb-1.5">Frete Grátis Acima (R$)</label>
                    <input type="number" min={0} value={settings.free_shipping_above ?? "199"} onChange={(e) => setSettings({ ...settings, free_shipping_above: e.target.value })} className="w-full border border-stone-200 px-4 py-3 text-stone-900 focus:outline-none focus:border-gold text-sm" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={handleSaveSettings} disabled={savingSettings} className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 font-semibold text-sm hover:bg-gold transition-colors disabled:opacity-60">
                  {savingSettings ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando...</> : <><Check size={16} /> Salvar Configurações</>}
                </button>
              </div>

              {/* Segurança */}
              <div className="bg-white p-6 shadow-sm mt-5">
                <h3 className="font-playfair text-lg text-stone-900 mb-4">Segurança</h3>
                <div className="flex items-center justify-between p-4 bg-stone-50">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-stone-400" />
                    <div>
                      <p className="text-sm font-medium text-stone-700">Autenticação em 2 Fatores (2FA)</p>
                      <p className="text-xs text-stone-400">Status: <span className="text-red-500 font-medium">Desativado</span></p>
                    </div>
                  </div>
                  <button disabled className="flex items-center gap-1.5 border border-stone-200 text-stone-400 px-4 py-2 text-xs font-medium cursor-not-allowed">
                    <Lock size={13} /> Ativar 2FA (Em Breve)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PRODUCT FORM MODAL ── */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-none">
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-playfair text-xl text-stone-900">{editingProduct ? "Editar Produto" : "Novo Produto"}</h3>
              <button onClick={() => setShowProductForm(false)} className="p-2 text-stone-400 hover:text-stone-700"><X size={20} /></button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Basic fields */}
              <div>
                <label className="block text-sm text-stone-600 mb-1.5">Nome do Produto *</label>
                <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Nome do produto" className="w-full border border-stone-200 px-4 py-3 text-stone-900 focus:outline-none focus:border-gold text-sm" />
              </div>
              <div>
                <label className="block text-sm text-stone-600 mb-1.5">Descrição *</label>
                <textarea rows={3} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="w-full border border-stone-200 px-4 py-3 text-stone-900 focus:outline-none focus:border-gold text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-stone-600 mb-1.5">Preço (R$) *</label>
                  <input type="text" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} placeholder="89.90" className="w-full border border-stone-200 px-4 py-3 text-stone-900 focus:outline-none focus:border-gold text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-stone-600 mb-1.5">Preço Original (De)</label>
                  <input type="text" value={productForm.original_price} onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })} placeholder="109.90" className="w-full border border-stone-200 px-4 py-3 text-stone-900 focus:outline-none focus:border-gold text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-stone-600 mb-1.5">Estoque</label>
                  <input type="number" min={0} value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="w-full border border-stone-200 px-4 py-3 text-stone-900 focus:outline-none focus:border-gold text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-stone-600 mb-1.5">Categoria *</label>
                  <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full border border-stone-200 px-4 py-3 text-stone-900 focus:outline-none focus:border-gold text-sm bg-white">
                    <option value="atelier">Linha Atelier</option>
                    <option value="aromas">Aromas</option>
                    <option value="henry-home">Henry Home</option>
                    <option value="don-henry">Don Henry</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="featured" checked={productForm.featured} onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })} className="w-4 h-4 accent-gold" />
                <label htmlFor="featured" className="text-sm text-stone-600">Produto em destaque</label>
              </div>
              <div>
                <label className="block text-sm text-stone-600 mb-2">Imagem do Produto *</label>
                <ImageUploader value={productForm.imageUrl} onChange={(val) => setProductForm({ ...productForm, imageUrl: val })} />
              </div>

              {/* Fragrance details */}
              <button type="button" onClick={() => setShowFragrance(!showFragrance)} className="flex items-center gap-2 text-stone-600 text-sm font-medium hover:text-gold transition-colors w-full text-left border border-stone-100 px-4 py-3">
                <ChevronDown size={16} className={`transition-transform ${showFragrance ? "rotate-180" : ""}`} />
                Detalhes Olfativos (opcional)
              </button>
              {showFragrance && (
                <div className="space-y-3 border border-stone-100 p-4">
                  {[
                    { key: "notes_top", label: "Notas de Topo", placeholder: "Rosa, Bergamota, Limão" },
                    { key: "notes_heart", label: "Notas de Coração", placeholder: "Jasmim, Íris, Oud" },
                    { key: "notes_base", label: "Notas de Fundo", placeholder: "Âmbar, Sândalo, Almíscar" },
                    { key: "fixation", label: "Fixação", placeholder: "Longa (8h+)" },
                    { key: "projection", label: "Projeção", placeholder: "Moderada" },
                    { key: "similar_to", label: "Similar a", placeholder: "Chanel No. 5, Dior Sauvage" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs text-stone-500 mb-1">{f.label}</label>
                      <input type="text" value={productForm[f.key as keyof ProductFormData] as string} onChange={(e) => setProductForm({ ...productForm, [f.key]: e.target.value })} placeholder={f.placeholder} className="w-full border border-stone-200 px-3 py-2 text-stone-900 focus:outline-none focus:border-gold text-sm" />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">Gênero</label>
                      <select value={productForm.gender} onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })} className="w-full border border-stone-200 px-3 py-2 text-stone-900 focus:outline-none focus:border-gold text-sm bg-white">
                        <option>Unissex</option><option>Masculino</option><option>Feminino</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">Volume (ml)</label>
                      <input type="number" min={0} value={productForm.volume_ml} onChange={(e) => setProductForm({ ...productForm, volume_ml: e.target.value })} placeholder="200" className="w-full border border-stone-200 px-3 py-2 text-stone-900 focus:outline-none focus:border-gold text-sm" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setShowProductForm(false)} className="flex items-center gap-1.5 px-5 py-2.5 border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"><X size={15} /> Cancelar</button>
              <button onClick={handleSaveProduct} disabled={savingProduct} className="flex items-center gap-1.5 px-5 py-2.5 bg-stone-900 text-white text-sm font-semibold hover:bg-gold transition-colors disabled:opacity-60">
                {savingProduct ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando...</> : <><Check size={15} /> {editingProduct ? "Salvar" : "Criar"}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
