import { db } from "@/lib/db";
import ProductManager from "@/components/ProductManager";
import type { Category, Product } from "@/lib/types";

export default async function ProductsPage() {
  const [{ data: p }, { data: c }] = await Promise.all([
    db.from("products").select("*").order("created_at", { ascending: false }),
    db.from("categories").select("*").order("name"),
  ]);
  return <ProductManager products={(p || []) as Product[]} categories={(c || []) as Category[]} />;
}
