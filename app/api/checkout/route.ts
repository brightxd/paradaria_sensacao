import { getPool } from "@/lib/db";
import { enfileirarPedido } from "@/lib/sqs";
import { checkoutSchema } from "@/lib/validation";
import { ZodError } from "zod";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { nome, email, itens } = checkoutSchema.parse(body);

    const db = getPool();

    const ids = itens.map((i) => i.itemId);
    const { rows: dbItens } = await db.query(
      "SELECT id, nome, valor_cents FROM itens WHERE id = ANY($1)",
      [ids],
    );

    const mapa = new Map(dbItens.map((i) => [i.id as string, i]));
    const pedidoId = crypto.randomUUID();

    await db.query(
      "INSERT INTO pedidos (id, cliente_nome, cliente_email) VALUES ($1, $2, $3)",
      [pedidoId, nome, email],
    );

    for (const { itemId, quantidade } of itens) {
      const item = mapa.get(itemId);
      if (!item) throw new Error(`Item ${itemId} não encontrado.`);
      await db.query(
        "INSERT INTO pedido_itens (pedido_id, item_id, nome, quantidade, valor_cents) VALUES ($1, $2, $3, $4, $5)",
        [pedidoId, itemId, item.nome, quantidade, item.valor_cents],
      );
    }

    await enfileirarPedido(pedidoId);
    return Response.json({ pedidoId }, { status: 202 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ erro: error.errors[0].message }, { status: 400 });
    }
    console.error("[checkout]", error);
    const msg = error instanceof Error ? error.message : "Erro ao processar pedido.";
    return Response.json({ erro: msg }, { status: 500 });
  }
}
