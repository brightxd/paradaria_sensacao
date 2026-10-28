import type { Carrinho, ItemCarrinho } from "@/types/carrinho";

const CHAVE_STORAGE = "padaria_carrinho";

export function carregarCarrinho(): Carrinho {
  if (typeof window === "undefined") return { itens: [] };
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE);
    if (!raw) return { itens: [] };
    return JSON.parse(raw) as Carrinho;
  } catch {
    return { itens: [] };
  }
}

export function salvarCarrinho(carrinho: Carrinho): void {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(carrinho));
}

export function adicionarAoCarrinho(item: ItemCarrinho): Carrinho {
  const carrinho = carregarCarrinho();
  const existente = carrinho.itens.find((i) => i.itemId === item.itemId);

  if (existente) {
    existente.quantidade += item.quantidade;
  } else {
    carrinho.itens.push(item);
  }

  salvarCarrinho(carrinho);
  return carrinho;
}

export function removerDoCarrinho(itemId: string): Carrinho {
  const carrinho = carregarCarrinho();
  carrinho.itens = carrinho.itens.filter((i) => i.itemId !== itemId);
  salvarCarrinho(carrinho);
  return carrinho;
}

export function limparCarrinho(): void {
  localStorage.removeItem(CHAVE_STORAGE);
}

export function calcularTotal(carrinho: Carrinho): number {
  return carrinho.itens.reduce((total, item) => total + item.valorCents * item.quantidade, 0);
}

export function formatarReais(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
