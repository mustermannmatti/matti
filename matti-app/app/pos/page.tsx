"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { signOut, useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/utils";

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

const CATEGORIES = [
  "Lebensmittel",
  "Drogerie",
  "Technik",
  "Restaurant",
  "Kleidung",
  "Sonstiges",
];

const QUICK_ITEMS = [
  { name: "Bio Vollmilch 1L", price: 1.49 },
  { name: "Mehrkornbrot 750g", price: 2.89 },
  { name: "Hähnchenbrust 400g", price: 5.99 },
  { name: "Tomaten 500g", price: 1.79 },
  { name: "Nudeln Barilla 500g", price: 1.49 },
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

// ─── API Keys Panel ─────────────────────────────────────────────────────────

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
      .then((r) => r.json())
      .then((data) => { setKeys(data); setLoading(false); });
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Docs box */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h2 className="font-semibold text-white mb-1">POS-Integration via API</h2>
        <p className="text-gray-400 text-sm mb-4">
          Sende nach jeder Transaktion einen HTTP-Request an Tappr. Wir erstellen den digitalen
          Kassenbon und geben dir eine QR-Code-URL zurück, die du auf dem Kundendisplay anzeigst.
        </p>
        <div className="bg-gray-900 rounded-lg p-4 text-xs font-mono text-gray-300 overflow-x-auto">
          <p className="text-gray-500 mb-2"># Bon per API erstellen</p>
          <p><span className="text-blue-400">POST</span> {origin}/api/v1/receipts</p>
          <p><span className="text-gray-500">Authorization:</span> Bearer {`<API_KEY>`}</p>
          <p><span className="text-gray-500">Content-Type:</span> application/json</p>
          <br />
          <p className="text-gray-500">{"{"}</p>
          <p className="pl-4">{`"items": [`}</p>
          <p className="pl-8">{`{ "name": "Milch 1L", "quantity": 2, "price": 1.29 },`}</p>
          <p className="pl-8">{`{ "name": "Brot", "quantity": 1, "price": 2.49 }`}</p>
          <p className="pl-4">{`],`}</p>
          <p className="pl-4">{`"category": "Lebensmittel",`}</p>
          <p className="pl-4">{`"transactionId": "POS-12345"`}</p>
          <p>{"}"}</p>
          <br />
          <p className="text-gray-500"># Antwort</p>
          <p className="text-gray-500">{"{"}</p>
          <p className="pl-4 text-green-400">{`"claimUrl": "${origin}/claim/<token>",`}</p>
          <p className="pl-4 text-green-400">{`"qrDataUrl": "data:image/png;base64,...",`}</p>
          <p className="pl-4">{`"total": 5.07, "subtotal": 4.07, "tax": 0.77`}</p>
          <p className="text-gray-500">{"}"}</p>
        </div>
        <p className="text-gray-500 text-xs mt-3">
          <span className="text-yellow-400">taxRate</span> optional (Standard: 0.19) ·{" "}
          <span className="text-yellow-400">transactionId</span> optional, deine interne Transaktions-ID
        </p>
      </div>

      {/* Create key */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-white mb-3">Neuen API-Schlüssel erstellen</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Name z.B. Kasse 1, NCR Terminal"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createKey()}
            className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
          <button
            onClick={createKey}
            disabled={creating || !newKeyName.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {creating ? "…" : "Erstellen"}
          </button>
        </div>
      </div>

      {/* Keys list */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-semibold text-white">API-Schlüssel ({keys.length})</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Laden…</div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Noch keine Schlüssel. Erstelle deinen ersten oben.
          </div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {keys.map((k) => (
              <li key={k.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm">{k.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${k.active ? "bg-green-900/50 text-green-400" : "bg-gray-700 text-gray-500"}`}>
                        {k.active ? "Aktiv" : "Deaktiviert"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-gray-400 font-mono bg-gray-900 px-2 py-1 rounded truncate max-w-[260px]">
                        {k.key}
                      </code>
                      <button
                        onClick={() => copyKey(k)}
                        className="text-xs text-blue-400 hover:text-blue-300 flex-shrink-0"
                      >
                        {copiedId === k.id ? "✓ Kopiert" : "Kopieren"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Erstellt {formatRelative(k.createdAt)} · Zuletzt benutzt {formatRelative(k.lastUsedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleKey(k.id, k.active)}
                      className="text-xs text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      {k.active ? "Deakt." : "Aktivieren"}
                    </button>
                    <button
                      onClick={() => deleteKey(k.id)}
                      className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                    >
                      Löschen
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

// ─── Main POS Page ───────────────────────────────────────────────────────────

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
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">T</span>
              </div>
            </Link>
            <span className="text-gray-400">|</span>
            <span className="font-semibold">Händler-Terminal</span>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setTab("terminal")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "terminal" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Terminal
            </button>
            <button
              onClick={() => setTab("api")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "api" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}
            >
              API-Schlüssel
            </button>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">
              Kunden-App →
            </Link>
            {session?.user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-7 h-7 bg-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold">{session.user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:inline">{session.user.name}</span>
                </div>
                <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-sm text-gray-400 hover:text-red-400 transition-colors">
                  Abmelden
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {tab === "api" ? (
          <ApiKeysPanel />
        ) : receipt ? (
          /* QR Code display */
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
            <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 max-w-sm w-full">
              <div className="text-center">
                <p className="text-gray-800 font-bold text-2xl mb-1">{formatCurrency(receipt.total)}</p>
                <p className="text-gray-500 text-sm">Jetzt Handy antippen oder QR scannen</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border-4 border-gray-900">
                <QRCode value={claimUrl} size={200} />
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span>oder NFC</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              <div className="w-16 h-16 border-4 border-gray-900 rounded-full flex items-center justify-center">
                <span className="text-3xl">📲</span>
              </div>
              <p className="text-gray-400 text-xs text-center">Bon-ID: {receipt.token.slice(0, 8)}…</p>
            </div>
            <div className="flex gap-3">
              <button onClick={reset} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                Neuer Bon
              </button>
              <Link href={`/claim/${receipt.token}`} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                Demo: Bon einlösen
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: item input */}
            <div>
              {selectedStore && (
                <div className="bg-gray-800 rounded-xl p-4 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">🏪</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{selectedStore.name}</p>
                    <p className="text-gray-400 text-xs">{selectedStore.address}</p>
                  </div>
                </div>
              )}

              <div className="bg-gray-800 rounded-xl p-4 mb-4">
                <label className="text-xs text-gray-400 mb-2 block">Kategorie</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === c ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-4 mb-4">
                <label className="text-xs text-gray-400 mb-2 block">Schnellauswahl</label>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_ITEMS.map((qi) => (
                    <button
                      key={qi.name}
                      onClick={() => addQuickItem(qi)}
                      className="bg-gray-700 hover:bg-gray-600 text-left px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <p className="text-white truncate">{qi.name}</p>
                      <p className="text-gray-400 text-xs">{formatCurrency(qi.price)}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-4">
                <label className="text-xs text-gray-400 mb-2 block">Artikel hinzufügen</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Artikelname"
                    value={newItem.name}
                    onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                    className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                    onKeyDown={(e) => e.key === "Enter" && addItem()}
                  />
                  <input
                    type="number"
                    placeholder="Menge"
                    value={newItem.quantity}
                    min={1}
                    onChange={(e) => setNewItem((p) => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                    className="w-16 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Preis"
                    value={newItem.price}
                    step="0.01"
                    onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))}
                    className="w-20 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === "Enter" && addItem()}
                  />
                </div>
                <button
                  onClick={addItem}
                  disabled={!newItem.name || !newItem.price}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  + Hinzufügen
                </button>
              </div>
            </div>

            {/* Right: current receipt */}
            <div>
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h2 className="font-semibold">Aktueller Bon</h2>
                  {items.length > 0 && (
                    <button onClick={() => setItems([])} className="text-red-400 text-sm hover:text-red-300">
                      Leeren
                    </button>
                  )}
                </div>

                {items.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p className="text-3xl mb-2">🛒</p>
                    <p className="text-sm">Noch keine Artikel</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-700">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between p-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.quantity}× {formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{formatCurrency(item.total)}</span>
                          <button onClick={() => removeItem(idx)} className="text-gray-500 hover:text-red-400 ml-2">✕</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {items.length > 0 && (
                  <div className="p-4 border-t border-gray-700">
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Zwischensumme</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>MwSt. (19%)</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-1 border-t border-gray-600">
                        <span>Gesamt</span>
                        <span className="text-blue-400">{formatCurrency(total)}</span>
                      </div>
                    </div>
                    <button
                      onClick={createReceipt}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white py-3 rounded-xl font-bold text-lg transition-colors"
                    >
                      {loading ? "Bon wird erstellt…" : "💳 Bon ausstellen"}
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
