import React, { useState, useEffect } from "react";
import {
  ChevronDown, Wind, Flame, Sparkles, Crown, ArrowRight,
  Star, ShoppingBag, Instagram, Facebook, Zap, Gift,
  CheckCircle, MessageCircle, Mail, Phone, MapPin,
} from "lucide-react";
import ProductCard from "@/components/features/ProductCard";
import ContactForm from "@/components/features/ContactForm";
import type { Product } from "@/types";
import { fetchProducts, fetchSettings } from "@/lib/supabase";
import { AROMAS } from "@/constants";
import heroImg from "@/assets/hero.jpg";

interface HomeProps {
  onAddToCart: (product: Product) => void;
}

const TESTIMONIALS = [
  { name: "Maria S.", rating: 5, text: "A vela de baunilha transformou meu quarto. Aroma incrível, dura o dia todo!", city: "São Paulo, SP" },
  { name: "João O.", rating: 5, text: "Don Henry Noir é simplesmente sublime. Vale cada centavo. Elegância pura.", city: "Rio de Janeiro, RJ" },
  { name: "Ana C.", rating: 5, text: "O spray Henry Home é prático e cheiroso. Uso no carro e todo mundo elogia!", city: "Belo Horizonte, MG" },
];

export default function Home({ onAddToCart }: HomeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchSettings()]).then(([prods, setts]) => {
      setProducts(prods.map((p: Record<string, unknown>) => ({
        ...p,
        imageUrl: (p.image_url as string) ?? "",
      } as unknown as Product)));
      setSettings(setts);
      setLoading(false);
    });
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const categories = [
    { id: "all", label: "Todos" },
    { id: "atelier", label: "Linha Atelier" },
    { id: "henry-home", label: "Henry Home" },
    { id: "don-henry", label: "Don Henry" },
  ];

  const filteredProducts = activeCategory === "all"
    ? products
    : products.filter((p) => p.category === activeCategory);

  const instagramUrl = settings.instagram_url || "https://instagram.com/henryatelier";
  const facebookUrl = settings.facebook_url || "";
  const tiktokUrl = settings.tiktok_url || "";
  const whatsappNum = (settings.whatsapp_phone || "5511999999999").replace(/\D/g, "");
  const freeShippingAbove = Number(settings.free_shipping_above || 199);

  return (
    <div className="min-h-screen">

      {/* ─── HERO ─── */}
      <section
        className="relative min-h-screen flex items-center justify-center"
        style={{ backgroundImage: `url(${heroImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/50 to-stone-900/70" />

        {/* Social icons top right */}
        <div className="absolute top-20 lg:top-6 right-6 flex items-center gap-3 z-10">
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
              <Instagram size={18} />
            </a>
          )}
          {facebookUrl && (
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
              <Facebook size={18} />
            </a>
          )}
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-px bg-gold/60" />
            <p className="text-gold tracking-[0.4em] text-xs uppercase font-lato font-medium">Aromas Artesanais</p>
            <div className="w-16 h-px bg-gold/60" />
          </div>
          <h1 className="font-playfair text-5xl sm:text-7xl text-white leading-tight mb-4">Henry Atelier</h1>
          <p className="font-playfair italic text-xl text-stone-200 mb-3">
            {settings.store_tagline || "Aroma para todos os dias"}
          </p>
          <p className="text-stone-300 text-sm mb-10 max-w-md mx-auto">
            Velas artesanais e sprays de luxo que transformam qualquer espaço em um refúgio de bem-estar.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollTo("produtos")}
              className="flex items-center gap-2 bg-gold text-white px-10 py-4 font-lato font-semibold tracking-widest uppercase text-sm hover:bg-gold-dark transition-colors duration-200 w-full sm:w-auto justify-center"
            >
              <ShoppingBag size={16} /> Explorar Coleção
            </button>
            <a
              href={`https://wa.me/${whatsappNum}?text=Olá! Gostaria de saber mais sobre os produtos Henry Atelier.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-white/40 text-white px-8 py-4 font-lato font-semibold tracking-widest uppercase text-sm hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
            >
              <MessageCircle size={16} /> Falar no WhatsApp
            </a>
          </div>

          {/* Free shipping badge */}
          {freeShippingAbove > 0 && (
            <div className="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-white text-xs">
              <Gift size={14} className="text-gold" />
              Frete grátis para pedidos acima de R$ {freeShippingAbove}
            </div>
          )}
        </div>

        <button
          onClick={() => scrollTo("atelier")}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce"
        >
          <ChevronDown size={28} />
        </button>
      </section>

      {/* ─── TRUST BADGES ─── */}
      <section className="bg-stone-950 py-4 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-12">
          {[
            { icon: <CheckCircle size={16} className="text-gold" />, label: "Aromas Artesanais" },
            { icon: <Zap size={16} className="text-gold" />, label: "Entrega Rápida" },
            { icon: <Gift size={16} className="text-gold" />, label: `Frete Grátis +R$ ${freeShippingAbove}` },
            { icon: <Star size={16} className="text-gold" />, label: "Qualidade Premium" },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-stone-400 text-xs tracking-wide">
              {b.icon}
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── LINHA ATELIER ─── */}
      <section id="atelier" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gold tracking-[0.3em] text-xs uppercase font-medium mb-4">Nossa Essência</p>
              <h2 className="section-title">Linha Henry Atelier</h2>
              <p className="text-stone-500 leading-relaxed mb-6">
                Velas aromatizadas criadas para transformar o cotidiano em um ritual de bem-estar.
                Cada peça é pensada para trazer conforto genuíno — aromas que ficam na memória.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Uso Cotidiano", "Conforto & Bem-Estar", "Artesanal", "100% Nacional"].map((tag) => (
                  <span key={tag} className="border border-stone-200 text-stone-600 text-xs tracking-wide px-3 py-1.5">{tag}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-beige-light p-6 flex flex-col items-center text-center">
                <Flame size={28} className="text-gold mb-3" />
                <p className="font-playfair text-stone-800 text-sm">Velas Premium</p>
                <p className="text-stone-400 text-xs mt-1">Soja e parafina</p>
              </div>
              <div className="bg-stone-900 p-6 flex flex-col items-center text-center">
                <Sparkles size={28} className="text-gold mb-3" />
                <p className="font-playfair text-white text-sm">Aromas Únicos</p>
                <p className="text-stone-400 text-xs mt-1">7 fragrâncias</p>
              </div>
              <div className="bg-stone-900 p-6 flex flex-col items-center text-center col-span-2">
                <p className="font-playfair italic text-white text-lg leading-relaxed">"Para quem faz do lar um refúgio."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AROMAS ─── */}
      <section id="aromas" className="py-20 px-6 bg-beige-light">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold tracking-[0.3em] text-xs uppercase font-medium mb-3">Fragrâncias</p>
            <h2 className="section-title">Nossos Aromas</h2>
            <p className="text-stone-500 max-w-md mx-auto">Cada aroma é uma história. Escolha o que fala com você.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {AROMAS.map((aroma) => (
              <div key={aroma.name} className="bg-white p-5 text-center group hover:border-b-2 hover:border-gold transition-all duration-200 cursor-default">
                <span className="text-3xl block mb-3">{aroma.icon}</span>
                <p className="font-playfair text-stone-800 text-xs leading-tight">{aroma.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HENRY HOME ─── */}
      <section id="henry-home" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="relative">
                <img src={heroImg} alt="Vela Henry Atelier em ambiente acolhedor" className="w-full object-cover aspect-[4/5]" />
                <div className="absolute -bottom-4 -right-4 bg-gold p-4 max-w-[160px]">
                  <p className="text-white font-playfair italic text-sm leading-snug">Frescor que transforma</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="text-gold tracking-[0.3em] text-xs uppercase font-medium mb-4">Sprays & Ambientes</p>
              <h2 className="section-title">Henry Home</h2>
              <p className="text-stone-500 leading-relaxed mb-6">
                Linha de sprays para ambientes desenvolvida para quem busca praticidade sem abrir mão da sofisticação.
              </p>
              <div className="space-y-3">
                {[
                  { icon: <Wind size={16} className="text-gold" />, label: "Para Carros", desc: "Frescor em cada percurso" },
                  { icon: <Wind size={16} className="text-gold" />, label: "Para Banheiros", desc: "Leveza e higiene sensorial" },
                  { icon: <Wind size={16} className="text-gold" />, label: "Para Ambientes", desc: "Salas, quartos e escritórios" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 border-b border-stone-50 pb-3">
                    {item.icon}
                    <div>
                      <p className="text-stone-800 font-medium text-sm">{item.label}</p>
                      <p className="text-stone-400 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DON HENRY ─── */}
      <section id="don-henry" className="py-24 px-6 bg-stone-950 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold tracking-[0.5em] text-xs uppercase font-medium mb-4">Linha Premium</p>
            <h2 className="font-playfair text-4xl md:text-5xl text-white mb-4">Don Henry</h2>
            <div className="w-16 h-px bg-gold mx-auto mb-6" />
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-stone-800">
            {[
              { quote: "Criado para quem valoriza o silêncio do luxo.", sub: "Velas e sprays de alto padrão" },
              { quote: "Elegância não se explica — se sente.", sub: "Para quem sabe o que quer" },
              { quote: "Don Henry revela quem você sempre foi.", sub: "Uma experiência olfativa única" },
            ].map((item, i) => (
              <div key={i} className="bg-stone-950 p-10 text-center">
                <Crown size={24} className="text-gold mx-auto mb-6 opacity-60" />
                <p className="font-playfair italic text-stone-200 text-base leading-relaxed mb-4">"{item.quote}"</p>
                <p className="text-stone-500 text-xs tracking-wide">{item.sub}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button onClick={() => { setActiveCategory("don-henry"); scrollTo("produtos"); }} className="inline-flex items-center gap-2 border border-gold text-gold px-10 py-4 font-lato font-semibold tracking-widest uppercase text-sm hover:bg-gold hover:text-white transition-colors duration-200">
              Ver Coleção Don Henry <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ─── PRODUCTS ─── */}
      <section id="produtos" className="py-24 px-6 bg-beige-light">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-gold tracking-[0.3em] text-xs uppercase font-medium mb-3">Loja</p>
            <h2 className="section-title">Nossos Produtos</h2>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 text-xs tracking-widest uppercase font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-stone-900 text-white"
                    : "bg-white text-stone-600 border border-stone-200 hover:border-stone-400"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-4 text-center py-16 text-stone-400">
                  Nenhum produto nesta categoria ainda.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold tracking-[0.3em] text-xs uppercase font-medium mb-3">Depoimentos</p>
            <h2 className="section-title">O Que Dizem Nossos Clientes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-beige-light p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-gold fill-gold" />
                  ))}
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="text-stone-900 font-medium text-sm">{t.name}</p>
                  <p className="text-stone-400 text-xs">{t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTATO ─── */}
      <section id="contato" className="py-24 px-6 bg-beige-light">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-gold tracking-[0.3em] text-xs uppercase font-medium mb-4">Fale Conosco</p>
              <h2 className="section-title">Entre em Contato</h2>
              <p className="text-stone-500 leading-relaxed mb-8">Tem dúvidas ou sugestões? Estamos aqui para ajudá-lo.</p>
              <div className="space-y-4">
                {settings.contact_email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white flex items-center justify-center"><Mail size={15} className="text-gold" /></div>
                    <div>
                      <p className="text-xs text-stone-400">E-mail</p>
                      <a href={`mailto:${settings.contact_email}`} className="text-stone-700 text-sm hover:text-gold transition-colors">{settings.contact_email}</a>
                    </div>
                  </div>
                )}
                {settings.contact_phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white flex items-center justify-center"><Phone size={15} className="text-gold" /></div>
                    <div>
                      <p className="text-xs text-stone-400">WhatsApp</p>
                      <a href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noopener noreferrer" className="text-stone-700 text-sm hover:text-gold transition-colors">{settings.contact_phone}</a>
                    </div>
                  </div>
                )}
                {settings.address && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white flex items-center justify-center"><MapPin size={15} className="text-gold" /></div>
                    <div>
                      <p className="text-xs text-stone-400">Endereço</p>
                      <p className="text-stone-700 text-sm">{settings.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Social links */}
              <div className="flex items-center gap-4 mt-8">
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-gold hover:text-white transition-colors">
                    <Instagram size={18} />
                  </a>
                )}
                {facebookUrl && (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-gold hover:text-white transition-colors">
                    <Facebook size={18} />
                  </a>
                )}
                {tiktokUrl && (
                  <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-gold hover:text-white transition-colors text-xs font-bold">
                    TK
                  </a>
                )}
              </div>
            </div>
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-stone-950 text-stone-400 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-playfair text-white text-xl mb-1">Henry Atelier</h3>
              <p className="text-xs text-gold tracking-widest mb-3">& Don Henry</p>
              <p className="text-xs text-stone-500 leading-relaxed max-w-[200px]">
                {settings.store_tagline || "Aromas que ficam na memória."}
              </p>
            </div>
            <div>
              <p className="text-stone-300 text-xs font-medium tracking-widest uppercase mb-3">Navegação</p>
              <ul className="space-y-2">
                {[
                  { label: "Linha Atelier", id: "atelier" },
                  { label: "Henry Home", id: "henry-home" },
                  { label: "Don Henry", id: "don-henry" },
                  { label: "Contato", id: "contato" },
                ].map((item) => (
                  <li key={item.id}>
                    <button onClick={() => scrollTo(item.id)} className="text-xs text-stone-500 hover:text-stone-300 transition-colors">{item.label}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-stone-300 text-xs font-medium tracking-widest uppercase mb-3">Siga-nos</p>
              <div className="flex items-center gap-3 mb-4">
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-white transition-colors"><Instagram size={18} /></a>
                )}
                {facebookUrl && (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-white transition-colors"><Facebook size={18} /></a>
                )}
              </div>
              {settings.business_hours && (
                <p className="text-xs text-stone-600">{settings.business_hours}</p>
              )}
              <a
                href={`https://wa.me/${whatsappNum}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-green-500 hover:text-green-400 text-xs transition-colors"
              >
                <MessageCircle size={14} /> Falar no WhatsApp
              </a>
            </div>
          </div>
          <div className="border-t border-stone-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs">© {new Date().getFullYear()} Henry Atelier. Todos os direitos reservados.</p>
            <p className="text-xs text-stone-600">Aromas que ficam na memória.</p>
          </div>
        </div>
      </footer>

      {/* ─── WhatsApp Floating Button ─── */}
      <a
        href={`https://wa.me/${whatsappNum}?text=Olá! Tenho interesse nos produtos Henry Atelier.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
        title="WhatsApp"
        aria-label="Falar no WhatsApp"
      >
        <MessageCircle size={26} />
      </a>
    </div>
  );
}
