# AWS Setup — Padaria 100sação (Trilha A)

Guia passo a passo para configurar toda a infraestrutura AWS do projeto.  
Siga **exatamente esta ordem** — cada etapa gera valores usados nas próximas.

> **Região**: use **us-east-1 (N. Virginia)** em todos os recursos.  
> **Convenção de nomes**: substitua `GRUPO` pelo identificador do seu grupo (ex: `g1`).

---

## Antes de começar

Abra o arquivo `.env.local` na raiz do projeto — você vai preenchendo os valores conforme avança.

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=          ← preencher no passo 1
AWS_SECRET_ACCESS_KEY=      ← preencher no passo 1
DATABASE_URL=               ← preencher no passo 2
S3_BUCKET=                  ← preencher no passo 3
SQS_QUEUE_URL=              ← preencher no passo 5
ADMIN_PIN=1234
```

---

## Passo 1 — IAM (usuário da aplicação)

**Objetivo:** criar credenciais para o servidor Next.js acessar S3 e SQS.

### 1.1 Criar o grupo de permissões

1. Console AWS → **IAM** → menu lateral **User groups** → **Create group**
2. **User group name:** `padaria-app-GRUPO`
3. Ignore a seção de usuários por ora → **Create user group**

### 1.2 Adicionar política inline ao grupo

1. Clique no grupo `padaria-app-GRUPO` → aba **Permissions** → **Add permissions** → **Create inline policy**
2. Clique em **JSON** e cole o conteúdo abaixo (substitua `GRUPO`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::padaria-GRUPO/fotos/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::padaria-GRUPO"
    },
    {
      "Effect": "Allow",
      "Action": ["sqs:SendMessage", "sqs:GetQueueAttributes"],
      "Resource": "arn:aws:sqs:us-east-1:*:pedidos-GRUPO"
    }
  ]
}
```

3. **Policy name:** `padaria-app-policy-GRUPO` → **Create policy**

### 1.3 Criar o usuário IAM

1. **IAM** → **Users** → **Create user**
2. **User name:** `padaria-app-GRUPO`
3. **Provide user access to the AWS Management Console:** deixe **desmarcado**
4. **Next** → **Add user to group** → selecione `padaria-app-GRUPO` → **Next** → **Create user**

### 1.4 Gerar Access Key

1. Clique no usuário `padaria-app-GRUPO` → aba **Security credentials**
2. Seção **Access keys** → **Create access key**
3. **Use case:** selecione **Application running outside AWS** → **Next** → **Create access key**
4. **Copie agora** (você não verá o secret depois):

```
AWS_ACCESS_KEY_ID=     ← cole o "Access key"
AWS_SECRET_ACCESS_KEY= ← cole o "Secret access key"
```

✅ `.env.local` atualizado com as duas chaves.

---

## Passo 2 — RDS (banco de dados PostgreSQL)

**Objetivo:** criar o banco relacional para produtos e pedidos.

### 2.1 Criar o banco RDS

1. Console → **RDS** → **Create database**
2. **Choose a database creation method:** Standard create
3. **Engine type:** PostgreSQL
4. **Engine version:** deixe a padrão (mais recente disponível)
5. **Templates:** Free tier
6. **DB instance identifier:** `padaria-GRUPO`
7. **Master username:** `padaria`
8. **Master password:** escolha uma senha forte e anote (ex: `Padaria@2026`)
9. Em **Connectivity**:
   - **Public access:** Yes *(necessário para o Next.js local e a Lambda sem VPC)*
   - **VPC security group:** Create new → nome: `padaria-rds-sg-GRUPO`
10. Em **Additional configuration** → **Initial database name:** `padaria`
11. **Create database** *(pode levar 3-5 minutos)*

### 2.2 Liberar acesso no Security Group

1. Após o banco ser criado, clique nele → seção **Security** → clique no security group `padaria-rds-sg-GRUPO`
2. Aba **Inbound rules** → **Edit inbound rules** → **Add rule**:
   - **Type:** PostgreSQL
   - **Source:** Anywhere-IPv4 (`0.0.0.0/0`)
3. **Save rules**

> ⚠️ Isso abre o banco para qualquer IP — adequado para projeto acadêmico. Em produção, restrinja ao IP específico.

### 2.3 Obter o endpoint e montar DATABASE_URL

1. Na página do banco → copie o **Endpoint** (ex: `padaria-g1.c9xyz.us-east-1.rds.amazonaws.com`)
2. Monte a URL e preencha no `.env.local`:

```
DATABASE_URL=postgresql://padaria:SUA_SENHA@padaria-GRUPO.c9xyz.us-east-1.rds.amazonaws.com:5432/padaria
```

### 2.4 Criar as tabelas (schema)

