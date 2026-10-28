"use client";

import { formatarReais } from "@/lib/carrinho";
import type { ItemCarrinho } from "@/types/carrinho";

interface CartSummaryProps {
  itens: ItemCarrinho[];
  total: number;
  onRemover: (itemId: string) => void;
}

export function CartSummary({ itens, total, onRemover }: CartSummaryProps) {
  if (itens.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-amber-100 p-8 text-center">
        <span className="text-5xl block mb-3">🛒</span>
        <p className="text-stone-500 text-sm">Seu pedido está vazio.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden shadow-sm">
      <div className="divide-y divide-stone-50">
        {itens.map((item) => (
          <div key={item.itemId} className="flex items-center gap-3 px-5 py-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-base shrink-0">
              🍞
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-800 truncate">{item.nome}</p>
              <p className="text-xs text-stone-400 mt-0.5">
                {item.quantidade}x · {formatarReais(item.valorCents)} cada
              </p>
            </div>
            <span className="text-sm font-bold text-amber-800 shrink-0">
              {formatarReais(item.valorCents * item.quantidade)}
            </span>
            <button
              onClick={() => onRemover(item.itemId)}
              className="text-stone-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50 shrink-0"
              aria-label={`Remover ${item.nome}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="border-t border-amber-100 px-5 py-4 flex items-center justify-between bg-amber-50/60">
        <span className="text-sm font-semibold text-stone-600">Total</span>
        <span className="font-playfair text-xl font-bold text-amber-800">{formatarReais(total)}</span>
      </div>
    </div>
  );
}
