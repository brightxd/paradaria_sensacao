"use client";

import Image from "next/image";
import { formatarReais } from "@/lib/carrinho";
import type { ItemComFoto } from "@/types/item";
import { useState } from "react";

interface ProductCardProps {
  item: ItemComFoto;
  onAdicionarAoCarrinho: (item: ItemComFoto, quantidade: number) => void;
}

export function ProductCard({ item, onAdicionarAoCarrinho }: ProductCardProps) {
  const [quantidade, setQuantidade] = useState(1);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col border border-amber-50">
      {/* Foto */}
      <div className="relative h-52 bg-amber-50 overflow-hidden">
        {item.fotoUrl ? (
          <Image
            src={item.fotoUrl}
            alt={item.nome}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-6xl">🍞</span>
            <span className="text-xs text-amber-400 font-medium">Sem foto</span>
          </div>
        )}
        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-amber-800 font-bold text-sm px-3 py-1 rounded-full shadow-sm">
          {formatarReais(item.valorCents)}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-4">
        <div className="flex-1">
          <h3 className="font-playfair font-bold text-amber-950 text-base leading-tight">{item.nome}</h3>
          {item.descricao && (
            <p className="text-sm text-stone-500 mt-1 line-clamp-2 leading-relaxed">{item.descricao}</p>
          )}
        </div>

        {/* Qty stepper + add button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-amber-50 rounded-lg overflow-hidden border border-amber-100">
            <button
              className="w-8 h-8 flex items-center justify-center text-amber-700 hover:bg-amber-100 text-lg font-medium transition-colors"
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              aria-label="Diminuir quantidade"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-semibold text-amber-900">{quantidade}</span>
            <button
              className="w-8 h-8 flex items-center justify-center text-amber-700 hover:bg-amber-100 text-lg font-medium transition-colors"
              onClick={() => setQuantidade((q) => q + 1)}
              aria-label="Aumentar quantidade"
            >
              +
            </button>
          </div>

          <button
            className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold bg-amber-700 text-white hover:bg-amber-800 active:scale-95 transition-all"
            onClick={() => {
              onAdicionarAoCarrinho(item, quantidade);
              setQuantidade(1);
            }}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
