import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Minus, Trash2, ShoppingBag, MessageCircle,
  Tag, CheckCircle, ChevronRight, MapPin, User, Mail, Phone, Home as HomeIcon,
  Search, CreditCard, Banknote, Smartphone, Building2, X,
} from "lucide-react";
import type { CartItem, DBOrder } from "@/types";
import { createOrderDB, fetchSettings, validateCoupon } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { toast } from "sonner";

interface CheckoutProps {
  items: CartItem[];
  total: number;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClearCart: () => void;
}

type PaymentMethod = "pix" | "credit_card" | "debit_card" | "cash" | "transfer" | "mercado_pago";

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; desc: string; icon: React.ReactNode; highlight?: string; online?: boolean }[] = [
  { id: "mercado_pago", label: "Mercado Pago", desc: "Cartão, PIX, Boleto — online", icon: <CreditCard size={18} />, highlight: "Pague online agora!", online: true },
  { id: "pix", label: "PIX (WhatsApp)", desc: "Chave enviada pelo WhatsApp", icon: <Smartphone size={18} />, highlight: "Ganhe desconto!" },
  { id: "credit_card", label: "Cartão de Crédito", desc: "Em até 12x — via WhatsApp", icon: <CreditCard size={18} /> },
  { id: "debit_card", label: "Cartão de Débito", desc: "Débito à vista — via WhatsApp", icon: <CreditCard size={18} /> },
  { id: "cash", label: "Dinheiro", desc: "Pagamento na entrega", icon: <Banknote size={18} /> },
  { id: "transfer", label: "Transferência Bancária", desc: "TED / DOC", icon: <Building2 size={18} /> },
];

async function fetchAddressByCep(cep: string) {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) return null;
  const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.erro) return null;
  return data as { logradouro: string; bairro: string; localidade: string; uf: string };
}

