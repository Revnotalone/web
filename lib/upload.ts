import { db } from "./db";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function uploadImage(file: File, folder: string, maxMB = 5): Promise<string> {
  const ext = TYPES[file.type];
  if (!ext) throw new Error("Format harus JPG, PNG, atau WebP");
  if (file.size > maxMB * 1024 * 1024) throw new Error(`Ukuran maksimal ${maxMB} MB`);
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await db.storage.from("uploads").upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
  if (error) throw new Error("Upload gagal: " + error.message);
  return db.storage.from("uploads").getPublicUrl(path).data.publicUrl;
}
