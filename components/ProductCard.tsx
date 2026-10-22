import Link from "next/link";
import { rp } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductCard({ p }: { p: Product }) {
  const img = p.images?.[0];
  const sale = p.discount_price != null;
  return (
    <Link href={`/produk/${p.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-mist">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={p.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl font-extrabold text-ink/20">{p.name[0]}</div>
        )}
        {p.stock <= 0 && <span className="absolute left-2 top-2 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">Habis</span>}
        {sale && p.stock > 0 && <span className="absolute left-2 top-2 rounded-full bg-sun px-3 py-1 text-xs font-bold">Diskon</span>}
      </div>
      <h3 className="mt-2 line-clamp-2 font-semibold leading-snug">{p.name}</h3>
      <p className="mt-0.5">
        <span className="font-bold">{rp(p.discount_price ?? p.price)}</span>
        {sale && <span className="ml-2 text-sm text-ink/50 line-through">{rp(p.price)}</span>}
      </p>
    </Link>
  );
}
