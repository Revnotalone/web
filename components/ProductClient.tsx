"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { rp } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductClient({ p }: { p: Product }) {
  const { add } = useCart();
  const imgs = p.images || [];
  const [cur, setCur] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");
  const [added, setAdded] = useState(false);
  const price = p.discount_price ?? p.price;

  function submit() {
    if (p.sizes?.length && !size) return setMsg("Pilih ukuran dulu");
    if (p.colors?.length && !color) return setMsg("Pilih warna dulu");
    setMsg("");
    add({ id: p.id, slug: p.slug, name: p.name, price, image: imgs[0] || null, size, color, qty, max: p.stock });
    setAdded(true);
  }
  const Chip = ({ v, on, set }: { v: string; on: boolean; set: () => void }) => (
    <button type="button" onClick={set} aria-pressed={on}
      className={`rounded-xl border px-4 py-2 font-semibold ${on ? "border-ink bg-ink text-white" : "border-mist bg-white"}`}>{v}</button>
  );

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <div className="aspect-square overflow-hidden rounded-3xl bg-mist">
          {imgs[cur] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgs[cur]} alt={p.name} className="h-full w-full object-cover" />
          ) : <div className="flex h-full items-center justify-center text-7xl font-extrabold text-ink/20">{p.name[0]}</div>}
        </div>
        {imgs.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {imgs.map((u, i) => (
              <button key={u} onClick={() => setCur(i)} aria-label={`Foto ${i + 1}`}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${i === cur ? "border-ink" : "border-transparent"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        {p.categories && <p className="text-sm text-ink/60">{p.categories.name}</p>}
        <h1 className="text-3xl font-extrabold leading-tight">{p.name}</h1>
        <p className="mt-2 text-2xl font-bold">
          {rp(price)} {p.discount_price != null && <span className="ml-2 text-base font-normal text-ink/50 line-through">{rp(p.price)}</span>}
        </p>
        <p className="mt-1 text-sm">{p.stock > 0 ? (p.stock <= 5 ? `Sisa ${p.stock}, buruan` : `Stok tersedia (${p.stock})`) : "Stok habis"}</p>

        {!!p.sizes?.length && (
          <div className="mt-5"><p className="label">Ukuran</p>
            <div className="flex flex-wrap gap-2">{p.sizes.map((s) => <Chip key={s} v={s} on={size === s} set={() => setSize(s)} />)}</div></div>
        )}
        {!!p.colors?.length && (
          <div className="mt-4"><p className="label">Warna</p>
            <div className="flex flex-wrap gap-2">{p.colors.map((c) => <Chip key={c} v={c} on={color === c} set={() => setColor(c)} />)}</div></div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-mist bg-white">
            <button className="px-4 py-3 text-lg" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Kurangi">−</button>
            <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
            <button className="px-4 py-3 text-lg" onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="Tambah">+</button>
          </div>
          <button className="btn btn-primary flex-1" disabled={p.stock <= 0} onClick={submit}>Masukkan keranjang</button>
        </div>
        {msg && <p role="alert" className="mt-2 font-semibold text-bad">{msg}</p>}
        {added && (
          <p className="mt-3 rounded-xl bg-sun/40 p-3 font-semibold">
            Sudah masuk keranjang. <Link href="/checkout" className="underline">Lanjut bayar</Link>
          </p>
        )}
        {p.description && <p className="mt-6 whitespace-pre-line leading-relaxed text-ink/80">{p.description}</p>}
      </div>
    </div>
  );
}
