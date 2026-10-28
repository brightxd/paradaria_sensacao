# AWS Setup — Padaria 100sação

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
S3_BUCKET=                  ← preencher no passo 2
SQS_QUEUE_URL=              ← preencher no passo 4
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
2. Clique em **JSON** e cole o conteúdo abaixo (substitua `GRUPO` e o número de conta):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": [
        "arn:aws:s3:::padaria-GRUPO/fotos/*",
        "arn:aws:s3:::padaria-GRUPO/itens/*",
        "arn:aws:s3:::padaria-GRUPO/pedidos/*"
      ]
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

## Passo 2 — S3 (bucket de dados)

**Objetivo:** armazenar fotos, itens e pedidos em JSON.

### 2.1 Criar o bucket

1. Console → **S3** → **Create bucket**
2. **Bucket name:** `padaria-GRUPO` *(deve ser globalmente único — adicione números se necessário)*
3. **AWS Region:** `us-east-1`
4. **Block Public Access:** mantenha **tudo marcado** (bucket privado)
5. O restante deixe padrão → **Create bucket**

### 2.2 Configurar CORS (necessário para upload direto do browser)

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

> Quando fizer deploy em produção, adicione a URL de produção ao `AllowedOrigins`.

3. **Save changes**

### 2.3 Atualizar .env.local

```
S3_BUCKET=padaria-GRUPO
```

✅ Neste ponto o app já funciona localmente com `npm run dev` — você pode cadastrar produtos e ver o cardápio.

---

## Passo 3 — SES (e-mail de confirmação)

**Objetivo:** verificar o endereço de e-mail que enviará as confirmações de pedido.

> SES em modo sandbox só envia para endereços verificados. Verifique pelo menos 2: o remetente e um destinatário de teste.

1. Console → **Amazon SES** → menu lateral **Verified identities** → **Create identity**
2. **Identity type:** Email address
3. **Email address:** seu e-mail (ex: `seuemail@gmail.com`)
4. **Create identity** → vá na caixa de entrada e clique no link de verificação
5. Repita para cada e-mail do grupo que vai receber pedidos de teste

> O valor `SES_FROM` (usado na Lambda `enviar-email`) será esse e-mail verificado.  
> Você vai preenchê-lo no **Passo 7**.

---

## Passo 4 — SQS (fila de pedidos)

**Objetivo:** desacoplar o checkout da Lambda de processamento.  
Crie **primeiro a DLQ**, depois a fila principal.

### 4.1 Criar a Dead-Letter Queue

1. Console → **Amazon SQS** → **Create queue**
2. **Type:** Standard
3. **Name:** `pedidos-dlq-GRUPO`
4. Tudo padrão → **Create queue**
5. Anote o ARN da DLQ (visível na página da fila): `arn:aws:sqs:us-east-1:CONTA:pedidos-dlq-GRUPO`

### 4.2 Criar a fila principal

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
7. Copie a **URL** da fila principal (formato `https://sqs.us-east-1.amazonaws.com/CONTA/pedidos-GRUPO`):

```
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/CONTA/pedidos-GRUPO
```

✅ `.env.local` com `SQS_QUEUE_URL` preenchido.  
✅ Neste ponto o checkout já enfileira pedidos corretamente.

---

## Passo 5 — Lambda: processar-pedido

**Objetivo:** Lambda que a SQS invoca para confirmar o pedido no S3 e publicar no SNS.

> Crie a função agora. O `SNS_TOPIC_ARN` você preenche depois do Passo 6.

### 5.1 Criar a função

1. Console → **Lambda** → **Create function**
2. **Author from scratch**
3. **Function name:** `processar-pedido-GRUPO`
4. **Runtime:** Node.js 22.x (ou a versão mais recente disponível)
5. **Architecture:** x86_64
6. **Create function**

### 5.2 Fazer upload do código

1. Na página da função → aba **Code**
2. Na janela de editor, **abra o arquivo** `index.mjs`
3. **Apague todo o conteúdo** e cole o conteúdo do arquivo `lambdas/processar-pedido/index.mjs` do projeto
4. Clique em **Deploy**

### 5.3 Configurar variáveis de ambiente

1. Aba **Configuration** → **Environment variables** → **Edit** → **Add environment variable**
2. Adicione:

| Key | Value |
|-----|-------|
| `S3_BUCKET` | `padaria-GRUPO` |
| `SNS_TOPIC_ARN` | *(deixe em branco por enquanto — preencher no Passo 6)* |

3. **Save**

### 5.4 Ajustar timeout

1. Aba **Configuration** → **General configuration** → **Edit**
2. **Timeout:** `0` min `30` sec
3. **Save**

### 5.5 Adicionar permissões à role da Lambda

