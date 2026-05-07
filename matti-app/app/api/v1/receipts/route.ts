import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import QRCode from "qrcode";

function getBaseUrl(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: Request) {
  // Authenticate via Bearer token
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
  }
  const rawKey = authHeader.slice(7);

  const apiKey = await db.apiKey.findUnique({
    where: { key: rawKey, active: true },
    include: { store: true },
  });

  if (!apiKey) {
    return NextResponse.json({ error: "Invalid or inactive API key" }, { status: 401 });
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { items, category, taxRate, transactionId } = body as {
    items: { name: string; quantity: number; price: number }[];
    category?: string;
    taxRate?: number;
    transactionId?: string;
  };

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items must be a non-empty array" }, { status: 400 });
  }

  for (const item of items) {
    if (typeof item.name !== "string" || typeof item.quantity !== "number" || typeof item.price !== "number") {
      return NextResponse.json(
        { error: "Each item must have: name (string), quantity (number), price (number)" },
        { status: 400 }
      );
    }
  }

  const rate = typeof taxRate === "number" ? taxRate : 0.19;
  const receiptItems = items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    total: Math.round(item.quantity * item.price * 100) / 100,
  }));

  const subtotal = Math.round(receiptItems.reduce((s, i) => s + i.total, 0) * 100) / 100;
  const tax = Math.round(subtotal * rate * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const receipt = await db.receipt.create({
    data: {
      storeId: apiKey.storeId,
      total,
      subtotal,
      tax,
      category: category ?? "Lebensmittel",
      status: "pending",
      items: { create: receiptItems },
    },
  });

  // Update lastUsedAt on the API key
  await db.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  const base = getBaseUrl(request);
  const claimUrl = `${base}/claim/${receipt.token}`;
  const qrDataUrl = await QRCode.toDataURL(claimUrl, { width: 300, margin: 2 });

  return NextResponse.json({
    receiptId: receipt.id,
    token: receipt.token,
    claimUrl,
    qrDataUrl,
    total,
    subtotal,
    tax,
    itemCount: items.length,
    store: {
      id: apiKey.store.id,
      name: apiKey.store.name,
    },
    ...(transactionId ? { transactionId } : {}),
  }, { status: 201 });
}
