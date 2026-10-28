import { getPool } from "@/lib/db";
import type { PedidoResumo } from "@/types/pedido";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  try {
    const db = getPool();
    const { rows } = await db.query(
      `SELECT id, cliente_nome, status, total_cents, criado_em
       FROM pedidos
       ORDER BY criado_em DESC
       LIMIT 50`,
    );
    const pedidos: PedidoResumo[] = rows.map((r) => ({
      id: r.id,
      clienteNome: r.cliente_nome,
      status: r.status,
      totalCents: r.total_cents,
      criadoEm: (r.criado_em as Date).toISOString(),
    }));
    return Response.json({ pedidos });
  } catch {
    return Response.json({ erro: "Erro ao listar pedidos." }, { status: 500 });
  }
}
