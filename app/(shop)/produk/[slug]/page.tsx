import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductClient from "@/components/ProductClient";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await db.from("products").select("name,description").eq("slug", params.slug).single();
  return { title: data?.name || "Produk", description: data?.description?.slice(0, 150) };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { data } = await db.from("products").select("*, categories(name,slug)").eq("slug", params.slug).single();
  if (!data) notFound();
  return <ProductClient p={data as Product} />;
}
