import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStripeClient, getStripeSetting, PLANS } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = await getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Zahlungen sind noch nicht eingerichtet." }, { status: 503 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const body = await request.json() as { plan: string; interval: "month" | "year" };
  const { plan, interval = "month" } = body;

  if (!PLANS[plan]) {
    return NextResponse.json({ error: "Unbekannter Plan" }, { status: 400 });
  }

  const planConfig = PLANS[plan];
  const price = interval === "year" ? planConfig.yearlyPrice : planConfig.monthlyPrice;

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });

  const origin = new URL(request.url).origin;
  const publishableKey = await getStripeSetting("stripe_publishable_key");

  // Find or create Stripe customer
  let customerId = user.stripeCustomerId ?? undefined;
  if (customerId) {
    try {
      await stripe.customers.retrieve(customerId);
    } catch {
      customerId = undefined;
      await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: null } });
    }
  }
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Tappr ${planConfig.name}`,
            description: `${planConfig.name}-Plan ${interval === "year" ? "jährlich" : "monatlich"}`,
          },
          unit_amount: price,
          recurring: { interval },
        },
        quantity: 1,
      },
    ],
    metadata: { userId: user.id, plan, interval },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing`,
    locale: "de",
  });

  return NextResponse.json({ url: checkoutSession.url, publishableKey });
}
