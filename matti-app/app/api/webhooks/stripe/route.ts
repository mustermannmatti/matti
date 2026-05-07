import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStripeClient, getStripeSetting } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const stripe = await getStripeClient();
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  const webhookSecret = await getStripeSetting("stripe_webhook_secret");
  if (!webhookSecret) return NextResponse.json({ error: "Webhook secret missing" }, { status: 503 });

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;
    if (!userId || !plan) return NextResponse.json({ ok: true });

    await db.user.update({ where: { id: userId }, data: { plan } });
    await db.subscription.create({
      data: {
        userId,
        plan,
        stripeSessionId: session.id,
        stripeSubscriptionId: session.subscription as string | null ?? undefined,
        status: "active",
      },
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const existing = await db.subscription.findUnique({
      where: { stripeSubscriptionId: sub.id },
    });
    if (existing) {
      await db.subscription.update({
        where: { stripeSubscriptionId: sub.id },
        data: { status: "cancelled" },
      });
      await db.user.update({ where: { id: existing.userId }, data: { plan: "free" } });
    }
  }

  return NextResponse.json({ ok: true });
}
