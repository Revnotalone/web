import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadImage } from "@/lib/upload";

export async function POST(req: Request, { params }: { params: { code: string } }) {
  const { data: o } = await db.from("orders").select("id,payment_method,payment_status").eq("order_code", params.code).single();
  if (!o || o.payment_method === "COD") return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  if (o.payment_status === "PAID") return NextResponse.json({ error: "Pesanan sudah lunas" }, { status: 400 });
  try {
    const file = (await req.formData()).get("file");
    if (!(file instanceof File)) throw new Error("Pilih foto bukti bayar");
    const url = await uploadImage(file, "bukti", 4);
    await db.from("orders").update({ proof_image: url }).eq("id", o.id);
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
