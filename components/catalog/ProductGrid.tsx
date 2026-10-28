"use client";

import { ProductCard } from "./ProductCard";
import type { ItemComFoto } from "@/types/item";
import type { ItemCarrinho } from "@/types/carrinho";

interface ProductGridProps {
  itens: ItemComFoto[];
  onAdicionarAoCarrinho: (item: ItemCarrinho) => void;
}

export function ProductGrid({ itens, onAdicionarAoCarrinho }: ProductGridProps) {
  if (itens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-6xl mb-4">🥐</span>
        <h3 className="text-lg font-semibold text-gray-700">Nenhum produto cadastrado</h3>
        <p className="text-gray-500 mt-1 text-sm">Aguarde a padaria adicionar os produtos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
