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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-5xl mb-3">📋</span>
        <p className="text-gray-500">Nenhum pedido encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pedidos.map((pedido) => (
        <div
          key={pedido.id}
          className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900">{pedido.clienteNome}</p>
              <StatusBadge status={pedido.status} />
            </div>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              #{pedido.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="text-right shrink-0">
            {pedido.totalCents != null ? (
              <p className="font-bold text-amber-600">{formatarReais(pedido.totalCents)}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">calculando...</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
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
