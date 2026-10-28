import { formatarReais, calcularTotal, adicionarAoCarrinho, removerDoCarrinho, limparCarrinho } from "@/lib/carrinho";
import type { ItemCarrinho } from "@/types/carrinho";

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => { mockStorage[k] = v; },
      removeItem: (k: string) => { delete mockStorage[k]; },
      clear: () => Object.keys(mockStorage).forEach((k) => delete mockStorage[k]),
    },
    writable: true,
  });
});

describe("formatarReais", () => {
  it("formata centavos em reais", () => {
    expect(formatarReais(750)).toBe("R$ 7,50");
  });

  it("formata valor zero", () => {
    expect(formatarReais(0)).toBe("R$ 0,00");
  });

  it("formata valores grandes", () => {
    expect(formatarReais(100000)).toBe("R$ 1.000,00");
  });
});

describe("calcularTotal", () => {
  it("calcula o total do carrinho", () => {
    const itens: ItemCarrinho[] = [
      { itemId: "1", nome: "Pão", valorCents: 300, fotoUrl: null, quantidade: 2 },
      { itemId: "2", nome: "Bolo", valorCents: 1500, fotoUrl: null, quantidade: 1 },
    ];
    expect(calcularTotal({ itens })).toBe(2100);
  });

  it("retorna zero para carrinho vazio", () => {
    expect(calcularTotal({ itens: [] })).toBe(0);
  });
});

describe("adicionarAoCarrinho", () => {
  const item: ItemCarrinho = { itemId: "abc", nome: "Sonho", valorCents: 750, fotoUrl: null, quantidade: 1 };

  it("adiciona novo item ao carrinho", () => {
    const carrinho = adicionarAoCarrinho(item);
    expect(carrinho.itens).toHaveLength(1);
    expect(carrinho.itens[0].itemId).toBe("abc");
  });

  it("incrementa quantidade de item existente", () => {
    adicionarAoCarrinho(item);
    const carrinho = adicionarAoCarrinho({ ...item, quantidade: 2 });
    expect(carrinho.itens).toHaveLength(1);
    expect(carrinho.itens[0].quantidade).toBe(3);
  });
});

describe("removerDoCarrinho", () => {
  it("remove item pelo id", () => {
    const item: ItemCarrinho = { itemId: "x1", nome: "Café", valorCents: 500, fotoUrl: null, quantidade: 1 };
    adicionarAoCarrinho(item);
    const carrinho = removerDoCarrinho("x1");
    expect(carrinho.itens).toHaveLength(0);
  });

  it("não falha ao remover item inexistente", () => {
    const carrinho = removerDoCarrinho("nao-existe");
    expect(carrinho.itens).toHaveLength(0);
  });
});

describe("limparCarrinho", () => {
  it("limpa o localStorage", () => {
    const item: ItemCarrinho = { itemId: "z1", nome: "Croissant", valorCents: 900, fotoUrl: null, quantidade: 1 };
    adicionarAoCarrinho(item);
    limparCarrinho();
    expect(mockStorage["padaria_carrinho"]).toBeUndefined();
  });
});
