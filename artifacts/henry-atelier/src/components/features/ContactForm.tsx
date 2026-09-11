import React, { useState } from "react";
import { createContactDB } from "@/lib/supabase";
import { toast } from "sonner";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Digite um e-mail válido.");
      return;
    }
    setLoading(true);
    try {
      await createContactDB({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        message: form.message,
      });
      toast.success("Mensagem enviada com sucesso!");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="cf-name" className="block text-sm text-stone-600 mb-1.5">Nome *</label>
        <input
          id="cf-name"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Seu nome"
          className="w-full border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm"
        />
      </div>
      <div>
        <label htmlFor="cf-email" className="block text-sm text-stone-600 mb-1.5">E-mail *</label>
        <input
          id="cf-email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="seu@email.com"
          className="w-full border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm"
        />
      </div>
      <div>
        <label htmlFor="cf-phone" className="block text-sm text-stone-600 mb-1.5">Telefone</label>
        <input
          id="cf-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="(11) 99999-9999"
          className="w-full border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm"
        />
      </div>
      <div>
        <label htmlFor="cf-message" className="block text-sm text-stone-600 mb-1.5">Mensagem *</label>
        <textarea
          id="cf-message"
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Como podemos ajudá-lo?"
          className="w-full border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-gold text-sm resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-stone-900 text-white py-4 font-lato font-semibold tracking-widest uppercase text-sm hover:bg-gold disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {loading ? "Enviando..." : "Enviar Mensagem"}
      </button>
    </form>
  );
}
