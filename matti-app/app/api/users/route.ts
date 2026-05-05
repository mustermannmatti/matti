import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const consumers = await db.user.findMany({
    where: { role: "consumer" },
  });
  return NextResponse.json(consumers);
}
