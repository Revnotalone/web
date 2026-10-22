import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cleanProduct, slugify } from "@/lib/product-body";

export async function POST(req: Request) {
  try {
    const body = cleanProduct(await req.json());
    const slug = slugify(body.name) + "-" + Math.random().toString(36).slice(2, 6);
    const { error } = await db.from("products").insert({ ...body, slug });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
