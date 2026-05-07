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
  });
}
