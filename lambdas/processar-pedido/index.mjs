// processar-pedido (Trilha A) — Node.js 22, roda no console da Lambda.
// Faz UPDATE no RDS com idempotência (WHERE status='recebido'), calcula total e publica no SNS.
import pg from "pg";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const { Pool } = pg;
const sns = new SNSClient({});

let pool;
function getPool() {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  return pool;
}

export const handler = async (event) => {
  const db = getPool();

  for (const registro of event.Records) {
    const { pedidoId, forcarErro } = JSON.parse(registro.body);

    if (forcarErro) throw new Error("Erro forçado para testar a DLQ");

    const { rows: itens } = await db.query(
      "SELECT nome, quantidade, valor_cents FROM pedido_itens WHERE pedido_id = $1",
      [pedidoId],
    );

    const totalCents = itens.reduce((t, i) => t + i.quantidade * i.valor_cents, 0);

    // Idempotência: só confirma se ainda estiver como 'recebido'
    const result = await db.query(
      `UPDATE pedidos
       SET status = 'confirmado', total_cents = $1, confirmado_em = NOW()
       WHERE id = $2 AND status = 'recebido'
       RETURNING cliente_nome, cliente_email`,
      [totalCents, pedidoId],
    );

    if (result.rows.length === 0) continue;

    const { cliente_nome, cliente_email } = result.rows[0];

    await sns.send(
      new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Message: JSON.stringify({
          pedidoId,
          nome: cliente_nome,
          email: cliente_email,
          itens: itens.map((i) => ({
            nome: i.nome,
            quantidade: i.quantidade,
            valorCents: i.valor_cents,
          })),
          totalCents,
        }),
      }),
    );
  }
};
