"use client";

import { usePedidos } from "@/hooks/usePedidos";
import { OrderList } from "@/components/orders/OrderList";

export default function PedidosPage() {
  const { pedidos, carregando, erro } = usePedidos();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Pedidos</h1>
          <p className="text-gray-500 mt-1 text-sm">Atualizado a cada 2 segundos</p>
        </div>
        <span className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Ao vivo
        </span>
      </div>

      {erro && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {erro}
        </div>
      )}

      {carregando && pedidos.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <OrderList pedidos={pedidos} />
      )}
    </div>
  );
}
