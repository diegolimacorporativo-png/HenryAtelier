import React, { useState } from "react";
import { ShoppingCart, Plus, Star, Tag, Check, AlertTriangle, Flower2, Timer } from "lucide-react";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const imageUrl = product.image_url ?? product.imageUrl ?? "";
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  const categoryLabel: Record<string, string> = {
    atelier: "Linha Atelier",
    "henry-home": "Henry Home",
    "don-henry": "Don Henry",
    aromas: "Aromas",
  };

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="group bg-white border border-stone-100 hover:border-stone-200 hover:shadow-md transition-all duration-300">
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-beige-light">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.category === "don-henry" && (
            <span className="bg-stone-900 text-gold text-xs tracking-widest px-2 py-1 uppercase font-medium">Luxo</span>
          )}
          {product.featured && (
            <span className="bg-gold text-white text-xs px-2 py-1 flex items-center gap-1 font-medium">
              <Star size={11} fill="white" /> Destaque
            </span>
          )}
          {hasDiscount && discountPct > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 font-semibold">-{discountPct}%</span>
          )}
        </div>
        {/* Stock warning */}
        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-3 left-3 right-3">
            <span className="bg-orange-500/90 text-white text-xs px-2 py-1 backdrop-blur-sm">
              <span className="inline-flex items-center gap-1.5"><AlertTriangle size={12} /> Últimas {product.stock} unidades!</span>
            </span>
          </div>
        )}
        {/* Quick add overlay */}
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-200 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-white text-stone-900 px-4 py-2 text-xs font-semibold tracking-widest uppercase hover:bg-gold hover:text-white transition-colors duration-150 shadow-md"
          >
            <Plus size={13} /> Adicionar
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-stone-400 tracking-widest uppercase mb-1">
          {categoryLabel[product.category] ?? product.category}
        </p>
        <h3 className="font-playfair text-stone-900 text-base leading-tight mb-1">{product.name}</h3>
        <p className="text-stone-500 text-xs leading-relaxed mb-3 line-clamp-2">{product.description}</p>

        {/* Fragrance hints */}
        {(product.notes_top || product.fixation) && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.notes_top && (
              <span className="inline-flex items-center gap-1 text-xs bg-beige-light text-stone-500 px-2 py-0.5"><Flower2 size={11} /> {product.notes_top.split(",")[0].trim()}</span>
            )}
            {product.fixation && (
              <span className="inline-flex items-center gap-1 text-xs bg-beige-light text-stone-500 px-2 py-0.5"><Timer size={11} /> {product.fixation}</span>
            )}
            {product.volume_ml && (
              <span className="text-xs bg-beige-light text-stone-500 px-2 py-0.5">{product.volume_ml}ml</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div>
            {hasDiscount && (
              <p className="text-stone-400 text-xs line-through">R$ {product.original_price!.toFixed(2).replace(".", ",")}</p>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-gold font-semibold font-lato text-lg">
                R$ {product.price.toFixed(2).replace(".", ",")}
              </span>
              {hasDiscount && (
                <Tag size={12} className="text-green-500" />
              )}
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={added}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold tracking-wide uppercase transition-all duration-200 flex-shrink-0 ${
              added
                ? "bg-green-600 text-white scale-95"
                : "bg-stone-900 text-white hover:bg-gold"
            }`}
          >
            {added ? (
              <><Check size={13} /> Adicionado!</>
            ) : (
              <><ShoppingCart size={13} /> Adicionar</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
