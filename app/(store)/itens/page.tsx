"use client";

import { useState, useEffect } from "react";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { useCarrinho } from "@/hooks/useCarrinho";
import type { ItemComFoto } from "@/types/item";
import type { ItemCarrinho } from "@/types/carrinho";
import Link from "next/link";
import { formatarReais } from "@/lib/carrinho";

export default function ItensPage() {
  const [itens, setItens] = useState<ItemComFoto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const { itens: carrinho, total, adicionar } = useCarrinho();

  useEffect(() => {
    fetch("/api/itens")
      .then((r) => r.json())
      .then(({ itens: lista }) => setItens(lista))
      .catch(() => setErro("Não foi possível carregar o cardápio."))
      .finally(() => setCarregando(false));
  }, []);

  const handleAdicionar = (item: ItemCarrinho) => {
    adicionar(item);
    setMensagem(`${item.nome} adicionado ao pedido!`);
    setTimeout(() => setMensagem(null), 2500);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Cardápio</h1>
          <p className="text-gray-500 mt-1 text-sm">Escolha o que deseja e adicione ao pedido</p>
        </div>
        <Link
          href="/itens/novo"
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors"
        >
          + Novo produto
        </Link>
      </div>

      {mensagem && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium flex items-center gap-2">
          ✓ {mensagem}
        </div>
      )}

      {erro && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {erro}
        </div>
      )}

      {carregando ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ProductGrid itens={itens} onAdicionarAoCarrinho={handleAdicionar} />
      )}

      {carrinho.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Link
            href="/checkout"
            className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-amber-600 text-white font-semibold shadow-lg hover:bg-amber-700 transition-all"
          >
            <span>🛒 {carrinho.length} {carrinho.length === 1 ? "item" : "itens"}</span>
            <span className="h-4 w-px bg-amber-400" />
            <span>{formatarReais(total)}</span>
            <span>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
