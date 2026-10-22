export const rp = (n: number) => "Rp" + new Intl.NumberFormat("id-ID").format(n || 0);

export const waLink = (num: string, text: string) =>
  `https://wa.me/${num.replace(/\D/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(text)}`;

export const tgl = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" });

export const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu", DIPROSES: "Diproses", DIKIRIM: "Dikirim", SELESAI: "Selesai", BATAL: "Dibatalkan",
};
export const BAYAR_LABEL: Record<string, string> = { PENDING: "Belum dibayar", PAID: "Lunas", FAILED: "Gagal" };
