# Padaria 100sação 🍞

Sistema de pedidos online para a Padaria 100sação, desenvolvido como projeto final do módulo de Cloud Computing com TypeScript da Ada Tech.

## Stack

- **Frontend/Backend**: Next.js 16+ (App Router, fullstack)
- **Linguagem**: TypeScript strict
- **Estilo**: Tailwind CSS
- **Validação**: Zod
- **Testes**: Jest + Testing Library (unit) · Playwright (E2E)
- **AWS**: S3 · SQS · Lambda · SNS · SES

## Trilha implementada

**Trilha B — só S3.** Dados em JSON no bucket (prefixos `itens/` e `pedidos/`), sem RDS. A idempotência da Lambda é garantida via escrita condicional (`IfMatch` na ETag).

O schema SQL para a **Trilha A (RDS)** está em `sql/schema.sql` caso queira migrar.

## Arquitetura

```
Browser → Next.js (Route Handlers)
                ├── S3          fotos (URL assinada) + itens/*.json + pedidos/*.json
                └── SQS         fila pedidos (DLQ após 3 falhas)
                        └── Lambda processar-pedido
                                ├── S3          confirma pedido (IfMatch)
                                └── SNS         publica pedido-confirmado
                                        └── Lambda enviar-email
                                                └── SES     e-mail de confirmação
```

Credenciais AWS ficam **apenas** no servidor Next.js (`.env.local`). O browser nunca vê as chaves.

## Pré-requisitos

- Node.js 20+
- Conta AWS com os recursos configurados (veja a seção abaixo)

## Configuração local

```bash
git clone <repo-url>
cd padaria-100sacao
npm install
cp .env.example .env.local   # preencha os valores
npm run dev                   # http://localhost:3000
```

### Variáveis de ambiente

| Variável | Onde | Descrição |
|---|---|---|
| `AWS_REGION` | Next | Região dos recursos (`us-east-1`) |
| `AWS_ACCESS_KEY_ID` | Next | Access key do usuário IAM |
| `AWS_SECRET_ACCESS_KEY` | Next | Secret key do usuário IAM |
| `S3_BUCKET` | Next | Nome do bucket (`padaria-SEU-GRUPO-1234`) |
| `SQS_QUEUE_URL` | Next | URL da fila principal |
| `SNS_TOPIC_ARN` | Lambda `processar-pedido` | ARN do tópico |
| `SES_FROM` | Lambda `enviar-email` | E-mail remetente verificado no SES |

## Páginas

| Rota | Descrição |
|---|---|
| `/` | Home com apresentação da padaria |
| `/itens` | Catálogo de produtos com carrinho flutuante |
| `/itens/novo` | Cadastro de produto com upload de foto |
| `/checkout` | Resumo do pedido + dados do cliente |
| `/pedidos` | Lista de pedidos com status ao vivo (polling a cada 2s) |

## Rotas de API

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/upload-url` | Gera URL assinada de PUT para o S3 |
| `GET` | `/api/itens` | Lista todos os itens com URLs das fotos |
| `POST` | `/api/itens` | Cria novo item |
| `POST` | `/api/checkout` | Grava pedido e enfileira no SQS |
| `GET` | `/api/pedidos` | Lista os 50 pedidos mais recentes |

## Testes

```bash
npm test                  # unit tests
npm run test:coverage     # unit tests + relatório de coverage
npm run test:e2e          # E2E com Playwright (requer npm run dev)
npm run test:e2e:ui       # E2E com interface visual
npm run type-check        # verificação de tipos TypeScript
```

**49 testes unitários** cobrindo: `lib/carrinho`, `lib/validation`, todos os componentes UI, hooks `useCarrinho` e `usePedidos`.

## Estrutura do projeto

```
padaria-100sacao/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (store)/
│   │   ├── itens/page.tsx
│   │   ├── itens/novo/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── pedidos/page.tsx
│   └── api/
│       ├── upload-url/route.ts
│       ├── itens/route.ts
│       ├── checkout/route.ts
│       └── pedidos/route.ts
├── components/
│   ├── ui/          Button, Input, Textarea, StatusBadge
│   ├── catalog/     ProductCard, ProductGrid
│   ├── cart/        CartSummary
│   ├── orders/      OrderList
│   └── layout/      Navbar
├── hooks/
│   ├── useCarrinho.ts
│   └── usePedidos.ts
├── lib/
│   ├── s3.ts          cliente S3 e URLs assinadas
│   ├── sqs.ts         envio para a fila
│   ├── store.ts       ler/gravar/listar JSON no S3
│   ├── carrinho.ts    localStorage (roda no browser)
│   └── validation.ts  schemas Zod
├── lambdas/
│   ├── processar-pedido/index.mjs
│   └── enviar-email/index.mjs
├── __tests__/         testes unitários
├── e2e/               testes E2E (Playwright)
├── sql/schema.sql     schema PostgreSQL (Trilha A)
├── middleware.ts      rate limiting
├── next.config.ts     security headers
└── .env.example
```

## Configuração dos recursos AWS

Siga a ordem abaixo — cada etapa gera um valor usado na próxima.

### 1. IAM

Crie um grupo `padaria-dev-SEU-GRUPO` e um usuário `padaria-app-SEU-GRUPO` com a política abaixo. Gere a access key e guarde no `.env.local`.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": [
        "arn:aws:s3:::padaria-SEU-GRUPO-1234/fotos/*",
        "arn:aws:s3:::padaria-SEU-GRUPO-1234/itens/*",
        "arn:aws:s3:::padaria-SEU-GRUPO-1234/pedidos/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::padaria-SEU-GRUPO-1234"
    },
    {
      "Effect": "Allow",
      "Action": ["sqs:SendMessage", "sqs:GetQueueAttributes"],
      "Resource": "arn:aws:sqs:us-east-1:*:pedidos-SEU-GRUPO"
    }
  ]
}
```

