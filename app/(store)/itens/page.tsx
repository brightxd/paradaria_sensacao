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
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.erro ?? "Erro ao carregar");
        return data;
      })
      .then(({ itens: lista }) => setItens(lista ?? []))
      .catch(() => setErro("Não foi possível carregar o cardápio."))
      .finally(() => setCarregando(false));
  }, []);

  const handleAdicionar = (item: ItemCarrinho) => {
    adicionar(item);
    setMensagem(`${item.nome} adicionado!`);
    setTimeout(() => setMensagem(null), 2500);
  };

  return (
    <>
      {/* Page header */}
      <div className="bg-white border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 flex items-end justify-between">
          <div>
            <p className="text-amber-600 text-sm font-medium uppercase tracking-widest mb-1">Padaria 100sação</p>
            <h1 className="font-playfair text-4xl font-bold text-amber-950">Cardápio</h1>
          </div>
          <Link
            href="/itens/novo"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-amber-700 text-white hover:bg-amber-800 transition-colors shadow-sm"
          >
            + Novo produto
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10">
        {mensagem && (
          <div className="mb-6 px-5 py-3.5 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium flex items-center gap-2">
            <span className="text-lg">✓</span>
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="mb-6 px-5 py-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {erro}
          </div>
        )}

        {carregando ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-stone-500 text-sm">Carregando cardápio...</p>
          </div>
        ) : (
          <ProductGrid itens={itens} onAdicionarAoCarrinho={handleAdicionar} />
        )}
      </div>

      {/* Floating cart bar */}
      {carrinho.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Link
            href="/checkout"
            className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-amber-800 text-white font-semibold shadow-2xl hover:bg-amber-900 transition-all hover:-translate-y-0.5"
          >
            <span className="bg-amber-600 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
              {carrinho.length}
            </span>
            <span>Ver pedido</span>
            <span className="h-4 w-px bg-amber-600" />
            <span className="text-amber-200">{formatarReais(total)}</span>
            <span>→</span>
          </Link>
        </div>
      )}
    </>
  );
}
