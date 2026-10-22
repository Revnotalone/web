import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/upload";

export async function POST(req: Request) {
  try {
    const file = (await req.formData()).get("file");
    if (!(file instanceof File)) throw new Error("File tidak ada");
    return NextResponse.json({ url: await uploadImage(file, "produk") });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
