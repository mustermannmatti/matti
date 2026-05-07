import Stripe from "stripe";
import { db } from "@/lib/db";

export async function getStripeClient(): Promise<Stripe | null> {
  const setting = await db.settings.findUnique({ where: { key: "stripe_secret_key" } });
  if (!setting?.value) return null;
  return new Stripe(setting.value);
}

export async function getStripeSetting(key: string): Promise<string | null> {
  const setting = await db.settings.findUnique({ where: { key } });
  return setting?.value ?? null;
}

export const PLANS: Record<string, { name: string; monthlyPrice: number; yearlyPrice: number }> = {
  pro: { name: "Pro", monthlyPrice: 499, yearlyPrice: 4900 },
  merchant: { name: "Händler", monthlyPrice: 2499, yearlyPrice: 24900 },
};
