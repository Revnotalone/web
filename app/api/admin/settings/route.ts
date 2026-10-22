import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULTS } from "@/lib/settings";
import { isValidQris } from "@/lib/qris";

export async function PUT(req: Request) {
  const b = await req.json().catch(() => ({}));
  const rows = Object.keys(DEFAULTS)
    .filter((k) => b[k] !== undefined)
    .map((k) => ({ key: k, value: String(b[k]).trim() }));
  const qris = rows.find((r) => r.key === "qris_static");
  if (qris && qris.value && !isValidQris(qris.value))
    return NextResponse.json({ error: "Kode QRIS tidak valid (harus diawali 000201 dan CRC benar). Salin ulang dari hasil scan." }, { status: 400 });
  const { error } = await db.from("settings").upsert(rows);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}
