import { renderHook, waitFor } from "@testing-library/react";
import { usePedidos } from "@/hooks/usePedidos";

const pedidosMock = [
  { id: "abc", clienteNome: "João", status: "recebido" as const, totalCents: null, criadoEm: "2026-01-01T10:00:00Z" },
];

describe("usePedidos", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ pedidos: pedidosMock }),
    } as Response);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it("carrega pedidos inicialmente", async () => {
    const { result } = renderHook(() => usePedidos());

    await waitFor(() => {
      expect(result.current.carregando).toBe(false);
    });

    expect(result.current.pedidos).toHaveLength(1);
    expect(result.current.pedidos[0].clienteNome).toBe("João");
  });

  it("exibe erro quando fetch falha", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    const { result } = renderHook(() => usePedidos());

    await waitFor(() => {
      expect(result.current.carregando).toBe(false);
    });

    expect(result.current.erro).not.toBeNull();
  });
});
