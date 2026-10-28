import { lerObjeto, gravarObjeto } from "@/lib/store";
import { enfileirarPedido } from "@/lib/sqs";
import { checkoutSchema } from "@/lib/validation";
import { ZodError } from "zod";
import type { Item } from "@/types/item";
import type { Pedido } from "@/types/pedido";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { nome, email, itens } = checkoutSchema.parse(body);

    const itensDoPedido = await Promise.all(
      itens.map(async ({ itemId, quantidade }) => {
        const { dado } = await lerObjeto<Item>(`itens/${itemId}.json`);
        return {
          itemId,
          nome: dado.nome,
          quantidade,
          valorCents: dado.valorCents,
        };
      }),
    );

    const pedido: Pedido = {
      id: crypto.randomUUID(),
      cliente: { nome, email },
      itens: itensDoPedido,
      totalCents: null,
      status: "recebido",
      criadoEm: new Date().toISOString(),
      confirmadoEm: null,
    };

    await gravarObjeto(`pedidos/${pedido.id}.json`, pedido);
    await enfileirarPedido(pedido.id);

    return Response.json({ pedidoId: pedido.id }, { status: 202 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ erro: error.errors[0].message }, { status: 400 });
    }
    const msg = error instanceof Error ? error.message : "Erro ao processar pedido.";
    return Response.json({ erro: msg }, { status: 500 });
  }
}
