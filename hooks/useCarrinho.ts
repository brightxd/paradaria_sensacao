"use client";

import { useState, useCallback } from "react";
import {
  carregarCarrinho,
  adicionarAoCarrinho,
  removerDoCarrinho,
  limparCarrinho,
  calcularTotal,
} from "@/lib/carrinho";
import type { ItemCarrinho } from "@/types/carrinho";

export function useCarrinho() {
  const [itens, setItens] = useState<ItemCarrinho[]>(() => carregarCarrinho().itens);

  const adicionar = useCallback((item: ItemCarrinho) => {
    const atualizado = adicionarAoCarrinho(item);
    setItens([...atualizado.itens]);
  }, []);

  const remover = useCallback((itemId: string) => {
    const atualizado = removerDoCarrinho(itemId);
    setItens([...atualizado.itens]);
  }, []);

  const limpar = useCallback(() => {
    limparCarrinho();
    setItens([]);
  }, []);

  const total = calcularTotal({ itens });

  return { itens, total, adicionar, remover, limpar };
}
