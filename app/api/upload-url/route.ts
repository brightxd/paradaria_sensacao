import { gerarUrlDeUpload } from "@/lib/s3";
import { uploadUrlSchema } from "@/lib/validation";
import { ZodError } from "zod";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { contentType } = uploadUrlSchema.parse(body);
    const resultado = await gerarUrlDeUpload(contentType);
    return Response.json(resultado);
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ erro: error.errors[0].message }, { status: 400 });
    }
    return Response.json({ erro: "Erro ao gerar URL de upload." }, { status: 500 });
  }
}
