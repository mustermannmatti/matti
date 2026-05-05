"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
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
  store: { name: string; address: string };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
};

type User = { id: string; name: string; email: string };

export default function ClaimPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [claimed, setClaimed] = useState<Receipt | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"preview" | "success">("preview");

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/users");
      const users = await res.json();
      if (users.length > 0) setUser(users[0]);
    }
    loadUser();
  }, []);

  async function claimReceipt() {
    if (!user) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/claim/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consumerId: user.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Fehler beim Einlösen");
      setLoading(false);
      return;
    }
    setClaimed(data);
    setStep("success");
    setLoading(false);
  }

  const { icon, bg } = categoryColor(claimed?.category ?? "Sonstiges");

  if (step === "success" && claimed) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full">
          {/* Success animation */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Bon gespeichert!
            </h1>
            <p className="text-gray-600">
              Der Kassenbon wurde deinem Konto hinzugefügt.
            </p>
          </div>

          {/* Receipt preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                <span className="text-xl">{icon}</span>
              </div>
              <div>
                <p className="font-semibold">{claimed.store.name}</p>
                <p className="text-xs text-gray-500">{formatDate(claimed.createdAt)}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="font-bold text-lg text-blue-600">
                  {formatCurrency(claimed.total)}
                </p>
                <p className="text-xs text-gray-500">{claimed.items.length} Artikel</p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-2">
              {claimed.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-0.5">
                  <span className="text-gray-700 truncate flex-1">{item.name}</span>
                  <span className="text-gray-500 ml-2">{formatCurrency(item.total)}</span>
                </div>
              ))}
              {claimed.items.length > 3 && (
                <p className="text-xs text-gray-400 mt-1">
                  +{claimed.items.length - 3} weitere Artikel
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={`/receipt/${claimed.id}`}
              className="bg-blue-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Bon ansehen
            </Link>
            <Link
              href="/dashboard"
              className="bg-white text-gray-700 border border-gray-300 text-center py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Zum Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📲</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Kassenbon einlösen
          </h1>
          <p className="text-gray-600 text-sm">
            Du löst einen digitalen Kassenbon ein.
            {user && (
              <span className="block mt-1 font-medium text-gray-800">
                Konto: {user.name}
              </span>
            )}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-green-500">●</span>
            <span>Gültiger Bon gefunden</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Token: {token.slice(0, 12)}…
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={claimReceipt}
          disabled={loading || !user}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-4 rounded-xl font-bold text-lg transition-colors mb-3"
        >
          {loading ? "Wird gespeichert…" : "✓ Bon jetzt einlösen"}
        </button>

        <Link
          href="/dashboard"
          className="block text-center text-sm text-gray-500 hover:text-gray-700"
        >
          Abbrechen
        </Link>
      </div>
    </div>
  );
}
