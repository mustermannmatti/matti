import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  const stores = await db.store.findMany({
    where: userId ? { userId } : undefined,
    include: { user: true },
  });

  return NextResponse.json(stores);
}
