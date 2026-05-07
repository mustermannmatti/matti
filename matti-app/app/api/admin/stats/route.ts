import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function checkAuth(request: Request) {
  const key = request.headers.get("x-admin-key");
  return key === process.env.ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [users, stores, receipts] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        store: {
          include: {
            _count: { select: { receipts: true } },
          },
        },
        _count: { select: { receipts: true } },
      },
    }),
    db.store.count(),
    db.receipt.aggregate({
      _sum: { total: true },
      _count: { _all: true },
    }),
  ]);

  const totalRevenue = receipts._sum.total ?? 0;
  const totalReceipts = receipts._count._all;

  const merchants = users.filter((u) => u.role === "merchant");
  const consumers = users.filter((u) => u.role === "consumer");

  const recentSignups = users.slice(0, 20).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    storeName: u.store?.name ?? null,
    storeAddress: u.store?.address ?? null,
    receiptCount: u.store?._count.receipts ?? u._count.receipts,
  }));

  // Revenue per merchant (via their store's receipts)
  const merchantStats = await Promise.all(
    merchants.map(async (m) => {
      if (!m.store) return null;
      const agg = await db.receipt.aggregate({
        where: { storeId: m.store.id },
        _sum: { total: true },
        _count: { _all: true },
      });
      return {
        id: m.id,
        name: m.name,
        email: m.email,
        createdAt: m.createdAt,
        storeName: m.store.name,
        storeAddress: m.store.address,
        receiptCount: agg._count._all,
        totalVolume: agg._sum.total ?? 0,
      };
    })
  );

  return NextResponse.json({
    overview: {
      totalUsers: users.length,
      totalMerchants: merchants.length,
      totalConsumers: consumers.length,
      totalStores: stores,
      totalReceipts,
      totalVolume: totalRevenue,
    },
    recentSignups,
    merchantStats: merchantStats.filter(Boolean),
  });
}
