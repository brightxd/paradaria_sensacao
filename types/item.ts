export interface Item {
  id: string;
  nome: string;
  descricao: string;
  valorCents: number;
  fotoKey?: string | null;
  criadoEm: string;
}

export interface ItemComFoto extends Item {
  fotoUrl: string | null;
}

export interface CriarItemInput {
  nome: string;
  descricao: string;
  valorCents: number;
  fotoKey?: string | null;
}
