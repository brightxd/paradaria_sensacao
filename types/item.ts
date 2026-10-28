export interface Item {
  id: string;
  nome: string;
  descricao: string;
  valorCents: number;
  fotoKey?: string;
  criadoEm: string;
}

export interface ItemComFoto extends Item {
  fotoUrl: string | null;
}

export interface CriarItemInput {
  nome: string;
  descricao: string;
  valorCents: number;
  fotoKey?: string;
}
