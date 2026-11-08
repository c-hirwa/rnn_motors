import { readImage } from "@/lib/storage";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const data = await readImage(key);
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": key.endsWith(".webp") ? "image/webp" : "image/jpeg",
      // Keys are unique per upload, so files never change.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
