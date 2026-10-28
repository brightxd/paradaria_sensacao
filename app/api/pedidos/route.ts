import { listarObjetos } from "@/lib/store";
import type { Pedido, PedidoResumo } from "@/types/pedido";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  try {
    const lista = await listarObjetos<Pedido>("pedidos/");
    lista.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

    const pedidos: PedidoResumo[] = lista.slice(0, 50).map((p) => ({
      id: p.id,
      clienteNome: p.cliente.nome,
      status: p.status,
      totalCents: p.totalCents,
      criadoEm: p.criadoEm,
    }));

    return Response.json({ pedidos });
  } catch {
    return Response.json({ erro: "Erro ao listar pedidos." }, { status: 500 });
  }
}
