import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Matti</span>
          </div>
          <nav className="flex gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Demo starten
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-4 py-2 text-sm font-medium mb-8">
            <span>✨</span>
            <span>Kein Papierbon mehr – alles digital</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Deine Ausgaben.
            <br />
            <span className="text-blue-600">Alle Kassenbons digital.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Tippe an der Kasse kurz mit dem Handy auf das NFC-Terminal – und
            dein Kassenbon landet sofort in der App. Kein Papier, keine
            Unordnung, alles auf einen Blick.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              App ausprobieren →
            </Link>
            <Link
              href="/pos"
              className="bg-white text-gray-700 border border-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors"
            >
              Händler-Terminal
            </Link>
          </div>
        </div>
      </section>

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
      <section className="px-6 py-16">
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
        <Link
          href="/dashboard"
          className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors inline-block"
        >
          Demo starten →
        </Link>
      </section>

      <footer className="bg-white border-t border-gray-200 px-6 py-6 text-center text-sm text-gray-500">
        © 2026 Matti – Digitale Kassenbons
      </footer>
    </main>
  );
}
