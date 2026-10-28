"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatarReais } from "@/lib/carrinho";
import type { PedidoResumo } from "@/types/pedido";

interface OrderListProps {
  pedidos: PedidoResumo[];
}

export function OrderList({ pedidos }: OrderListProps) {
  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-6xl mb-4">📋</span>
        <h3 className="font-playfair text-xl font-bold text-amber-950">Nenhum pedido ainda</h3>
        <p className="text-stone-500 mt-2 text-sm">Os pedidos aparecerão aqui assim que forem feitos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pedidos.map((pedido) => (
        <div
          key={pedido.id}
          className="bg-white rounded-2xl border border-amber-100 px-6 py-5 flex items-center gap-5 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl shrink-0">
            🛍️
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <p className="font-playfair font-bold text-amber-950">{pedido.clienteNome}</p>
              <StatusBadge status={pedido.status} />
            </div>
            <p className="text-xs text-stone-400 mt-0.5 font-mono tracking-wide">
              #{pedido.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="text-right shrink-0">
            {pedido.totalCents != null ? (
              <p className="font-playfair font-bold text-amber-800 text-lg">{formatarReais(pedido.totalCents)}</p>
            ) : (
              <p className="text-sm text-stone-400 italic">calculando...</p>
            )}
            <p className="text-xs text-stone-400 mt-0.5">
              {new Date(pedido.criadoEm).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
