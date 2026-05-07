"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import NumberFlow from "@number-flow/react";
import { CheckCheck, Receipt, BarChart2, Smartphone, Store, Headphones, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";

const plans = [
  {
    name: "Kostenlos",
    description: "Perfekt für Kunden, die ihre Kassenbons digital speichern möchten – ohne Kosten, für immer.",
    price: 0,
    yearlyPrice: 0,
    buttonText: "Jetzt kostenlos starten",
    buttonHref: "/dashboard",
    popular: false,
    features: [
      { text: "Bis zu 50 Kassenbons", icon: <Receipt size={18} /> },
      { text: "Ausgaben-Übersicht", icon: <BarChart2 size={18} /> },
      { text: "QR-Code Scanner", icon: <Smartphone size={18} /> },
    ],
    includes: [
      "Was du bekommst:",
      "Automatische Kategorisierung",
      "NFC & QR-Code Empfang",
      "DSGVO-konformer Speicher",
      "Kein Kreditkarte nötig",
    ],
  },
  {
    name: "Pro",
    description: "Für Kunden, die ihre Finanzen wirklich im Griff haben wollen – unbegrenzt und smart.",
    price: 4.99,
    yearlyPrice: 49,
    buttonText: "Pro starten",
    buttonHref: "/register",
    popular: true,
    features: [
      { text: "Unbegrenzte Kassenbons", icon: <Receipt size={18} /> },
      { text: "Detaillierte Ausgaben-Analyse", icon: <BarChart2 size={18} /> },
      { text: "Mehrere Geräte synchronisieren", icon: <Smartphone size={18} /> },
    ],
    includes: [
      "Alles aus Kostenlos, plus:",
      "Export als PDF",
      "Monats- & Jahresberichte",
      "Prioritäts-Support",
      "Erweiterte Suchfunktion",
    ],
  },
  {
    name: "Händler",
    description: "Die komplette Lösung für Geschäfte: digitale Bons ausstellen, Kunden analysieren, wachsen.",
    price: 24.99,
    yearlyPrice: 249,
    buttonText: "Als Händler starten",
    buttonHref: "/register",
    popular: false,
    features: [
      { text: "QR-Code & NFC Generierung", icon: <Zap size={18} /> },
      { text: "Kassenbon-Verwaltung", icon: <Store size={18} /> },
      { text: "Dedizierter Support", icon: <Headphones size={18} /> },
    ],
    includes: [
      "Alles aus Pro, plus:",
      "Händler-Terminal (POS)",
      "Kunden-Analysen",
      "API-Zugang",
      "Steuer-Export (DATEV)",
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
      <div className="relative z-50 mx-auto flex w-fit rounded-full bg-white border border-gray-200 shadow-sm p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={`relative z-10 w-fit sm:h-11 h-9 rounded-full sm:px-6 px-4 font-medium transition-colors text-sm ${
            selected === "0" ? "text-white" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <AnimatePresence>
            {selected === "0" && (
              <motion.span
                key="pill-monthly"
                layoutId="switch-tappr"
                className="absolute top-0 left-0 sm:h-11 h-9 w-full rounded-full shadow-sm shadow-blue-400 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400"
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              />
            )}
          </AnimatePresence>
          <span className="relative">Monatlich</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={`relative z-10 w-fit sm:h-11 h-9 rounded-full sm:px-6 px-4 font-medium transition-colors text-sm ${
            selected === "1" ? "text-white" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <AnimatePresence>
            {selected === "1" && (
              <motion.span
                key="pill-yearly"
                layoutId="switch-tappr"
                className="absolute top-0 left-0 sm:h-11 h-9 w-full rounded-full shadow-sm shadow-blue-400 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400"
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              />
            )}
          </AnimatePresence>
          <span className="relative flex items-center gap-2">
            Jährlich
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
              −20%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { delay: i * 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    }),
    hidden: { filter: "blur(10px)", y: -16, opacity: 0 },
  };

  return (
    <div className="px-4 pt-16 pb-24 min-h-screen mx-auto relative bg-gray-50" ref={pricingRef}>
      {/* Subtle blue radial glow */}
      <div
        className="absolute top-0 left-[10%] right-[10%] w-[80%] h-96 z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at center, #2563eb 0%, transparent 70%)",
          opacity: 0.08,
        }}
      />

      {/* Header */}
      <div className="text-center mb-10 max-w-3xl mx-auto relative z-10">
        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3"
        >
          Preise
        </TimelineContent>

        <TimelineContent
          as="h1"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
        >
          Der richtige Plan für{" "}
          <TimelineContent
            as="span"
            animationNum={2}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="border border-dashed border-blue-400 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 inline-block"
          >
            dich
          </TimelineContent>
        </TimelineContent>

        <TimelineContent
          as="p"
          animationNum={3}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-gray-500 text-base max-w-xl mx-auto"
        >
          Für Kunden kostenlos – für immer. Händler bekommen alles was sie brauchen, um papierlose Kassenbons auszustellen.
        </TimelineContent>
      </div>

      {/* Toggle */}
      <TimelineContent
        as="div"
        animationNum={4}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="mb-10 relative z-10"
      >
        <PricingSwitch onSwitch={(v) => setIsYearly(parseInt(v) === 1)} />
      </TimelineContent>

      {/* Cards */}
      <div className="grid md:grid-cols-3 max-w-5xl gap-5 mx-auto relative z-10">
        {plans.map((plan, index) => (
          <TimelineContent
            key={plan.name}
            as="div"
            animationNum={5 + index}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <Card
              className={`relative h-full flex flex-col border ${
                plan.popular
                  ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
                  : "bg-white border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-sm shadow-blue-300">
                    Beliebtester Plan
                  </span>
                </div>
              )}

              <CardHeader className="text-left pb-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">{plan.description}</p>

                <div className="flex items-baseline gap-1 min-h-[2.75rem]">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-bold text-gray-900">Kostenlos</span>
                  ) : (
                    <>
                      <NumberFlow
                        value={isYearly ? plan.yearlyPrice : plan.price}
                        format={{ style: "currency", currency: "EUR", minimumFractionDigits: 2 }}
                        className="text-4xl font-bold text-gray-900"
                        spinTiming={{ duration: 500, easing: "ease-out" }}
                        opacityTiming={{ duration: 300, easing: "ease-out" }}
                      />
                      <span className="text-gray-500 text-sm ml-1">
                        /{isYearly ? "Jahr" : "Monat"}
                      </span>
                    </>
                  )}
                </div>
                {isYearly && plan.price > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-green-600 font-medium mt-1"
                  >
                    Du sparst {((plan.price * 12) - plan.yearlyPrice).toFixed(0)} € im Jahr
                  </motion.p>
                )}
              </CardHeader>

              <CardContent className="pt-0 flex flex-col flex-1">
                <Link
                  href={plan.buttonHref}
                  className={`w-full mb-6 py-3 px-4 text-base font-semibold rounded-xl text-center transition-all block ${
                    plan.popular
                      ? "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-300 hover:shadow-blue-400 hover:from-blue-400 hover:to-blue-600"
                      : "bg-gradient-to-b from-gray-800 to-gray-950 text-white shadow-lg shadow-gray-400 hover:from-gray-700 hover:to-gray-900"
                  }`}
                >
                  {plan.buttonText}
                </Link>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="text-blue-600 flex-shrink-0">{feature.icon}</span>
                      <span className="text-sm text-gray-600">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-gray-200 pt-5 mt-auto space-y-2.5">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">{plan.includes[0]}</h4>
                  <ul className="space-y-2">
                    {plan.includes.slice(1).map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <span className="h-5 w-5 bg-green-50 border border-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        </span>
                        <span className="text-sm text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>

      {/* Bottom trust note */}
      <TimelineContent
        as="p"
        animationNum={8}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="text-center text-gray-400 text-sm mt-10 relative z-10"
      >
        Alle Pläne beinhalten DSGVO-konformen Datenschutz · Keine versteckten Kosten · Jederzeit kündbar
      </TimelineContent>
    </div>
  );
}
