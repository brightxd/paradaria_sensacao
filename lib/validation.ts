import { z } from "zod";

export const uploadUrlSchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"], {
    errorMap: () => ({ message: "Tipo de imagem não permitido. Use JPEG, PNG ou WebP." }),
  }),
});

export const criarItemSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(100),
  descricao: z.string().max(500).optional().default(""),
  valorCents: z.number().int("Valor deve ser inteiro").min(1, "Valor deve ser maior que zero"),
  fotoKey: z.string().optional(),
});

export const checkoutSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(100),
  email: z.string().email("E-mail inválido"),
  itens: z
    .array(
      z.object({
        itemId: z.string().uuid("ID de item inválido"),
        quantidade: z.number().int().min(1, "Quantidade deve ser ao menos 1"),
      }),
    )
    .min(1, "Carrinho não pode estar vazio"),
});

export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;
export type CriarItemInput = z.infer<typeof criarItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
