import { criarItemSchema, checkoutSchema, uploadUrlSchema } from "@/lib/validation";

describe("uploadUrlSchema", () => {
  it("aceita tipos de imagem permitidos", () => {
    expect(() => uploadUrlSchema.parse({ contentType: "image/jpeg" })).not.toThrow();
    expect(() => uploadUrlSchema.parse({ contentType: "image/png" })).not.toThrow();
    expect(() => uploadUrlSchema.parse({ contentType: "image/webp" })).not.toThrow();
  });

  it("rejeita tipos não permitidos", () => {
    expect(() => uploadUrlSchema.parse({ contentType: "image/gif" })).toThrow();
    expect(() => uploadUrlSchema.parse({ contentType: "application/pdf" })).toThrow();
  });
});

describe("criarItemSchema", () => {
  const valido = { nome: "Pão", valorCents: 350 };

  it("valida item correto", () => {
    expect(() => criarItemSchema.parse(valido)).not.toThrow();
  });

  it("rejeita nome muito curto", () => {
    expect(() => criarItemSchema.parse({ ...valido, nome: "A" })).toThrow();
  });

  it("rejeita valorCents negativo", () => {
    expect(() => criarItemSchema.parse({ ...valido, valorCents: -1 })).toThrow();
  });

  it("rejeita valorCents zero", () => {
    expect(() => criarItemSchema.parse({ ...valido, valorCents: 0 })).toThrow();
  });

  it("rejeita valorCents float", () => {
    expect(() => criarItemSchema.parse({ ...valido, valorCents: 3.5 })).toThrow();
  });

  it("usa string vazia como default para descricao", () => {
    const result = criarItemSchema.parse(valido);
    expect(result.descricao).toBe("");
  });
});

describe("checkoutSchema", () => {
  const valido = {
    nome: "Maria",
    email: "maria@exemplo.com",
    itens: [{ itemId: "550e8400-e29b-41d4-a716-446655440000", quantidade: 1 }],
  };

  it("valida checkout correto", () => {
    expect(() => checkoutSchema.parse(valido)).not.toThrow();
  });

  it("rejeita e-mail inválido", () => {
    expect(() => checkoutSchema.parse({ ...valido, email: "nao-e-email" })).toThrow();
  });

  it("rejeita carrinho vazio", () => {
    expect(() => checkoutSchema.parse({ ...valido, itens: [] })).toThrow();
  });

  it("rejeita quantidade zero", () => {
    expect(() =>
      checkoutSchema.parse({
        ...valido,
        itens: [{ itemId: "550e8400-e29b-41d4-a716-446655440000", quantidade: 0 }],
      }),
    ).toThrow();
  });
});
