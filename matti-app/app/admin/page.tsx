"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Overview = {
  totalUsers: number;
  totalMerchants: number;
  totalConsumers: number;
  payingCount: number;
  monthlyRevenue: number;
};

type PayingUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
  subscriptionSince: string;
  monthlyRevenue: number;
};

type MerchantStat = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  plan: string;
  storeName: string | null;
  storeAddress: string | null;
  isPaying: boolean;
  subscriptionSince: string | null;
};

type ConsumerItem = {
  id: string;
  name: string;
  email: string;
  plan: string;
  createdAt: string;
  isPaying: boolean;
};

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, string> = {
    pro: "bg-blue-500/20 text-blue-400",
    merchant: "bg-purple-500/20 text-purple-400",
    free: "bg-gray-500/20 text-gray-400",
  };
  const label: Record<string, string> = { pro: "Pro", merchant: "Händler", free: "Kostenlos" };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${map[plan] ?? "bg-gray-500/20 text-gray-400"}`}>
      {label[plan] ?? plan}
    </span>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [payingUsers, setPayingUsers] = useState<PayingUser[]>([]);
  const [merchants, setMerchants] = useState<MerchantStat[]>([]);
  const [consumers, setConsumers] = useState<ConsumerItem[]>([]);
  const [revenueChart, setRevenueChart] = useState<{ month: string; umsatz: number; abonnenten: number }[]>([]);
  const [tab, setTab] = useState<"overview" | "paying" | "merchants" | "users" | "payments">("overview");

  type PaymentSetting = { key: string; value: string; set: boolean };
  const [paymentSettings, setPaymentSettings] = useState<PaymentSetting[]>([]);
  const [paymentForm, setPaymentForm] = useState({ stripe_publishable_key: "", stripe_secret_key: "", stripe_webhook_secret: "" });
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentSaved, setPaymentSaved] = useState(false);

  const loadData = useCallback(async (key: string) => {
    setLoading(true);
    const [statsRes, psRes] = await Promise.all([
      fetch("/api/admin/stats", { headers: { "x-admin-key": key } }),
      fetch("/api/admin/settings", { headers: { "x-admin-key": key } }),
    ]);
    if (statsRes.status === 401) {
      setAuthError(true);
      sessionStorage.removeItem("admin_key");
      setAuthed(false);
      setLoading(false);
      return;
    }
    const stats = await statsRes.json();
    setOverview(stats.overview);
    setPayingUsers(stats.payingUsers ?? []);
    setMerchants(stats.merchantStats ?? []);
    setConsumers(stats.consumerList ?? []);
    setRevenueChart(stats.revenueChart ?? []);
    if (psRes.ok) setPaymentSettings(await psRes.json());
    setAuthed(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    const storedKey = sessionStorage.getItem("admin_key");
    if (storedKey) loadData(storedKey);
  }, [loadData]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(false);
    sessionStorage.setItem("admin_key", password);
    await loadData(password);
  }

  async function savePaymentSettings() {
    const key = sessionStorage.getItem("admin_key") ?? "";
    setPaymentSaving(true);
    const toSave = Object.fromEntries(
      Object.entries(paymentForm).filter(([, v]) => v.trim() !== "")
    );
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify(toSave),
    });
    setPaymentSaving(false);
    setPaymentSaved(true);
    setPaymentForm({ stripe_publishable_key: "", stripe_secret_key: "", stripe_webhook_secret: "" });
    setTimeout(() => setPaymentSaved(false), 3000);
    const psRes = await fetch("/api/admin/settings", { headers: { "x-admin-key": key } });
    if (psRes.ok) setPaymentSettings(await psRes.json());
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <h1 className="text-white font-bold text-xl">Admin-Zugang</h1>
            <p className="text-gray-400 text-sm mt-1">Nur für Tappr-Entwickler</p>
          </div>
          <form onSubmit={handleLogin} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">Admin-Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              placeholder="••••••••••••"
              className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 placeholder-gray-500"
            />
            {authError && <p className="text-red-400 text-sm mb-3">Falsches Passwort.</p>}
            <button
              type="submit"
              disabled={!password}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Einloggen
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading || !overview) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Übersicht" },
    { key: "paying", label: `Zahlende (${payingUsers.length})` },
    { key: "merchants", label: `Händler (${merchants.length})` },
    { key: "users", label: `Kunden (${consumers.length})` },
    { key: "payments", label: "Stripe" },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-lg">Tappr</span>
            <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-medium">Admin</span>
          </div>
          <button
            onClick={() => { sessionStorage.removeItem("admin_key"); setAuthed(false); }}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            Abmelden
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Händler gesamt", value: overview.totalMerchants, color: "text-blue-400" },
            { label: "Kunden gesamt", value: overview.totalConsumers, color: "text-purple-400" },
            { label: "Zahlende Nutzer", value: overview.payingCount, color: "text-green-400" },
            { label: "Monatlicher Umsatz", value: formatCurrency(overview.monthlyRevenue), color: "text-yellow-400" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <p className="text-gray-400 text-xs mb-2">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-6 bg-gray-800/50 p-1 rounded-xl w-fit overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                tab === t.key ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="space-y-6">
          {/* Revenue Chart */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
            <h2 className="font-semibold mb-1">Umsatzentwicklung</h2>
            <p className="text-xs text-gray-400 mb-5">Monatlich wiederkehrender Umsatz – letzte 12 Monate</p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueChart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUmsatz" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v} €`}
                  width={56}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 12 }}
                  labelStyle={{ color: "#f9fafb", fontWeight: 600 }}
                  itemStyle={{ color: "#93c5fd" }}
                  formatter={(value) => [`${Number(value).toFixed(2)} €`, "Umsatz"] as [string, string]}
                />
                <Area
                  type="monotone"
                  dataKey="umsatz"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorUmsatz)"
                  dot={{ fill: "#3b82f6", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h2 className="font-semibold">Neue zahlende Nutzer</h2>
              </div>
              {payingUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Noch keine Abonnenten</div>
              ) : (
                <ul className="divide-y divide-gray-700/50">
                  {payingUsers.slice(0, 8).map((u) => (
                    <li key={u.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold bg-green-500/20 text-green-400">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{u.name}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <PlanBadge plan={u.plan} />
                        <p className="text-xs text-yellow-400 font-semibold mt-1">+{formatCurrency(u.monthlyRevenue)}/Mo</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
              <h2 className="font-semibold mb-4">Umsatz-Übersicht</h2>
              <div className="space-y-4">
                {[
                  {
                    label: "Pro-Abonnenten",
                    count: payingUsers.filter((u) => u.plan === "pro").length,
                    revenue: payingUsers.filter((u) => u.plan === "pro").reduce((s, u) => s + u.monthlyRevenue, 0),
                    color: "text-blue-400",
                  },
                  {
                    label: "Händler-Abonnenten",
                    count: payingUsers.filter((u) => u.plan === "merchant").length,
                    revenue: payingUsers.filter((u) => u.plan === "merchant").reduce((s, u) => s + u.monthlyRevenue, 0),
                    color: "text-purple-400",
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">{row.label}</p>
                      <p className="text-xs text-gray-400">{row.count} Nutzer</p>
                    </div>
                    <p className={`font-bold text-lg ${row.color}`}>{formatCurrency(row.revenue)}/Mo</p>
                  </div>
                ))}
                <div className="border-t border-gray-700 pt-3 flex items-center justify-between">
                  <p className="font-semibold text-white">Gesamt monatlich</p>
                  <p className="font-bold text-xl text-yellow-400">{formatCurrency(overview.monthlyRevenue)}/Mo</p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <p>Hochgerechnet auf 1 Jahr</p>
                  <p className="text-green-400 font-semibold">{formatCurrency(overview.monthlyRevenue * 12)}</p>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {tab === "paying" && (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            {payingUsers.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-3xl mb-2">💳</p>
                <p>Noch keine zahlenden Nutzer</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-xs">
                      <th className="text-left px-4 py-3 font-medium">Name</th>
                      <th className="text-left px-4 py-3 font-medium">E-Mail</th>
                      <th className="text-left px-4 py-3 font-medium">Plan</th>
                      <th className="text-right px-4 py-3 font-medium">Umsatz/Mo</th>
                      <th className="text-right px-4 py-3 font-medium">Abo seit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {payingUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{u.email}</td>
                        <td className="px-4 py-3"><PlanBadge plan={u.plan} /></td>
                        <td className="px-4 py-3 text-right font-semibold text-yellow-400">{formatCurrency(u.monthlyRevenue)}</td>
                        <td className="px-4 py-3 text-right text-gray-400 text-xs">{formatDate(u.subscriptionSince)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-700 bg-gray-700/30">
                      <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-300">Gesamt ({payingUsers.length} Abonnenten)</td>
                      <td className="px-4 py-3 text-right font-bold text-yellow-400">{formatCurrency(overview.monthlyRevenue)}/Mo</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "merchants" && (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            {merchants.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-3xl mb-2">🏪</p>
                <p>Noch keine Händler registriert</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-xs">
                      <th className="text-left px-4 py-3 font-medium">Händler</th>
                      <th className="text-left px-4 py-3 font-medium">Laden</th>
                      <th className="text-left px-4 py-3 font-medium">Plan</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-right px-4 py-3 font-medium">Abo seit</th>
                      <th className="text-right px-4 py-3 font-medium">Registriert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {merchants.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">{m.name}</p>
                          <p className="text-gray-400 text-xs">{m.email}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{m.storeName ?? <span className="text-gray-500 italic">Kein Laden</span>}</td>
                        <td className="px-4 py-3"><PlanBadge plan={m.plan} /></td>
                        <td className="px-4 py-3">
                          {m.isPaying
                            ? <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Aktiv</span>
                            : <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full">Kostenlos</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400 text-xs">
                          {m.subscriptionSince ? formatDate(m.subscriptionSince) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400 text-xs">{formatDate(m.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "users" && (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            {consumers.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-3xl mb-2">👤</p>
                <p>Noch keine Kunden registriert</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-xs">
                      <th className="text-left px-4 py-3 font-medium">Name</th>
                      <th className="text-left px-4 py-3 font-medium">E-Mail</th>
                      <th className="text-left px-4 py-3 font-medium">Plan</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-right px-4 py-3 font-medium">Registriert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {consumers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{u.email}</td>
                        <td className="px-4 py-3"><PlanBadge plan={u.plan} /></td>
                        <td className="px-4 py-3">
                          {u.isPaying
                            ? <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Pro</span>
                            : <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full">Kostenlos</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "payments" && (
          <div className="max-w-2xl space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "stripe_publishable_key", label: "Publishable Key", icon: "🔑" },
                { key: "stripe_secret_key", label: "Secret Key", icon: "🔒" },
                { key: "stripe_webhook_secret", label: "Webhook Secret", icon: "🪝" },
              ].map(({ key, label, icon }) => {
                const s = paymentSettings.find((p) => p.key === key);
                return (
                  <div key={key} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <p className="text-xl mb-2">{icon}</p>
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    {s?.set
                      ? <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Gesetzt</span>
                      : <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Fehlt</span>
                    }
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="font-semibold text-white mb-4">Keys hinterlegen</h3>
              <div className="space-y-3">
                {[
                  { field: "stripe_publishable_key" as const, label: "Publishable Key", placeholder: "pk_test_..." },
                  { field: "stripe_secret_key" as const, label: "Secret Key", placeholder: "sk_test_..." },
                  { field: "stripe_webhook_secret" as const, label: "Webhook Secret", placeholder: "whsec_..." },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                    <input
                      type="password"
                      placeholder={placeholder}
                      value={paymentForm[field]}
                      onChange={(e) => setPaymentForm((p) => ({ ...p, [field]: e.target.value }))}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={savePaymentSettings}
                disabled={paymentSaving || Object.values(paymentForm).every((v) => !v.trim())}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
              >
                {paymentSaving ? "Speichern…" : paymentSaved ? "Gespeichert" : "Keys speichern"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
