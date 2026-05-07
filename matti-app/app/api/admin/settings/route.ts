import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const ALLOWED_KEYS = [
  "stripe_publishable_key",
  "stripe_secret_key",
  "stripe_webhook_secret",
];

function checkAuth(request: Request) {
  const key = request.headers.get("x-admin-key");
  return key === process.env.ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!checkAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await db.settings.findMany({
    where: { key: { in: ALLOWED_KEYS } },
  });

  // Mask secret key — only show last 4 chars
  const masked = settings.map((s) => ({
    key: s.key,
    value: s.key.includes("secret") ? maskSecret(s.value) : s.value,
    set: !!s.value,
  }));

  return NextResponse.json(masked);
}

export async function POST(request: Request) {
  if (!checkAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as Record<string, string>;

  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_KEYS.includes(key)) continue;
    if (!value?.trim()) continue;
    await db.settings.upsert({
      where: { key },
      update: { value: value.trim() },
      create: { key, value: value.trim() },
    });
  }

  return NextResponse.json({ ok: true });
}

function maskSecret(value: string) {
  if (!value || value.length < 8) return "••••••••";
  return "••••••••" + value.slice(-4);
}
