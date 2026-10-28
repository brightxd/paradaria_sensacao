export interface ItemCarrinho {
  itemId: string;
  nome: string;
  valorCents: number;
  fotoUrl: string | null;
  quantidade: number;
}

export interface Carrinho {
  itens: ItemCarrinho[];
}
