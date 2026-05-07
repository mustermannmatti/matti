"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { signOut, useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, LogOut, Zap, Key, ShoppingCart, ChevronRight, Copy, Check, X } from "lucide-react";

type Store = { id: string; name: string; address: string };
type Item = { name: string; quantity: number; price: number; total: number };
type ApiKey = {
  id: string;
  name: string;
  key: string;
  active: boolean;
  createdAt: string;
  lastUsedAt: string | null;
};

const CATEGORIES = ["Lebensmittel", "Drogerie", "Technik", "Restaurant", "Kleidung", "Sonstiges"];
const CATEGORY_ICONS: Record<string, string> = {
  Lebensmittel: "🛒", Drogerie: "🧴", Technik: "💻", Restaurant: "🍽️", Kleidung: "👕", Sonstiges: "📦",
};

const QUICK_ITEMS = [
  { name: "Bio Vollmilch 1L", price: 1.49 },
  { name: "Mehrkornbrot 750g", price: 2.89 },
  { name: "Hähnchenbrust 400g", price: 5.99 },
  { name: "Tomaten 500g", price: 1.79 },
  { name: "Nudeln 500g", price: 1.49 },
  { name: "Olivenöl 500ml", price: 5.99 },
];

function formatRelative(dateStr: string | null) {
  if (!dateStr) return "Noch nie";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `vor ${hrs} Std.`;
  return `vor ${Math.floor(hrs / 24)} Tagen`;
}

