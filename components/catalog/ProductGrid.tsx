"use client";

import { ProductCard } from "./ProductCard";
import type { ItemComFoto } from "@/types/item";
import type { ItemCarrinho } from "@/types/carrinho";

interface ProductGridProps {
  itens: ItemComFoto[];
  onAdicionarAoCarrinho: (item: ItemCarrinho) => void;
}

export function ProductGrid({ itens, onAdicionarAoCarrinho }: ProductGridProps) {
  if (!itens || itens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-7xl mb-5">🥐</span>
        <h3 className="font-playfair text-xl font-bold text-amber-950">Nenhum produto ainda</h3>
        <p className="text-stone-500 mt-2 text-sm">Aguarde a padaria adicionar os produtos ao cardápio.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {itens.map((item) => (
        <ProductCard
          key={item.id}
          item={item}
          onAdicionarAoCarrinho={(itemComFoto, quantidade) =>
            onAdicionarAoCarrinho({
              itemId: itemComFoto.id,
              nome: itemComFoto.nome,
              valorCents: itemComFoto.valorCents,
              fotoUrl: itemComFoto.fotoUrl,
              quantidade,
            })
          }
        />
      ))}
    </div>
  );
}
