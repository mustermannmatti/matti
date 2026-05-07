import Link from "next/link";
import { SiteNav } from "@/components/layout/site-nav";

const steps = [
  {
    number: "01",
    title: "Händler-Konto erstellen",
    color: "bg-blue-50 border-blue-200 text-blue-700",
    badge: "bg-blue-600",
    items: [
      'Gehe zu tappr.app/register und wähle "Händler"',
      "Gib deinen Namen, E-Mail und ein sicheres Passwort ein",
      "Trage deinen Ladennamen, Adresse und Steuer-ID (USt-IdNr.) ein",
      'Klicke auf "Händler registrieren" – fertig',
    ],
    note: null,
  },
  {
    number: "02",
    title: "Einloggen & Terminal aufrufen",
    color: "bg-purple-50 border-purple-200 text-purple-700",
    badge: "bg-purple-600",
    items: [
      "Melde dich mit deiner E-Mail und deinem Passwort an",
      "Du wirst automatisch zu deinem Händler-Terminal weitergeleitet",
      "Dort siehst du oben deinen Laden – nur dein eigener ist sichtbar",
    ],
    note: null,
  },
  {
    number: "03",
    title: "API-Schlüssel erstellen (für POS-Integration)",
    color: "bg-orange-50 border-orange-200 text-orange-700",
    badge: "bg-orange-500",
    items: [
      'Klicke im Terminal oben auf den Tab "API-Schlüssel"',
      'Gib einen Namen ein, z.B. "Kasse 1" oder "Hauptkasse"',
      'Klicke auf "Erstellen" – dein API-Schlüssel wird generiert',
      "Kopiere den Schlüssel und speichere ihn sicher",
    ],
    note: "⚠️ Der Schlüssel wird nur einmal vollständig angezeigt. Kopiere ihn sofort.",
  },
  {
    number: "04",
    title: "POS-System verbinden",
    color: "bg-green-50 border-green-200 text-green-700",
    badge: "bg-green-600",
    items: [
      "Dein Kassensystem sendet nach jeder Transaktion einen HTTP-Request an Tappr",
      "Tappr erstellt den digitalen Bon und gibt dir eine QR-Code-URL zurück",
      "Diese URL zeigst du auf dem Kundendisplay an",
      "Der Kunde scannt den QR-Code mit dem Handy – Bon ist gespeichert",
    ],
    note: null,
  },
  {
    number: "05",
    title: "Ersten Bon manuell testen",
    color: "bg-gray-50 border-gray-200 text-gray-700",
    badge: "bg-gray-600",
    items: [
      "Gehe zum Terminal-Tab im POS",
      "Wähle eine Kategorie und füge Artikel hinzu",
      'Klicke auf "Bon ausstellen"',
      "Ein QR-Code erscheint – scanne ihn mit deinem Handy zum Testen",
    ],
    note: null,
  },
];

const codeExample = `POST https://tappr.app/api/v1/receipts
Authorization: Bearer DEIN_API_SCHLÜSSEL
Content-Type: application/json

{
  "items": [
    { "name": "Milch 1L",  "quantity": 2, "price": 1.29 },
    { "name": "Brot 750g", "quantity": 1, "price": 2.49 }
  ],
  "category": "Lebensmittel",
  "transactionId": "KASSE-00123"
}`;

const codeResponse = `{
  "receiptId": "clx...",
  "claimUrl": "https://tappr.app/claim/abc123",
  "qrDataUrl": "data:image/png;base64,...",
  "total": 5.84
}`;

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav />

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Händler-Onboarding</span>
          <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
            In 5 Schritten startklar
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Von der Registrierung bis zum ersten digitalen Kassenbon — alles in unter 10 Minuten.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-16">
          {steps.map((step) => (
            <div key={step.number} className={`rounded-2xl border-2 p-6 ${step.color}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 ${step.badge} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold text-sm">{step.number}</span>
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-gray-900 text-lg mb-3">{step.title}</h2>
                  <ul className="space-y-2">
                    {step.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {step.note && (
                    <p className="mt-3 text-sm font-medium text-orange-700 bg-orange-100 rounded-lg px-3 py-2">
                      {step.note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* API Reference */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-8">
          <h2 className="text-white font-bold text-xl mb-2">API-Referenz</h2>
          <p className="text-gray-400 text-sm mb-6">
            Dein POS-System sendet nach jeder Transaktion diesen Request. Die Antwort enthält
            den QR-Code als Bild-URL zum direkten Anzeigen auf dem Kundendisplay.
          </p>

          <div className="mb-4">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Request</p>
            <pre className="bg-gray-800 rounded-xl p-4 text-sm text-green-400 overflow-x-auto whitespace-pre-wrap">
              {codeExample}
            </pre>
          </div>

          <div>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Antwort</p>
            <pre className="bg-gray-800 rounded-xl p-4 text-sm text-blue-300 overflow-x-auto whitespace-pre-wrap">
              {codeResponse}
            </pre>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              { field: "items", desc: "Array mit name, quantity, price (Pflicht)" },
              { field: "category", desc: "Lebensmittel, Drogerie, Technik … (optional)" },
              { field: "taxRate", desc: "Standard: 0.19 – für 7% MwSt. → 0.07 (optional)" },
              { field: "transactionId", desc: "Deine interne Transaktions-ID (optional)" },
            ].map(({ field, desc }) => (
              <div key={field} className="bg-gray-800 rounded-lg p-3">
                <code className="text-yellow-400 text-xs">{field}</code>
                <p className="text-gray-400 text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Bereit loszulegen?</h2>
          <p className="text-blue-100 mb-6">Erstelle jetzt dein Händler-Konto – kostenlos für den ersten Monat.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Jetzt registrieren →
            </Link>
            <Link
              href="/pos"
              className="bg-blue-500 border border-blue-400 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-400 transition-colors"
            >
              Zum Terminal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
