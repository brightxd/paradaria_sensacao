import {
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { s3, BUCKET } from "./s3";

export async function lerObjeto<T>(key: string): Promise<{ dado: T; etag: string }> {
  const r = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const dado = JSON.parse(await r.Body!.transformToString()) as T;
  return { dado, etag: r.ETag! };
}

export async function gravarObjeto(key: string, dado: unknown, ifMatch?: string): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(dado),
      ContentType: "application/json",
      ...(ifMatch ? { IfMatch: ifMatch } : {}),
    }),
  );
}

export async function listarObjetos<T>(prefixo: string): Promise<T[]> {
  const r = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefixo }));
  const chaves = (r.Contents ?? []).map((o) => o.Key!).filter((k) => k.endsWith(".json"));
  return Promise.all(chaves.map(async (k) => (await lerObjeto<T>(k)).dado));
}