Com o banco criado, execute o schema SQL do projeto. No terminal do projeto:

```bash
npx ts-node -e "
const { Pool } = require('pg');
const fs = require('fs');
const sql = fs.readFileSync('lib/schema.sql', 'utf8');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query(sql).then(() => { console.log('Schema criado!'); pool.end(); });
" --skip-project
```

Ou use qualquer cliente PostgreSQL (DBeaver, TablePlus, psql) com a `DATABASE_URL`.

✅ Banco pronto. Neste ponto o app já funciona localmente (mock desaparece, dados vão pro banco).

---

## Passo 3 — S3 (bucket para fotos)

**Objetivo:** armazenar as fotos dos produtos com upload direto do browser via presigned URL.

### 3.1 Criar o bucket

1. Console → **S3** → **Create bucket**
2. **Bucket name:** `padaria-GRUPO` *(deve ser globalmente único — adicione números se necessário)*
3. **AWS Region:** `us-east-1`
4. **Block Public Access:** mantenha **tudo marcado** (bucket privado)
5. O restante deixe padrão → **Create bucket**

### 3.2 Configurar CORS

1. Clique no bucket → aba **Permissions** → seção **Cross-origin resource sharing (CORS)** → **Edit**
2. Cole o JSON abaixo:

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

3. **Save changes**

### 3.3 Atualizar .env.local

```
S3_BUCKET=padaria-GRUPO
```

✅ Cadastro de produtos com foto funcionando.

---

## Passo 4 — SES (e-mail de confirmação)

**Objetivo:** verificar o endereço de e-mail que enviará as confirmações de pedido.

> SES em modo sandbox só envia para endereços verificados. Verifique pelo menos 2: o remetente e um destinatário de teste.

1. Console → **Amazon SES** → menu lateral **Verified identities** → **Create identity**
2. **Identity type:** Email address
3. **Email address:** seu e-mail (ex: `seuemail@gmail.com`)
4. **Create identity** → vá na caixa de entrada e clique no link de verificação
5. Repita para cada e-mail do grupo que vai receber pedidos de teste

---

## Passo 5 — SQS (fila de pedidos)

**Objetivo:** desacoplar o checkout da Lambda de processamento.  
Crie **primeiro a DLQ**, depois a fila principal.

### 5.1 Criar a Dead-Letter Queue

1. Console → **Amazon SQS** → **Create queue**
2. **Type:** Standard
3. **Name:** `pedidos-dlq-GRUPO`
4. Tudo padrão → **Create queue**

### 5.2 Criar a fila principal

1. **Create queue**
2. **Type:** Standard
3. **Name:** `pedidos-GRUPO`
4. Em **Configuration**:
   - **Visibility timeout:** `60` segundos
5. Em **Dead-letter queue**:
   - **Enabled:** ✅
   - **Choose queue:** selecione `pedidos-dlq-GRUPO`
   - **Maximum receives:** `3`
6. **Create queue**
7. Copie a **URL** da fila principal:

```
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/CONTA/pedidos-GRUPO
```

✅ Checkout enfileirando pedidos.

---

## Passo 6 — Lambda: processar-pedido

**Objetivo:** Lambda que a SQS invoca para confirmar o pedido no RDS e publicar no SNS.

> Esta Lambda usa `pg` (não disponível nativamente no Node.js da Lambda), então precisa ser enviada como zip.

### 6.1 Gerar o zip no terminal do projeto

```bash
cd lambdas/processar-pedido
npm install
zip -r ../../processar-pedido.zip .
cd ../..
```

Isso cria `processar-pedido.zip` na raiz do projeto.

### 6.2 Criar a função Lambda

1. Console → **Lambda** → **Create function**
2. **Author from scratch**
3. **Function name:** `processar-pedido-GRUPO`
4. **Runtime:** Node.js 22.x
5. **Architecture:** x86_64
6. **Create function**

### 6.3 Upload do zip

1. Aba **Code** → **Upload from** → **.zip file** → selecione `processar-pedido.zip`
2. **Save**

### 6.4 Configurar variáveis de ambiente

1. Aba **Configuration** → **Environment variables** → **Edit** → **Add**:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://padaria:SENHA@endpoint.rds.amazonaws.com:5432/padaria` |
| `SNS_TOPIC_ARN` | *(deixar em branco — preencher no Passo 7)* |

2. **Save**

### 6.5 Ajustar timeout

1. Aba **Configuration** → **General configuration** → **Edit**
2. **Timeout:** `0` min `30` sec → **Save**

### 6.6 Adicionar permissões à role da Lambda

