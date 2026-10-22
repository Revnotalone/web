import Link from "next/link";
import { db } from "@/lib/db";
import { rp } from "@/lib/format";

const day = (d: Date | string) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

export default async function Dashboard() {
  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const [{ data: orders }, { data: low }] = await Promise.all([
    db.from("orders").select("total_amount,payment_status,order_status,created_at").gte("created_at", since),
    db.from("products").select("id,name,stock").lte("stock", 5).order("stock").limit(10),
  ]);
  const list = orders || [];
  const counted = (o: any) => o.order_status !== "BATAL" && (o.payment_status === "PAID" || o.order_status === "SELESAI");
  const today = day(new Date());
  const todayOrders = list.filter((o: any) => day(o.created_at) === today);
  const pending = list.filter((o: any) => o.order_status === "PENDING").length;

  const days = Array.from({ length: 7 }, (_, i) => day(new Date(Date.now() - (6 - i) * 86400000)));
  const sums = days.map((d) => list.filter((o: any) => counted(o) && day(o.created_at) === d).reduce((a: number, o: any) => a + o.total_amount, 0));
  const max = Math.max(...sums, 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel"><p className="text-ink/60">Omset hari ini</p><p className="text-2xl font-extrabold">{rp(sums[6])}</p></div>
        <div className="panel"><p className="text-ink/60">Pesanan hari ini</p><p className="text-2xl font-extrabold">{todayOrders.length}</p></div>
        <Link href="/admin/pesanan" className="panel"><p className="text-ink/60">Perlu diproses</p><p className="text-2xl font-extrabold">{pending}</p></Link>
      </div>

      <section className="panel">
        <h2 className="mb-1 font-extrabold">Omset 7 hari terakhir</h2>
        <p className="mb-4 text-sm text-ink/60">Hanya pesanan yang sudah lunas atau selesai. Total: {rp(sums.reduce((a, b) => a + b, 0))}</p>
        <div className="flex h-40 items-end gap-2">
          {sums.map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
              <div className="w-full rounded-t-lg bg-sun" style={{ height: `${(v / max) * 100}%`, minHeight: v ? 4 : 1 }} title={rp(v)} />
              <span className="text-xs">{days[i].slice(5)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="mb-2 font-extrabold">Stok menipis</h2>
        {!low?.length ? <p className="text-ink/60">Semua stok aman.</p> : (
          <ul className="divide-y divide-mist">
            {low.map((p: any) => <li key={p.id} className="flex justify-between py-2"><span>{p.name}</span><b className={p.stock === 0 ? "text-bad" : ""}>{p.stock === 0 ? "Habis" : `Sisa ${p.stock}`}</b></li>)}
          </ul>
        )}
        <Link href="/admin/produk" className="mt-3 inline-block font-semibold underline">Atur produk</Link>
      </section>
    </div>
  );
}
