"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      if (!sessionId) { setLoading(false); return; }
      try {
        const res = await fetch(`/api/checkout/session?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setPlan(data.plan ?? null);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [sessionId]);

  const isMerchant = plan === "merchant";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Zahlung erfolgreich!</h1>
        <p className="text-gray-500 mb-8">
          {isMerchant
            ? "Dein Händler-Abo wurde aktiviert. Richte jetzt deinen Laden ein."
            : "Dein Plan wurde aktiviert. Du hast jetzt Zugriff auf alle Features."}
        </p>
        {!loading && (
          <div className="flex flex-col gap-3">
            <Link
              href={isMerchant ? "/onboarding" : "/dashboard"}
              className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
            >
              {isMerchant ? "Händler-Einrichtung starten →" : "Zum Dashboard →"}
            </Link>
            <Link href="/" className="text-gray-500 text-sm hover:text-gray-700">
              Zurück zur Startseite
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
