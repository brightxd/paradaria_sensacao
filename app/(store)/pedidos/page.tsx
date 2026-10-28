"use client";

import { usePedidos } from "@/hooks/usePedidos";
import { OrderList } from "@/components/orders/OrderList";

export default function PedidosPage() {
  const { pedidos, carregando, erro } = usePedidos();

  return (
    <>
      <div className="bg-white border-b border-amber-100">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10 flex items-end justify-between">
          <div>
            <p className="text-amber-600 text-sm font-medium uppercase tracking-widest mb-1">Padaria 100sação</p>
            <h1 className="font-playfair text-4xl font-bold text-amber-950">Meus Pedidos</h1>
          </div>
          <span className="flex items-center gap-2 text-xs text-stone-400 pb-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Atualização automática
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10">
        {erro && (
          <div className="mb-6 px-5 py-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {erro}
          </div>
        )}

        {carregando && pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-stone-500 text-sm">Carregando pedidos...</p>
          </div>
        ) : (
          <OrderList pedidos={pedidos} />
        )}
      </div>
    </>
  );
}
