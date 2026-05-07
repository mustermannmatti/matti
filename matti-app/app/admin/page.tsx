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

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [merchants, setMerchants] = useState<MerchantStat[]>([]);
  const [tab, setTab] = useState<"overview" | "merchants" | "users">("overview");

  const storedKey =
    typeof window !== "undefined" ? sessionStorage.getItem("admin_key") : null;

  const loadData = useCallback(async (key: string) => {
    setLoading(true);
    const res = await fetch("/api/admin/stats", {
      headers: { "x-admin-key": key },
    });
    if (res.status === 401) {
      setAuthError(true);
      sessionStorage.removeItem("admin_key");
      setAuthed(false);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setOverview(data.overview);
    setSignups(data.recentSignups);
    setMerchants(data.merchantStats);
    setAuthed(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (storedKey) {
      loadData(storedKey);
    }
  }, [storedKey, loadData]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(false);
    await loadData(password);
    if (!authError) {
      sessionStorage.setItem("admin_key", password);
    }
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admin-Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              placeholder="••••••••••••"
              className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 placeholder-gray-500"
            />
            {authError && (
              <p className="text-red-400 text-sm mb-3">Falsches Passwort.</p>
            )}
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

  const statCards = [
    { label: "Registrierte Händler", value: overview.totalMerchants, color: "text-blue-400" },
    { label: "Kunden (Consumer)", value: overview.totalConsumers, color: "text-purple-400" },
    { label: "Kassenbons gesamt", value: overview.totalReceipts, color: "text-green-400" },
    { label: "Umsatzvolumen (Bons)", value: formatCurrency(overview.totalVolume), color: "text-yellow-400" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
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
            onClick={() => {
              sessionStorage.removeItem("admin_key");
              setAuthed(false);
            }}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            Abmelden
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Overview stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <p className="text-gray-400 text-xs mb-2">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-0">
          {(["overview", "merchants", "users"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px ${
                tab === t
                  ? "bg-gray-800 text-white border border-gray-700 border-b-gray-800"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t === "overview" ? "Übersicht" : t === "merchants" ? "Händler" : "Alle Nutzer"}
            </button>
          ))}
        </div>

        {/* Overview tab */}
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
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "merchant" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
                        {u.role === "merchant" ? "Händler" : "Kunde"}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(u.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
              <h2 className="font-semibold mb-4">Plattform-Statistiken</h2>
              <div className="space-y-4">
                {[
                  { label: "Gesamte Nutzer", value: overview.totalUsers, max: overview.totalUsers, color: "bg-blue-500" },
                  { label: "Händler", value: overview.totalMerchants, max: overview.totalUsers, color: "bg-cyan-500" },
                  { label: "Kunden", value: overview.totalConsumers, max: overview.totalUsers, color: "bg-purple-500" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-300">{s.label}</span>
                      <span className="font-semibold">{s.value}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${s.color}`}
                        style={{ width: s.max > 0 ? `${Math.round((s.value / s.max) * 100)}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-700 mt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Kassenbons gesamt</span>
                    <span className="font-semibold">{overview.totalReceipts}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Umsatzvolumen (Bons)</span>
                    <span className="font-semibold text-yellow-400">{formatCurrency(overview.totalVolume)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Merchants tab */}
        {tab === "merchants" && (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold">Alle Händler ({merchants.length})</h2>
            </div>
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
                      <th className="text-right px-4 py-3 font-medium">Kassenbons</th>
                      <th className="text-right px-4 py-3 font-medium">Volumen</th>
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

        {/* All users tab */}
        {tab === "users" && (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h2 className="font-semibold">Alle Nutzer ({signups.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-xs">
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium">E-Mail</th>
                    <th className="text-left px-4 py-3 font-medium">Rolle</th>
                    <th className="text-left px-4 py-3 font-medium">Laden</th>
                    <th className="text-right px-4 py-3 font-medium">Kassenbons</th>
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
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "merchant" ? "bg-blue-500/20 text-blue-400" : u.role === "admin" ? "bg-red-500/20 text-red-400" : "bg-purple-500/20 text-purple-400"}`}>
                          {u.role === "merchant" ? "Händler" : u.role === "admin" ? "Admin" : "Kunde"}
                        </span>
                      </td>
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
      </div>
    </div>
  );
}
