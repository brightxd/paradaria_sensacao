-- Schema da Padaria 100sação (Trilha A — RDS PostgreSQL)
-- Execute este arquivo uma vez após criar o banco no RDS.
-- Exemplo: psql $DATABASE_URL -f lib/schema.sql

CREATE TABLE IF NOT EXISTS itens (
  id          VARCHAR(36)  PRIMARY KEY,
  nome        VARCHAR(255) NOT NULL,
  descricao   TEXT         NOT NULL DEFAULT '',
  valor_cents INTEGER      NOT NULL,
  foto_key    VARCHAR(500),
  criado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedidos (
  id            VARCHAR(36)  PRIMARY KEY,
  cliente_nome  VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255) NOT NULL,
  status        VARCHAR(20)  NOT NULL DEFAULT 'recebido',
  total_cents   INTEGER,
  criado_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  confirmado_em TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS pedido_itens (
  pedido_id   VARCHAR(36)  NOT NULL REFERENCES pedidos(id),
  item_id     VARCHAR(36)  NOT NULL REFERENCES itens(id),
  nome        VARCHAR(255) NOT NULL,
  quantidade  INTEGER      NOT NULL,
  valor_cents INTEGER      NOT NULL,
  PRIMARY KEY (pedido_id, item_id)
);
