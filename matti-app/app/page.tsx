import Link from "next/link";
import { HeroSection } from "@/components/blocks/hero-section-1";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* How it works */}
      <section className="bg-white border-t border-gray-200 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">So funktioniert es</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🏪",
                title: "1. Laden stellt NFC bereit",
                desc: "An jeder Kasse befindet sich ein NFC-Terminal oder QR-Code. Direkt in die Kassensoftware integriert.",
              },
              {
                icon: "📱",
                title: "2. Handy antippen",
                desc: "Du tippst dein Smartphone kurz ans Terminal. Der Bon wird sofort deinem Matti-Konto zugeordnet.",
              },
              {
                icon: "📊",
                title: "3. Ausgaben im Blick",
                desc: "Alle Bons sind digital gespeichert – kategorisiert, durchsuchbar, für immer abrufbar.",
              },
            ].map((s) => (
              <div key={s.title} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{s.icon}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: "🧾", title: "Digitale Kassenbons", desc: "Alle Bons werden sicher in der Cloud gespeichert – für immer abrufbar." },
              { icon: "📈", title: "Ausgaben-Analyse", desc: "Wofür gibst du dein Geld aus? Kategorisiert und visualisiert." },
              { icon: "🔍", title: "Schnelle Suche", desc: "Finde jeden Bon in Sekunden – nach Laden, Datum oder Produktname." },
              { icon: "🏷️", title: "Automatische Kategorien", desc: "Lebensmittel, Drogerie, Technik – Matti erkennt die Kategorie automatisch." },
              { icon: "📲", title: "NFC & QR-Transfer", desc: "An der Kasse einfach antippen oder QR-Code scannen – fertig." },
              { icon: "🌱", title: "Nachhaltiger", desc: "Kein Thermopapier mehr. Gut für dich, gut für die Umwelt." },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 bg-white rounded-xl p-5 border border-gray-200">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-gray-600 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 px-6 py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Bereit loszulegen?</h2>
        <p className="text-blue-100 mb-8 text-lg">
          Probiere die Demo direkt im Browser aus – keine Installation nötig.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors inline-block"
          >
            Demo starten →
          </Link>
          <Link
            href="/register"
            className="bg-blue-500 border border-blue-400 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-400 transition-colors inline-block"
          >
            Als Händler registrieren
          </Link>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 px-6 py-6 text-center text-sm text-gray-500">
        © 2026 Matti – Digitale Kassenbons
      </footer>
    </>
  );
}
