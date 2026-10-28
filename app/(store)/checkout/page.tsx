"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCarrinho } from "@/hooks/useCarrinho";
import { CartSummary } from "@/components/cart/CartSummary";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { itens, total, remover, limpar } = useCarrinho();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erros, setErros] = useState<{ nome?: string; email?: string }>({});
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pedidoId, setPedidoId] = useState<string | null>(null);

  if (pedidoId) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="text-2xl font-black text-gray-900">Pedido recebido!</h1>
        <p className="text-gray-500 mt-2">
          Você receberá um e-mail de confirmação em breve.
        </p>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 inline-block">
          <p className="text-xs text-amber-600 font-mono">Pedido</p>
          <p className="font-bold text-amber-800 text-lg tracking-widest">
            #{pedidoId.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <div className="mt-8 flex gap-3 justify-center">
          <Link
            href="/pedidos"
            className="px-6 py-3 rounded-xl font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors"
          >
            Acompanhar pedido
          </Link>
          <Link
            href="/itens"
            className="px-6 py-3 rounded-xl font-semibold bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Ver cardápio
          </Link>
        </div>
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-bold text-gray-700">Seu pedido está vazio</h2>
        <Link
          href="/itens"
          className="mt-4 inline-block px-6 py-3 rounded-xl font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors"
        >
          Ver cardápio
        </Link>
      </div>
    );
  }

  const validar = (): boolean => {
    const novosErros: typeof erros = {};
    if (!nome.trim() || nome.length < 2) novosErros.nome = "Informe seu nome completo.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) novosErros.email = "Informe um e-mail válido.";
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleFinalizarPedido = async () => {
    if (!validar()) return;
    setEnviando(true);
    setErro(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          itens: itens.map(({ itemId, quantidade }) => ({ itemId, quantidade })),
        }),
      });

      if (!res.ok) {
        const { erro: msg } = await res.json();
        throw new Error(msg ?? "Erro ao finalizar pedido.");
      }

      const { pedidoId: id } = await res.json();
      limpar();
      setPedidoId(id);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Finalizar pedido</h1>
        <p className="text-gray-500 mt-1 text-sm">Revise os itens e informe seus dados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Seu pedido</h2>
          <CartSummary itens={itens} total={total} onRemover={remover} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Seus dados</h2>

          {erro && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {erro}
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="nome"
              label="Nome completo"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setErros((e2) => ({ ...e2, nome: undefined }));
              }}
              error={erros.nome}
              required
            />
            <Input
              id="email"
              type="email"
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErros((e2) => ({ ...e2, email: undefined }));
              }}
              error={erros.email}
              required
            />
          </div>

          <Button
            className="w-full mt-6"
            size="lg"
            onClick={handleFinalizarPedido}
            loading={enviando}
            disabled={itens.length === 0}
          >
            {enviando ? "Enviando..." : "Finalizar pedido"}
          </Button>
          <p className="text-xs text-gray-400 text-center mt-3">
            Você receberá um e-mail de confirmação
          </p>
        </div>
      </div>
    </div>
  );
}
