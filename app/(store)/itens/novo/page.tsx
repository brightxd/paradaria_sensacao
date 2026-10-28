"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

interface FormState {
  nome: string;
  descricao: string;
  valor: string;
  foto: File | null;
  fotoPreview: string | null;
}

const initialState: FormState = {
  nome: "",
  descricao: "",
  valor: "",
  foto: null,
  fotoPreview: null,
};

export default function NovoItemPage() {
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
    const preview = URL.createObjectURL(file);
    setForm((f) => ({ ...f, foto: file, fotoPreview: preview }));
    setErros((e) => ({ ...e, foto: undefined }));
  };

  const validar = (): boolean => {
    const novosErros: typeof erros = {};
    if (!form.nome.trim() || form.nome.length < 2) novosErros.nome = "Nome deve ter ao menos 2 caracteres.";
    const valorNum = parseFloat(form.valor.replace(",", "."));
    if (!form.valor || isNaN(valorNum) || valorNum <= 0) novosErros.valor = "Informe um valor válido maior que zero.";
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return false;
    }
    return true;
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

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": form.foto.type },
          body: form.foto,
        });
        if (!uploadRes.ok) throw new Error("Erro ao enviar foto.");
        fotoKey = key;
      }

      const valorCents = Math.round(parseFloat(form.valor.replace(",", ".")) * 100);

      const itemRes = await fetch("/api/itens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: form.nome, descricao: form.descricao, valorCents, fotoKey }),
      });

      if (!itemRes.ok) {
        const { erro } = await itemRes.json();
        throw new Error(erro ?? "Erro ao salvar produto.");
      }

      router.push("/itens");
    } catch (err) {
      setErroGlobal(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Novo produto</h1>
        <p className="text-gray-500 mt-1 text-sm">Adicione um produto ao cardápio</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        {erroGlobal && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {erroGlobal}
          </div>
        )}

        <Input
          id="nome"
          label="Nome do produto"
          placeholder="Ex: Pão de queijo"
          value={form.nome}
          onChange={(e) => set("nome", e.target.value)}
          error={erros.nome}
          required
        />

        <Textarea
          id="descricao"
          label="Descrição (opcional)"
          placeholder="Descreva o produto..."
          value={form.descricao}
          onChange={(e) => set("descricao", e.target.value)}
        />

        <Input
          id="valor"
          label="Preço (R$)"
          placeholder="Ex: 7,50"
          value={form.valor}
          onChange={(e) => set("valor", e.target.value)}
          error={erros.valor}
          inputMode="decimal"
          required
        />

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Foto do produto</span>
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-amber-400 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {form.fotoPreview ? (
              <div className="relative h-48">
                <Image src={form.fotoPreview} alt="Prévia" fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">Trocar foto</span>
                </div>
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-gray-400 gap-2">
                <span className="text-3xl">📷</span>
                <span className="text-sm">Clique para adicionar uma foto</span>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFoto}
            className="hidden"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={salvando}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={salvando} className="flex-1">
            {salvando ? "Salvando..." : "Salvar produto"}
          </Button>
        </div>
      </form>
    </div>
  );
}
