"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { rp } from "@/lib/format";

type PS = { cod_enabled: boolean; transfer_enabled: boolean; qris_enabled: boolean; cod_fee: number; shipping_cost: number; free_shipping_min: number; bank_info: string };

export default function CheckoutClient({ s }: { s: PS }) {
  const { items, subtotal, setQty, remove, clear } = useCart();
  const router = useRouter();
  const methods = [
    s.qris_enabled && { id: "QRIS", title: "QRIS", desc: "Scan, nominal terisi otomatis" },
    s.transfer_enabled && { id: "TRANSFER", title: "Transfer bank", desc: "Upload bukti setelah transfer" },
    s.cod_enabled && { id: "COD", title: "Bayar di tempat (COD)", desc: s.cod_fee ? `Biaya COD ${rp(s.cod_fee)}` : "Bayar saat barang sampai" },
  ].filter(Boolean) as { id: string; title: string; desc: string }[];

  const [f, setF] = useState({ name: "", wa: "", address: "", note: "" });
  const [method, setMethod] = useState(methods[0]?.id || "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const shipping = s.free_shipping_min > 0 && subtotal >= s.free_shipping_min ? 0 : s.shipping_cost;
  const fee = method === "COD" ? s.cod_fee : 0;
  const total = subtotal + shipping + fee;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const res = await fetch("/api/orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, method, items: items.map((i) => ({ id: i.id, qty: i.qty, size: i.size, color: i.color })) }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(d.error || "Gagal membuat pesanan");
    clear();
    router.push(`/pesanan/${d.code}`);
  }

  if (items.length === 0)
    return (
      <div className="panel mx-auto max-w-md text-center">
        <p className="text-xl font-extrabold">Keranjangmu masih kosong</p>
        <Link href="/" className="btn btn-sun mt-4">Cari produk</Link>
      </div>
    );

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <section className="panel">
          <h2 className="mb-3 text-xl font-extrabold">Keranjang</h2>
          <ul className="divide-y divide-mist">
            {items.map((i) => (
              <li key={i.key} className="flex gap-3 py-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-mist">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {i.image && <img src={i.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/produk/${i.slug}`} className="font-semibold">{i.name}</Link>
                  <p className="text-sm text-ink/60">{[i.size, i.color].filter(Boolean).join(" • ")}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="flex items-center rounded-lg border border-mist">
                      <button type="button" className="px-3 py-1" onClick={() => setQty(i.key, i.qty - 1)} aria-label="Kurangi">−</button>
                      <span className="w-6 text-center">{i.qty}</span>
                      <button type="button" className="px-3 py-1" onClick={() => setQty(i.key, i.qty + 1)} aria-label="Tambah">+</button>
                    </div>
                    <button type="button" onClick={() => remove(i.key)} className="text-sm font-semibold text-bad">Hapus</button>
                  </div>
                </div>
                <p className="font-bold">{rp(i.price * i.qty)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel space-y-4">
          <h2 className="text-xl font-extrabold">Alamat pengiriman</h2>
          <div><label className="label" htmlFor="n">Nama penerima</label>
            <input id="n" required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></div>
          <div><label className="label" htmlFor="w">Nomor WhatsApp</label>
            <input id="w" required inputMode="tel" className="input" placeholder="08123456789" value={f.wa} onChange={(e) => setF({ ...f, wa: e.target.value })} autoComplete="tel" /></div>
          <div><label className="label" htmlFor="a">Alamat lengkap</label>
            <textarea id="a" required rows={3} className="input" placeholder="Jalan, RT/RW, kelurahan, kecamatan, kota, kode pos" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
          <div><label className="label" htmlFor="c">Catatan (opsional)</label>
            <input id="c" className="input" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></div>
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
        <section className="panel">
          <h2 className="mb-3 text-xl font-extrabold">Cara bayar</h2>
          {methods.length === 0 && <p className="text-bad">Belum ada metode pembayaran aktif. Hubungi admin toko.</p>}
          <div className="space-y-2" role="radiogroup">
            {methods.map((m) => (
              <label key={m.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${method === m.id ? "border-ink bg-sun/30" : "border-mist"}`}>
                <input type="radio" name="m" className="mt-1" checked={method === m.id} onChange={() => setMethod(m.id)} />
                <span><b>{m.title}</b><br /><span className="text-sm text-ink/70">{m.desc}</span></span>
              </label>
            ))}
          </div>
        </section>
        <section className="panel space-y-1">
          <Row k="Subtotal" v={rp(subtotal)} />
          <Row k="Ongkir" v={shipping === 0 ? "Gratis" : rp(shipping)} />
          {fee > 0 && <Row k="Biaya COD" v={rp(fee)} />}
          <div className="mt-2 flex justify-between border-t border-mist pt-3 text-xl font-extrabold"><span>Total</span><span>{rp(total)}</span></div>
          {err && <p role="alert" className="pt-2 font-semibold text-bad">{err}</p>}
          <button className="btn btn-primary mt-3 w-full" disabled={busy || !method}>{busy ? "Memproses…" : "Buat pesanan"}</button>
        </section>
      </aside>
    </form>
  );
}
const Row = ({ k, v }: { k: string; v: string }) => <div className="flex justify-between"><span className="text-ink/70">{k}</span><span className="font-semibold">{v}</span></div>;
