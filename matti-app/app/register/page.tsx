"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"consumer" | "merchant">("consumer");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    storeName: "",
    storeAddress: "",
    taxId: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.passwordConfirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    if (form.password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        storeName: form.storeName,
        storeAddress: form.storeAddress,
        taxId: form.taxId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registrierung fehlgeschlagen.");
      setLoading(false);
      return;
    }

    router.push(role === "merchant" ? "/login?registered=1" : "/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">Tappr</span>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Konto erstellen</p>
        </div>

        {/* Role toggle */}
        <div className="bg-gray-100 rounded-2xl p-1 flex mb-6">
          <button
            type="button"
            onClick={() => setRole("consumer")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              role === "consumer"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            👤 Kunde
          </button>
          <button
            type="button"
            onClick={() => setRole("merchant")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              role === "merchant"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🏪 Händler
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {role === "consumer" ? "Kundenkonto erstellen" : "Händler-Konto erstellen"}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {role === "consumer"
              ? "Speichere Kassenbons und behalte deine Ausgaben im Blick."
              : "Stelle deinen Kunden digitale Kassenbons aus."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {role === "consumer" ? "Dein Name" : "Name des Inhabers"}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                autoFocus
                placeholder={role === "consumer" ? "Max Mustermann" : "Max Mustermann"}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                placeholder={role === "consumer" ? "deine@email.de" : "inhaber@meinladen.de"}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                placeholder="Mindestens 8 Zeichen"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passwort bestätigen
              </label>
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={(e) => update("passwordConfirm", e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Merchant-only fields */}
            {role === "merchant" && (
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Laden-Informationen
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name des Ladens
                  </label>
                  <input
                    type="text"
                    value={form.storeName}
                    onChange={(e) => update("storeName", e.target.value)}
                    required={role === "merchant"}
                    placeholder="Mein Supermarkt"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.storeAddress}
                    onChange={(e) => update("storeAddress", e.target.value)}
                    placeholder="Musterstraße 1, 60311 Frankfurt"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Steuer-ID / USt-IdNr.
                  </label>
                  <input
                    type="text"
                    value={form.taxId}
                    onChange={(e) => update("taxId", e.target.value)}
                    required={role === "merchant"}
                    placeholder="DE123456789"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Umsatzsteuer-Identifikationsnummer deines Unternehmens
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading
                ? "Konto wird erstellt…"
                : role === "consumer"
                ? "Kostenlos registrieren"
                : "Händler-Konto erstellen"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Bereits registriert?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
