"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate, categoryColor } from "@/lib/utils";
import FloatingActionMenu from "@/components/ui/floating-action-menu";
import { QrCode, Store, Receipt } from "lucide-react";

type Receipt = {
  id: string;
  token: string;
  total: number;
  subtotal: number;
  tax: number;
  category: string;
  status: string;
  createdAt: string;
  claimedAt: string | null;
  store: { id: string; name: string; address: string };
  items: { id: string; name: string; quantity: number; price: number; total: number }[];
};

type User = { id: string; name: string; email: string };

export default function DashboardPage() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isMerchant, setIsMerchant] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Alle");
  const [seeded, setSeeded] = useState(false);

  const fabOptions = [
    {
      label: "QR-Code scannen",
      Icon: <QrCode className="w-4 h-4" />,
      onClick: () => router.push("/scan"),
    },
    ...(isMerchant ? [{
      label: "Händler-Terminal",
      Icon: <Store className="w-4 h-4" />,
      onClick: () => router.push("/pos"),
    }] : []),
    {
      label: "Alle Kassenbons",
      Icon: <Receipt className="w-4 h-4" />,
      onClick: () => document.getElementById("receipts-section")?.scrollIntoView({ behavior: "smooth" }),
    },
  ];

  useEffect(() => {
    async function init() {
      try {
        if (!localStorage.getItem("matti_seeded")) {
          await fetch("/api/seed", { method: "POST" });
          localStorage.setItem("matti_seeded", "1");
        }
        setSeeded(true);
        const [usersRes, sessionRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/auth/session"),
        ]);
        if (!usersRes.ok) throw new Error("Failed to load users");
        const users = await usersRes.json();
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          setIsMerchant(session?.user?.role === "merchant");
        }
        if (users.length > 0) {
          setUser(users[0]);
          const receiptsRes = await fetch(`/api/receipts?consumerId=${users[0].id}`);
          if (!receiptsRes.ok) throw new Error("Failed to load receipts");
          const data = await receiptsRes.json();
          setReceipts(data);
        }
      } catch (err) {
        console.error("Dashboard init error:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const categories = ["Alle", ...Array.from(new Set(receipts.map((r) => r.category)))];

  const filtered = receipts.filter((r) => {
    const matchSearch =
      filter === "" ||
      r.store.name.toLowerCase().includes(filter.toLowerCase()) ||
      r.items.some((i) => i.name.toLowerCase().includes(filter.toLowerCase()));
    const matchCat = categoryFilter === "Alle" || r.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalSpent = receipts.reduce((s, r) => s + r.total, 0);
  const thisMonth = receipts.filter((r) => {
    const d = new Date(r.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonth.reduce((s, r) => s + r.total, 0);

  const byCategory = receipts.reduce(
    (acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.total;
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-[53px] bg-white border-b border-gray-200" />
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="h-7 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-4 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 w-full bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-1.5 w-full bg-gray-200 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">T</span>
            </div>
            <span className="font-bold text-lg">Tappr</span>
          </Link>
          <div className="flex items-center gap-3">
            {isMerchant && (
              <Link
                href="/pos"
                className="text-sm text-gray-600 hover:text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg"
              >
                Händler-Terminal
              </Link>
            )}
            {user && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-semibold text-xs">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <span className="hidden sm:inline">{user.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Gesamt ausgegeben</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Diesen Monat</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(thisMonthTotal)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Kassenbons</p>
            <p className="text-2xl font-bold text-gray-900">{receipts.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Läden</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(receipts.map((r) => r.store.id)).size}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Receipts list */}
          <div id="receipts-section" className="md:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-3">Kassenbons</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Laden oder Produkt suchen…"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-4xl mb-2">🧾</p>
                  <p>Keine Kassenbons gefunden</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filtered.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/receipt/${r.id}`}
                        className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryColor(r.category).bg}`}
                        >
                          <span className="text-xl">{categoryColor(r.category).icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{r.store.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(r.createdAt)} · {r.items.length} Artikel
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-gray-900">{formatCurrency(r.total)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor(r.category).badge}`}>
                            {r.category}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Category breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Nach Kategorie</h3>
              <div className="space-y-2">
                {Object.entries(byCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, amount]) => {
                    const pct = Math.round((amount / totalSpent) * 100);
                    const { bg, icon } = categoryColor(cat);
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="flex items-center gap-1.5">
                            <span>{icon}</span>
                            <span className="text-gray-700">{cat}</span>
                          </span>
                          <span className="font-medium">{formatCurrency(amount)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${categoryColor(cat).bar}`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Quick scan CTA */}
            <div className="bg-blue-600 rounded-xl p-4 text-white">
              <p className="text-2xl mb-2">📲</p>
              <h3 className="font-semibold mb-1">Bon einlösen</h3>
              <p className="text-blue-100 text-sm mb-3">
                Hast du einen QR-Code? Scanne ihn, um den Bon zu deinem Konto hinzuzufügen.
              </p>
              <Link
                href="/scan"
                className="bg-white text-blue-600 text-sm font-semibold px-4 py-2 rounded-lg inline-block hover:bg-blue-50 transition-colors"
              >
                QR-Code scannen
              </Link>
            </div>
          </div>
        </div>
      </div>

      <FloatingActionMenu options={fabOptions} />
    </div>
  );
}