export default function Checkout({ items, total, onUpdateQuantity, onRemove, onClearCart }: CheckoutProps) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    zip: "", address: "", number: "", complement: "", neighborhood: "", city: "", state: "",
  });
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: "percent" | "fixed"; value: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [whatsappNum, setWhatsappNum] = useState("5511999999999");
  const [pixDiscount, setPixDiscount] = useState(5);
  const [freeShippingAbove, setFreeShippingAbove] = useState(199);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mpLoading, setMpLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<DBOrder | null>(null);
  const itemsSnapshot = useRef<CartItem[]>(items);
  const totalSnapshot = useRef<number>(total);

  useEffect(() => {
    if (items.length > 0) {
      itemsSnapshot.current = items;
      totalSnapshot.current = total;
    }
  }, [items, total]);

  useEffect(() => {
    fetchSettings().then((s) => {
      if (s.whatsapp_phone) setWhatsappNum(s.whatsapp_phone);
      if (s.pix_discount) setPixDiscount(Number(s.pix_discount));
      if (s.free_shipping_above) setFreeShippingAbove(Number(s.free_shipping_above));
    });
  }, []);

  // ── CEP Auto-fill ─────────────────────────────────
  const handleCepLookup = async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    setZipError("");
    setForm((f) => ({ ...f, zip: cep }));
    if (clean.length === 8) {
      setZipLoading(true);
      const addr = await fetchAddressByCep(clean);
      setZipLoading(false);
      if (addr) {
        setForm((f) => ({
          ...f,
          address: addr.logradouro || f.address,
          neighborhood: addr.bairro || f.neighborhood,
          city: addr.localidade || f.city,
          state: addr.uf || f.state,
        }));
        toast.success("Endereço preenchido automaticamente!");
      } else {
        setZipError("CEP não encontrado. Preencha o endereço manualmente.");
      }
    }
  };

  // ── Computed ──────────────────────────────────────
  const activeItems = confirmedOrder ? (confirmedOrder.items as CartItem[]) : itemsSnapshot.current;
  const subtotal = confirmedOrder ? confirmedOrder.subtotal : totalSnapshot.current;
  const pixDiscountAmt = paymentMethod === "pix" ? subtotal * (pixDiscount / 100) : 0;
  const couponDiscountAmt = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? subtotal * (appliedCoupon.value / 100)
      : Math.min(appliedCoupon.value, subtotal)
    : 0;
  const totalDiscount = pixDiscountAmt + couponDiscountAmt;
  const afterDiscount = subtotal - totalDiscount;
  const shipping = afterDiscount >= freeShippingAbove ? 0 : 15.9;
  const finalTotal = afterDiscount + shipping;

  // ── Coupon ────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    const coupon = await validateCoupon(couponInput.trim(), subtotal);
    setCouponLoading(false);
    if (!coupon) {
      toast.error("Cupom inválido ou expirado.");
      return;
    }
    setAppliedCoupon({ code: coupon.code, type: coupon.type, value: coupon.value });
    toast.success(`Cupom "${coupon.code}" aplicado!`);
  };

  // ── Mercado Pago Online Checkout ─────────────────
  const handleMercadoPago = async () => {
    if (!form.name || !form.email || !form.phone) {
      toast.error("Preencha nome, e-mail e telefone antes de continuar.");
      return;
    }
    if (itemsSnapshot.current.length === 0) {
      toast.error("Seu carrinho está vazio.");
      return;
    }

    setMpLoading(true);
    console.log("[Checkout] Iniciando pagamento via Mercado Pago...");

    const fullAddress = [form.address, form.number, form.complement, form.neighborhood]
      .filter(Boolean).join(", ");

    const { data, error } = await supabase.functions.invoke("create-payment", {
      body: {
        order: {
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          customer_address: fullAddress || undefined,
          customer_city: form.city || undefined,
          customer_state: form.state || undefined,
          customer_zip: form.zip || undefined,
          items: itemsSnapshot.current,
          subtotal,
          shipping,
          discount: totalDiscount,
          total: finalTotal,
          coupon_code: appliedCoupon?.code,
        },
      },
    });

    if (error) {
      let errorMessage = error.message;
      if (error instanceof FunctionsHttpError) {
        try {
          const statusCode = error.context?.status ?? 500;
          const textContent = await error.context?.text();
          errorMessage = `[${statusCode}] ${textContent || error.message}`;
        } catch {
          errorMessage = error.message;
        }
      }
      console.error("[Checkout] MP error:", errorMessage);
      toast.error("Erro ao criar pagamento: " + errorMessage);
      setMpLoading(false);
      return;
    }

    // Always use init_point (production) — sandbox_init_point intentionally rejected
    const paymentUrl: string = data?.init_point ?? "";

    if (!paymentUrl) {
      toast.error("Não foi possível obter o link de pagamento.");
      setMpLoading(false);
      return;
    }

    // CRITICAL: Block any sandbox URL before redirecting
    if (paymentUrl.includes("sandbox") || paymentUrl.includes("beta.mercadopago")) {
      console.error("[Checkout] CRITICAL: Sandbox URL detected on frontend. Blocking redirect:", paymentUrl);
      toast.error("Erro de configuração: URL de sandbox detectada. Verifique as credenciais de produção.");
      setMpLoading(false);
      return;
    }

    console.log("[Checkout] Redirecting to MP:", paymentUrl);
    toast.success(`Pedido ${data.order_number} criado! Redirecionando para pagamento...`);
    onClearCart();
    // Redirect to Mercado Pago
    window.location.href = paymentUrl;
  };

  // ── WhatsApp Checkout ─────────────────────────────
  const handleWhatsApp = async () => {
    if (!form.name || !form.email || !form.phone || !form.address) {
      toast.error("Preencha todos os campos obrigatórios (nome, e-mail, telefone e endereço).");
      return;
    }
    if (!paymentMethod) {
      toast.error("Selecione uma forma de pagamento.");
      return;
    }
    if (itemsSnapshot.current.length === 0) {
      toast.error("Seu carrinho está vazio.");
      return;
    }

    if (confirmedOrder) {
      const paymentLabel = PAYMENT_OPTIONS.find((p) => p.id === confirmedOrder.payment_method)?.label ?? confirmedOrder.payment_method ?? "A combinar";
      const itemsList = confirmedOrder.items
        .map((item) => `• ${item.product.name} ×${item.quantity} — R$ ${(item.product.price * item.quantity).toFixed(2).replace(".", ",")}`)
        .join("\n");
      const message = [
        `*Pedido Henry Atelier*`,
        `*Pedido:* ${confirmedOrder.order_number}`,
        ``,
        `*Cliente:* ${confirmedOrder.customer_name}`,
        `E-mail: ${confirmedOrder.customer_email}`,
        confirmedOrder.customer_phone ? `Telefone: ${confirmedOrder.customer_phone}` : "",
        ``,
        `*Itens do Pedido:*`,
        itemsList,
        ``,
        `*Forma de Pagamento:* ${paymentLabel}`,
        `*TOTAL: R$ ${confirmedOrder.total.toFixed(2).replace(".", ",")}*`,
      ].filter(Boolean).join("\n");
      const phone = whatsappNum.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
      return;
    }

    setIsSubmitting(true);
    console.log("[Checkout] Iniciando pedido via WhatsApp...");

    const paymentLabel = PAYMENT_OPTIONS.find((p) => p.id === paymentMethod)?.label ?? paymentMethod;

    let savedOrder: DBOrder | null = null;
    try {
      const fullAddress = [form.address, form.number, form.complement, form.neighborhood]
        .filter(Boolean).join(", ");
      const cityState = [form.city, form.state].filter(Boolean).join(" - ");
      savedOrder = await createOrderDB({
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        customer_address: `${fullAddress}${cityState ? `, ${cityState}` : ""}${form.zip ? ` CEP: ${form.zip}` : ""}`,
        items: itemsSnapshot.current,
        subtotal,
        shipping,
        discount: totalDiscount,
        total: finalTotal,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon?.code,
      }) as DBOrder;
      console.log("[Checkout] Pedido salvo:", savedOrder?.order_number);
      setConfirmedOrder(savedOrder);
    } catch (err) {
      console.error("[Checkout] Erro ao salvar pedido:", err);
      toast.error("Erro ao registrar pedido. Tente novamente.");
      setIsSubmitting(false);
      return;
    }

    const orderNum = savedOrder?.order_number ?? "---";
    const itemsList = itemsSnapshot.current
      .map((item) => `• ${item.product.name} ×${item.quantity} — R$ ${(item.product.price * item.quantity).toFixed(2).replace(".", ",")}`)
      .join("\n");

    const fullAddress = [form.address, form.number, form.complement, form.neighborhood].filter(Boolean).join(", ");

    const message = [
      `*Novo Pedido — Henry Atelier*`,
      `*Pedido:* ${orderNum}`,
      ``,
      `*Cliente:*`,
      `Nome: ${form.name}`,
      `E-mail: ${form.email}`,
      `Telefone: ${form.phone}`,
      fullAddress ? `Endereço: ${fullAddress}` : "",
      form.city || form.state ? `Cidade: ${form.city}${form.state ? ` - ${form.state}` : ""}` : "",
      form.zip ? `CEP: ${form.zip}` : "",
      ``,
      `*Itens do Pedido:*`,
      itemsList,
      ``,
      `*Forma de Pagamento:* ${paymentLabel}`,
      paymentMethod === "pix" ? `Aguardando chave PIX para pagamento` : "",
      ``,
      `*Subtotal:* R$ ${subtotal.toFixed(2).replace(".", ",")}`,
      pixDiscountAmt > 0 ? `*Desconto PIX (${pixDiscount}%):* -R$ ${pixDiscountAmt.toFixed(2).replace(".", ",")}` : "",
      couponDiscountAmt > 0 ? `*Cupom (${appliedCoupon?.code}):* -R$ ${couponDiscountAmt.toFixed(2).replace(".", ",")}` : "",
      `*Frete:* ${shipping === 0 ? "GRÁTIS" : `R$ ${shipping.toFixed(2).replace(".", ",")}`}`,
      ``,
      `*TOTAL: R$ ${finalTotal.toFixed(2).replace(".", ",")}*`,
      ``,
      `_${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}_`,
    ].filter(Boolean).join("\n");

    const phone = whatsappNum.replace(/\D/g, "");
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");

    onClearCart();
    setIsSubmitting(false);
    toast.success(`Pedido ${orderNum} registrado! Abrindo WhatsApp...`);
  };

  // ── Confirmed ─────────────────────────────────────
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-beige-light flex items-center justify-center px-6 py-20 pt-24 lg:pt-20">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="font-playfair text-3xl text-stone-900 mb-2">Pedido Enviado!</h2>
          <p className="text-stone-500 mb-1">Número do pedido:</p>
          <p className="text-gold font-mono font-bold text-2xl mb-6">{confirmedOrder.order_number}</p>
          <p className="text-stone-500 text-sm mb-8 max-w-sm mx-auto">
            Seu pedido foi registrado com sucesso. Continue pelo WhatsApp para confirmar o pagamento e entrega.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 font-semibold text-sm hover:bg-green-700 transition-colors"
            >
              <MessageCircle size={16} /> Continuar no WhatsApp
            </button>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-stone-900 text-white px-6 py-3 font-semibold text-sm hover:bg-gold transition-colors"
            >
              Voltar à Loja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────
  if (itemsSnapshot.current.length === 0) {
    return (
      <div className="min-h-screen bg-beige-light flex items-center justify-center px-6 py-20 pt-24 lg:pt-20">
        <div className="text-center">
          <ShoppingBag size={56} className="text-stone-300 mx-auto mb-5" />
          <h2 className="font-playfair text-2xl text-stone-700 mb-3">Seu carrinho está vazio</h2>
          <p className="text-stone-500 mb-8">Explore nossa coleção e encontre o aroma perfeito.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-4 font-lato font-semibold tracking-widest uppercase text-sm hover:bg-gold transition-colors">
            Explorar Produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-20 lg:pt-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-stone-400 text-sm hover:text-stone-700 transition-colors inline-flex items-center gap-1">
            ← Continuar comprando
          </Link>
          <h1 className="font-playfair text-3xl text-stone-900 mt-4">Finalizar Pedido</h1>
          {afterDiscount >= freeShippingAbove ? (
            <p className="text-green-600 text-sm mt-1 font-medium">✓ Frete grátis incluído!</p>
          ) : (
            <p className="text-stone-500 text-sm mt-1">
              Frete grátis acima de R$ {freeShippingAbove.toFixed(0)} — faltam R$ {(freeShippingAbove - afterDiscount).toFixed(2).replace(".", ",")}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-5">

            {/* Cart Items */}
            <div className="bg-white p-5 sm:p-6 shadow-sm">
              <h2 className="font-playfair text-xl text-stone-900 mb-4">
                Carrinho ({activeItems.length} {activeItems.length === 1 ? "item" : "itens"})
              </h2>
              <div className="space-y-4">
                {activeItems.map((item) => (
                  <div key={item.product.id} className="flex gap-4 pb-4 border-b border-stone-50 last:border-0 last:pb-0">
                    <img
                      src={item.product.image_url ?? item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover flex-shrink-0 bg-beige-light"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-playfair text-stone-900 text-sm sm:text-base leading-tight">{item.product.name}</p>
                      <p className="text-gold font-semibold text-sm mt-0.5">
                        R$ {item.product.price.toFixed(2).replace(".", ",")}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-stone-200">
                          <button onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-stone-500 hover:text-stone-900">
                            <Minus size={11} />
                          </button>
                          <span className="w-7 sm:w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-stone-500 hover:text-stone-900">
                            <Plus size={11} />
                          </button>
                        </div>
                        <button onClick={() => onRemove(item.product.id)} className="text-stone-300 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                        <span className="ml-auto text-stone-700 text-sm font-semibold">
                          R$ {(item.product.price * item.quantity).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Form */}
            <div className="bg-white p-5 sm:p-6 shadow-sm">
              <h2 className="font-playfair text-xl text-stone-900 mb-4">Seus Dados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs text-stone-500 mb-1">Nome completo *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Seu nome completo" className="w-full border border-stone-200 pl-9 pr-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm" />
                  </div>
                </div>
                {/* Email */}
                <div className="sm:col-span-2">
                  <label className="block text-xs text-stone-500 mb-1">E-mail *</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" className="w-full border border-stone-200 pl-9 pr-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm" />
                  </div>
                </div>
                {/* Phone */}
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Telefone / WhatsApp *</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" className="w-full border border-stone-200 pl-9 pr-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm" />
                  </div>
                </div>
                {/* CEP */}
                <div>
                  <label className="block text-xs text-stone-500 mb-1">CEP</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={form.zip}
                      onChange={(e) => handleCepLookup(e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                      className="w-full border border-stone-200 pl-9 pr-9 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm"
                    />
                    {zipLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {!zipLoading && form.zip.replace(/\D/g, "").length === 8 && !zipError && (
                      <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                    )}
                  </div>
                  {zipError && <p className="text-red-500 text-xs mt-1">{zipError}</p>}
                </div>
                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs text-stone-500 mb-1">Endereço (rua) *</label>
                  <div className="relative">
                    <HomeIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rua / Avenida" className="w-full border border-stone-200 pl-9 pr-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm" />
                  </div>
                </div>
                {/* Number */}
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Número</label>
                  <input type="text" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="123" className="w-full border border-stone-200 px-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm" />
                </div>
                {/* Complement */}
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Complemento</label>
                  <input type="text" value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} placeholder="Apto, bloco..." className="w-full border border-stone-200 px-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm" />
                </div>
                {/* Neighborhood */}
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Bairro</label>
                  <input type="text" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} placeholder="Bairro" className="w-full border border-stone-200 px-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm" />
                </div>
                {/* City */}
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Cidade</label>
                  <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Cidade" className="w-full border border-stone-200 px-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-5 sm:p-6 shadow-sm">
              <h2 className="font-playfair text-xl text-stone-900 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-gold" />
                Forma de Pagamento *
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PAYMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`flex items-center gap-3 p-3 border-2 transition-all text-left ${
                      paymentMethod === opt.id
                        ? "border-gold bg-gold/5"
                        : "border-stone-100 hover:border-stone-300"
                    }`}
                  >
                    <div className={`${paymentMethod === opt.id ? "text-gold" : "text-stone-400"} flex-shrink-0`}>
                      {opt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-stone-900 text-sm font-medium">{opt.label}</p>
                      <p className="text-stone-400 text-xs">{opt.desc}</p>
                    </div>
                    {opt.highlight && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 font-medium flex-shrink-0">
                        {opt.highlight}
                      </span>
                    )}
                    {paymentMethod === opt.id && (
                      <CheckCircle size={16} className="text-gold flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              {paymentMethod === "mercado_pago" && (
                <div className="mt-3 bg-blue-50 border border-blue-200 p-3 flex items-start gap-2">
                  <span className="text-blue-600 flex-shrink-0 mt-0.5">Seguro</span>
                  <p className="text-blue-800 text-xs">
                    Pague online agora com <strong>cartão, PIX ou boleto</strong> pelo ambiente seguro do Mercado Pago.
                    Seu pedido é liberado automaticamente após confirmação do pagamento.
                  </p>
                </div>
              )}
              {paymentMethod === "pix" && (
                <div className="mt-3 bg-green-50 border border-green-200 p-3 flex items-start gap-2">
                  <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-green-800 text-xs">
                    Você ganhou <strong>{pixDiscount}% de desconto</strong> no pagamento via PIX!
                    A chave será enviada pelo WhatsApp após confirmação do pedido.
                  </p>
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className="bg-white p-5 sm:p-6 shadow-sm">
              <h2 className="font-playfair text-xl text-stone-900 mb-4 flex items-center gap-2">
                <Tag size={18} className="text-gold" />
                Cupom de Desconto
              </h2>
              {appliedCoupon ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 p-3">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-green-800 font-semibold text-sm">{appliedCoupon.code}</p>
                    <p className="text-green-600 text-xs">
                      {appliedCoupon.type === "percent"
                        ? `${appliedCoupon.value}% de desconto`
                        : `R$ ${appliedCoupon.value.toFixed(2).replace(".", ",")} de desconto`}
                    </p>
                  </div>
                  <button onClick={() => setAppliedCoupon(null)} className="p-1 text-stone-400 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    placeholder="Digite o código do cupom"
                    className="flex-1 border border-stone-200 px-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm uppercase"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="px-4 py-2.5 bg-stone-900 text-white text-sm font-semibold hover:bg-gold transition-colors disabled:opacity-60 whitespace-nowrap"
                  >
                    {couponLoading ? "..." : "Aplicar"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column — Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white p-5 sm:p-6 shadow-sm lg:sticky lg:top-6">
              <h2 className="font-playfair text-xl text-stone-900 mb-4">Resumo do Pedido</h2>

              <div className="space-y-1.5 mb-4">
                {activeItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-stone-500 truncate mr-2 max-w-[140px]">{item.product.name} ×{item.quantity}</span>
                    <span className="text-stone-700 flex-shrink-0 font-medium">
                      R$ {(item.product.price * item.quantity).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                </div>
                {pixDiscountAmt > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto PIX ({pixDiscount}%)</span>
                    <span>-R$ {pixDiscountAmt.toFixed(2).replace(".", ",")}</span>
                  </div>
                )}
                {couponDiscountAmt > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Cupom ({appliedCoupon?.code})</span>
                    <span>-R$ {couponDiscountAmt.toFixed(2).replace(".", ",")}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Frete</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                    {shipping === 0 ? "GRÁTIS" : `R$ ${shipping.toFixed(2).replace(".", ",")}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-stone-200 mt-3 pt-3 flex justify-between mb-5">
                <span className="font-playfair text-stone-900 text-lg">Total</span>
                <span className="font-playfair text-gold text-xl font-semibold">
                  R$ {finalTotal.toFixed(2).replace(".", ",")}
                </span>
              </div>

              {/* Payment badge */}
              {paymentMethod && (
                <div className="bg-stone-50 border border-stone-100 p-3 mb-4 flex items-center gap-2">
                  <span className="text-xs text-stone-500">Pagamento:</span>
                  <span className="text-xs font-semibold text-stone-800">
                    {PAYMENT_OPTIONS.find((p) => p.id === paymentMethod)?.label}
                  </span>
                </div>
              )}

              {/* Mercado Pago CTA */}
              {paymentMethod === "mercado_pago" ? (
                <button
                  onClick={handleMercadoPago}
                  disabled={mpLoading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 font-lato font-semibold tracking-widest uppercase text-sm hover:bg-blue-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {mpLoading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Aguarde...</>
                  ) : (
                    <><CreditCard size={18} /> Pagar com Mercado Pago</>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleWhatsApp}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-4 font-lato font-semibold tracking-widest uppercase text-sm hover:bg-green-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Registrando...</>
                  ) : (
                    <><MessageCircle size={18} /> Finalizar via WhatsApp</>
                  )}
                </button>
              )}

              <p className="text-center text-xs text-stone-400 mt-2 flex items-center justify-center gap-1">
                <ChevronRight size={12} />
                {paymentMethod === "mercado_pago" ? "Ambiente seguro — Mercado Pago" : "Pedido salvo antes de abrir o WhatsApp"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
