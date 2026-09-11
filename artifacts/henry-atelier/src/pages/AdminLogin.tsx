import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    const email = form.email.trim().toLowerCase();
    const authEmail = email === "admin@henryatelier.com.br"
      ? "admin@henryatelier.com"
      : email;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: form.password,
      });

      if (error) throw error;

      const isAdmin =
        data.user?.user_metadata?.role === "admin" ||
        ["admin@henryatelier.com.br", "admin@ascendia.com.br", "admin@grfconstrucao.com"].includes(email);

      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error("Esta conta não possui acesso administrativo.");
      }

      onSuccess();
      toast.success("Bem-vindo ao painel administrativo!");
      navigate("/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-stone-800 mb-5">
            <Shield size={24} className="text-gold" />
          </div>
          <h1 className="font-playfair text-2xl text-white mb-2">Acesso Administrativo</h1>
          <p className="text-stone-500 text-sm">Henry Atelier — Painel de Controle</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-sm text-stone-400 mb-1.5">
              E-mail
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@henryatelier.com"
              className="w-full bg-stone-900 border border-stone-700 px-4 py-3 text-white placeholder:text-stone-600 focus:outline-none focus:border-gold text-sm"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm text-stone-400 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Senha de acesso"
                className="w-full bg-stone-900 border border-stone-700 px-4 py-3 pr-11 text-white placeholder:text-stone-600 focus:outline-none focus:border-gold text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gold text-white py-4 font-lato font-semibold tracking-widest uppercase text-sm hover:bg-gold-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 mt-2"
          >
            <Shield size={16} />
            {loading ? "Autenticando..." : "Acessar Painel"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/" className="text-stone-600 text-xs hover:text-stone-400 transition-colors">
            ← Voltar à loja
          </Link>
        </div>
      </div>
    </div>
  );
}
