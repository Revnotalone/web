import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cleanProduct } from "@/lib/product-body";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { error } = await db.from("products").update(cleanProduct(await req.json())).eq("id", params.id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error } = await db.from("products").delete().eq("id", params.id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}
