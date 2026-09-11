import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package, Wind, Home, Crown, Mail, LogIn, UserPlus, Settings,
  LogOut, Menu, X, ShoppingBag, Sparkles, Instagram, Facebook,
  MessageCircle,
} from "lucide-react";
import type { AuthState } from "@/types";
import { fetchSettings } from "@/lib/supabase";

interface SidebarProps {
  authState: AuthState;
  cartCount: number;
  onLogout: () => void;
  onCartOpen: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Linha Atelier", href: "/#atelier", icon: <Package size={17} /> },
  { label: "Aromas", href: "/#aromas", icon: <Sparkles size={17} /> },
  { label: "Henry Home", href: "/#henry-home", icon: <Home size={17} /> },
  { label: "Don Henry", href: "/#don-henry", icon: <Crown size={17} /> },
  { label: "Contato", href: "/#contato", icon: <Mail size={17} /> },
];

export default function Sidebar({ authState, cartCount, onLogout, onCartOpen }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings().then(setSettings);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith("/#")) {
      const sectionId = href.replace("/#", "");
      if (window.location.pathname !== "/") {
        navigate("/");
        setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" }), 100);
      } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const instagramUrl = settings.instagram_url || "";
  const facebookUrl = settings.facebook_url || "";
  const whatsappNum = (settings.whatsapp_phone || "5511999999999").replace(/\D/g, "");

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-stone-100">
        <Link to="/" onClick={() => setIsOpen(false)}>
          <h1 className="font-playfair text-xl text-stone-900 tracking-wide">Henry Atelier</h1>
          <p className="text-xs text-gold tracking-widest uppercase mt-1">& Don Henry</p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
        <p className="px-4 py-2 text-xs text-stone-400 tracking-widest uppercase font-medium">Coleções</p>
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => handleNavClick(item.href)}
            className="sidebar-link w-full text-left rounded-sm"
          >
            <span className="text-gold">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        <div className="pt-4 pb-2"><div className="border-t border-stone-100" /></div>
        <p className="px-4 py-2 text-xs text-stone-400 tracking-widest uppercase font-medium">Conta</p>

        {authState.type === "none" && (
          <>
            <Link to="/login" onClick={() => setIsOpen(false)} className="sidebar-link rounded-sm flex items-center gap-3">
              <LogIn size={17} className="text-gold" /> Login Cliente
            </Link>
            <Link to="/cadastro" onClick={() => setIsOpen(false)} className="sidebar-link rounded-sm flex items-center gap-3">
              <UserPlus size={17} className="text-gold" /> Cadastro
            </Link>
            <Link to="/admin-login" onClick={() => setIsOpen(false)} className="sidebar-link rounded-sm flex items-center gap-3">
              <Settings size={17} className="text-gold" /> Painel Admin
            </Link>
          </>
        )}
        {authState.type === "customer" && (
          <>
            <div className="px-4 py-2">
              <p className="text-xs text-stone-500">Olá,</p>
              <p className="text-sm font-medium text-stone-900 truncate">{authState.user.name}</p>
            </div>
            <button onClick={() => { onLogout(); setIsOpen(false); }} className="sidebar-link rounded-sm w-full text-left">
              <LogOut size={17} className="text-gold" /> Sair
            </button>
          </>
        )}
        {authState.type === "admin" && (
          <>
            <Link to="/admin" onClick={() => setIsOpen(false)} className="sidebar-link rounded-sm flex items-center gap-3">
              <Settings size={17} className="text-gold" /> Painel Admin
            </Link>
            <button onClick={() => { onLogout(); setIsOpen(false); }} className="sidebar-link rounded-sm w-full text-left">
              <LogOut size={17} className="text-gold" /> Sair
            </button>
          </>
        )}
      </nav>

      {/* Social + WhatsApp */}
      <div className="px-4 pb-2 flex items-center gap-3 justify-center">
        {instagramUrl && (
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-gold transition-colors p-1">
            <Instagram size={16} />
          </a>
        )}
        {facebookUrl && (
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-gold transition-colors p-1">
            <Facebook size={16} />
          </a>
        )}
        <a href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-green-500 transition-colors p-1">
          <MessageCircle size={16} />
        </a>
      </div>

      {/* Cart */}
      <div className="px-4 pb-6">
        <button
          onClick={() => { onCartOpen(); setIsOpen(false); }}
          className="w-full flex items-center justify-between px-4 py-3 bg-stone-900 text-white hover:bg-gold transition-colors duration-200"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} /><span className="text-sm tracking-wide">Carrinho</span>
          </div>
          {cartCount > 0 && (
            <span className="bg-gold text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-stone-100 px-4 py-4 flex items-center justify-between">
        <Link to="/">
          <h1 className="font-playfair text-lg text-stone-900">Henry Atelier</h1>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={onCartOpen} className="relative p-2 text-stone-700 hover:text-gold transition-colors" aria-label="Carrinho">
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
          <button onClick={() => setIsOpen(true)} className="p-2 text-stone-700 hover:text-stone-900 transition-colors" aria-label="Menu">
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen fixed left-0 top-0 bg-white border-r border-stone-100 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/40 z-50" onClick={() => setIsOpen(false)} />}

      {/* Mobile Drawer */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="absolute top-4 right-4">
          <button onClick={() => setIsOpen(false)} className="p-2 text-stone-500 hover:text-stone-900"><X size={20} /></button>
        </div>
        <SidebarContent />
      </div>
    </>
  );
}
