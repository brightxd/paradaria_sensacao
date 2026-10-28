import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });
export const BUCKET = process.env.S3_BUCKET!;

const TIPOS_PERMITIDOS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function gerarUrlDeUpload(contentType: string): Promise<{ uploadUrl: string; fotoKey: string }> {
  const ext = TIPOS_PERMITIDOS[contentType];
  if (!ext) throw new Error("Tipo de imagem não permitido. Use JPEG, PNG ou WebP.");

  const fotoKey = `fotos/${crypto.randomUUID()}.${ext}`;
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET, Key: fotoKey, ContentType: contentType }),
    { expiresIn: 300 },
  );
  return { uploadUrl, fotoKey };
}

export function gerarUrlDaFoto(fotoKey: string): Promise<string> {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: fotoKey }),
    { expiresIn: 3600 },
  );
}
