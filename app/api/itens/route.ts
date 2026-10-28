import { getPool } from "@/lib/db";
import { gerarUrlDaFoto } from "@/lib/s3";
import { criarItemSchema } from "@/lib/validation";
import { ZodError } from "zod";
import type { ItemComFoto } from "@/types/item";

export const runtime = "nodejs";

const MOCK_ITENS: ItemComFoto[] = [
  {
    id: "mock-1",
    nome: "Pão Francês",
    descricao: "Crocante por fora, macio por dentro. Fresquinho toda manhã!",
    valorCents: 75,
    fotoKey: null,
    fotoUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop&q=80",
    criadoEm: "2026-01-01T06:00:00Z",
  },
  {
    id: "mock-2",
    nome: "Croissant de Manteiga",
    descricao: "Folhado artesanal com manteiga importada, assado na hora.",
    valorCents: 850,
    fotoKey: null,
    fotoUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop&q=80",
    criadoEm: "2026-01-01T06:00:00Z",
  },
  {
    id: "mock-3",
    nome: "Bolo de Chocolate",
    descricao: "Bolo fudgy de chocolate belga com cobertura cremosa. Rende 12 fatias.",
    valorCents: 5500,
    fotoKey: null,
    fotoUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&q=80",
    criadoEm: "2026-01-01T06:00:00Z",
  },
  {
    id: "mock-4",
    nome: "Pão de Queijo",
    descricao: "Mineiros de Minas, com queijo parmesão e polvilho azedo. Pacote com 6 unidades.",
    valorCents: 1200,
    fotoKey: null,
    fotoUrl: "https://images.unsplash.com/photo-1568471173242-461f0a730452?w=400&h=300&fit=crop&q=80",
    criadoEm: "2026-01-01T06:00:00Z",
  },
  {
    id: "mock-5",
    nome: "Sonho de Baunilha",
    descricao: "Massa frita e macia recheada com creme de baunilha e açúcar de confeiteiro.",
    valorCents: 600,
    fotoKey: null,
    fotoUrl: "https://images.unsplash.com/photo-1551024601-bec78de5b69e?w=400&h=300&fit=crop&q=80",
    criadoEm: "2026-01-01T06:00:00Z",
  },
  {
    id: "mock-6",
    nome: "Torta de Morango",
    descricao: "Base crocante, creme de confeiteiro e morangos frescos. Toda semana.",
    valorCents: 6500,
    fotoKey: null,
    fotoUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop&q=80",
    criadoEm: "2026-01-01T06:00:00Z",
  },
  {
    id: "mock-7",
    nome: "Baguete Rústica",
    descricao: "Fermentação natural de 24h, casca crocante e miolo aberto. Fatia generosa.",
    valorCents: 900,
    fotoKey: null,
    fotoUrl: "https://images.unsplash.com/photo-1586511925558-a4c6376fe65f?w=400&h=300&fit=crop&q=80",
    criadoEm: "2026-01-01T06:00:00Z",
  },
  {
    id: "mock-8",
    nome: "Coxinha de Frango",
    descricao: "Massa crocante recheada com frango desfiado e requeijão cremoso. 1 unidade.",
    valorCents: 500,
    fotoKey: null,
    fotoUrl: "https://images.unsplash.com/photo-1606778303077-160e2e0ad500?w=400&h=300&fit=crop&q=80",
    criadoEm: "2026-01-01T06:00:00Z",
  },
];

export async function GET(): Promise<Response> {
  if (!process.env.DATABASE_URL) {
    return Response.json({ itens: MOCK_ITENS });
  }

  try {
    const db = getPool();
    const { rows } = await db.query(
      "SELECT id, nome, descricao, valor_cents, foto_key, criado_em FROM itens ORDER BY nome",
    );
    const itens: ItemComFoto[] = await Promise.all(
      rows.map(async (r) => ({
        id: r.id,
        nome: r.nome,
        descricao: r.descricao,
        valorCents: r.valor_cents,
        fotoKey: r.foto_key ?? null,
        fotoUrl: r.foto_key ? await gerarUrlDaFoto(r.foto_key) : null,
        criadoEm: (r.criado_em as Date).toISOString(),
      })),
    );
    return Response.json({ itens });
  } catch {
    return Response.json({ erro: "Erro ao listar itens." }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<Response> {
  if (!process.env.DATABASE_URL) {
    return Response.json({ erro: "Banco de dados não configurado." }, { status: 503 });
  }

  try {
    const body = await req.json();
    const dados = criarItemSchema.parse(body);
    const id = crypto.randomUUID();
    const db = getPool();
    await db.query(
      "INSERT INTO itens (id, nome, descricao, valor_cents, foto_key) VALUES ($1, $2, $3, $4, $5)",
      [id, dados.nome, dados.descricao ?? "", dados.valorCents, dados.fotoKey ?? null],
    );
    return Response.json({ item: { id, ...dados } }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ erro: error.errors[0].message }, { status: 400 });
    }
    return Response.json({ erro: "Erro ao criar item." }, { status: 500 });
  }
}
