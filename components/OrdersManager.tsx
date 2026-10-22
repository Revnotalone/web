"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { rp, tgl, waLink, STATUS_LABEL, BAYAR_LABEL } from "@/lib/format";

export default function OrdersManager({ orders, store }: { orders: any[]; store: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState("SEMUA");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  async function patch(id: string, body: object) {
    setBusy(id); setErr("");
    const r = await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy("");
    if (!r.ok) return setErr((await r.json().catch(() => ({}))).error || "Gagal menyimpan");
    router.refresh();
  }
  const shown = orders.filter((o) => filter === "SEMUA" || o.order_status === filter);

  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {["SEMUA", ...Object.keys(STATUS_LABEL)].map((k) => (
          <button key={k} onClick={() => setFilter(k)} className={`btn !py-2 whitespace-nowrap ${filter === k ? "btn-primary" : "btn-ghost"}`}>{k === "SEMUA" ? "Semua" : STATUS_LABEL[k]}</button>
        ))}
      </div>
      {err && <p role="alert" className="mb-3 font-semibold text-bad">{err}</p>}
      {shown.length === 0 && <div className="panel text-ink/60">Belum ada pesanan di tab ini.</div>}
      <div className="space-y-4">
        {shown.map((o) => (
          <article key={o.id} className="panel space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div><b className="text-lg">{o.order_code}</b><p className="text-sm text-ink/60">{tgl(o.created_at)} • {o.payment_method}</p></div>
              <div className="text-right"><b className="text-lg">{rp(o.total_amount)}</b>
                <p className={`text-sm font-semibold ${o.payment_status === "PAID" ? "text-ok" : "text-ink/70"}`}>{BAYAR_LABEL[o.payment_status]}</p></div>
            </div>
            <div className="text-sm">
              <p><b>{o.customer_name}</b> • {o.customer_wa}</p>
              <p className="text-ink/70">{o.customer_address}</p>
              {o.note && <p className="italic">Catatan: {o.note}</p>}
              <ul className="mt-2 list-disc pl-5">{o.items.map((l: any, i: number) => <li key={i}>{l.name} ({[l.size, l.color].filter(Boolean).join(", ")}) × {l.qty}</li>)}</ul>
            </div>
            {o.proof_image && (
              <a href={o.proof_image} target="_blank" rel="noreferrer" className="inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.proof_image} alt="Bukti bayar" className="h-28 rounded-lg border border-mist object-cover" />
              </a>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <select className="input !w-auto !py-2" value={o.order_status} disabled={busy === o.id} aria-label="Status pesanan"
                onChange={(e) => patch(o.id, { order_status: e.target.value })}>
                {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              {o.payment_status !== "PAID" && o.order_status !== "BATAL" && (
                <button className="btn btn-sun !py-2" disabled={busy === o.id} onClick={() => confirm(`Konfirmasi lunas ${rp(o.total_amount)}? Pastikan uang sudah masuk.`) && patch(o.id, { payment_status: "PAID" })}>Konfirmasi lunas</button>
              )}
              <input className="input !w-44 !py-2" placeholder="No. resi" defaultValue={o.tracking_number || ""}
                onBlur={(e) => e.target.value !== (o.tracking_number || "") && patch(o.id, { tracking_number: e.target.value })} aria-label="Nomor resi" />
              <a className="btn btn-ghost !py-2" target="_blank" rel="noreferrer"
                href={waLink(o.customer_wa, `Halo ${o.customer_name}, pesananmu ${o.order_code} di ${store} berstatus: ${STATUS_LABEL[o.order_status]}${o.tracking_number ? `. No. resi: ${o.tracking_number}` : ""}.`)}>Chat WA</a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
