import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import sharp from "sharp";

/**
 * Local photo storage. Files live in storage/uploads and are served by /media/[key].
 * To move to Supabase Storage or S3 later, replace these three functions.
 */
export const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");
export const KEY_RE = /^[a-z0-9-]+\.(jpg|webp)$/;

export async function saveImage(input: Buffer, nameHint = "car") {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const base =
    nameHint.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "car";
  const key = `${base}-${randomBytes(5).toString("hex")}.jpg`;
  const { data, info } = await sharp(input, { failOn: "error" })
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
  await fs.writeFile(path.join(UPLOAD_DIR, key), data);
  return { key, width: info.width, height: info.height };
}

export async function readImage(key: string) {
  if (!KEY_RE.test(key)) return null;
  try {
    return await fs.readFile(path.join(UPLOAD_DIR, key));
  } catch {
    return null;
  }
}

export async function deleteImage(key: string) {
  if (!KEY_RE.test(key)) return;
  await fs.rm(path.join(UPLOAD_DIR, key), { force: true });
}
