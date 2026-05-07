"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

type Overview = {
  totalUsers: number;
  totalMerchants: number;
  totalConsumers: number;
  totalStores: number;
  totalReceipts: number;
  totalVolume: number;
};

type Signup = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  storeName: string | null;
  receiptCount: number;
};

type MerchantStat = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  storeName: string;
  storeAddress: string;
  receiptCount: number;
  totalVolume: number;
};

type ReceiptItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
};

type AdminReceipt = {
  id: string;
  token: string;
  total: number;
  subtotal: number;
  tax: number;
  category: string;
  status: string;
  createdAt: string;
  claimedAt: string | null;
  store: {
    name: string;
    address: string;
    user: { name: string; email: string };
  };
  consumer: { name: string; email: string } | null;
  items: ReceiptItem[];
};

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    merchant: "bg-blue-500/20 text-blue-400",
    consumer: "bg-purple-500/20 text-purple-400",
    admin: "bg-red-500/20 text-red-400",
  };
  const label: Record<string, string> = { merchant: "Händler", consumer: "Kunde", admin: "Admin" };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${map[role] ?? "bg-gray-500/20 text-gray-400"}`}>
      {label[role] ?? role}
    </span>
  );
}

function StatusBadge({ status, claimedAt }: { status: string; claimedAt: string | null }) {
  if (claimedAt) return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Eingelöst</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">Ausstehend</span>;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [merchants, setMerchants] = useState<MerchantStat[]>([]);
  const [receipts, setReceipts] = useState<AdminReceipt[]>([]);
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "merchants" | "users" | "receipts" | "payments">("overview");

  const [receiptSearch, setReceiptSearch] = useState("");

  // Payment settings state
  type PaymentSetting = { key: string; value: string; set: boolean };
  const [paymentSettings, setPaymentSettings] = useState<PaymentSetting[]>([]);
  const [paymentForm, setPaymentForm] = useState({ stripe_publishable_key: "", stripe_secret_key: "", stripe_webhook_secret: "" });
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentSaved, setPaymentSaved] = useState(false);

  const loadData = useCallback(async (key: string) => {
    setLoading(true);
    const [statsRes, receiptsRes] = await Promise.all([
      fetch("/api/admin/stats", { headers: { "x-admin-key": key } }),
      fetch("/api/admin/receipts", { headers: { "x-admin-key": key } }),
    ]);
    if (statsRes.status === 401) {
      setAuthError(true);
      sessionStorage.removeItem("admin_key");
      setAuthed(false);
      setLoading(false);
      return;
    }
    const stats = await statsRes.json();
    const recs = await receiptsRes.json();
    setOverview(stats.overview);
    setSignups(stats.recentSignups);
    setMerchants(stats.merchantStats);
    setReceipts(recs);

    // Load payment settings
    const psRes = await fetch("/api/admin/settings", { headers: { "x-admin-key": key } });
    if (psRes.ok) {
      const ps = await psRes.json();
      setPaymentSettings(ps);
    }

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

  const filteredReceipts = receipts.filter((r) => {
    if (!receiptSearch) return true;
    const q = receiptSearch.toLowerCase();
    return (
      r.store.name.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.consumer?.name.toLowerCase().includes(q) ||
      r.consumer?.email.toLowerCase().includes(q) ||
      r.items.some((i) => i.name.toLowerCase().includes(q))
    );
  });

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
    { key: "merchants", label: `Händler (${merchants.length})` },
    { key: "users", label: `Nutzer (${signups.length})` },
    { key: "receipts", label: `Kassenbons (${receipts.length})` },
    { key: "payments", label: "💳 Zahlungen" },
  ] as const;

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
    // Reload settings
    const psRes = await fetch("/api/admin/settings", { headers: { "x-admin-key": key } });
    if (psRes.ok) setPaymentSettings(await psRes.json());
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-lg">Tappr</span>
            <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-medium">
              Admin
            </span>
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
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Händler", value: overview.totalMerchants, color: "text-blue-400" },
            { label: "Kunden", value: overview.totalConsumers, color: "text-purple-400" },
            { label: "Kassenbons", value: overview.totalReceipts, color: "text-green-400" },
            { label: "Umsatzvolumen", value: formatCurrency(overview.totalVolume), color: "text-yellow-400" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <p className="text-gray-400 text-xs mb-2">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-800/50 p-1 rounded-xl w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === t.key ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h2 className="font-semibold">Neueste Registrierungen</h2>
              </div>
              <ul className="divide-y divide-gray-700/50">
                {signups.slice(0, 8).map((u) => (
                  <li key={u.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${u.role === "merchant" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <RoleBadge role={u.role} />
                      <p className="text-xs text-gray-500 mt-1">{formatDate(u.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
              <h2 className="font-semibold mb-4">Neueste Kassenbons</h2>
              <ul className="space-y-2">
                {receipts.slice(0, 6).map((r) => (
                  <li key={r.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-gray-400 truncate">{r.store.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={r.status} claimedAt={r.claimedAt} />
                      <span className="font-semibold text-yellow-400">{formatCurrency(r.total)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* MERCHANTS */}
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
                      <th className="text-left px-4 py-3 font-medium">Adresse</th>
                      <th className="text-right px-4 py-3 font-medium">Bons</th>
                      <th className="text-right px-4 py-3 font-medium">Volumen</th>
                      <th className="text-right px-4 py-3 font-medium">Seit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {merchants.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">{m.name}</p>
                          <p className="text-gray-400 text-xs">{m.email}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{m.storeName}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs max-w-[150px] truncate">{m.storeAddress || "—"}</td>
                        <td className="px-4 py-3 text-right font-semibold">{m.receiptCount}</td>
                        <td className="px-4 py-3 text-right font-semibold text-yellow-400">{formatCurrency(m.totalVolume)}</td>
                        <td className="px-4 py-3 text-right text-gray-400 text-xs">{formatDate(m.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* USERS */}
        {tab === "users" && (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-xs">
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium">E-Mail</th>
                    <th className="text-left px-4 py-3 font-medium">Rolle</th>
                    <th className="text-left px-4 py-3 font-medium">Laden</th>
                    <th className="text-right px-4 py-3 font-medium">Bons</th>
                    <th className="text-right px-4 py-3 font-medium">Registriert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {signups.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${u.role === "merchant" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{u.email}</td>
                      <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                      <td className="px-4 py-3 text-gray-400">{u.storeName ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold">{u.receiptCount}</td>
                      <td className="px-4 py-3 text-right text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RECEIPTS */}
        {tab === "receipts" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                placeholder="Suche nach Laden, Kunde, Produkt…"
                value={receiptSearch}
                onChange={(e) => setReceiptSearch(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72 placeholder-gray-500"
              />
              <span className="text-gray-400 text-sm">{filteredReceipts.length} Ergebnisse</span>
            </div>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-xs">
                    <th className="text-left px-4 py-3 font-medium w-8"></th>
                    <th className="text-left px-4 py-3 font-medium">Laden</th>
                    <th className="text-left px-4 py-3 font-medium">Händler</th>
                    <th className="text-left px-4 py-3 font-medium">Kunde</th>
                    <th className="text-left px-4 py-3 font-medium">Kategorie</th>
                    <th className="text-right px-4 py-3 font-medium">Artikel</th>
                    <th className="text-right px-4 py-3 font-medium">Betrag</th>
                    <th className="text-right px-4 py-3 font-medium">Status</th>
                    <th className="text-right px-4 py-3 font-medium">Datum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredReceipts.map((r) => (
                    <>
                      <tr
                        key={r.id}
                        className="hover:bg-gray-700/30 transition-colors cursor-pointer"
                        onClick={() => setExpandedReceipt(expandedReceipt === r.id ? null : r.id)}
                      >
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {expandedReceipt === r.id ? "▼" : "▶"}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">{r.store.name}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{r.store.user.name}</td>
                        <td className="px-4 py-3 text-gray-300 text-xs">
                          {r.consumer ? r.consumer.name : <span className="text-gray-500 italic">Anonym</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{r.category}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300">{r.items.length}</td>
                        <td className="px-4 py-3 text-right font-semibold text-yellow-400">{formatCurrency(r.total)}</td>
                        <td className="px-4 py-3 text-right">
                          <StatusBadge status={r.status} claimedAt={r.claimedAt} />
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400 text-xs">{formatDate(r.createdAt)}</td>
                      </tr>

                      {/* Expanded detail row */}
                      {expandedReceipt === r.id && (
                        <tr key={`${r.id}-detail`} className="bg-gray-900/60">
                          <td colSpan={9} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Items */}
                              <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Artikel</p>
                                <ul className="space-y-1.5">
                                  {r.items.map((item) => (
                                    <li key={item.id} className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-500 text-xs w-5">{item.quantity}×</span>
                                        <span className="text-gray-200">{item.name}</span>
                                      </div>
                                      <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span>{formatCurrency(item.price)} / Stk.</span>
                                        <span className="font-semibold text-white w-16 text-right">{formatCurrency(item.total)}</span>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Summary */}
                              <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Zusammenfassung</p>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between text-gray-400">
                                    <span>Zwischensumme</span>
                                    <span>{formatCurrency(r.subtotal)}</span>
                                  </div>
                                  <div className="flex justify-between text-gray-400">
                                    <span>MwSt. (19%)</span>
                                    <span>{formatCurrency(r.tax)}</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-white border-t border-gray-700 pt-2">
                                    <span>Gesamt</span>
                                    <span className="text-yellow-400">{formatCurrency(r.total)}</span>
                                  </div>
                                  <div className="pt-2 space-y-1 text-xs text-gray-500">
                                    <div className="flex justify-between">
                                      <span>Bon-ID</span>
                                      <span className="font-mono">{r.token.slice(0, 12)}…</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Erstellt</span>
                                      <span>{formatDate(r.createdAt)}</span>
                                    </div>
                                    {r.claimedAt && (
                                      <div className="flex justify-between">
                                        <span>Eingelöst</span>
                                        <span>{formatDate(r.claimedAt)}</span>
                                      </div>
                                    )}
                                    {r.consumer && (
                                      <div className="flex justify-between">
                                        <span>Kunde</span>
                                        <span>{r.consumer.name} ({r.consumer.email})</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>

              {filteredReceipts.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  <p className="text-3xl mb-2">🧾</p>
                  <p>Keine Kassenbons gefunden</p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* PAYMENTS */}
        {tab === "payments" && (
          <div className="max-w-2xl space-y-6">
            {/* Status */}
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
                    {s?.set ? (
                      <div>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">✓ Gesetzt</span>
                        <p className="text-xs text-gray-600 font-mono mt-1">{s.value}</p>
                      </div>
                    ) : (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">✗ Fehlt</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* How to get keys */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 text-sm text-gray-400 space-y-2">
              <p className="font-semibold text-white">So richtest du Stripe ein:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Gehe zu <span className="text-blue-400">dashboard.stripe.com</span> und erstelle ein Konto</li>
                <li>Unter <span className="text-gray-300">Entwickler → API-Schlüssel</span>: Publishable Key + Secret Key kopieren</li>
                <li>Unter <span className="text-gray-300">Entwickler → Webhooks</span>: Endpoint hinzufügen → URL: <code className="text-green-400 bg-gray-900 px-1 rounded">/api/webhooks/stripe</code></li>
                <li>Events: <code className="text-green-400 bg-gray-900 px-1 rounded">checkout.session.completed</code> + <code className="text-green-400 bg-gray-900 px-1 rounded">customer.subscription.deleted</code></li>
                <li>Webhook Signing Secret kopieren und unten eintragen</li>
              </ol>
              <p className="text-xs text-gray-600 mt-2">PayPal, Klarna und SEPA aktivierst du in Stripe unter Einstellungen → Zahlungsmethoden — sie erscheinen dann automatisch im Checkout.</p>
            </div>

            {/* Form */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="font-semibold text-white mb-4">Keys hinterlegen</h3>
              <div className="space-y-3">
                {[
                  { field: "stripe_publishable_key" as const, label: "Publishable Key", placeholder: "pk_live_..." },
                  { field: "stripe_secret_key" as const, label: "Secret Key", placeholder: "sk_live_..." },
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
                {paymentSaving ? "Speichern…" : paymentSaved ? "✓ Gespeichert" : "Keys speichern"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
