// enviar-email — Node.js 24, roda no console da Lambda.
// Assina o tópico SNS e envia o e-mail de confirmação pelo SES.
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({});

const formatarReais = (cents) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const handler = async (event) => {
  for (const registro of event.Records) {
    const p = JSON.parse(registro.Sns.Message);

    const linhas = p.itens.map(
      (i) =>
        `  ${i.quantidade}x ${i.nome}  —  ${formatarReais(i.quantidade * (i.valorCents ?? i.valor_cents))}`,
    );

    const corpo = [
      `Olá, ${p.nome}!`,
      "",
      "Seu pedido foi confirmado. Aqui está o resumo:",
      "",
      ...linhas,
      "",
      `Total: ${formatarReais(p.totalCents)}`,
      "",
      `Número do pedido: ${p.pedidoId}`,
      "",
      "Obrigado por escolher a Padaria 100sação! 🍞",
    ].join("\n");

    await ses.send(
      new SendEmailCommand({
        Source: process.env.SES_FROM,
        Destination: { ToAddresses: [p.email] },
        Message: {
          Subject: { Data: `Pedido ${p.pedidoId.slice(0, 8).toUpperCase()} confirmado — Padaria 100sação` },
          Body: { Text: { Data: corpo } },
        },
      }),
    );
  }
};
