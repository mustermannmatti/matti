import Link from "next/link";
import { HeroSection } from "@/components/blocks/hero-section-1";
import { FeaturesSection } from "@/components/blocks/features-section";
import { TestimonialsSection } from "@/components/blocks/testimonials-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* So funktioniert es */}
      <section id="how-it-works" className="bg-white px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Einfach & schnell</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">In 3 Schritten zum digitalen Bon</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">Kein Aufwand, keine App-Öffnung nötig – einfach antippen und fertig.</p>
          </div>
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  step: "01",
                  icon: "🏪",
                  title: "Kassenbon wird erstellt",
                  desc: "Der Händler erstellt den Bon digital im Tappr-Terminal – QR-Code und NFC werden automatisch generiert.",
                  color: "bg-blue-50 border-blue-200",
                  iconBg: "bg-blue-100",
                },
                {
                  step: "02",
                  icon: "📲",
                  title: "Handy antippen oder scannen",
                  desc: "Du hältst dein Smartphone kurz ans NFC-Terminal oder scannst den QR-Code – dauert eine Sekunde.",
                  color: "bg-purple-50 border-purple-200",
                  iconBg: "bg-purple-100",
                },
                {
                  step: "03",
                  icon: "✅",
                  title: "Bon landet in der App",
                  desc: "Sofort gespeichert, kategorisiert und in deiner Ausgaben-Übersicht sichtbar. Kein Papier, kein Chaos.",
                  color: "bg-green-50 border-green-200",
                  iconBg: "bg-green-100",
                },
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center text-center">
                  <div className={`relative w-24 h-24 rounded-2xl flex items-center justify-center border-2 mb-6 ${s.color}`}>
                    <span className="text-4xl">{s.icon}</span>
                    <span className="absolute -top-3 -right-3 w-7 h-7 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FeaturesSection />

      <TestimonialsSection />

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-20 text-center text-white">
        <h2 className="text-4xl font-bold mb-4">Bereit für papierlose Bons?</h2>
        <p className="text-blue-100 mb-10 text-lg max-w-xl mx-auto">
          Probiere Tappr kostenlos aus – keine Kreditkarte, keine Installation nötig.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors inline-block"
          >
            App ausprobieren →
          </Link>
          <Link
            href="/register"
            className="bg-blue-500 border border-blue-400 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-400 transition-colors inline-block"
          >
            Als Händler registrieren
          </Link>
        </div>
      </section>

      <footer className="bg-gray-950 border-t border-gray-800 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">T</span>
            </div>
            <span className="font-bold text-white">Tappr</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 Tappr – Digitale Kassenbons</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/pricing" className="hover:text-white transition-colors">Preise</Link>
            <Link href="/login" className="hover:text-white transition-colors">Anmelden</Link>
            <Link href="/register" className="hover:text-white transition-colors">Registrieren</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
