import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// Returns the store for the authenticated user, or null if not a merchant.
async function getAuthenticatedStore(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, include: { store: true } });
  if (!user || user.role !== "merchant" || !user.store) return null;
  return user.store;
}

const KEY_SELECT = {
  id: true, name: true, key: true, active: true, createdAt: true, lastUsedAt: true,
} as const;

// GET /api/v1/keys
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await getAuthenticatedStore(session.user.id);
  if (!store) return NextResponse.json({ error: "No merchant store found" }, { status: 403 });

  const keys = await db.apiKey.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
    select: KEY_SELECT,
  });

  return NextResponse.json(keys);
}

// POST /api/v1/keys
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await getAuthenticatedStore(session.user.id);
  if (!store) return NextResponse.json({ error: "No merchant store found" }, { status: 403 });

  const body = await request.json().catch(() => ({})) as { name?: string };
  const name = body.name?.trim() || "API-Schlüssel";

  const apiKey = await db.apiKey.create({
    data: { storeId: store.id, name },
    select: KEY_SELECT,
  });

  return NextResponse.json(apiKey, { status: 201 });
}

// PATCH /api/v1/keys — toggle active state
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await getAuthenticatedStore(session.user.id);
  if (!store) return NextResponse.json({ error: "No merchant store found" }, { status: 403 });

  const body = await request.json().catch(() => ({})) as { id?: string; active?: boolean };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const key = await db.apiKey.findFirst({ where: { id: body.id, storeId: store.id } });
  if (!key) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.apiKey.update({
    where: { id: body.id },
    data: { active: body.active ?? !key.active },
    select: KEY_SELECT,
  });

  return NextResponse.json(updated);
}

// DELETE /api/v1/keys?id=<keyId>
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await getAuthenticatedStore(session.user.id);
  if (!store) return NextResponse.json({ error: "No merchant store found" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const key = await db.apiKey.findFirst({ where: { id, storeId: store.id } });
  if (!key) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.apiKey.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
