// processar-pedido (Trilha B) — Node.js 24, roda no console da Lambda.
// Lê o pedido do S3, calcula o total, confirma com IfMatch (idempotência) e publica no SNS.
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const s3 = new S3Client({});
const sns = new SNSClient({});
const Bucket = process.env.S3_BUCKET;

export const handler = async (event) => {
  for (const registro of event.Records) {
    const { pedidoId, forcarErro } = JSON.parse(registro.body);

    if (forcarErro) throw new Error("Erro forçado para testar a DLQ");

    const Key = `pedidos/${pedidoId}.json`;
    const obj = await s3.send(new GetObjectCommand({ Bucket, Key }));
    const pedido = JSON.parse(await obj.Body.transformToString());

    if (pedido.status === "confirmado") continue;

    pedido.totalCents = pedido.itens.reduce(
      (t, i) => t + i.quantidade * i.valorCents,
      0,
    );
    pedido.status = "confirmado";
    pedido.confirmadoEm = new Date().toISOString();

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket,
          Key,
          IfMatch: obj.ETag,
          Body: JSON.stringify(pedido),
          ContentType: "application/json",
        }),
      );
    } catch (e) {
      if (e.$metadata?.httpStatusCode === 412) continue;
      throw e;
    }

    await sns.send(
      new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Message: JSON.stringify({
          pedidoId,
          nome: pedido.cliente.nome,
          email: pedido.cliente.email,
          itens: pedido.itens,
          totalCents: pedido.totalCents,
        }),
      }),
    );
  }
};
