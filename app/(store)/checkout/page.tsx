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
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center py-16">
          <div className="text-7xl mb-6">🎉</div>
          <h1 className="font-playfair text-3xl font-bold text-amber-950">Pedido recebido!</h1>
          <p className="text-stone-500 mt-3">
            Você receberá um e-mail de confirmação assim que seu pedido for processado.
          </p>
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl px-8 py-5 inline-block">
            <p className="text-xs text-amber-600 font-semibold uppercase tracking-widest mb-1">Número do pedido</p>
            <p className="font-playfair font-bold text-amber-900 text-2xl tracking-widest">
              #{pedidoId.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/pedidos"
              className="px-6 py-3 rounded-xl font-semibold bg-amber-700 text-white hover:bg-amber-800 transition-colors"
            >
              Acompanhar pedido
            </Link>
            <Link
              href="/itens"
              className="px-6 py-3 rounded-xl font-semibold bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              Ver cardápio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-7xl mb-5">🛒</div>
          <h2 className="font-playfair text-2xl font-bold text-amber-950 mb-2">Seu pedido está vazio</h2>
          <p className="text-stone-500 mb-6">Escolha produtos no cardápio para continuar.</p>
          <Link
            href="/itens"
            className="px-7 py-3 rounded-xl font-semibold bg-amber-700 text-white hover:bg-amber-800 transition-colors"
          >
            Ver cardápio
          </Link>
        </div>
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
    <>
      <div className="bg-white border-b border-amber-100">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10">
          <p className="text-amber-600 text-sm font-medium uppercase tracking-widest mb-1">Finalizar</p>
          <h1 className="font-playfair text-4xl font-bold text-amber-950">Meu Pedido</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Cart */}
          <div className="md:col-span-3">
            <h2 className="font-semibold text-stone-600 mb-4 text-xs uppercase tracking-widest">Itens selecionados</h2>
            <CartSummary itens={itens} total={total} onRemover={remover} />
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <h2 className="font-semibold text-stone-600 mb-4 text-xs uppercase tracking-widest">Seus dados</h2>
            <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm">
              {erro && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
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
                  label="E-mail para confirmação"
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
              <p className="text-xs text-stone-400 text-center mt-3">
                Você receberá um e-mail de confirmação
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
