import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function checkAuth(request: Request) {
  const key = request.headers.get("x-admin-key");
  return key === process.env.ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const receipts = await db.receipt.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      store: {
        include: { user: { select: { name: true, email: true } } },
      },
      consumer: { select: { name: true, email: true } },
      items: true,
    },
  });

  return NextResponse.json(receipts);
}
