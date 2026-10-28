"use client";

import { formatarReais } from "@/lib/carrinho";
import type { ItemCarrinho } from "@/types/carrinho";
import { Button } from "@/components/ui/Button";

interface CartSummaryProps {
  itens: ItemCarrinho[];
  total: number;
  onRemover: (itemId: string) => void;
}

export function CartSummary({ itens, total, onRemover }: CartSummaryProps) {
  if (itens.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
        <span className="text-4xl block mb-2">🛒</span>
        <p className="text-gray-500 text-sm">Seu pedido está vazio.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="divide-y divide-gray-50">
        {itens.map((item) => (
          <div key={item.itemId} className="flex items-center gap-3 p-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.nome}</p>
              <p className="text-xs text-gray-500">
                {item.quantidade}x {formatarReais(item.valorCents)}
              </p>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {formatarReais(item.valorCents * item.quantidade)}
            </span>
            <button
              onClick={() => onRemover(item.itemId)}
              className="text-gray-300 hover:text-red-400 transition-colors p-1"
              aria-label={`Remover ${item.nome}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50">
        <span className="text-sm font-semibold text-gray-700">Total</span>
        <span className="text-lg font-bold text-amber-600">{formatarReais(total)}</span>
      </div>
    </div>
  );
}
