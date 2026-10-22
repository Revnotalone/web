const list = (v: any): string[] => (Array.isArray(v) ? v : []).map((x) => String(x).trim()).filter(Boolean);

export function cleanProduct(b: any) {
  const price = Math.floor(Number(b.price));
  const disc = b.discount_price === "" || b.discount_price == null ? null : Math.floor(Number(b.discount_price));
  if (!String(b.name || "").trim()) throw new Error("Nama produk wajib diisi");
  if (!(price >= 0)) throw new Error("Harga tidak valid");
  if (disc !== null && !(disc >= 0 && disc < price)) throw new Error("Harga diskon harus lebih kecil dari harga normal");
  return {
    name: String(b.name).trim(), description: String(b.description || "").trim() || null,
    price, discount_price: disc, stock: Math.max(0, Math.floor(Number(b.stock)) || 0),
    category_id: b.category_id || null, images: list(b.images), sizes: list(b.sizes), colors: list(b.colors),
    is_featured: !!b.is_featured,
  };
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "produk";
