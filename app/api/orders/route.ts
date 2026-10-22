import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { buildDynamicQris, isValidQris } from "@/lib/qris";

const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newCode = () =>
  "AIPI-" + Array.from(crypto.getRandomValues(new Uint8Array(6)), (x) => ALPHA[x % 32]).join("");
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return fail("Data tidak valid");

  const name = String(b.name || "").trim().slice(0, 80);
  const wa = String(b.wa || "").replace(/[^\d+]/g, "").slice(0, 20);
  const address = String(b.address || "").trim().slice(0, 400);
  const note = String(b.note || "").trim().slice(0, 300);
  const method = String(b.method || "");
  const input: any[] = Array.isArray(b.items) ? b.items.slice(0, 30) : [];

  if (name.length < 2) return fail("Nama belum diisi");
  if (wa.length < 9) return fail("Nomor WhatsApp belum benar");
  if (address.length < 10) return fail("Alamat lengkap belum diisi");
  if (!["COD", "TRANSFER", "QRIS"].includes(method)) return fail("Pilih metode pembayaran");
  if (!input.length) return fail("Keranjang kosong");

  const s = await getSettings();
  if (method === "COD" && !s.cod_enabled) return fail("COD sedang tidak tersedia");
  if (method === "TRANSFER" && !s.transfer_enabled) return fail("Transfer sedang tidak tersedia");
  if (method === "QRIS" && !(s.qris_enabled && isValidQris(s.qris_static))) return fail("QRIS sedang tidak tersedia");

  const { data: prods } = await db.from("products").select("*").in("id", input.map((i) => String(i.id)));
  const map = new Map((prods || []).map((p: any) => [p.id, p]));

  const lines: any[] = [];
  for (const i of input) {
    const p: any = map.get(String(i.id));
    const qty = Math.floor(Number(i.qty));
    if (!p || !(qty >= 1 && qty <= 99)) return fail("Ada produk yang tidak valid");
    const size = String(i.size || ""), color = String(i.color || "");
    if (p.sizes?.length && !p.sizes.includes(size)) return fail(`Pilih ukuran untuk ${p.name}`);
    if (p.colors?.length && !p.colors.includes(color)) return fail(`Pilih warna untuk ${p.name}`);
    lines.push({ id: p.id, name: p.name, price: p.discount_price ?? p.price, qty, size, color, image: p.images?.[0] || null });
  }

  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const shipping = s.free_shipping_min > 0 && subtotal >= s.free_shipping_min ? 0 : s.shipping_cost;
  const codFee = method === "COD" ? s.cod_fee : 0;
  const total = subtotal + shipping + codFee;

  // Kurangi stok (atomik per produk), batalkan semua kalau ada yang kurang
  const done: any[] = [];
  for (const l of lines) {
    const { data: ok } = await db.rpc("decrement_stock", { p_id: l.id, p_qty: l.qty });
    if (!ok) {
      for (const d of done) await db.rpc("increment_stock", { p_id: d.id, p_qty: d.qty });
      return fail(`Stok ${l.name} tidak cukup`, 409);
    }
    done.push(l);
  }

  const code = newCode();
  const { error } = await db.from("orders").insert({
    order_code: code, customer_name: name, customer_wa: wa, customer_address: address, note,
    items: lines, subtotal, shipping_cost: shipping, cod_fee: codFee, total_amount: total,
    payment_method: method,
    qris_string: method === "QRIS" ? buildDynamicQris(s.qris_static, total) : null,
    expires_at: method === "QRIS" ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null,
  });
  if (error) {
    for (const d of done) await db.rpc("increment_stock", { p_id: d.id, p_qty: d.qty });
    return fail("Gagal membuat pesanan, coba lagi", 500);
  }
  return NextResponse.json({ code });
}
