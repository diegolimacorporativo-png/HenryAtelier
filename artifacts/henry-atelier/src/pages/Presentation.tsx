import React, { useState } from "react";
import {
  ChevronLeft, ChevronRight, Monitor, Zap, TrendingUp, Database,
  Smartphone, Shield, Globe, Users, CheckCircle, ArrowRight,
  Code2, GitBranch, Layout, BarChart3, MessageSquare, Star,
  Building2, Settings, Lock
} from "lucide-react";
import grfLogo from "@/assets/grf-logo.jpeg";

const TOTAL_SLIDES = 7;

interface SlideProps {
  children: React.ReactNode;
}

function Slide({ children }: SlideProps) {
  return (
    <div className="w-full h-full flex flex-col">
      {children}
    </div>
  );
}

export default function Presentation() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(TOTAL_SLIDES - 1, c + 1));

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };

  const slides = [
    // ── SLIDE 1 — CAPA ──────────────────────────────────────────
    <Slide key={0}>
      <div className="flex-1 bg-[#0d0d0d] relative overflow-hidden flex flex-col items-center justify-center text-center px-8">
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "linear-gradient(#F5C842 1px, transparent 1px), linear-gradient(90deg, #F5C842 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        {/* Accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F5C842] to-[#d4a800]" />
        {/* Vertical accent */}
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#F5C842] to-transparent opacity-40" />

        <div className="relative z-10 max-w-3xl">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img src={grfLogo} alt="GRF Construção" className="w-24 h-24 object-contain bg-white/5 rounded-xl p-2 border border-white/10" />
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-[#F5C842]/50" />
            <span className="text-[#F5C842] text-xs tracking-[0.5em] uppercase font-medium">Proposta Comercial</span>
            <div className="h-px w-16 bg-[#F5C842]/50" />
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
            PROJETO DIGITAL
            <br />
            <span className="text-[#F5C842]">GRF CONSTRUÇÃO</span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mt-4">
            Site profissional arquitetado para geração de autoridade, orçamento e crescimento futuro.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {["Site Premium", "CRM de Obras", "Painel Admin", "Expansão App"].map((tag) => (
              <span key={tag} className="border border-[#F5C842]/30 text-[#F5C842]/80 text-xs px-4 py-1.5 tracking-widest uppercase">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 right-8 text-gray-600 text-xs tracking-widest uppercase">2025</div>
      </div>
    </Slide>,

    // ── SLIDE 2 — O SITE QUE SERÁ ENTREGUE ──────────────────────
    <Slide key={1}>
      <div className="flex-1 bg-[#111] relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F5C842] to-[#d4a800]" />

        {/* Header */}
        <div className="px-8 sm:px-14 pt-10 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <Monitor size={20} className="text-[#F5C842]" />
            <span className="text-[#F5C842] text-xs tracking-[0.4em] uppercase">Entrega</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">O Site Que Será Entregue</h2>
        </div>

        <div className="flex-1 px-8 sm:px-14 py-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
          {[
            { icon: <Layout size={16} />, title: "Páginas Completas", desc: "Home premium · Sobre · Serviços · Portfólio · Orçamento · Contato" },
            { icon: <MessageSquare size={16} />, title: "WhatsApp Flutuante", desc: "Botão direto em todas as páginas, número editável no admin" },
            { icon: <Globe size={16} />, title: "SEO São Paulo", desc: "Otimizado para Google: metadados, schema, sitemap e robots.txt" },
            { icon: <Smartphone size={16} />, title: "Ultra Responsivo", desc: "Perfeito em mobile, tablet e desktop — testado em todos browsers" },
            { icon: <Zap size={16} />, title: "Performance Premium", desc: "Carregamento rápido, imagens otimizadas, Lighthouse 90+" },
            { icon: <Shield size={16} />, title: "Arquitetura Escalável", desc: "Preparado para GitHub + Render + futuras integrações" },
            { icon: <Database size={16} />, title: "Integração com E-mail", desc: "Formulário de orçamento com envio automático de e-mail" },
            { icon: <Code2 size={16} />, title: "Clean Code", desc: "Código limpo, documentado, fácil de manter e expandir" },
            { icon: <GitBranch size={16} />, title: "Deploy Profissional", desc: "GitHub versionado + Render com CI/CD automático" },
          ].map((item) => (
            <div key={item.title} className="bg-white/4 border border-white/8 p-4 hover:border-[#F5C842]/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#F5C842]">{item.icon}</span>
                <span className="text-white font-semibold text-sm">{item.title}</span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Slide>,

    // ── SLIDE 3 — FUNCIONALIDADES ────────────────────────────────
    <Slide key={2}>
      <div className="flex-1 bg-[#0d0d0d] relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F5C842] to-[#d4a800]" />
        <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-[#F5C842]/20 to-transparent" />

        <div className="px-8 sm:px-14 pt-10 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={20} className="text-[#F5C842]" />
            <span className="text-[#F5C842] text-xs tracking-[0.4em] uppercase">Resultados</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Funcionalidades & Benefícios</h2>
        </div>

        <div className="flex-1 px-8 sm:px-14 py-8 grid sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-[#F5C842] font-bold text-sm tracking-widest uppercase mb-4">Geração de Negócios</h3>
            <div className="space-y-3">
              {[
                "Geração automática de leads qualificados",
                "Pedido de orçamento com formulário completo",
                "Clique direto no WhatsApp da empresa",
                "Prova visual com galeria de obras reais",
                "Fortalecimento de marca e autoridade",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle size={14} className="text-[#F5C842] flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[#F5C842] font-bold text-sm tracking-widest uppercase mb-4">Crescimento Digital</h3>
            <div className="space-y-3">
              {[
                "Autoridade orgânica no Google São Paulo",
                "Preparado para tráfego pago (Meta + Google Ads)",
                "Base para criação de landing pages futuras",
                "Analytics integrado para acompanhar resultados",
                "Integração com Instagram e redes sociais",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle size={14} className="text-[#F5C842] flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Highlight box */}
          <div className="sm:col-span-2 bg-[#F5C842]/8 border border-[#F5C842]/20 p-5 flex items-center gap-4">
            <Star size={32} className="text-[#F5C842] flex-shrink-0" />
            <div>
              <p className="text-white font-bold text-base">Impacto imediato nas vendas</p>
              <p className="text-gray-400 text-sm mt-1">
                Empresas de construção civil com presença digital bem posicionada capturam até <strong className="text-[#F5C842]">3x mais leads</strong> do que concorrentes sem site profissional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Slide>,

    // ── SLIDE 4 — EVOLUÇÃO FUTURA ────────────────────────────────
    <Slide key={3}>
      <div className="flex-1 bg-[#111] relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F5C842] to-[#d4a800]" />

        <div className="px-8 sm:px-14 pt-10 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <Zap size={20} className="text-[#F5C842]" />
            <span className="text-[#F5C842] text-xs tracking-[0.4em] uppercase">Expansão</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Evolução Futura do Sistema</h2>
          <p className="text-gray-500 text-sm mt-2">Módulos opcionais disponíveis para expansão gradual conforme o crescimento</p>
        </div>

        <div className="flex-1 px-8 sm:px-14 py-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
          {[
            { icon: <Settings size={16} />, label: "Painel Administrativo", tag: "Fase 2", desc: "Gestão completa do site sem precisar de programador" },
            { icon: <Users size={16} />, label: "CRM de Obras", tag: "Fase 2", desc: "Pipeline completo: lead → visita → proposta → obra → entrega" },
            { icon: <Building2 size={16} />, label: "Portal do Cliente", tag: "Fase 3", desc: "Cliente acompanha o andamento da obra em tempo real" },
            { icon: <BarChart3 size={16} />, label: "Dashboard de Orçamentos", tag: "Fase 3", desc: "Gestão financeira e comercial das propostas enviadas" },
            { icon: <Monitor size={16} />, label: "Upload de Fotos", tag: "Fase 3", desc: "Registro fotográfico de obras diretamente no sistema" },
            { icon: <MessageSquare size={16} />, label: "Chatbot IA", tag: "Fase 4", desc: "Atendimento automatizado e qualificação de leads 24h" },
            { icon: <Smartphone size={16} />, label: "App Mobile", tag: "Fase 4", desc: "Gestão de obras e clientes pelo celular" },
            { icon: <Zap size={16} />, label: "Automação Comercial", tag: "Fase 4", desc: "n8n, webhooks, follow-up automático por WhatsApp" },
            { icon: <Database size={16} />, label: "Integração ERP", tag: "Fase 5", desc: "Conexão com sistemas financeiros e de estoque" },
          ].map((item) => (
            <div key={item.label} className="bg-white/3 border border-white/6 p-4 hover:border-[#F5C842]/20 transition-colors group">
              <div className="flex items-start justify-between mb-2">
                <span className="text-[#F5C842] group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="text-[10px] bg-[#F5C842]/15 text-[#F5C842] px-2 py-0.5 tracking-wide">{item.tag}</span>
              </div>
              <p className="text-white font-semibold text-sm mb-1">{item.label}</p>
              <p className="text-gray-600 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Slide>,

    // ── SLIDE 5 — ARQUITETURA ────────────────────────────────────
    <Slide key={4}>
      <div className="flex-1 bg-[#0d0d0d] relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F5C842] to-[#d4a800]" />
        <div className="absolute inset-0 opacity-3"
          style={{ backgroundImage: "radial-gradient(circle, #F5C842 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

        <div className="px-8 sm:px-14 pt-10 pb-6 border-b border-white/5 relative">
          <div className="flex items-center gap-3 mb-2">
            <Code2 size={20} className="text-[#F5C842]" />
            <span className="text-[#F5C842] text-xs tracking-[0.4em] uppercase">Tecnologia</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Arquitetura do Projeto</h2>
        </div>

        <div className="flex-1 px-8 sm:px-14 py-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 content-start relative">
          {[
            {
              cat: "Frontend",
              color: "#F5C842",
              items: ["React + TypeScript", "Tailwind CSS", "Componentização modular", "SSR / ISR otimizado", "Lazy loading"]
            },
            {
              cat: "Backend",
              color: "#4ade80",
              items: ["Node.js / Next.js API", "Service layer", "Repository pattern", "Validação com Zod", "Error boundaries"]
            },
            {
              cat: "Banco de Dados",
              color: "#60a5fa",
              items: ["PostgreSQL", "ORM estruturado", "Migrations versionadas", "Soft delete", "Audit timestamps"]
            },
            {
              cat: "DevOps",
              color: "#f472b6",
              items: ["GitHub versionado", "Deploy no Render", "CI/CD automático", "Health checks", "Variáveis de ambiente"]
            },
          ].map((col) => (
            <div key={col.cat} className="bg-white/3 border border-white/8 p-5">
              <h3 className="font-bold text-sm mb-3" style={{ color: col.color }}>{col.cat}</h3>
              <div className="space-y-2">
                {col.items.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                    <p className="text-gray-400 text-xs">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="sm:col-span-2 lg:col-span-4 bg-[#F5C842]/5 border border-[#F5C842]/15 p-4 flex items-center gap-3">
            <Lock size={18} className="text-[#F5C842] flex-shrink-0" />
            <p className="text-gray-300 text-sm">
              <strong className="text-white">Segurança enterprise:</strong> HTTPS obrigatório · sanitização de inputs · proteção CSRF · senhas com hash bcrypt · RBAC por cargos
            </p>
          </div>
        </div>
      </div>
    </Slide>,

    // ── SLIDE 6 — INVESTIMENTO ───────────────────────────────────
    <Slide key={5}>
      <div className="flex-1 bg-[#111] relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F5C842] to-[#d4a800]" />

        <div className="px-8 sm:px-14 pt-10 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 size={20} className="text-[#F5C842]" />
            <span className="text-[#F5C842] text-xs tracking-[0.4em] uppercase">Investimento</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Planos e Valores</h2>
        </div>

        <div className="flex-1 px-8 sm:px-14 py-8 grid sm:grid-cols-3 gap-5 content-center">
          {/* Plano 1 */}
          <div className="bg-white/4 border border-white/10 p-6 flex flex-col">
            <div className="mb-4">
              <span className="text-gray-500 text-xs tracking-widest uppercase">Plano</span>
              <h3 className="text-white text-xl font-bold mt-1">Site Premium</h3>
            </div>
            <div className="space-y-2 flex-1 mb-6">
              {["Site completo profissional", "Design premium personalizado", "Copy estratégica de vendas", "WhatsApp integrado", "SEO para São Paulo", "Formulário de orçamento", "Deploy profissional", "Suporte pós-entrega"].map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <CheckCircle size={13} className="text-gray-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400 text-xs">{f}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-gray-500 text-xs mb-1">Investimento</p>
              <p className="text-3xl font-bold text-white">R$ 2.500</p>
            </div>
          </div>

          {/* Plano 2 — destaque */}
          <div className="bg-[#F5C842]/8 border-2 border-[#F5C842] p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F5C842] text-black text-xs font-bold px-4 py-1 tracking-widest uppercase">
              Recomendado
            </div>
            <div className="mb-4">
              <span className="text-[#F5C842] text-xs tracking-widest uppercase">Plano</span>
              <h3 className="text-white text-xl font-bold mt-1">Site + Admin</h3>
            </div>
            <div className="space-y-2 flex-1 mb-6">
              {["Tudo do Plano Premium", "Painel admin completo", "Login seguro com RBAC", "CRM básico de leads", "Gestão de portfólio", "Configurações do site", "Base para expansão futura", "30 dias de suporte"].map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <CheckCircle size={13} className="text-[#F5C842] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-xs">{f}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#F5C842]/30 pt-4">
              <p className="text-[#F5C842]/70 text-xs mb-1">Investimento</p>
              <p className="text-3xl font-bold text-[#F5C842]">R$ 3.500</p>
            </div>
          </div>

          {/* Plano 3 */}
          <div className="bg-white/3 border border-white/8 p-6 flex flex-col">
            <div className="mb-4">
              <span className="text-gray-500 text-xs tracking-widest uppercase">Plano</span>
              <h3 className="text-white text-xl font-bold mt-1">Sistema + App</h3>
            </div>
            <div className="space-y-2 flex-1 mb-6">
              {["Site + Admin + CRM completo", "Pipeline de obras Kanban", "Portal do cliente", "Dashboard financeiro", "Upload de fotos de obras", "Chatbot IA integrado", "App mobile (iOS + Android)", "Automação comercial"].map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <CheckCircle size={13} className="text-gray-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400 text-xs">{f}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-gray-500 text-xs mb-1">Investimento estimado</p>
              <p className="text-3xl font-bold text-white">R$ 8.000<span className="text-xl text-gray-500">+</span></p>
            </div>
          </div>
        </div>
      </div>
    </Slide>,

    // ── SLIDE 7 — FECHAMENTO ─────────────────────────────────────
    <Slide key={6}>
      <div className="flex-1 bg-[#0d0d0d] relative overflow-hidden flex flex-col items-center justify-center text-center px-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F5C842] to-[#d4a800]" />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "linear-gradient(#F5C842 1px, transparent 1px), linear-gradient(90deg, #F5C842 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        {/* Large BG text */}
        <p className="absolute text-[180px] font-black text-white/2 select-none tracking-tighter leading-none">GRF</p>

        <div className="relative z-10 max-w-2xl">
          <img src={grfLogo} alt="GRF" className="w-16 h-16 object-contain mx-auto mb-8 opacity-80" />

          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12 bg-[#F5C842]/50" />
            <span className="text-[#F5C842] text-xs tracking-[0.5em] uppercase">Próximos Passos</span>
            <div className="h-px w-12 bg-[#F5C842]/50" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            O site da GRF será mais do que
            <br />
            <span className="text-[#F5C842]">presença digital.</span>
          </h2>

          <p className="text-gray-400 text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Será uma <strong className="text-white">base estratégica</strong> para vendas, autoridade e futura expansão tecnológica da empresa — uma plataforma que cresce junto com o seu negócio.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <div className="bg-[#F5C842] text-black px-10 py-4 font-bold text-sm tracking-widest uppercase flex items-center gap-2 cursor-default">
              Aprovação e Início Imediato <ArrowRight size={16} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 border-t border-white/5 pt-8">
            {[
              { label: "Prazo de Entrega", value: "15 dias" },
              { label: "Revisões Incluídas", value: "3 rounds" },
              { label: "Suporte Pós-entrega", value: "30 dias" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[#F5C842] font-bold text-xl">{item.value}</p>
                <p className="text-gray-600 text-xs mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Slide>,
  ];

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col"
      tabIndex={0}
      onKeyDown={handleKey}
      style={{ outline: "none" }}
    >
      {/* Slide area */}
      <div className="flex-1 overflow-hidden relative">
        {slides[current]}
      </div>

      {/* Navigation */}
      <div className="bg-[#0a0a0a] border-t border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={grfLogo} alt="GRF" className="w-6 h-6 object-contain opacity-60" />
          <span className="text-gray-600 text-xs tracking-widest uppercase hidden sm:block">GRF Construção Civil</span>
        </div>

        {/* Slide indicators */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current ? "bg-[#F5C842] w-6" : "bg-white/15 w-1.5 hover:bg-white/30"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-xs mr-2 hidden sm:block">{current + 1} / {TOTAL_SLIDES}</span>
          <button
            onClick={prev}
            disabled={current === 0}
            className="w-9 h-9 flex items-center justify-center border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-colors disabled:opacity-20"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={next}
            disabled={current === TOTAL_SLIDES - 1}
            className="w-9 h-9 flex items-center justify-center border border-[#F5C842]/40 text-[#F5C842] hover:bg-[#F5C842] hover:text-black transition-colors disabled:opacity-20"
            aria-label="Próximo slide"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
