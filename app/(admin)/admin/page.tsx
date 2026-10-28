"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    if (res.ok) {
      localStorage.setItem("admin_auth", "1");
      router.replace("/admin/produtos");
    } else {
      setErro("PIN incorreto.");
      setPin("");
    }
    setCarregando(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            🔐
          </div>
          <h1 className="font-playfair text-2xl font-bold text-amber-950">Área Administrativa</h1>
          <p className="text-stone-500 text-sm mt-1">Acesso restrito à equipe da padaria</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-8 space-y-5">
          {erro && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
              {erro}
            </div>
          )}
          <div>
            <label htmlFor="pin" className="block text-sm font-semibold text-stone-700 mb-2">
              PIN de acesso
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-center text-2xl tracking-widest font-mono"
              required
              autoFocus
            />
            <p className="text-xs text-stone-400 mt-2 text-center">PIN padrão de demo: 1234</p>
          </div>
          <button
            type="submit"
            disabled={carregando || pin.length < 4}
            className="w-full py-3 rounded-xl font-semibold bg-amber-700 text-white hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {carregando ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
