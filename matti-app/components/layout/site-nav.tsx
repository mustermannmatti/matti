"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) setUser({ name: data.user.name, role: (data.user as { role?: string }).role ?? "consumer" });
        setSessionLoaded(true);
      })
      .catch(() => setSessionLoaded(true));
  }, []);

  const appHref = user ? (user.role === "merchant" ? "/pos" : "/dashboard") : "/login";
  const appLabel = user ? `${user.name} →` : "Anmelden";

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-50/90 via-white/90 to-purple-50/90 backdrop-blur-md border-b border-blue-100/60 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">T</span>
          </div>
          <span className="font-bold text-gray-900">Tappr</span>
          <span className="hidden sm:inline-flex items-center gap-1 ml-1 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            Kostenlos
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/#how-it-works" className="hover:text-gray-900 transition-colors">So funktioniert es</Link>
          <Link href="/#features" className="hover:text-gray-900 transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-gray-900 transition-colors">Preise</Link>
          <Link href="/onboarding" className="hover:text-gray-900 transition-colors">Händler starten</Link>
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {sessionLoaded && !user && (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Anmelden
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
              >
                Registrieren
              </Link>
            </>
          )}
          {sessionLoaded && (
            <Link
              href={appHref}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors max-w-[160px] truncate"
            >
              {appLabel}
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-blue-100/60 bg-white/95 backdrop-blur-md px-6 py-4 space-y-3">
          <Link href="/#how-it-works" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setOpen(false)}>So funktioniert es</Link>
          <Link href="/#features" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setOpen(false)}>Features</Link>
          <Link href="/pricing" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setOpen(false)}>Preise</Link>
          <Link href="/onboarding" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setOpen(false)}>Händler starten</Link>
          <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
            {sessionLoaded && !user && (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-700 py-2" onClick={() => setOpen(false)}>Anmelden</Link>
                <Link href="/register" className="bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl text-center" onClick={() => setOpen(false)}>Registrieren</Link>
              </>
            )}
            <Link href={appHref} className="bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl text-center truncate" onClick={() => setOpen(false)}>
              {appLabel}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
