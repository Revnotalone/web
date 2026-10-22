import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import type { Category, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: { cat?: string; q?: string } }) {
  const { data: cats } = await db.from("categories").select("*").order("name");
  let query = db.from("products").select("*").order("created_at", { ascending: false });
  const active = (cats as Category[] | null)?.find((c) => c.slug === searchParams.cat);
  if (active) query = query.eq("category_id", active.id);
  if (searchParams.q) query = query.ilike("name", `%${searchParams.q.slice(0, 60)}%`);
  const { data } = await query;
  const products = (data || []) as Product[];
  const filtering = !!(active || searchParams.q);

  return (
    <>
      {!filtering && (
        <section className="mb-8 overflow-hidden rounded-3xl bg-sun p-6 sm:p-12">
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Dari sepatu sampai sabuk, lengkapi langkahmu hari ini.
          </h1>
          <p className="mt-4 max-w-md text-lg">Bayar di tempat, transfer, atau scan QRIS. Pilih yang paling nyaman buat kamu.</p>
          <a href="#produk" className="btn btn-primary mt-6">Lihat semua produk</a>
        </section>
      )}

      <nav className="mb-6 flex gap-2 overflow-x-auto pb-1" aria-label="Kategori">
        <Link href="/" className={`btn !py-2 whitespace-nowrap ${!active ? "btn-primary" : "btn-ghost"}`}>Semua</Link>
        {(cats as Category[] | null)?.map((c) => (
          <Link key={c.id} href={`/?cat=${c.slug}`} className={`btn !py-2 whitespace-nowrap ${active?.id === c.id ? "btn-primary" : "btn-ghost"}`}>
            {c.name}
          </Link>
        ))}
      </nav>

      <section id="produk">
        {searchParams.q && <p className="mb-4">Hasil untuk <b>{searchParams.q}</b>: {products.length} produk</p>}
        {products.length === 0 ? (
          <div className="panel text-center">
            <p className="font-semibold">Belum ada produk di sini.</p>
            <p className="text-ink/60">Coba kategori lain, atau tambahkan produk lewat /admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
    </>
  );
}
