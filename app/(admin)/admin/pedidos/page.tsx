"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { usePedidos } from "@/hooks/usePedidos";
import { OrderList } from "@/components/orders/OrderList";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPedidosPage() {
  const router = useRouter();
  const { pedidos, carregando, erro } = usePedidos();

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.replace("/admin");
  };

  return (
    <AdminGuard>
      <div className="bg-amber-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-playfair font-bold text-amber-300">Admin</span>
            <nav className="flex gap-1">
              <Link href="/admin/produtos" className="px-3 py-1.5 rounded-lg text-sm font-medium text-amber-300 hover:bg-amber-800 transition-colors">Produtos</Link>
              <Link href="/admin/pedidos" className="px-3 py-1.5 rounded-lg text-sm font-medium text-amber-100 bg-amber-800 hover:bg-amber-700 transition-colors">Pedidos</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">← Voltar ao site</Link>
            <button onClick={handleLogout} className="text-xs text-amber-400 hover:text-red-300 transition-colors">Sair</button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-amber-950">Pedidos</h1>
            <p className="text-stone-500 text-sm mt-1">{pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""} no sistema</p>
          </div>
          <span className="flex items-center gap-2 text-xs text-stone-400 pb-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Atualização automática
          </span>
        </div>

        {erro && (
          <div className="mb-6 px-5 py-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{erro}</div>
        )}

        {carregando && pedidos.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <OrderList pedidos={pedidos} />
        )}
      </div>
    </AdminGuard>
  );
}
