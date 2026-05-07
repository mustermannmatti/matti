"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { motion } from "motion/react";
import { useState } from "react";
import Link from "next/link";

const plans = [
  {
    name: "Kostenlos",
    tagline: "Perfekt zum Starten",
    price: 0,
    yearlyPrice: 0,
    buttonText: "Kostenlos starten",
    buttonHref: "/dashboard",
    popular: false,
    includes: [
      "Was du bekommst:",
      "Bis zu 50 Kassenbons",
      "Ausgaben-Übersicht",
      "Automatische Kategorisierung",
      "QR-Code Scanner",
    ],
  },
  {
    name: "Pro",
    tagline: "Für Vielkäufer",
    price: 4.99,
    yearlyPrice: 49,
    buttonText: "Pro holen",
    buttonHref: "/register",
    popular: true,
    includes: [
      "Alles aus Kostenlos, plus:",
      "Unbegrenzte Kassenbons",
      "Detaillierte Ausgaben-Analyse",
      "Export als PDF",
      "Mehrere Geräte synchronisieren",
      "Prioritäts-Support",
    ],
  },
  {
    name: "Händler",
    tagline: "Für Geschäfte & Filialen",
    price: 24.99,
    yearlyPrice: 249,
    buttonText: "Als Händler starten",
    buttonHref: "/register",
    popular: false,
    includes: [
      "Alles aus Pro, plus:",
      "QR-Code & NFC Generierung",
      "Kassenbon-Verwaltung",
      "Kunden-Analysen",
      "API-Zugang",
      "Dedizierter Support",
    ],
  },
];

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-900 border border-gray-700 p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "0" ? "text-white" : "text-gray-400"
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId="switch"
              className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm shadow-blue-600 border-blue-600 bg-gradient-to-t from-blue-500 to-blue-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monatlich</span>
        </button>
        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "1" ? "text-white" : "text-gray-400"
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId="switch"
              className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm shadow-blue-600 border-blue-600 bg-gradient-to-t from-blue-500 to-blue-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            Jährlich
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
              -20%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection4() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="pt-24 pb-12 text-center px-4">
        <div className="inline-flex items-center gap-2 bg-blue-950 border border-blue-800 text-blue-300 rounded-full px-4 py-2 text-sm mb-6">
          <span>✨</span>
          <span>Einfache, transparente Preise</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Der richtige Plan für dich
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
          Starte kostenlos und upgrade jederzeit. Keine versteckten Kosten, keine Überraschungen.
        </p>
        <PricingSwitch onSwitch={(v) => setIsYearly(Number.parseInt(v) === 1)} />
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 max-w-5xl gap-6 mx-auto px-4 pb-24">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "relative text-white border flex flex-col",
              plan.popular
                ? "bg-gradient-to-b from-blue-950 to-neutral-900 border-blue-600 shadow-[0px_0px_60px_-10px_rgba(37,99,235,0.5)]"
                : "bg-neutral-900 border-neutral-800"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Beliebteste Wahl
                </span>
              </div>
            )}
            <CardHeader className="text-left pb-4">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{plan.tagline}</p>
              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">
                  <NumberFlow
                    value={isYearly ? plan.yearlyPrice : plan.price}
                    format={{ minimumFractionDigits: plan.price === 0 ? 0 : 2, maximumFractionDigits: 2 }}
                  />
                </span>
                <span className="text-gray-400 text-sm">
                  {plan.price === 0 ? "für immer" : isYearly ? "€/Jahr" : "€/Monat"}
                </span>
              </div>
              {isYearly && plan.price > 0 && (
                <p className="text-green-400 text-xs mt-1">
                  Du sparst {((plan.price * 12) - plan.yearlyPrice).toFixed(0)}€ im Jahr
                </p>
              )}
            </CardHeader>

            <CardContent className="pt-0 flex flex-col flex-1">
              <Link
                href={plan.buttonHref}
                className={cn(
                  "w-full mb-6 p-3 text-base font-semibold rounded-xl text-center transition-colors",
                  plan.popular
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white"
                )}
              >
                {plan.buttonText}
              </Link>

              <div className="space-y-3 border-t border-neutral-700 pt-4 flex-1">
                <p className="text-sm font-medium text-gray-300 mb-3">{plan.includes[0]}</p>
                <ul className="space-y-2">
                  {plan.includes.slice(1).map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="text-blue-400 text-base">✓</span>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ / reassurance */}
      <div className="border-t border-neutral-800 py-12 text-center px-4">
        <p className="text-gray-500 text-sm">
          Alle Pläne beinhalten SSL-Verschlüsselung, DSGVO-Konformität und können jederzeit gekündigt werden.
        </p>
      </div>
    </div>
  );
}
