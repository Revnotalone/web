"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { rp } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

const empty = { id: "", name: "", description: "", price: "", discount_price: "", stock: "0", category_id: "", images: [] as string[], sizes: "", colors: "", is_featured: false };

export default function ProductManager({ products, categories }: { products: Product[]; categories: Category[] }) {
  const router = useRouter();
  const [f, setF] = useState(empty);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function edit(p?: Product) {
    setErr(""); setOpen(true);
    setF(p ? { id: p.id, name: p.name, description: p.description || "", price: String(p.price), discount_price: p.discount_price?.toString() || "", stock: String(p.stock), category_id: p.category_id || "", images: p.images || [], sizes: (p.sizes || []).join(", "), colors: (p.colors || []).join(", "), is_featured: p.is_featured } : empty);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function upload(files: FileList | null) {
    if (!files) return;
    setBusy(true); setErr("");
    for (const file of Array.from(files)) {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(d.error || "Upload gagal"); break; }
      setF((x) => ({ ...x, images: [...x.images, d.url] }));
    }
    setBusy(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
    const body = { ...f, sizes: split(f.sizes), colors: split(f.colors) };
    const r = await fetch(f.id ? `/api/admin/products/${f.id}` : "/api/admin/products", { method: f.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (!r.ok) return setErr((await r.json().catch(() => ({}))).error || "Gagal menyimpan");
    setOpen(false); setF(empty); router.refresh();
  }

  async function del(p: Product) {
    if (!confirm(`Hapus "${p.name}"? Tidak bisa dibatalkan.`)) return;
    const r = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    if (r.ok) router.refresh(); else setErr("Gagal menghapus");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Produk ({products.length})</h1>
        <button className="btn btn-sun" onClick={() => edit()}>Tambah produk</button>
      </div>

      {open && (
        <form onSubmit={save} className="panel grid gap-4 sm:grid-cols-2">
          <h2 className="text-xl font-extrabold sm:col-span-2">{f.id ? "Edit produk" : "Produk baru"}</h2>
          <div className="sm:col-span-2"><label className="label" htmlFor="pn">Nama produk</label><input id="pn" required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div><label className="label" htmlFor="pc">Kategori</label>
            <select id="pc" className="input" value={f.category_id} onChange={(e) => setF({ ...f, category_id: e.target.value })}>
              <option value="">Tanpa kategori</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="label" htmlFor="ps">Stok</label><input id="ps" type="number" min={0} className="input" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} /></div>
          <div><label className="label" htmlFor="pp">Harga normal (Rp)</label><input id="pp" required type="number" min={0} className="input" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></div>
          <div><label className="label" htmlFor="pd">Harga diskon (Rp, opsional)</label><input id="pd" type="number" min={0} className="input" value={f.discount_price} onChange={(e) => setF({ ...f, discount_price: e.target.value })} /></div>
          <div><label className="label" htmlFor="pz">Ukuran (pisahkan koma)</label><input id="pz" className="input" placeholder="38, 39, 40, 41" value={f.sizes} onChange={(e) => setF({ ...f, sizes: e.target.value })} /></div>
          <div><label className="label" htmlFor="pw">Warna (pisahkan koma)</label><input id="pw" className="input" placeholder="Hitam, Putih" value={f.colors} onChange={(e) => setF({ ...f, colors: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="pk">Deskripsi</label><textarea id="pk" rows={3} className="input" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="pf">Foto (foto pertama jadi sampul)</label>
            <input id="pf" type="file" multiple accept="image/jpeg,image/png,image/webp" className="input" disabled={busy} onChange={(e) => upload(e.target.files)} />
            <div className="mt-2 flex flex-wrap gap-2">
              {f.images.map((u) => (
                <div key={u} className="relative h-20 w-20 overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="" className="h-full w-full object-cover" />
                  <button type="button" aria-label="Hapus foto" className="absolute right-1 top-1 rounded-full bg-ink px-2 text-white" onClick={() => setF({ ...f, images: f.images.filter((x) => x !== u) })}>×</button>
                </div>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 font-semibold sm:col-span-2"><input type="checkbox" checked={f.is_featured} onChange={(e) => setF({ ...f, is_featured: e.target.checked })} /> Produk unggulan</label>
          {err && <p role="alert" className="font-semibold text-bad sm:col-span-2">{err}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <button className="btn btn-primary" disabled={busy}>{busy ? "Menyimpan…" : "Simpan produk"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Batal</button>
          </div>
        </form>
      )}
      {!open && err && <p role="alert" className="font-semibold text-bad">{err}</p>}

      {products.length === 0 ? <div className="panel text-ink/60">Belum ada produk. Klik “Tambah produk” untuk mulai.</div> : (
        <div className="panel divide-y divide-mist !p-0">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-mist">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{p.name}</p>
                <p className="text-sm text-ink/60">{rp(p.discount_price ?? p.price)} • stok {p.stock}</p></div>
              <button className="btn btn-ghost !py-2" onClick={() => edit(p)}>Edit</button>
              <button className="btn btn-ghost !py-2 text-bad" onClick={() => del(p)}>Hapus</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
