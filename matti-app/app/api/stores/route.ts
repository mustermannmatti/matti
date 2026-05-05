import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const stores = await db.store.findMany({ include: { user: true } });
  return NextResponse.json(stores);
}
