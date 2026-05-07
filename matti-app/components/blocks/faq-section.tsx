"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    category: "Für Kunden",
    items: [
      {
        q: "Muss ich eine App installieren?",
        a: "Nein. Du hältst dein Smartphone einfach ans NFC-Terminal oder scannst den QR-Code – der Bon öffnet sich direkt im Browser. Für die Ausgaben-Übersicht gibt es ein optionales Konto.",
      },
      {
        q: "Wie funktioniert der QR-Code?",
        a: "Beim Bezahlen wird auf dem Kundendisplay ein QR-Code angezeigt. Du scannst ihn mit der Kamera-App deines Smartphones – fertig. Du wirst direkt auf deinen digitalen Kassenbon weitergeleitet.",
      },
      {
        q: "Wo werden meine Kassenbons gespeichert?",
        a: "Mit einem kostenlosen Konto werden alle deine Bons in deinem persönlichen Dashboard gespeichert – sortiert, kategorisiert und jederzeit abrufbar. Ohne Konto ist der Bon nur über den direkten Link zugänglich.",
      },
      {
        q: "Ist Tappr kostenlos für Kunden?",
        a: "Ja, für Kunden ist Tappr dauerhaft kostenlos – ohne Kreditkarte, ohne versteckte Kosten.",
      },
    ],
  },
  {
    category: "Für Händler",
    items: [
      {
        q: "Welche Kassensysteme werden unterstützt?",
        a: "Tappr funktioniert mit jedem System, das einen HTTP-Request senden kann – das sind praktisch alle modernen POS-Systeme (NCR, Diebold Nixdorf, Lightspeed, eigene Software u.v.m.). Über unsere REST-API lässt sich die Integration in wenigen Stunden umsetzen.",
      },
      {
        q: "Wie lange dauert die Integration?",
        a: "Die technische Integration dauert je nach POS-System 1–4 Stunden. Alles was dein Entwickler braucht ist ein API-Schlüssel und unser Endpunkt. Eine Schritt-für-Schritt-Anleitung findest du nach dem Login unter 'Händler starten'.",
      },
      {
        q: "Was passiert, wenn der Kunde keinen QR-Code scannt?",
        a: "Gar nichts – der Bon bleibt in unserem System gespeichert und kann über den direkten Link jederzeit abgerufen werden. Du kannst dem Kunden optional auch einen gedruckten QR auf einem Mini-Beleg mitgeben.",
      },
      {
        q: "Kann ich mehrere Kassen/Terminals verbinden?",
        a: "Ja. Du kannst für jede Kasse einen eigenen API-Schlüssel erstellen (z.B. 'Kasse 1', 'Kasse 2'). So siehst du genau, welche Transaktionen von welcher Kasse kommen.",
      },
      {
        q: "Unterstützt Tappr den DATEV-Export?",
        a: "Ja, im Händler-Plan ist der Steuer-Export für DATEV enthalten. Alle Belege werden DSGVO-konform gespeichert und können für die Buchhaltung exportiert werden.",
      },
    ],
  },
  {
    category: "Datenschutz & Sicherheit",
    items: [
      {
        q: "Ist Tappr DSGVO-konform?",
        a: "Ja. Alle Daten werden auf deutschen Servern gespeichert, verschlüsselt übertragen (TLS) und nicht an Dritte weitergegeben. Jeder Nutzer kann seine Daten jederzeit löschen.",
      },
      {
        q: "Wer kann meinen Kassenbon sehen?",
        a: "Nur du – über deinen persönlichen Link oder dein Tappr-Konto. Händler sehen nur, ob ein Bon eingelöst wurde, aber keine persönlichen Kundendaten ohne Einwilligung.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left py-4 gap-4"
      >
        <span className="font-medium text-gray-900 text-sm">{q}</span>
        <ChevronDown
          size={16}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="text-sm text-gray-600 leading-relaxed pb-4">{a}</p>
      )}
    </div>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="bg-gray-50 px-6 py-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">FAQ</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Häufige Fragen</h2>
          <p className="text-gray-500">Alles was du über Tappr wissen musst.</p>
        </div>

        <div className="space-y-8">
          {faqs.map((group) => (
            <div key={group.category}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
                {group.category}
              </h3>
              <div className="bg-white rounded-2xl border border-gray-200 px-6">
                {group.items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
