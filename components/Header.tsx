"use client";
import Link from "next/link";
import { useCart } from "./CartProvider";

export default function Header({ name }: { name: string }) {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-30 border-b border-mist bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-extrabold tracking-tight">{name}</Link>
        <form action="/" className="ml-auto hidden flex-1 max-w-sm sm:block">
          <input name="q" placeholder="Cari sepatu, tas, sabuk" className="input !py-2" aria-label="Cari produk" />
        </form>
        <Link href="/lacak" className="ml-auto text-sm font-semibold sm:ml-0">Lacak pesanan</Link>
        <Link href="/checkout" className="btn btn-sun !px-4 !py-2" aria-label={`Keranjang, ${count} barang`}>
          Keranjang{count > 0 && <span className="rounded-full bg-ink px-2 text-sm text-white">{count}</span>}
        </Link>
      </div>
    </header>
  );
}
