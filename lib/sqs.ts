import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: process.env.AWS_REGION ?? "us-east-1" });

export function enfileirarPedido(pedidoId: string): Promise<unknown> {
  return sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL!,
      MessageBody: JSON.stringify({ pedidoId }),
    }),
  );
}
