import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";
import { getSettings } from "@/lib/settings";
import { waLink } from "@/lib/format";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <CartProvider>
      <Header name={s.store_name} />
      <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-6">{children}</main>
      <footer className="mt-10 bg-ink py-8 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4">
          <p className="font-bold">{s.store_name}</p>
          {s.wa_admin && (
            <a className="btn btn-sun !py-2" href={waLink(s.wa_admin, "Halo, saya mau tanya produk.")} target="_blank" rel="noreferrer">
              Tanya lewat WhatsApp
            </a>
          )}
        </div>
      </footer>
    </CartProvider>
  );
}