1. Aba **Configuration** → **Permissions** → clique no nome da **Execution role**
2. **Add permissions** → **Create inline policy** → **JSON**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "*"
    }
  ]
}
```

3. **Policy name:** `processar-pedido-policy` → **Create policy**
4. Adicione também a policy gerenciada:
   - **Add permissions** → **Attach policies** → busque `AWSLambdaSQSQueueExecutionRole` → **Add permissions**

### 6.7 Configurar trigger SQS

1. Aba **Configuration** → **Triggers** → **Add trigger**
2. **Source:** SQS → **SQS queue:** `pedidos-GRUPO`
3. **Batch size:** `1` → **Add**

---

## Passo 7 — SNS (tópico de pedido confirmado)

### 7.1 Criar o tópico

1. Console → **Amazon SNS** → **Topics** → **Create topic**
2. **Type:** Standard
3. **Name:** `pedido-confirmado-GRUPO`
4. **Create topic**
5. Copie o **ARN**

### 7.2 Atualizar a Lambda processar-pedido

1. Volte para a Lambda → aba **Configuration** → **Environment variables** → **Edit**
2. Preencha `SNS_TOPIC_ARN` com o ARN copiado → **Save**

---

## Passo 8 — Lambda: enviar-email

### 8.1 Criar a função

1. **Lambda** → **Create function**
2. **Function name:** `enviar-email-GRUPO`
3. **Runtime:** Node.js 22.x → **Create function**

### 8.2 Upload do código

1. Aba **Code** → cole o conteúdo de `lambdas/enviar-email/index.mjs` → **Deploy**

### 8.3 Variáveis de ambiente

| Key | Value |
|-----|-------|
| `SES_FROM` | `seuemail@gmail.com` *(e-mail verificado no SES)* |

### 8.4 Permissões

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": "ses:SendEmail", "Resource": "*" }
  ]
}
```

**Policy name:** `enviar-email-policy`

### 8.5 Assinar o tópico SNS

1. Console → **SNS** → `pedido-confirmado-GRUPO` → **Subscriptions** → **Create subscription**
2. **Protocol:** AWS Lambda → **Endpoint:** selecione `enviar-email-GRUPO`
3. **Create subscription**

---

## Passo 9 — Testar o fluxo completo

```bash
npm run dev
```

### Checklist

1. **Cadastrar produto** → `/admin` (PIN: 1234) → `/admin/produtos/novo` — produto deve aparecer no cardápio
2. **Fazer pedido** → `/itens` → checkout com e-mail verificado no SES → status `202`
3. **Acompanhar** → `/pedidos` — status muda de `recebido` para `confirmado` em ~30s
4. **Verificar e-mail** — confirmação deve ter chegado na caixa de entrada
5. **Testar DLQ** (opcional) — envie `{"pedidoId": "x", "forcarErro": true}` pela fila SQS → após 3 tentativas vai para `pedidos-dlq-GRUPO`

---

## Resumo: .env.local completo

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...                          # passo 1.4
AWS_SECRET_ACCESS_KEY=...                          # passo 1.4
DATABASE_URL=postgresql://padaria:SENHA@...        # passo 2.3
S3_BUCKET=padaria-GRUPO                            # passo 3.1
SQS_QUEUE_URL=https://sqs.us-east-1...             # passo 5.2
ADMIN_PIN=1234
```

---

## Diagrama do fluxo (Trilha A)

```
Browser
  │
  ├─ GET /api/itens ──────────────────────── RDS → SELECT itens
  │
  ├─ POST /api/upload-url ──────────────── S3 presigned PUT URL
  │   └─ PUT <presigned-url> ────────────── S3 fotos/<uuid>
  │
  └─ POST /api/checkout
       ├─ SELECT itens ──────────────────── RDS → itens
       ├─ INSERT pedido + pedido_itens ──── RDS
       └─ SendMessage ───────────────────── SQS pedidos-GRUPO
                                                  │
                                        Lambda processar-pedido
                                                  ├─ SELECT pedido_itens ── RDS
                                                  ├─ UPDATE pedidos ──────── RDS (status: confirmado)
                                                  └─ Publish ─────────────── SNS pedido-confirmado-GRUPO
                                                                                    │
                                                                          Lambda enviar-email
                                                                                    └─ SendEmail ── SES → caixa do cliente
```

---

## Limpeza após a entrega

1. Lambdas `enviar-email-GRUPO` e `processar-pedido-GRUPO`
2. Subscription do SNS → Tópico `pedido-confirmado-GRUPO`
3. Filas SQS `pedidos-GRUPO` e `pedidos-dlq-GRUPO`
4. Identidades verificadas no SES
5. Bucket S3 `padaria-GRUPO` (esvazie antes de deletar)
6. Banco RDS `padaria-GRUPO` (confirme backup desabilitado antes de deletar)
7. Usuário IAM `padaria-app-GRUPO` → Grupo `padaria-app-GRUPO`
