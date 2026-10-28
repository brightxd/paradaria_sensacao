"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { AdminGuard } from "@/components/admin/AdminGuard";
import Image from "next/image";
import Link from "next/link";

interface FormState {
  nome: string;
  descricao: string;
  valor: string;
  foto: File | null;
  fotoPreview: string | null;
}

const initialState: FormState = { nome: "", descricao: "", valor: "", foto: null, fotoPreview: null };

export default function AdminNovoProdutoPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(initialState);
  const [erros, setErros] = useState<Partial<Record<keyof FormState, string>>>({});
  const [salvando, setSalvando] = useState(false);
  const [erroGlobal, setErroGlobal] = useState<string | null>(null);

  const set = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErros((e) => ({ ...e, [field]: undefined }));
  };

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, foto: file, fotoPreview: URL.createObjectURL(file) }));
  };

  const validar = (): boolean => {
    const novosErros: typeof erros = {};
    if (!form.nome.trim() || form.nome.length < 2) novosErros.nome = "Nome deve ter ao menos 2 caracteres.";
    const v = parseFloat(form.valor.replace(",", "."));
    if (!form.valor || isNaN(v) || v <= 0) novosErros.valor = "Informe um valor válido maior que zero.";
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;
    setSalvando(true);
    setErroGlobal(null);

    try {
      let fotoKey: string | undefined;

      if (form.foto) {
        const urlRes = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentType: form.foto.type }),
        });
        if (!urlRes.ok) throw new Error("Erro ao obter URL de upload.");
        const { uploadUrl, fotoKey: key } = await urlRes.json();
        const uploadRes = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": form.foto.type }, body: form.foto });
        if (!uploadRes.ok) throw new Error("Erro ao enviar foto.");
        fotoKey = key;
      }

      const itemRes = await fetch("/api/itens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: form.nome, descricao: form.descricao, valorCents: Math.round(parseFloat(form.valor.replace(",", ".")) * 100), fotoKey }),
      });

      if (!itemRes.ok) {
        const { erro } = await itemRes.json();
        throw new Error(erro ?? "Erro ao salvar produto.");
      }

      router.push("/admin/produtos");
    } catch (err) {
      setErroGlobal(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <AdminGuard>
      <div className="bg-amber-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-playfair font-bold text-amber-300">Admin</span>
            <nav className="flex gap-1">
              <Link href="/admin/produtos" className="px-3 py-1.5 rounded-lg text-sm font-medium text-amber-100 bg-amber-800 hover:bg-amber-700 transition-colors">Produtos</Link>
              <Link href="/admin/pedidos" className="px-3 py-1.5 rounded-lg text-sm font-medium text-amber-300 hover:bg-amber-800 transition-colors">Pedidos</Link>
            </nav>
          </div>
          <Link href="/" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">← Voltar ao site</Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 sm:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/produtos" className="text-stone-400 hover:text-stone-600 transition-colors text-sm">← Produtos</Link>
          <span className="text-stone-300">/</span>
          <h1 className="font-playfair text-2xl font-bold text-amber-950">Novo Produto</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-amber-100 p-8 shadow-sm space-y-6">
          {erroGlobal && (
            <div className="px-5 py-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{erroGlobal}</div>
          )}

          <div>
            <span className="block text-sm font-semibold text-stone-700 mb-2">Foto do produto</span>
            <div className="relative rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-amber-200 hover:border-amber-400 transition-colors bg-amber-50/50" onClick={() => fileRef.current?.click()}>
              {form.fotoPreview ? (
                <div className="relative h-48">
                  <Image src={form.fotoPreview} alt="Prévia" fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-semibold bg-black/40 px-3 py-1.5 rounded-lg">Trocar foto</span>
                  </div>
                </div>
              ) : (
                <div className="h-36 flex flex-col items-center justify-center gap-2 text-amber-400">
                  <span className="text-4xl">📷</span>
                  <span className="text-sm font-medium">Clique para adicionar uma foto</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFoto} className="hidden" />
          </div>

          <Input id="nome" label="Nome do produto" placeholder="Ex: Pão de queijo" value={form.nome} onChange={(e) => set("nome", e.target.value)} error={erros.nome} required />
          <Textarea id="descricao" label="Descrição (opcional)" placeholder="Descreva brevemente..." value={form.descricao} onChange={(e) => set("descricao", e.target.value)} />
          <Input id="valor" label="Preço (R$)" placeholder="Ex: 7,50" value={form.valor} onChange={(e) => set("valor", e.target.value)} error={erros.valor} inputMode="decimal" required />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => router.push("/admin/produtos")} disabled={salvando}>Cancelar</Button>
            <Button type="submit" loading={salvando} className="flex-1">{salvando ? "Salvando..." : "Salvar produto"}</Button>
          </div>
        </form>
      </div>
    </AdminGuard>
  );
}
