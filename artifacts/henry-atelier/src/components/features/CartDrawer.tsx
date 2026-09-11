import React from "react";
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, Gift } from "lucide-react";
import type { CartItem } from "@/types";
import { useNavigate } from "react-router-dom";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  total,
  onUpdateQuantity,
  onRemove,
}: CartDrawerProps) {
  const navigate = useNavigate();
  const FREE_SHIPPING = 199;
  const remaining = FREE_SHIPPING - total;
  const progress = Math.min((total / FREE_SHIPPING) * 100, 100);

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 transform transition-transform duration-300 flex flex-col shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-stone-950">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={19} className="text-gold" />
            <h2 className="font-playfair text-lg text-white">Carrinho</h2>
            {items.length > 0 && (
              <span className="bg-gold text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {items.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white transition-colors"
            aria-label="Fechar carrinho"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free shipping progress */}
        {items.length > 0 && (
          <div className="px-5 py-3 bg-stone-50 border-b border-stone-100">
            {remaining > 0 ? (
              <p className="text-xs text-stone-600 mb-1.5 flex items-center gap-1.5">
                <Gift size={12} className="text-gold" />
                Frete grátis a partir de <strong>R$ {remaining.toFixed(2).replace(".", ",")}</strong> a mais
              </p>
            ) : (
              <p className="text-xs text-green-700 mb-1.5 flex items-center gap-1.5 font-medium">
                <Gift size={12} className="text-green-600" />
                Você ganhou frete grátis.
              </p>
            )}
            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <ShoppingBag size={52} className="text-stone-200 mb-4" />
              <p className="font-playfair text-xl text-stone-400 mb-2">Carrinho vazio</p>
              <p className="text-stone-400 text-sm mb-6">Encontre o aroma perfeito para você</p>
              <button
                onClick={onClose}
                className="text-gold text-sm font-medium hover:underline flex items-center gap-1"
              >
                Ver produtos <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3 py-4 border-b border-stone-50 last:border-0">
                  <img
                    src={item.product.image_url ?? item.product.imageUrl}
                    alt={item.product.name}
                    className="w-18 h-18 w-[72px] h-[72px] object-cover flex-shrink-0 bg-beige-light"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-playfair text-sm text-stone-900 leading-tight line-clamp-2">
                      {item.product.name}
                    </p>
                    <p className="text-gold font-semibold text-sm mt-0.5">
                      R$ {item.product.price.toFixed(2).replace(".", ",")}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity */}
                      <div className="flex items-center border border-stone-200">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-stone-700 text-sm font-medium">
                          R$ {(item.product.price * item.quantity).toFixed(2).replace(".", ",")}
                        </span>
                        <button
                          onClick={() => onRemove(item.product.id)}
                          className="p-1.5 text-stone-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                          aria-label="Remover item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-stone-100 bg-stone-50">
            <div className="flex justify-between mb-1">
              <span className="text-stone-500 text-sm">Subtotal</span>
              <span className="text-stone-900 font-semibold">
                R$ {total.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-stone-400 text-xs">Frete</span>
              <span className={`text-xs font-medium ${total >= FREE_SHIPPING ? "text-green-600" : "text-stone-400"}`}>
                {total >= FREE_SHIPPING ? "GRÁTIS" : "Calculado no checkout"}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-stone-900 text-white py-4 font-lato font-semibold tracking-widest uppercase text-sm hover:bg-gold transition-colors duration-200 flex items-center justify-center gap-2"
            >
              Finalizar Pedido <ArrowRight size={16} />
            </button>
            <button
              onClick={onClose}
              className="w-full mt-2 py-2.5 text-stone-500 text-xs hover:text-stone-700 transition-colors"
            >
              Continuar comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
