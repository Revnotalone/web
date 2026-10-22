import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import OrdersManager from "@/components/OrdersManager";

export default async function OrdersPage() {
  const [{ data }, s] = await Promise.all([db.from("orders").select("*").order("created_at", { ascending: false }).limit(200), getSettings()]);
  return (<><h1 className="mb-4 text-2xl font-extrabold">Pesanan</h1><OrdersManager orders={data || []} store={s.store_name} /></>);
}
