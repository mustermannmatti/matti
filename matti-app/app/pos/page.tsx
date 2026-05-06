"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { signOut, useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/utils";

type Store = { id: string; name: string; address: string };
type Item = { name: string; quantity: number; price: number; total: number };

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

export default function POSPage() {
  const { data: session } = useSession();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [category, setCategory] = useState("Lebensmittel");
  const [newItem, setNewItem] = useState({ name: "", quantity: 1, price: "" });
  const [receipt, setReceipt] = useState<{
    id: string;
    token: string;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      await fetch("/api/seed", { method: "POST" });
      const res = await fetch("/api/stores");
      const data = await res.json();
      setStores(data);
      if (data.length > 0) {
        const myStore = session?.user?.id
          ? data.find((s: Store & { userId?: string }) => s.userId === session.user?.id)
          : null;
        setSelectedStore(myStore ?? data[0]);
      }
    }
    load();
  }, [session]);

  function addItem() {
    const price = parseFloat(newItem.price);
    if (!newItem.name || isNaN(price) || price <= 0) return;
    setItems((prev) => [
      ...prev,
      {
        name: newItem.name,
        quantity: newItem.quantity,
        price,
        total: Math.round(price * newItem.quantity * 100) / 100,
      },
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

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

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

  function reset() {
    setReceipt(null);
    setItems([]);
    setNewItem({ name: "", quantity: 1, price: "" });
  }

  const claimUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/claim/${receipt?.token}`
      : "";

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
            </Link>
            <span className="text-gray-400">|</span>
            <span className="font-semibold">Händler-Terminal</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">
              Kunden-App →
            </Link>
            {session?.user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-7 h-7 bg-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:inline">{session.user.name}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                >
                  Abmelden
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {receipt ? (
          /* QR Code Anzeige */
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
            <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 max-w-sm w-full">
              <div className="text-center">
                <p className="text-gray-800 font-bold text-2xl mb-1">
                  {formatCurrency(receipt.total)}
                </p>
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
              <p className="text-gray-400 text-xs text-center">
                Bon-ID: {receipt.token.slice(0, 8)}…
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Neuer Bon
              </button>
              <Link
                href={`/claim/${receipt.token}`}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Demo: Bon einlösen
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: item input */}
            <div>
              {/* Store select */}
              <div className="bg-gray-800 rounded-xl p-4 mb-4">
                <label className="text-xs text-gray-400 mb-2 block">Laden</label>
                <select
                  value={selectedStore?.id ?? ""}
                  onChange={(e) =>
                    setSelectedStore(
                      stores.find((s) => s.id === e.target.value) ?? null
                    )
                  }
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="bg-gray-800 rounded-xl p-4 mb-4">
                <label className="text-xs text-gray-400 mb-2 block">Kategorie</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        category === c
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick items */}
              <div className="bg-gray-800 rounded-xl p-4 mb-4">
                <label className="text-xs text-gray-400 mb-2 block">
                  Schnellauswahl
                </label>
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

              {/* Manual item */}
              <div className="bg-gray-800 rounded-xl p-4">
                <label className="text-xs text-gray-400 mb-2 block">
                  Artikel hinzufügen
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Artikelname"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem((p) => ({ ...p, name: e.target.value }))
                    }
                    className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                    onKeyDown={(e) => e.key === "Enter" && addItem()}
                  />
                  <input
                    type="number"
                    placeholder="Menge"
                    value={newItem.quantity}
                    min={1}
                    onChange={(e) =>
                      setNewItem((p) => ({
                        ...p,
                        quantity: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-16 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Preis"
                    value={newItem.price}
                    step="0.01"
                    onChange={(e) =>
                      setNewItem((p) => ({ ...p, price: e.target.value }))
                    }
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
                    <button
                      onClick={() => setItems([])}
                      className="text-red-400 text-sm hover:text-red-300"
                    >
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
                      <li
                        key={idx}
                        className="flex items-center justify-between p-3"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {item.quantity}× {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {formatCurrency(item.total)}
                          </span>
                          <button
                            onClick={() => removeItem(idx)}
                            className="text-gray-500 hover:text-red-400 ml-2"
                          >
                            ✕
                          </button>
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
