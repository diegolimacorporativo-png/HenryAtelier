import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Sidebar from "@/components/layout/Sidebar";
import CartDrawer from "@/components/features/CartDrawer";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminLogin from "@/pages/AdminLogin";
import Admin from "@/pages/Admin";
import Checkout from "@/pages/Checkout";
import NotFound from "@/pages/NotFound";
import Presentation from "@/pages/Presentation";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

function AppInner() {
  const { authState, loading, refresh, logout } = useAuth();
  const { items, total, count, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();

  const fullScreenPaths = ["/admin", "/admin-login", "/apresentacao"];
  const isFullScreen = fullScreenPaths.some((p) => location.pathname.startsWith(p));

  // Show loading spinner while auth state initializes
  if (loading && !isFullScreen) {
    return (
      <div className="min-h-screen bg-beige-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-sm font-lato tracking-widest uppercase text-xs">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isFullScreen) {
    return (
      <Routes>
        <Route path="/apresentacao" element={<Presentation />} />
        <Route path="/admin-login" element={<AdminLogin onSuccess={refresh} />} />
        <Route
          path="/admin"
          element={authState.type === "admin" ? <Admin /> : <Navigate to="/admin-login" replace />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  // Convert new AuthState to legacy shape expected by Sidebar
  const legacyAuthState = {
    type: authState.type,
    user: authState.user
      ? {
          id: authState.user.id,
          name: authState.user.username,
          email: authState.user.email,
          avatar: authState.user.avatar,
        }
      : undefined,
  };

  return (
    <div className="lg:pl-64">
      <Sidebar
        authState={legacyAuthState as any}
        cartCount={count}
        onLogout={logout}
        onCartOpen={() => setCartOpen(true)}
      />
      <main className="pt-16 lg:pt-0">
        <Routes>
          <Route path="/" element={<Home onAddToCart={addToCart} />} />
          <Route path="/login" element={<Login onSuccess={refresh} />} />
          <Route path="/cadastro" element={<Register onSuccess={refresh} />} />
          <Route
            path="/checkout"
            element={
              <Checkout
                items={items}
                total={total}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                onClearCart={clearCart}
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        total={total}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <AppInner />
    </BrowserRouter>
  );
}
