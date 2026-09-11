import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-beige-light flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-gold text-8xl font-playfair font-light mb-4">404</p>
        <h1 className="font-playfair text-2xl text-stone-900 mb-3">Página não encontrada</h1>
        <p className="text-stone-500 mb-8">A página que você procura não existe ou foi movida.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-4 font-lato font-semibold tracking-widest uppercase text-sm hover:bg-gold transition-colors"
        >
          Voltar à Loja
        </Link>
      </div>
    </div>
  );
}
