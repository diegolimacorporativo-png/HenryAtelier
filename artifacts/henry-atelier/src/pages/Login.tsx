import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, Mail, Shield, ArrowLeft, Chrome } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type LoginStep = "email" | "password" | "otp";

interface LoginProps {
  onSuccess: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mode, setMode] = useState<"password" | "otp">("password");

  // ── Email + Password Login ─────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(
        error.message.includes("Invalid login")
          ? "E-mail ou senha incorretos."
          : error.message
      );
      setLoading(false);
      return;
    }
    onSuccess();
    navigate("/");
    // Don't call setLoading(false) — let navigation happen
  };

  // ── Magic Link / OTP Login ─────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Digite seu e-mail.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível enviar o código. Verifique o e-mail.");
      return;
    }
    toast.success(`Código enviado para ${email}!`);
    setStep("otp");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      toast.error("Digite o código de 4 dígitos.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    if (error) {
      toast.error("Código inválido ou expirado. Tente novamente.");
      setLoading(false);
      return;
    }
    onSuccess();
    navigate("/");
    // Don't call setLoading(false) — let navigation happen
  };

  // ── Google OAuth ───────────────────────────────────
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: "offline", prompt: "consent" },
        skipBrowserRedirect: false,
      },
    });
    if (error) {
      toast.error("Erro ao iniciar login com Google: " + error.message);
      setGoogleLoading(false);
    }
    // On success: auto-redirects, no state update needed
  };

  return (
    <div className="min-h-screen bg-beige-light flex items-center justify-center px-4 py-20 pt-24 lg:pt-20">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 shadow-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl text-stone-900 mb-2">
            {step === "otp" ? "Confirme o Código" : "Bem-vindo de volta"}
          </h1>
          <p className="text-stone-500 text-sm">
            {step === "otp"
              ? `Insira o código enviado para ${email}`
              : "Acesse sua conta Henry Atelier"}
          </p>
        </div>

        {/* ── STEP: OTP Verification ── */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm text-stone-600 mb-1.5">
                Código de verificação
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="0000"
                autoFocus
                className="w-full border border-stone-200 px-4 py-4 text-stone-900 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-gold"
              />
              <p className="text-xs text-stone-400 mt-1.5 text-center">
                Código enviado por e-mail — válido por 60 minutos
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white py-4 font-lato font-semibold tracking-widest uppercase text-sm hover:bg-gold disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verificando...</>
              ) : (
                <><Shield size={16} /> Confirmar Código</>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep("email"); setOtp(""); }}
              className="w-full py-2.5 text-stone-500 text-xs hover:text-stone-700 transition-colors flex items-center justify-center gap-1"
            >
              <ArrowLeft size={13} /> Voltar e reenviar código
            </button>
          </form>
        )}

        {/* ── STEP: Email + Password / OTP ── */}
        {step !== "otp" && (
          <>
            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 border-2 border-stone-200 py-3.5 text-stone-700 text-sm font-medium hover:border-stone-400 hover:bg-stone-50 transition-colors mb-5 disabled:opacity-60"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Entrar com Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-stone-100" />
              <span className="text-stone-400 text-xs">ou continue com e-mail</span>
              <div className="flex-1 h-px bg-stone-100" />
            </div>

            {/* Mode toggle */}
            <div className="flex mb-5 border border-stone-200">
              <button
                type="button"
                onClick={() => setMode("password")}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${mode === "password" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-50"}`}
              >
                Senha
              </button>
              <button
                type="button"
                onClick={() => setMode("otp")}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${mode === "otp" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-50"}`}
              >
                Código por E-mail
              </button>
            </div>

            {/* Password Login */}
            {mode === "password" && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-stone-600 mb-1.5">E-mail</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      className="w-full border border-stone-200 pl-9 pr-3 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-stone-600 mb-1.5">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      autoComplete="current-password"
                      className="w-full border border-stone-200 px-4 py-3 pr-11 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white py-4 font-lato font-semibold tracking-widest uppercase text-sm hover:bg-gold disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Entrando...</>
                  ) : (
                    <><LogIn size={16} /> Entrar</>
                  )}
                </button>
              </form>
            )}

            {/* OTP Login */}
            {mode === "otp" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm text-stone-600 mb-1.5">E-mail</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      className="w-full border border-stone-200 pl-9 pr-3 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm"
                    />
                  </div>
                  <p className="text-xs text-stone-400 mt-1">Enviaremos um código de 4 dígitos para seu e-mail.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white py-4 font-lato font-semibold tracking-widest uppercase text-sm hover:bg-gold disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enviando...</>
                  ) : (
                    <><Mail size={16} /> Enviar Código</>
                  )}
                </button>
              </form>
            )}

            {/* Footer links */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-stone-500 text-sm">
                Não tem conta?{" "}
                <Link to="/cadastro" className="text-gold hover:underline font-medium">
                  Cadastre-se grátis
                </Link>
              </p>
              <p className="text-stone-400 text-xs">
                <Link to="/" className="hover:text-stone-600 transition-colors flex items-center justify-center gap-1">
                  <ArrowLeft size={11} /> Voltar à loja
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
