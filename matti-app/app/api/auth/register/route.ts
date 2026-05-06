import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { name, email, password, storeName, storeAddress } = await request.json();

  if (!name || !email || !password || !storeName) {
    return NextResponse.json({ error: "Alle Felder sind erforderlich" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "E-Mail bereits registriert" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: "merchant",
      store: {
        create: {
          name: storeName,
          address: storeAddress || "",
        },
      },
    },
  });

  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}
