"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatarReais } from "@/lib/carrinho";
import type { ItemComFoto } from "@/types/item";
import { useRouter } from "next/navigation";

function AdminNav({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="bg-amber-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-playfair font-bold text-amber-300">Admin</span>
          <nav className="flex gap-1">
            <Link href="/admin/produtos" className="px-3 py-1.5 rounded-lg text-sm font-medium text-amber-100 bg-amber-800 hover:bg-amber-700 transition-colors">
              Produtos
            </Link>
            <Link href="/admin/pedidos" className="px-3 py-1.5 rounded-lg text-sm font-medium text-amber-300 hover:bg-amber-800 transition-colors">
              Pedidos
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">← Voltar ao site</Link>
          <button onClick={onLogout} className="text-xs text-amber-400 hover:text-red-300 transition-colors">
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProdutosPage() {
  const router = useRouter();
  const [itens, setItens] = useState<ItemComFoto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.replace("/admin");
  };

  const carregarItens = useCallback(() => {
    fetch("/api/itens")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.erro);
        return data;
      })
      .then(({ itens: lista }) => setItens(lista ?? []))
      .catch(() => setErro("Erro ao carregar produtos."))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => { carregarItens(); }, [carregarItens]);

  return (
    <AdminGuard>
      <AdminNav onLogout={handleLogout} />
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-amber-950">Produtos</h1>
            <p className="text-stone-500 text-sm mt-1">{itens.length} produto{itens.length !== 1 ? "s" : ""} cadastrado{itens.length !== 1 ? "s" : ""}</p>
          </div>
          <Link
            href="/admin/produtos/novo"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-amber-700 text-white hover:bg-amber-800 transition-colors shadow-sm"
          >
            + Novo produto
          </Link>
        </div>

        {erro && (
          <div className="mb-6 px-5 py-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {erro}
          </div>
        )}

        {carregando ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : itens.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-3">📦</span>
            <h3 className="font-playfair text-xl font-bold text-amber-950">Nenhum produto</h3>
            <p className="text-stone-500 mt-1 text-sm">Adicione o primeiro produto ao cardápio.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 border-b border-amber-100">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-stone-600 text-xs uppercase tracking-wide">Produto</th>
                  <th className="px-5 py-3 text-left font-semibold text-stone-600 text-xs uppercase tracking-wide hidden sm:table-cell">Descrição</th>
                  <th className="px-5 py-3 text-right font-semibold text-stone-600 text-xs uppercase tracking-wide">Preço</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {itens.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 overflow-hidden shrink-0">
                          {item.fotoUrl ? (
                            <Image src={item.fotoUrl} alt={item.nome} width={48} height={48} className="object-cover w-full h-full" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">🍞</div>
                          )}
                        </div>
                        <span className="font-semibold text-stone-800">{item.nome}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-stone-500 max-w-xs truncate hidden sm:table-cell">
                      {item.descricao || "—"}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-amber-800">
                      {formatarReais(item.valorCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
