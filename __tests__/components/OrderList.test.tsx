import { render, screen } from "@testing-library/react";
import { OrderList } from "@/components/orders/OrderList";
import type { PedidoResumo } from "@/types/pedido";

const pedidos: PedidoResumo[] = [
  { id: "550e8400-e29b-41d4-a716-446655440001", clienteNome: "João", status: "recebido", totalCents: null, criadoEm: "2026-01-01T10:00:00Z" },
  { id: "550e8400-e29b-41d4-a716-446655440002", clienteNome: "Maria", status: "confirmado", totalCents: 1500, criadoEm: "2026-01-01T11:00:00Z" },
];

describe("OrderList", () => {
  it("exibe nomes dos clientes", () => {
    render(<OrderList pedidos={pedidos} />);
    expect(screen.getByText("João")).toBeInTheDocument();
    expect(screen.getByText("Maria")).toBeInTheDocument();
  });

  it("exibe badge de status", () => {
    render(<OrderList pedidos={pedidos} />);
    expect(screen.getByText("Recebido")).toBeInTheDocument();
    expect(screen.getByText("Confirmado")).toBeInTheDocument();
  });

  it("exibe total formatado quando disponível", () => {
    render(<OrderList pedidos={pedidos} />);
    expect(screen.getByText("R$ 15,00")).toBeInTheDocument();
  });

  it("exibe mensagem quando não há pedidos", () => {
    render(<OrderList pedidos={[]} />);
    expect(screen.getByText(/nenhum pedido/i)).toBeInTheDocument();
  });
});
