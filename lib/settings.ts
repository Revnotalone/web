import { db } from "./db";
import { isValidQris } from "./qris";

export const DEFAULTS: Record<string, string> = {
  store_name: "TOKO AIPI", wa_admin: "", bank_info: "",
  qris_static: "", cod_enabled: "true", transfer_enabled: "true", qris_enabled: "true",
  cod_fee: "0", shipping_cost: "15000", free_shipping_min: "0",
};

export type Settings = {
  store_name: string; wa_admin: string; bank_info: string; qris_static: string;
  cod_enabled: boolean; transfer_enabled: boolean; qris_enabled: boolean;
  cod_fee: number; shipping_cost: number; free_shipping_min: number;
};

export async function getSettings(): Promise<Settings> {
  const { data } = await db.from("settings").select("key,value");
  const m: Record<string, string> = { ...DEFAULTS };
  (data || []).forEach((r: any) => (m[r.key] = r.value));
  return {
    store_name: m.store_name, wa_admin: m.wa_admin, bank_info: m.bank_info, qris_static: m.qris_static,
    cod_enabled: m.cod_enabled === "true", transfer_enabled: m.transfer_enabled === "true",
    qris_enabled: m.qris_enabled === "true",
    cod_fee: Number(m.cod_fee) || 0, shipping_cost: Number(m.shipping_cost) || 0,
    free_shipping_min: Number(m.free_shipping_min) || 0,
  };
}

// Versi aman untuk dikirim ke browser (tanpa QRIS statis)
export function publicSettings(s: Settings) {
  const { qris_static, ...rest } = s;
  return { ...rest, qris_enabled: s.qris_enabled && isValidQris(qris_static) };
}
