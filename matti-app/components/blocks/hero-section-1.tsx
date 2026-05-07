"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

function DashboardMockup() {
  const receipts = [
    { store: "REWE Markt Frankfurt", amount: "34,87 €", icon: "🛒", cat: "Lebensmittel", date: "03.05.2026", color: "bg-green-100" },
    { store: "dm-drogerie markt", amount: "18,45 €", icon: "🧴", cat: "Drogerie", date: "02.05.2026", color: "bg-pink-100" },
    { store: "EDEKA Aktiv Markt", amount: "52,10 €", icon: "🛒", cat: "Lebensmittel", date: "30.04.2026", color: "bg-green-100" },
    { store: "MediaMarkt", amount: "129,00 €", icon: "💻", cat: "Technik", date: "28.04.2026", color: "bg-blue-100" },
  ];
  const categories = [
    { name: "Lebensmittel", pct: 72, color: "bg-green-400", amount: "87,0 €" },
    { name: "Technik", pct: 50, color: "bg-blue-400", amount: "129,0 €" },
    { name: "Drogerie", pct: 28, color: "bg-pink-400", amount: "18,5 €" },
  ];
  return (
    <div className="text-sm">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">T</span>
          </div>
          <span className="font-bold text-gray-900">Tappr</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">Händler-Terminal</span>
          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-700 font-bold text-xs">M</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Gesamt ausgegeben", value: "234,42 €", color: "text-gray-900" },
          { label: "Diesen Monat", value: "87,21 €", color: "text-blue-600" },
          { label: "Kassenbons", value: "4", color: "text-gray-900" },
          { label: "Läden", value: "3", color: "text-gray-900" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-xl border border-gray-100">
          <div className="p-3 border-b border-gray-100">
            <p className="font-semibold text-gray-800 text-xs">Kassenbons</p>
          </div>
          <ul className="divide-y divide-gray-50">
            {receipts.map((r) => (
              <li key={r.store} className="flex items-center gap-3 px-3 py-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${r.color}`}>
                  <span className="text-base">{r.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-xs truncate">{r.store}</p>
                  <p className="text-xs text-gray-400">{r.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 text-xs">{r.amount}</p>
                  <span className="text-xs text-gray-400">{r.cat}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <p className="font-semibold text-gray-800 text-xs mb-3">Nach Kategorie</p>
          <div className="space-y-3">
            {categories.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{c.name}</span>
                  <span className="font-medium">{c.amount}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className={`h-1.5 rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-600 rounded-xl p-3 text-white">
            <p className="text-lg mb-1">📲</p>
            <p className="font-semibold text-xs mb-1">Bon einlösen</p>
            <p className="text-blue-100 text-xs">QR-Code scannen</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const { scrollY } = useScroll();
  const mockupY = useTransform(scrollY, [0, 400], [0, 60]);

  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        {/* Background: subtle grid + blue glow, no globe */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#eff6ff_0%,#ffffff_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0e7ff22_1px,transparent_1px),linear-gradient(to_bottom,#e0e7ff22_1px,transparent_1px)] bg-[size:60px_60px]" />
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute right-0 top-32 w-72 h-72 rounded-full bg-purple-400/10 blur-3xl" />
          <div className="absolute left-0 top-48 w-72 h-72 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <section>
          <div className="relative pt-28 md:pt-36">
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center">

                {/* Free badge */}
                <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
                  className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Kostenlos für Kunden – für immer
                </motion.div>

                {/* Announcement badge */}
                <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
                  className="mb-8"
                >
                  <Link
                    href="/dashboard"
                    className="group mx-auto flex w-fit items-center gap-3 rounded-full border border-blue-100 bg-white px-4 py-1.5 shadow-sm shadow-blue-100 transition-all hover:shadow-md hover:border-blue-300"
                  >
                    <span className="text-sm text-gray-600">
                      ✨ Kassenbons per NFC – kein Papier mehr
                    </span>
                    <div className="size-5 overflow-hidden rounded-full bg-blue-600 flex items-center justify-center">
                      <div className="flex w-10 -translate-x-1/2 duration-300 ease-in-out group-hover:translate-x-0">
                        <ArrowRight className="flex-shrink-0 m-auto size-3 text-white" />
                        <ArrowRight className="flex-shrink-0 m-auto size-3 text-white" />
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  custom={2} variants={fadeUp} initial="hidden" animate="visible"
                  className="max-w-4xl mx-auto text-5xl md:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight text-balance"
                >
                  Deine Kassenbons.{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                    Digital. Sicher.
                  </span>{" "}
                  Immer dabei.
                </motion.h1>

                <motion.p
                  custom={3} variants={fadeUp} initial="hidden" animate="visible"
                  className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 text-balance"
                >
                  Tappr speichert alle deine Kassenbons automatisch – per NFC oder QR-Code an der Kasse.
                  Kein Papier, keine Unordnung, alle Ausgaben auf einen Blick.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  custom={4} variants={fadeUp} initial="hidden" animate="visible"
                  className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
                >
                  <Button asChild size="lg" className="rounded-xl px-8 text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                    <Link href="/dashboard">
                      Kostenlos starten →
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-xl px-8 text-base border-gray-200 hover:border-blue-200">
                    <Link href="/register">
                      Als Händler registrieren
                    </Link>
                  </Button>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                  custom={5} variants={fadeUp} initial="hidden" animate="visible"
                  className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400"
                >
                  <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Kein Kreditkarte nötig</span>
                  <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> DSGVO-konform</span>
                  <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Kostenlos für Kunden</span>
                </motion.div>
              </div>
            </div>

            {/* Dashboard mockup with parallax */}
            <motion.div
              style={{ y: mockupY }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative mt-16 px-4 md:px-8"
            >
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent z-10" />
              <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-blue-950/10 p-6">
                <DashboardMockup />
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA below dashboard */}
        <section className="pt-4 pb-20 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="max-w-xl mx-auto"
          >
            <p className="text-gray-500 mb-6 text-base">
              Überzeugt? Starte jetzt kostenlos – in weniger als einer Minute eingerichtet.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-105 duration-200"
            >
              <span>App ausprobieren</span>
              <ArrowRight className="size-5" />
            </Link>
            <div className="mt-6 flex items-center justify-center gap-8 text-sm text-gray-400">
              {[
                { value: "10.000+", label: "Nutzer" },
                { value: "50+", label: "Händler" },
                { value: "500.000+", label: "Kassenbons" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-bold text-gray-900 text-lg">{s.value}</p>
                  <p className="text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>
    </>
  );
}

const menuItems = [
  { name: "Features", href: "/#features" },
  { name: "So funktionierts", href: "/#how-it-works" },
  { name: "Preise", href: "/pricing" },
  { name: "Dashboard", href: "/dashboard" },
];

const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav
        data-state={menuState ? "active" : undefined}
        className="fixed z-20 w-full px-2 group"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled
              ? "bg-white/80 backdrop-blur-xl max-w-4xl rounded-2xl border border-gray-200 shadow-lg shadow-black/5 lg:px-5"
              : "bg-gradient-to-r from-blue-50/80 via-white/80 to-purple-50/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-3">
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-300">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="font-bold text-xl text-gray-900">Tappr</span>
                <span className="hidden sm:inline text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                  Kostenlos
                </span>
              </Link>
              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-500 hover:text-gray-900 block duration-150 font-medium"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-gray-100 p-6 shadow-xl md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-3 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-gray-600 hover:text-gray-900 block duration-150">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button asChild variant="outline" size="sm" className={cn("rounded-lg border-gray-200", isScrolled && "lg:hidden")}>
                  <Link href="/login">Anmelden</Link>
                </Button>
                <Button asChild size="sm" className={cn("rounded-lg bg-blue-600 hover:bg-blue-700", isScrolled && "lg:hidden")}>
                  <Link href="/register">Registrieren</Link>
                </Button>
                <Button asChild size="sm" className={cn("rounded-lg bg-blue-600 hover:bg-blue-700", isScrolled ? "lg:inline-flex" : "hidden")}>
                  <Link href="/dashboard">Jetzt starten</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
