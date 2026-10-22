"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { rp, waLink } from "@/lib/format";

type Props = {
  code: string; method: string; total: number; paid: boolean; cancelled: boolean;
  qris: string | null; expiresAt: string | null; proof: string | null; bankInfo: string; wa: string;
};

export default function PaymentPanel(p: Props) {
  const router = useRouter();
  const [qr, setQr] = useState("");
  const [left, setLeft] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { if (p.qris) QRCode.toDataURL(p.qris, { width: 360, margin: 2 }).then(setQr); }, [p.qris]);
  useEffect(() => {
    if (!p.expiresAt || p.method !== "QRIS") return;
    const tick = () => setLeft(Math.max(0, Math.floor((new Date(p.expiresAt!).getTime() - Date.now()) / 1000)));
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, [p.expiresAt, p.method]);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true); setMsg("");
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch(`/api/orders/${p.code}/proof`, { method: "POST", body: fd });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setMsg(d.error || "Upload gagal");
    router.refresh();
  }

  if (p.cancelled) return <div className="panel">Pesanan ini dibatalkan.</div>;
  if (p.paid) return <div className="panel bg-ok/10 font-semibold text-ok">Pembayaran sudah kami terima. Terima kasih!</div>;
  if (p.method === "COD") return <div className="panel">Siapkan uang pas <b>{rp(p.total)}</b> saat kurir tiba. Pesananmu akan kami proses.</div>;

  const expired = left === 0 && !p.proof;
  const mm = left != null ? `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}` : "";

  return (
    <div className="panel space-y-4">
      {p.method === "QRIS" && (
        <>
          <h2 className="text-xl font-extrabold">Scan QRIS</h2>
          {expired ? (
            <p className="font-semibold text-bad">Waktu bayar habis. Hubungi admin lewat WhatsApp bila kamu sudah terlanjur transfer.</p>
          ) : (
            <>
              <p>Bayar tepat <b>{rp(p.total)}</b>. Nominal sudah terisi di QR. Sisa waktu <b aria-live="off">{mm}</b></p>
              {qr && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qr} alt={`QRIS pembayaran ${rp(p.total)}`} className="mx-auto w-full max-w-xs rounded-xl border border-mist" />
              )}
              {qr && <a href={qr} download={`QRIS-${p.code}.png`} className="btn btn-ghost w-full">Simpan gambar QR</a>}
            </>
          )}
        </>
      )}
      {p.method === "TRANSFER" && (
        <>
          <h2 className="text-xl font-extrabold">Transfer ke rekening</h2>
          <p className="whitespace-pre-line rounded-xl bg-paper p-3 font-semibold">{p.bankInfo || "Rekening belum diisi. Hubungi admin."}</p>
          <p>Jumlah transfer: <b>{rp(p.total)}</b></p>
        </>
      )}
      {!expired && (
        <div>
          <p className="label">Sudah bayar? Upload bukti</p>
          {p.proof && <p className="mb-2 font-semibold text-ok">Bukti terkirim. Admin akan memeriksa pembayaranmu.</p>}
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} className="input" />
          {busy && <p className="mt-1 text-sm">Mengunggah…</p>}
          {msg && <p role="alert" className="mt-1 font-semibold text-bad">{msg}</p>}
        </div>
      )}
      {p.wa && (
        <a className="btn btn-sun w-full" target="_blank" rel="noreferrer"
          href={waLink(p.wa, `Halo, saya sudah bayar pesanan ${p.code} sebesar ${rp(p.total)}.`)}>Konfirmasi lewat WhatsApp</a>
      )}
    </div>
  );
}
