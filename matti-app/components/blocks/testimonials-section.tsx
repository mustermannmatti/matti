"use client";

import { useRef } from "react";
import { TestimonialsColumn, type Testimonial } from "@/components/ui/testimonials-columns-1";
import { TimelineContent } from "@/components/ui/timeline-animation";

const firstColumn: Testimonial[] = [
  {
    text: "Seit wir Tappr einsetzen, haben wir keine Papierbons mehr. Die Kunden sind begeistert – einfach Handy antippen und fertig. Spart uns auch richtig Zeit an der Kasse.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=markus&backgroundColor=b6e3f4",
    name: "Markus Feilhauer",
    role: "Inhaber, Bäckerei Feilhauer",
  },
  {
    text: "Ich habe endlich den Überblick über meine Ausgaben. Tappr kategorisiert alles automatisch – ich sehe auf einen Blick, wieviel ich im Monat für Lebensmittel ausgebe.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=lena&backgroundColor=ffd5dc",
    name: "Lena Schubert",
    role: "Kundin, München",
  },
  {
    text: "Als Restaurantbetreiber schätze ich, dass Tappr uns echte Kunden-Einblicke gibt. Wir sehen, was gut ankommt und können unser Angebot anpassen.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=ibrahim&backgroundColor=c0aede",
    name: "Ibrahim Yildiz",
    role: "Betreiber, Restaurant Bosphorus",
  },
];

const secondColumn: Testimonial[] = [
  {
    text: "Kein Kassenbon-Chaos mehr in meiner Handtasche! Alle Einkäufe sind digital gespeichert und ich kann sie jederzeit nachschauen. Genial einfach.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=sarah&backgroundColor=d1f4e0",
    name: "Sarah Meier",
    role: "Kundin, Hamburg",
  },
  {
    text: "Die Integration war in einer Stunde erledigt. Unser Team brauchte keine Schulung – Tappr ist selbsterklärend. Unsere Kunden fragen mittlerweile aktiv danach.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=tobias&backgroundColor=b6e3f4",
    name: "Tobias Richter",
    role: "Filialleiter, Sport-Richter GmbH",
  },
  {
    text: "Der Steuer-Export nach DATEV hat mir beim letzten Jahresabschluss Stunden gespart. Das allein ist den Händler-Plan wert.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=claudia&backgroundColor=ffd5dc",
    name: "Claudia Baumann",
    role: "Selbstständige Unternehmerin, Köln",
  },
];

const thirdColumn: Testimonial[] = [
  {
    text: "Ich bin Student und nutze Tappr, um mein Budget im Blick zu behalten. Die Ausgaben-Analyse zeigt mir genau, wo ich zu viel ausgebe – super praktisch.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=felix&backgroundColor=c0aede",
    name: "Felix Wagner",
    role: "Student, Berlin",
  },
  {
    text: "Wir haben Tappr in unserem Modegeschäft eingeführt und merken, dass die Retourenquote gesunken ist. Kunden können ihren Bon nicht mehr verlieren.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=petra&backgroundColor=d1f4e0",
    name: "Petra Hoffmann",
    role: "Inhaberin, Boutique Stil & Mehr",
  },
  {
    text: "Endlich keine zerknitterten Bons mehr in der Hosentasche. Tappr empfängt alles per NFC – ich halte kurz mein Handy dran und bin fertig. Das ist 2026.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=nico&backgroundColor=b6e3f4",
    name: "Nico Brandt",
    role: "Kunde, Frankfurt",
  },
];

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      className="bg-white px-6 py-24 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <TimelineContent
            as="p"
            animationNum={0}
            timelineRef={sectionRef}
            className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3"
          >
            Kundenstimmen
          </TimelineContent>
          <TimelineContent
            as="h2"
            animationNum={1}
            timelineRef={sectionRef}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Was unsere Nutzer sagen
          </TimelineContent>
          <TimelineContent
            as="p"
            animationNum={2}
            timelineRef={sectionRef}
            className="text-gray-500 text-base max-w-xl mx-auto"
          >
            Von Stammkunden bis Händlern – Tappr begeistert beide Seiten des Kassenbons.
          </TimelineContent>
        </div>

        <div className="flex gap-6 justify-center [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[600px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={18} />
          <TestimonialsColumn
            testimonials={secondColumn}
            duration={22}
            className="hidden md:block"
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            duration={16}
            className="hidden lg:block"
          />
        </div>
      </div>
    </section>
  );
}
