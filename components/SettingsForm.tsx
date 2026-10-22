"use client";
import { useState } from "react";
import type { Settings } from "@/lib/settings";

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [s, setS] = useState({ ...initial, cod_fee: String(initial.cod_fee), shipping_cost: String(initial.shipping_cost), free_shipping_min: String(initial.free_shipping_min) });
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: any) => setS((x) => ({ ...x, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const r = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
    setBusy(false);
    setMsg(r.ok ? { ok: true, t: "Pengaturan tersimpan" } : { ok: false, t: (await r.json().catch(() => ({}))).error || "Gagal menyimpan" });
  }
  const Toggle = ({ k, label }: { k: string; label: string }) => (
    <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={(s as any)[k] === true || (s as any)[k] === "true"} onChange={(e) => set(k, e.target.checked)} /> {label}</label>
  );

  return (
    <form onSubmit={save} className="space-y-6">
      <section className="panel grid gap-4 sm:grid-cols-2">
        <h2 className="text-xl font-extrabold sm:col-span-2">Toko</h2>
        <div><label className="label" htmlFor="sn">Nama toko</label><input id="sn" className="input" value={s.store_name} onChange={(e) => set("store_name", e.target.value)} /></div>
        <div><label className="label" htmlFor="sw">WhatsApp admin</label><input id="sw" className="input" placeholder="6281234567890" value={s.wa_admin} onChange={(e) => set("wa_admin", e.target.value)} /></div>
        <div><label className="label" htmlFor="so">Ongkir flat (Rp)</label><input id="so" type="number" min={0} className="input" value={s.shipping_cost} onChange={(e) => set("shipping_cost", e.target.value)} /></div>
        <div><label className="label" htmlFor="sg">Gratis ongkir mulai belanja (Rp, 0 = nonaktif)</label><input id="sg" type="number" min={0} className="input" value={s.free_shipping_min} onChange={(e) => set("free_shipping_min", e.target.value)} /></div>
      </section>

      <section className="panel space-y-4">
        <h2 className="text-xl font-extrabold">Cara bayar</h2>
        <Toggle k="cod_enabled" label="Aktifkan COD" />
        <div className="max-w-xs"><label className="label" htmlFor="sc">Biaya tambahan COD (Rp)</label><input id="sc" type="number" min={0} className="input" value={s.cod_fee} onChange={(e) => set("cod_fee", e.target.value)} /></div>
        <hr className="border-mist" />
        <Toggle k="transfer_enabled" label="Aktifkan transfer manual" />
        <div><label className="label" htmlFor="sb">Info rekening (tampil ke pembeli)</label>
          <textarea id="sb" rows={3} className="input" placeholder={"BCA 1234567890\na.n. Nama Kamu"} value={s.bank_info} onChange={(e) => set("bank_info", e.target.value)} /></div>
        <hr className="border-mist" />
        <Toggle k="qris_enabled" label="Aktifkan QRIS dinamis" />
        <div><label className="label" htmlFor="sq">Kode QRIS statis toko</label>
          <textarea id="sq" rows={4} className="input font-mono text-sm" placeholder="000201010211..." value={s.qris_static} onChange={(e) => set("qris_static", e.target.value)} />
          <p className="mt-1 text-sm text-ink/70">Scan QR statis tokomu dengan aplikasi pemindai QR biasa (bukan aplikasi e-wallet), lalu salin teks hasilnya yang diawali <b>000201</b>. Sistem otomatis mengisi nominal tiap pesanan.</p></div>
      </section>

      {msg && <p role="status" className={`font-semibold ${msg.ok ? "text-ok" : "text-bad"}`}>{msg.t}</p>}
      <button className="btn btn-primary" disabled={busy}>{busy ? "Menyimpan…" : "Simpan pengaturan"}</button>
    </form>
  );
}
