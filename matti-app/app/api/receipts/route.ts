import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const consumerId = searchParams.get("consumerId");

  if (!consumerId) {
    return NextResponse.json({ error: "consumerId required" }, { status: 400 });
  }

  const receipts = await db.receipt.findMany({
    where: { consumerId },
    include: { store: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(receipts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { storeId, items, category } = body;

  const subtotal = items.reduce(
    (sum: number, item: { total: number }) => sum + item.total,
    0
  );
  const tax = Math.round(subtotal * 0.19 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const receipt = await db.receipt.create({
    data: {
      storeId,
      total,
      subtotal,
      tax,
      category: category || "Sonstiges",
      status: "pending",
      items: { create: items },
    },
    include: { store: true, items: true },
  });

  return NextResponse.json(receipt);
}
