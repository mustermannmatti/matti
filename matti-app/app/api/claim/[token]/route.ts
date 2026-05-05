import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();
  const { consumerId } = body;

  const receipt = await db.receipt.findUnique({ where: { token } });

  if (!receipt) {
    return NextResponse.json({ error: "Bon nicht gefunden" }, { status: 404 });
  }

  if (receipt.status === "claimed") {
    return NextResponse.json(
      { error: "Bon wurde bereits abgeholt" },
      { status: 409 }
    );
  }

  const updated = await db.receipt.update({
    where: { token },
    data: {
      consumerId,
      status: "claimed",
      claimedAt: new Date(),
    },
    include: { store: true, items: true },
  });

  return NextResponse.json(updated);
}