1. Aba **Configuration** → **Permissions** → clique no nome da **Execution role** (abre o IAM)
2. **Add permissions** → **Create inline policy** → **JSON**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::padaria-GRUPO/pedidos/*"
    },
    {
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "*"
    }
  ]
}
```

3. **Policy name:** `processar-pedido-policy` → **Create policy**
4. Volte para a role e adicione também a policy gerenciada:
   - **Add permissions** → **Attach policies** → busque `AWSLambdaSQSQueueExecutionRole` → **Add permissions**

### 5.6 Configurar trigger SQS

1. Volte para a função Lambda → aba **Configuration** → **Triggers** → **Add trigger**
2. **Source:** SQS
3. **SQS queue:** selecione `pedidos-GRUPO`
4. **Batch size:** `1`
5. **Add**

---

## Passo 6 — SNS (tópico de pedido confirmado)

**Objetivo:** publicar evento de confirmação para a Lambda de e-mail.

### 6.1 Criar o tópico

1. Console → **Amazon SNS** → **Topics** → **Create topic**
2. **Type:** Standard
3. **Name:** `pedido-confirmado-GRUPO`
4. **Create topic**
5. Copie o **ARN** (formato `arn:aws:sns:us-east-1:CONTA:pedido-confirmado-GRUPO`)

### 6.2 Atualizar a Lambda processar-pedido

1. Volte para **Lambda** → `processar-pedido-GRUPO`
2. Aba **Configuration** → **Environment variables** → **Edit**
3. Preencha `SNS_TOPIC_ARN` com o ARN copiado → **Save**

---

## Passo 7 — Lambda: enviar-email

**Objetivo:** receber o evento SNS e enviar e-mail via SES.

### 7.1 Criar a função

1. **Lambda** → **Create function**
2. **Function name:** `enviar-email-GRUPO`
3. **Runtime:** Node.js 22.x
4. **Create function**

### 7.2 Upload do código

1. Aba **Code** → cole o conteúdo de `lambdas/enviar-email/index.mjs` → **Deploy**

### 7.3 Variáveis de ambiente

1. Aba **Configuration** → **Environment variables** → **Edit** → **Add**:

| Key | Value |
|-----|-------|
| `SES_FROM` | `seuemail@gmail.com` *(e-mail verificado no SES)* |

2. **Save**

### 7.4 Permissões

1. Aba **Configuration** → **Permissions** → clique na **Execution role**
2. **Add permissions** → **Create inline policy** → **JSON**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ses:SendEmail",
      "Resource": "*"
    }
  ]
}
```

3. **Policy name:** `enviar-email-policy` → **Create policy**

### 7.5 Assinar o tópico SNS

1. Console → **SNS** → `pedido-confirmado-GRUPO` → aba **Subscriptions** → **Create subscription**
2. **Protocol:** AWS Lambda
3. **Endpoint:** selecione `enviar-email-GRUPO` (ou cole o ARN da função)
4. **Create subscription**

---

## Passo 8 — Testar o fluxo completo

Com tudo configurado, reinicie o servidor local:

```bash
npm run dev
```

### Checklist de teste

1. **Cadastrar produto** → `/admin` (PIN: 1234) → `/admin/produtos/novo`
   - Preencha nome, descrição, preço e selecione uma foto
   - Salvar → deve aparecer na lista e no cardápio `/itens`

2. **Fazer pedido** → `/itens`
   - Adicione produtos ao carrinho → checkout
   - Informe nome e **e-mail verificado no SES**
   - Clicar em "Finalizar pedido" → deve retornar `202 Accepted`

3. **Acompanhar** → `/pedidos` ou `/admin/pedidos`
   - O pedido aparece com status `recebido`
   - Em ~10–30s o status muda para `confirmado` (Lambda processou)
   - Verifique a caixa de entrada — o e-mail de confirmação deve ter chegado

4. **Testar DLQ** (opcional):
   - No checkout, envie um pedido com `forcarErro: true` via Postman diretamente na fila SQS
   - Após 3 tentativas, a mensagem deve aparecer em `pedidos-dlq-GRUPO`

---

## Resumo: o que preencher no .env.local

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...          # passo 1.4
AWS_SECRET_ACCESS_KEY=...          # passo 1.4
S3_BUCKET=padaria-GRUPO            # passo 2.1
SQS_QUEUE_URL=https://sqs...       # passo 4.2
ADMIN_PIN=1234
```

---

## Diagrama do fluxo

```
Browser
  │
  ├─ GET /api/itens ──────────────────────────── S3 itens/*.json
  │
  ├─ POST /api/upload-url ────────────────────── S3 presigned PUT URL
  │   └─ PUT <presigned-url> ─────────────────── S3 fotos/<uuid>
  │
  └─ POST /api/checkout
       ├─ GET item JSON ─────────────────────── S3 itens/<id>.json
       ├─ PUT pedido JSON ───────────────────── S3 pedidos/<id>.json  (status: recebido)
       └─ SendMessage ───────────────────────── SQS pedidos-GRUPO
                                                      │
                                            Lambda processar-pedido
                                                      ├─ GET pedido ── S3
                                                      ├─ PUT pedido ── S3  (status: confirmado, IfMatch)
                                                      └─ Publish ───── SNS pedido-confirmado-GRUPO
                                                                              │
                                                                    Lambda enviar-email
                                                                              └─ SendEmail ── SES → caixa do cliente
```

---

## Limpeza após a entrega

Para não gerar custos, apague nesta ordem:

1. Lambda `enviar-email-GRUPO` e `processar-pedido-GRUPO`
2. Subscription do SNS → Tópico `pedido-confirmado-GRUPO`
3. Filas SQS `pedidos-GRUPO` e `pedidos-dlq-GRUPO`
4. Identidades verificadas no SES
5. Bucket S3 `padaria-GRUPO` (esvazie antes de deletar)
6. Usuário IAM `padaria-app-GRUPO` → Grupo `padaria-app-GRUPO`
