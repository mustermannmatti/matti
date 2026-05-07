import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, role, storeName, storeAddress, taxId } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, E-Mail und Passwort sind erforderlich" }, { status: 400 });
  }

  if (role === "merchant" && !storeName) {
    return NextResponse.json({ error: "Ladenname ist erforderlich" }, { status: 400 });
  }

  if (role === "merchant" && !taxId) {
    return NextResponse.json({ error: "Steueridentifikationsnummer ist erforderlich" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "E-Mail bereits registriert" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  if (role === "merchant") {
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
            taxId: taxId,
          },
        },
      },
    });
    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } else {
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "consumer",
      },
    });
    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  }
}
