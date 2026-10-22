import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const ORDER = ["PENDING", "DIPROSES", "DIKIRIM", "SELESAI", "BATAL"];
const PAY = ["PENDING", "PAID", "FAILED"];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json().catch(() => ({}));
  const { data: o } = await db.from("orders").select("*").eq("id", params.id).single();
  if (!o) return NextResponse.json({ error: "Pesanan tidak ada" }, { status: 404 });

  const patch: Record<string, any> = {};
  if (b.order_status !== undefined) {
    if (!ORDER.includes(b.order_status)) return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    patch.order_status = b.order_status;
  }
  if (b.payment_status !== undefined) {
    if (!PAY.includes(b.payment_status)) return NextResponse.json({ error: "Status bayar tidak valid" }, { status: 400 });
    patch.payment_status = b.payment_status;
  }
  if (b.tracking_number !== undefined) patch.tracking_number = String(b.tracking_number).trim().slice(0, 60) || null;

  // Pembayaran lunas otomatis memajukan pesanan PENDING -> DIPROSES
  if (patch.payment_status === "PAID" && !patch.order_status && o.order_status === "PENDING") patch.order_status = "DIPROSES";

  const { error } = await db.from("orders").update(patch).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Dibatalkan -> stok dikembalikan (sekali saja)
  if (patch.order_status === "BATAL" && o.order_status !== "BATAL") {
    for (const l of o.items) await db.rpc("increment_stock", { p_id: l.id, p_qty: l.qty });
  }
  // Batal lalu dibuka lagi -> ambil stok lagi
  if (o.order_status === "BATAL" && patch.order_status && patch.order_status !== "BATAL") {
    for (const l of o.items) await db.rpc("decrement_stock", { p_id: l.id, p_qty: l.qty });
  }
  return NextResponse.json({ ok: true });
}