function ApiKeysPanel() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/v1/keys")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setKeys(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  async function createKey() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/v1/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName.trim() }),
    });
    const key = await res.json();
    setKeys((prev) => [key, ...prev]);
    setNewKeyName("");
    setCreating(false);
  }

  async function toggleKey(id: string, active: boolean) {
    const res = await fetch("/api/v1/keys", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    const updated = await res.json();
    setKeys((prev) => prev.map((k) => k.id === id ? updated : k));
  }

  async function deleteKey(id: string) {
    await fetch(`/api/v1/keys?id=${id}`, { method: "DELETE" });
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  function copyKey(key: ApiKey) {
    navigator.clipboard.writeText(key.key);
    setCopiedId(key.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 backdrop-blur p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">POS-Integration via API</h2>
            <p className="text-slate-400 text-xs">HTTP-Request nach jeder Transaktion</p>
          </div>
        </div>
        <div className="bg-slate-950 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto border border-slate-700/50">
          <p className="text-slate-500 mb-1"># Bon per API erstellen</p>
          <p><span className="text-blue-400">POST</span> <span className="text-slate-300">{origin}/api/v1/receipts</span></p>
          <p><span className="text-slate-500">Authorization:</span> Bearer &lt;API_KEY&gt;</p>
          <br />
          <p className="text-slate-500">{"{"}</p>
          <p className="pl-4">{`"items": [{ "name": "Milch 1L", "quantity": 2, "price": 1.29 }],`}</p>
          <p className="pl-4">{`"category": "Lebensmittel"`}</p>
          <p>{"}"}</p>
          <br />
          <p className="text-green-400/80">{`→ { "claimUrl": "${origin}/claim/<token>", "total": 3.07 }`}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 backdrop-blur p-6">
        <h3 className="font-semibold text-white mb-4">Neuen API-Schlüssel erstellen</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="z.B. Kasse 1, NCR Terminal"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createKey()}
            className="flex-1 bg-slate-900 text-white rounded-xl px-4 py-2.5 text-sm border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-500"
          />
          <button
            onClick={createKey}
            disabled={creating || !newKeyName.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {creating ? "…" : "Erstellen"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 backdrop-blur overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60 flex items-center gap-2">
          <Key className="w-4 h-4 text-slate-400" />
          <h3 className="font-semibold text-white">API-Schlüssel <span className="text-slate-500 font-normal">({keys.length})</span></h3>
        </div>
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Laden…</div>
        ) : keys.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500 text-sm">Noch keine Schlüssel. Erstelle deinen ersten oben.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-700/50">
            {keys.map((k) => (
              <li key={k.id} className="px-6 py-4 hover:bg-slate-700/20 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-medium text-white text-sm">{k.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${k.active ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-slate-700 text-slate-500"}`}>
                        {k.active ? "Aktiv" : "Deaktiviert"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded-lg truncate max-w-[240px] border border-slate-700/50">
                        {k.key}
                      </code>
                      <button onClick={() => copyKey(k)} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        {copiedId === k.id ? <><Check className="w-3 h-3" /> Kopiert</> : <><Copy className="w-3 h-3" /> Kopieren</>}
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5">
                      Erstellt {formatRelative(k.createdAt)} · Zuletzt {formatRelative(k.lastUsedAt)}
                    </p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <button onClick={() => toggleKey(k.id, k.active)} className="text-xs text-slate-400 hover:text-yellow-400 transition-colors">
                      {k.active ? "Deakt." : "Aktivieren"}
                    </button>
                    <button onClick={() => deleteKey(k.id)} className="text-xs text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function POSPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<"terminal" | "api">("terminal");
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [category, setCategory] = useState("Lebensmittel");
  const [newItem, setNewItem] = useState({ name: "", quantity: 1, price: "" });
  const [receipt, setReceipt] = useState<{ id: string; token: string; total: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    async function load() {
      const res = await fetch(`/api/stores?userId=${session!.user!.id}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setStores(data);
        setSelectedStore(data[0]);
      }
    }
    load();
  }, [session]);

  function addItem() {
    const price = parseFloat(newItem.price);
    if (!newItem.name || isNaN(price) || price <= 0) return;
    setItems((prev) => [
      ...prev,
      { name: newItem.name, quantity: newItem.quantity, price, total: Math.round(price * newItem.quantity * 100) / 100 },
    ]);
    setNewItem({ name: "", quantity: 1, price: "" });
  }

  function addQuickItem(qi: { name: string; price: number }) {
    setItems((prev) => {
      const existing = prev.find((i) => i.name === qi.name);
      if (existing) {
        return prev.map((i) =>
          i.name === qi.name
            ? { ...i, quantity: i.quantity + 1, total: Math.round((i.quantity + 1) * i.price * 100) / 100 }
            : i
        );
      }
      return [...prev, { name: qi.name, quantity: 1, price: qi.price, total: qi.price }];
    });
  }

  function removeItem(idx: number) { setItems((prev) => prev.filter((_, i) => i !== idx)); }

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const tax = Math.round(subtotal * 0.19 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  async function createReceipt() {
    if (!selectedStore || items.length === 0) return;
    setLoading(true);
    const res = await fetch("/api/receipts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId: selectedStore.id, items, category }),
    });
    const data = await res.json();
    setReceipt(data);
    setLoading(false);
  }

  function reset() { setReceipt(null); setItems([]); setNewItem({ name: "", quantity: 1, price: "" }); }

  const claimUrl = typeof window !== "undefined" ? `${window.location.origin}/claim/${receipt?.token}` : "";

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
                <span className="text-white font-bold text-sm">T</span>
              </div>
            </Link>
            <div className="h-5 w-px bg-slate-700" />
            {selectedStore ? (
              <div>
                <p className="text-white font-semibold text-sm leading-none">{selectedStore.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">Händler-Terminal</p>
              </div>
            ) : (
              <span className="text-slate-300 font-semibold text-sm">Händler-Terminal</span>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 rounded-xl p-1">
            {[
              { key: "terminal", label: "Terminal", icon: <ShoppingCart className="w-3.5 h-3.5" /> },
              { key: "api", label: "API-Schlüssel", icon: <Key className="w-3.5 h-3.5" /> },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as "terminal" | "api")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t.key
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {session?.user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
                    <span className="text-xs font-bold">{session.user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:inline text-sm text-slate-300 font-medium">{session.user.name}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {tab === "api" ? (
          <ApiKeysPanel />
        ) : receipt ? (
          /* QR Display */
          <div className="flex flex-col items-center justify-center min-h-[75vh] gap-6">
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150" />
              <div className="relative bg-white rounded-3xl p-8 flex flex-col items-center gap-5 w-80 shadow-2xl">
                <div className="text-center">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">Betrag</p>
                  <p className="text-slate-900 font-black text-4xl">{formatCurrency(receipt.total)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                  <QRCode value={claimUrl} size={196} />
                </div>
                <div className="flex items-center gap-3 w-full text-slate-400 text-xs">
                  <div className="h-px bg-slate-200 flex-1" />
                  <span className="font-medium">oder NFC antippen</span>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>
                <div className="w-14 h-14 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                  <span className="text-2xl">📲</span>
                </div>
                <p className="text-slate-400 text-xs font-mono">#{receipt.token.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                Neuer Bon
              </button>
              <Link
                href={`/claim/${receipt.token}`}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all text-sm"
              >
                Demo: Einlösen
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Left column: inputs (3/5) */}
            <div className="lg:col-span-3 space-y-4">

              {/* Category picker */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Kategorie</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                        category === c
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                          : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700/50"
                      }`}
                    >
                      <span>{CATEGORY_ICONS[c]}</span>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick items */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Schnellauswahl</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUICK_ITEMS.map((qi) => (
                    <button
                      key={qi.name}
                      onClick={() => addQuickItem(qi)}
                      className="group bg-slate-800 hover:bg-slate-700 border border-slate-700/50 hover:border-blue-500/40 text-left px-3.5 py-3 rounded-xl transition-all"
                    >
                      <p className="text-white text-sm font-medium truncate group-hover:text-blue-300 transition-colors">{qi.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{formatCurrency(qi.price)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual item input */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Artikel manuell</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Artikelname"
                    value={newItem.name}
                    onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addItem()}
                    className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-500"
                  />
                  <input
                    type="number"
                    placeholder="Mge."
                    value={newItem.quantity}
                    min={1}
                    onChange={(e) => setNewItem((p) => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                    className="w-16 bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <input
                    type="number"
                    placeholder="€"
                    value={newItem.price}
                    step="0.01"
                    onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addItem()}
                    className="w-20 bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <button
                    onClick={addItem}
                    disabled={!newItem.name || !newItem.price}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right column: receipt (2/5) */}
            <div className="lg:col-span-2">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden sticky top-24">

                {/* Receipt header */}
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-white text-sm">Aktueller Bon</span>
                    {items.length > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {items.length}
                      </span>
                    )}
                  </div>
                  {items.length > 0 && (
                    <button onClick={() => setItems([])} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Leeren
                    </button>
                  )}
                </div>

                {/* Items */}
                {items.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3">
                      <ShoppingCart className="w-7 h-7 text-slate-600" />
                    </div>
                    <p className="text-slate-500 text-sm">Noch keine Artikel</p>
                    <p className="text-slate-600 text-xs mt-1">Wähle aus der Schnellauswahl oder füge manuell hinzu</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-800/80 max-h-64 overflow-y-auto">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/40 transition-colors group">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.quantity}× {formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-semibold text-white">{formatCurrency(item.total)}</span>
                          <button onClick={() => removeItem(idx)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Totals + CTA */}
                {items.length > 0 && (
                  <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/80">
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Zwischensumme</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>MwSt. 19%</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2 border-t border-slate-700/60">
                        <span className="font-semibold text-white">Gesamt</span>
                        <span className="text-2xl font-black text-white">{formatCurrency(total)}</span>
                      </div>
                    </div>
                    <button
                      onClick={createReceipt}
                      disabled={loading}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-base transition-all shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60 hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Bon wird erstellt…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Zap className="w-4 h-4" />
                          Bon ausstellen
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
