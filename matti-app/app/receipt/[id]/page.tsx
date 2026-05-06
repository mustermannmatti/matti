"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { formatCurrency, formatDate, categoryColor } from "@/lib/utils";

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
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
};

export default function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/receipts/${id}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        if (data && typeof data === "object" && "error" in data) {
          setNotFound(true);
        } else {
          setReceipt(data);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-[53px] bg-white border-b border-gray-200" />
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-2">🔍</p>
          <p className="text-gray-600">Kassenbon nicht gefunden</p>
          <Link href="/dashboard" className="text-blue-600 mt-4 inline-block">
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { bg, icon } = categoryColor(receipt.category);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            ← Zurück
          </Link>
          <span className="text-gray-300">|</span>
          <span className="font-medium text-gray-900">Kassenbon</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Store header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${bg}`}>
              <span className="text-3xl">{icon}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{receipt.store.name}</h1>
              <p className="text-sm text-gray-500">{receipt.store.address}</p>
              <p className="text-sm text-gray-500 mt-1">{formatDate(receipt.createdAt)}</p>
            </div>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
              ✓ Digital gespeichert
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl border border-gray-200 mb-4">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Artikel ({receipt.items.length})
            </h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {receipt.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity}× {formatCurrency(item.price)}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(item.total)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Totals */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Zwischensumme</span>
              <span>{formatCurrency(receipt.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>MwSt. (19%)</span>
              <span>{formatCurrency(receipt.tax)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
              <span>Gesamt</span>
              <span className="text-blue-600">{formatCurrency(receipt.total)}</span>
            </div>
          </div>
        </div>

        {/* Receipt info */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold mb-3 text-gray-900">Bon-Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Kategorie</span>
              <span className="font-medium">{receipt.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="text-green-600 font-medium">✓ Digital eingelöst</span>
            </div>
            {receipt.claimedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Eingelöst am</span>
                <span className="font-medium">{formatDate(receipt.claimedAt)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Bon-ID</span>
              <span className="font-mono text-xs text-gray-400">{receipt.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
