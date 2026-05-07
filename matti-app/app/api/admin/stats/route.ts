import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/stripe";

function checkAuth(request: Request) {
  const key = request.headers.get("x-admin-key");
  return key === process.env.ADMIN_PASSWORD;
}

const PLAN_MONTHLY: Record<string, number> = {
  pro: PLANS.pro.monthlyPrice / 100,
  merchant: PLANS.merchant.monthlyPrice / 100,
};

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      store: true,
      subscriptions: {
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const merchants = users.filter((u) => u.role === "merchant");
  const consumers = users.filter((u) => u.role === "consumer");

  const payingUsers = users
    .filter((u) => u.subscriptions.length > 0)
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      plan: u.plan,
      createdAt: u.createdAt,
      subscriptionSince: u.subscriptions[0].createdAt,
      monthlyRevenue: PLAN_MONTHLY[u.plan] ?? 0,
    }));

  const monthlyRevenue = payingUsers.reduce((s, u) => s + u.monthlyRevenue, 0);

  const merchantStats = merchants.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    createdAt: m.createdAt,
    plan: m.plan,
    storeName: m.store?.name ?? null,
    storeAddress: m.store?.address ?? null,
    isPaying: m.subscriptions.length > 0,
    subscriptionSince: m.subscriptions[0]?.createdAt ?? null,
  }));

  const consumerList = consumers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    plan: u.plan,
    createdAt: u.createdAt,
    isPaying: u.subscriptions.length > 0,
  }));

  // Build monthly revenue chart: last 12 months, cumulative active subs per month
  const allSubs = await db.subscription.findMany({
    where: { status: "active" },
    include: { user: { select: { plan: true } } },
    orderBy: { createdAt: "asc" },
  });

  const now = new Date();
  const revenueChart = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const label = d.toLocaleDateString("de-DE", { month: "short", year: "2-digit" });
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const activeThen = allSubs.filter((s) => new Date(s.createdAt) <= endOfMonth);
    const revenue = activeThen.reduce((sum, s) => sum + (PLAN_MONTHLY[s.user.plan] ?? 0), 0);
    const count = activeThen.length;
    return { month: label, umsatz: revenue, abonnenten: count };
  });

  return NextResponse.json({
    overview: {
      totalUsers: users.length,
      totalMerchants: merchants.length,
      totalConsumers: consumers.length,
      payingCount: payingUsers.length,
      monthlyRevenue,
    },
    payingUsers,
    merchantStats,
    consumerList,
    revenueChart,
  });
}
