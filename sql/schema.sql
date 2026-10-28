-- schema.sql — Trilha A (RDS PostgreSQL)
-- Execute uma única vez no database `padaria` da instância do grupo.

create table if not exists itens (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  descricao   text,
  valor_cents integer not null check (valor_cents >= 0),
  foto_key    text,
  criado_em   timestamptz not null default now()
);

create table if not exists pedidos (
  id            uuid primary key,
  cliente_nome  text not null,
  cliente_email text not null,
  status        text not null default 'recebido'
                  check (status in ('recebido', 'confirmado')),
  total_cents   integer,
  criado_em     timestamptz not null default now(),
  confirmado_em timestamptz
);

create table if not exists pedido_itens (
  pedido_id   uuid references pedidos(id) on delete cascade,
  item_id     uuid references itens(id),
  quantidade  integer not null check (quantidade > 0),
  valor_cents integer not null,
  primary key (pedido_id, item_id)
);

create index if not exists pedidos_status_idx on pedidos(status);
create index if not exists pedidos_criado_em_idx on pedidos(criado_em desc);
