import { renderHook, act } from "@testing-library/react";
import { useCarrinho } from "@/hooks/useCarrinho";

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => { mockStorage[k] = v; },
      removeItem: (k: string) => { delete mockStorage[k]; },
    },
    writable: true,
  });
});

describe("useCarrinho", () => {
  it("começa com carrinho vazio", () => {
    const { result } = renderHook(() => useCarrinho());
    expect(result.current.itens).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it("adiciona item ao carrinho", () => {
    const { result } = renderHook(() => useCarrinho());
    act(() => {
      result.current.adicionar({
        itemId: "1",
        nome: "Pão",
        valorCents: 300,
        fotoUrl: null,
        quantidade: 1,
      });
    });
    expect(result.current.itens).toHaveLength(1);
    expect(result.current.total).toBe(300);
  });

  it("remove item do carrinho", () => {
    const { result } = renderHook(() => useCarrinho());
    act(() => {
      result.current.adicionar({ itemId: "1", nome: "Pão", valorCents: 300, fotoUrl: null, quantidade: 1 });
    });
    act(() => {
      result.current.remover("1");
    });
    expect(result.current.itens).toHaveLength(0);
  });

  it("limpa o carrinho", () => {
    const { result } = renderHook(() => useCarrinho());
    act(() => {
      result.current.adicionar({ itemId: "1", nome: "Pão", valorCents: 300, fotoUrl: null, quantidade: 2 });
    });
    act(() => {
      result.current.limpar();
    });
    expect(result.current.itens).toHaveLength(0);
  });
});
