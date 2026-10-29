"use client";

import { useState, useEffect, useRef } from "react";
import type { PedidoResumo } from "@/types/pedido";

const INTERVALO_MS = 2000;

export function usePedidos() {
  const [pedidos, setPedidos] = useState<PedidoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const buscar = async () => {
    try {
      const res = await fetch("/api/pedidos");
      if (!res.ok) throw new Error("Falha ao carregar pedidos.");
      const { pedidos: lista } = (await res.json()) as { pedidos: PedidoResumo[] };
      setPedidos((prev) =>
        JSON.stringify(prev) === JSON.stringify(lista) ? prev : lista,
      );
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscar();
    timerRef.current = setInterval(buscar, INTERVALO_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { pedidos, carregando, erro };
}
