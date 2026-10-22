import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { rp, tgl, STATUS_LABEL, BAYAR_LABEL } from "@/lib/format";
import PaymentPanel from "@/components/PaymentPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Status pesanan" };

const STEPS = ["PENDING", "DIPROSES", "DIKIRIM", "SELESAI"];

export default async function OrderPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code).toUpperCase();
  const { data: o } = await db.from("orders").select("*").eq("order_code", code).single();
  if (!o) notFound();
  const s = await getSettings();
  const step = STEPS.indexOf(o.order_status);

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <section className="panel">
          <p className="text-sm text-ink/60">Kode pesanan (simpan ya)</p>
          <h1 className="text-3xl font-extrabold">{o.order_code}</h1>
          <p className="text-sm text-ink/60">{tgl(o.created_at)}</p>
          {o.order_status === "BATAL" ? (
            <p className="mt-3 font-semibold text-bad">Dibatalkan</p>
          ) : (
            <ol className="mt-4 flex gap-1">
              {STEPS.map((st, i) => (
                <li key={st} className={`flex-1 rounded-lg px-2 py-2 text-center text-sm font-semibold ${i <= step ? "bg-ink text-white" : "bg-mist text-ink/60"}`}>
                  {STATUS_LABEL[st]}
                </li>
              ))}
            </ol>
          )}
          <p className="mt-3 text-sm">Pembayaran: <b>{BAYAR_LABEL[o.payment_status]}</b></p>
          {o.tracking_number && <p className="mt-1">No. resi: <b>{o.tracking_number}</b></p>}
        </section>

        <section className="panel">
          <h2 className="mb-2 font-extrabold">Isi pesanan</h2>
          <ul className="divide-y divide-mist">
            {o.items.map((l: any, i: number) => (
              <li key={i} className="flex justify-between gap-3 py-2">
                <span>{l.name} <span className="text-sm text-ink/60">({[l.size, l.color].filter(Boolean).join(", ")}) × {l.qty}</span></span>
                <b>{rp(l.price * l.qty)}</b>
              </li>
            ))}
          </ul>
          <div className="mt-2 space-y-1 border-t border-mist pt-2 text-sm">
            <div className="flex justify-between"><span>Ongkir</span><span>{o.shipping_cost ? rp(o.shipping_cost) : "Gratis"}</span></div>
            {o.cod_fee > 0 && <div className="flex justify-between"><span>Biaya COD</span><span>{rp(o.cod_fee)}</span></div>}
            <div className="flex justify-between text-lg font-extrabold"><span>Total</span><span>{rp(o.total_amount)}</span></div>
          </div>
        </section>
      </div>

      <PaymentPanel
        code={o.order_code} method={o.payment_method} total={o.total_amount}
        paid={o.payment_status === "PAID"} cancelled={o.order_status === "BATAL"}
        qris={o.qris_string} expiresAt={o.expires_at} proof={o.proof_image}
        bankInfo={s.bank_info} wa={s.wa_admin}
      />
    </div>
  );
}