### 2. S3

Crie o bucket `padaria-SEU-GRUPO-1234` em `us-east-1` com **Block all public access** ativo. Adicione a política de CORS:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 3. SES

Em **Amazon SES > Identities**, verifique o e-mail de cada integrante (clique no link de confirmação). Em modo sandbox, só é possível enviar para e-mails verificados.

### 4. SQS

Crie a DLQ primeiro, depois a fila principal apontando para ela:

1. Fila `pedidos-dlq-SEU-GRUPO` — Standard, padrões
2. Fila `pedidos-SEU-GRUPO` — Standard, **Visibility timeout: 60s**, Dead-letter queue: `pedidos-dlq-SEU-GRUPO`, Maximum receives: 3

Copie a **URL** da fila principal para `SQS_QUEUE_URL`.

### 5. Lambda — processar-pedido

1. Crie a função `processar-pedido-SEU-GRUPO` — Runtime Node.js 24, timeout 30s
2. Cole o código de `lambdas/processar-pedido/index.mjs`
3. Variáveis de ambiente: `S3_BUCKET`, `SNS_TOPIC_ARN` (preencher após criar o tópico)
4. Permissões na role: `AWSLambdaSQSQueueExecutionRole` + inline policies:
   - `sns:Publish` no tópico
   - `s3:GetObject` e `s3:PutObject` em `pedidos/*`
5. Trigger: SQS `pedidos-SEU-GRUPO`, batch size 1

### 6. SNS

Crie o tópico `pedido-confirmado-SEU-GRUPO` — Standard. Copie o ARN e preencha `SNS_TOPIC_ARN` na Lambda `processar-pedido`.

### 7. Lambda — enviar-email

1. Crie a função `enviar-email-SEU-GRUPO` — Runtime Node.js 24
2. Cole o código de `lambdas/enviar-email/index.mjs`
3. Variável de ambiente: `SES_FROM` (um e-mail verificado no SES)
4. Inline policy na role: `ses:SendEmail` em `*`
5. No tópico SNS: crie uma assinatura **AWS Lambda** apontando para esta função

## Segurança

- Nenhuma chave AWS no código ou no git (`.env.local` está no `.gitignore`)
- Security headers em todas as rotas: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`
- Rate limiting no middleware: 60 requisições por minuto por IP
- Validação de todos os inputs com Zod antes de qualquer operação
- Bucket S3 privado — fotos acessíveis apenas por URL assinada (validade 1h)
- IAM com permissão mínima por perfil (app vs. dev vs. Lambda)

## Fluxo completo

1. Dono cadastra produto com foto → browser pede URL assinada ao Next → faz PUT direto no S3 → Next salva `itens/<id>.json`
2. Cliente escolhe itens → carrinho no `localStorage` → checkout → Next salva `pedidos/<id>.json` com status `recebido` e congela preços → envia `{ pedidoId }` para a fila → responde `202`
3. SQS invoca Lambda `processar-pedido` → lê o JSON, calcula total, grava com `IfMatch` (idempotência) → publica no SNS
4. SNS invoca Lambda `enviar-email` → formata e-mail → SES envia para o cliente
5. Página `/pedidos` consulta `GET /api/pedidos` a cada 2s → status muda de `recebido` para `confirmado`

## Respostas do enunciado

**O que acontece se a Lambda `enviar-email` estiver fora do ar na hora do pedido?**
O SNS tentará reenviar a mensagem para a Lambda por até 23 horas (política de retry padrão: backoff exponencial). Se a Lambda voltar durante esse período, o e-mail será enviado normalmente. A idempotência na `processar-pedido` garante que o pedido já está confirmado no S3, então não há risco de processamento duplo. Se o SNS esgotar as tentativas, a mensagem é descartada — o pedido segue confirmado no sistema, mas o cliente não recebe o e-mail. Para mitigar, configure uma DLQ no SNS ou um alarme no CloudWatch para a fila de mensagens mortas.

## Limpeza após a entrega

Apague, na ordem: Lambdas → tópico SNS → filas SQS → bucket S3 → usuários e grupo IAM.
