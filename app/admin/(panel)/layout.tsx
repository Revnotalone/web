import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

const nav = [["/admin", "Ringkasan"], ["/admin/pesanan", "Pesanan"], ["/admin/produk", "Produk"], ["/admin/pengaturan", "Pengaturan"]];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
          <b className="mr-2 text-lg">Admin</b>
          {nav.map(([h, l]) => <Link key={h} href={h} className="font-semibold hover:text-sun">{l}</Link>)}
          <span className="ml-auto flex items-center gap-4"><Link href="/" className="text-sm underline" target="_blank">Lihat toko</Link><LogoutButton /></span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
