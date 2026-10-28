"use client";

import Image from "next/image";
import { formatarReais } from "@/lib/carrinho";
import { Button } from "@/components/ui/Button";
import type { ItemComFoto } from "@/types/item";
import { useState } from "react";

interface ProductCardProps {
  item: ItemComFoto;
  onAdicionarAoCarrinho: (item: ItemComFoto, quantidade: number) => void;
}

export function ProductCard({ item, onAdicionarAoCarrinho }: ProductCardProps) {
  const [quantidade, setQuantidade] = useState(1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="relative h-52 bg-amber-50">
        {item.fotoUrl ? (
          <Image
            src={item.fotoUrl}
            alt={item.nome}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-amber-300">
            <span className="text-5xl">🍞</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-base leading-tight">{item.nome}</h3>
          {item.descricao && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.descricao}</p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-amber-600">{formatarReais(item.valorCents)}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                className="px-2 py-1 text-gray-500 hover:bg-gray-50 text-sm"
                onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                aria-label="Diminuir quantidade"
              >
                −
              </button>
              <span className="px-3 py-1 text-sm font-medium text-gray-700 min-w-[32px] text-center">
                {quantidade}
              </span>
              <button
                className="px-2 py-1 text-gray-500 hover:bg-gray-50 text-sm"
                onClick={() => setQuantidade((q) => q + 1)}
                aria-label="Aumentar quantidade"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <Button
          size="sm"
          className="w-full"
          onClick={() => {
            onAdicionarAoCarrinho(item, quantidade);
            setQuantidade(1);
          }}
        >
          Adicionar ao pedido
        </Button>
      </div>
    </div>
  );
}
