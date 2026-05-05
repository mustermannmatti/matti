"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ScanPage() {
  const [token, setToken] = useState("");
  const router = useRouter();

  function submit() {
    const t = token.trim();
    if (t) router.push(`/claim/${t}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
          ← Zurück
        </Link>

        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📷</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">QR-Code scannen</h1>
        <p className="text-gray-600 text-sm mb-8">
          In der nativen App öffnet sich hier die Kamera automatisch. Im Browser gibst du den Token ein.
        </p>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
            <div className="text-center text-gray-400">
              <p className="text-4xl mb-2">📷</p>
              <p className="text-sm">Kamera-Scan (native App)</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Bon-Token eingeben…"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={submit}
              disabled={!token.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Los
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Tipp: Erstelle einen Testbon im{" "}
          <Link href="/pos" className="text-blue-600 hover:underline">
            Händler-Terminal
          </Link>{" "}
          und scanne dann den QR-Code.
        </p>
      </div>
    </div>
  );
}
