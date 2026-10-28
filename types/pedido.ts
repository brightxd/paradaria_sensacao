export type StatusPedido = "recebido" | "confirmado";

export interface ItemDoPedido {
  itemId: string;
  nome: string;
  quantidade: number;
  valorCents: number;
}

export interface ClientePedido {
  nome: string;
  email: string;
}

export interface Pedido {
  id: string;
  cliente: ClientePedido;
  itens: ItemDoPedido[];
  totalCents: number | null;
  status: StatusPedido;
  criadoEm: string;
  confirmadoEm: string | null;
}

export interface PedidoResumo {
  id: string;
  clienteNome: string;
  status: StatusPedido;
  totalCents: number | null;
  criadoEm: string;
}

export interface CheckoutInput {
  nome: string;
  email: string;
  itens: { itemId: string; quantidade: number }[];
}
