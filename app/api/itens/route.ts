import { listarObjetos, gravarObjeto } from "@/lib/store";
import { gerarUrlDaFoto } from "@/lib/s3";
import { criarItemSchema } from "@/lib/validation";
import { ZodError } from "zod";
import type { Item, ItemComFoto } from "@/types/item";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  try {
    const lista = await listarObjetos<Item>("itens/");
    const itens: ItemComFoto[] = await Promise.all(
      lista.map(async (item) => ({
        ...item,
        fotoUrl: item.fotoKey ? await gerarUrlDaFoto(item.fotoKey) : null,
      })),
    );
    itens.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    return Response.json({ itens });
  } catch {
    return Response.json({ erro: "Erro ao listar itens." }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const dados = criarItemSchema.parse(body);

    const item: Item = {
      id: crypto.randomUUID(),
      ...dados,
      descricao: dados.descricao ?? "",
      criadoEm: new Date().toISOString(),
    };

    await gravarObjeto(`itens/${item.id}.json`, item);
    return Response.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ erro: error.errors[0].message }, { status: 400 });
    }
    return Response.json({ erro: "Erro ao criar item." }, { status: 500 });
  }
}
