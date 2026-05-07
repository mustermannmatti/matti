import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Smartphone, Search } from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="bg-gray-50 py-16 md:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:max-w-5xl">
        <div className="text-center mb-14">
          <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Features</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2">Alles was du brauchst</h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Tappr ist mehr als nur ein Bon-Speicher – dein digitales Ausgaben-Cockpit.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-6 gap-3">

          {/* Card 1: 100% Papierlos */}
          <Card className="relative col-span-full flex overflow-hidden lg:col-span-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-default">
            <CardContent className="relative m-auto size-fit pt-6">
              <div className="relative flex h-24 w-56 items-center">
                <svg
                  className="text-blue-100 absolute inset-0 size-full"
                  viewBox="0 0 254 104"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="mx-auto block w-fit text-5xl font-semibold text-blue-600">100%</span>
              </div>
              <h2 className="mt-6 text-center text-3xl font-semibold text-gray-900">Papierlos</h2>
              <p className="mt-2 text-center text-sm text-gray-500">Kein Thermopapier mehr – gut für dich und die Umwelt.</p>
            </CardContent>
          </Card>

          {/* Card 2: Sicher & verschlüsselt */}
          <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-default">
            <CardContent className="pt-6">
              <div className="relative mx-auto flex aspect-square size-32 rounded-full border border-blue-100 before:absolute before:-inset-2 before:rounded-full before:border before:border-blue-50">
                <div className="m-auto flex flex-col items-center gap-1">
                  <Shield className="size-10 text-blue-600" strokeWidth={1.5} />
                </div>
              </div>
              <div className="relative z-10 mt-6 space-y-2 text-center">
                <h2 className="text-lg font-semibold text-gray-900">Sicher verschlüsselt</h2>
                <p className="text-sm text-gray-500">
                  Alle Kassenbons werden DSGVO-konform gespeichert. Deine Daten gehören nur dir.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: NFC & QR – per Antippen */}
          <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-default">
            <CardContent className="pt-6">
              <div className="pt-6 lg:px-6">
                {/* Stylized wave chart representing instant transfer */}
                <svg className="w-full text-blue-600" viewBox="0 0 386 123" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd" clipRule="evenodd"
                    d="M3 123C3 123 14.3298 94.153 35.1282 88.0957C55.9266 82.0384 65.9333 80.5508 65.9333 80.5508C65.9333 80.5508 80.699 80.5508 92.1777 80.5508C103.656 80.5508 100.887 63.5348 109.06 63.5348C117.233 63.5348 117.217 91.9728 124.78 91.9728C132.343 91.9728 142.264 78.03 153.831 80.5508C165.398 83.0716 186.825 91.9728 193.761 91.9728C200.697 91.9728 206.296 63.5348 214.07 63.5348C221.844 63.5348 238.653 93.7771 244.234 91.9728C249.814 90.1684 258.8 60 266.19 60C272.075 60 284.1 88.057 286.678 88.0957C294.762 88.2171 300.192 72.9284 305.423 72.9284C312.323 72.9284 323.377 65.2437 335.553 63.5348C347.729 61.8259 348.218 82.07 363.639 80.5508C367.875 80.1335 372.949 82.2017 376.437 87.1008C379.446 91.3274 381.054 97.4325 382.521 104.647C383.479 109.364 382.521 123 382.521 123"
                    fill="url(#tappr_grad)"
                  />
                  <path
                    className="text-blue-600"
                    d="M3 121.077C3 121.077 15.3041 93.6691 36.0195 87.756C56.7349 81.8429 66.6632 80.9723 66.6632 80.9723C66.6632 80.9723 80.0327 80.9723 91.4656 80.9723C102.898 80.9723 100.415 64.2824 108.556 64.2824C116.696 64.2824 117.693 92.1332 125.226 92.1332C132.759 92.1332 142.07 78.5115 153.591 80.9723C165.113 83.433 186.092 92.1332 193 92.1332C199.908 92.1332 205.274 64.2824 213.017 64.2824C220.76 64.2824 237.832 93.8946 243.39 92.1332C248.948 90.3718 257.923 60.5 265.284 60.5C271.145 60.5 283.204 87.7182 285.772 87.756C293.823 87.8746 299.2 73.0802 304.411 73.0802C311.283 73.0802 321.425 65.9506 333.552 64.2824C345.68 62.6141 346.91 82.4553 362.27 80.9723C377.629 79.4892 383 106.605 383 106.605"
                    stroke="currentColor" strokeWidth="3"
                  />
                  <defs>
                    <linearGradient id="tappr_grad" x1="3" y1="60" x2="3" y2="123" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#2563eb" stopOpacity="0.15" />
                      <stop offset="1" stopColor="#2563eb" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="relative z-10 mt-6 space-y-2 text-center">
                <h2 className="text-lg font-semibold text-gray-900">NFC & QR – in einer Sekunde</h2>
                <p className="text-sm text-gray-500">
                  Handy ans Terminal – fertig. Kein Scannen, kein Tippen, kein Warten.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Ausgaben-Analyse */}
          <Card className="relative col-span-full overflow-hidden lg:col-span-3 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-default">
            <CardContent className="grid pt-6 sm:grid-cols-2">
              <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                <div className="relative flex aspect-square size-12 rounded-full border border-gray-200 before:absolute before:-inset-2 before:rounded-full before:border before:border-gray-100">
                  <Search className="m-auto size-5 text-blue-600" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">Ausgaben auf einen Blick</h2>
                  <p className="text-sm text-gray-500">
                    Sieh genau, wofür du dein Geld ausgibst – nach Kategorie, Datum oder Laden sortiert.
                  </p>
                </div>
              </div>
              <div className="relative mt-6 before:absolute before:inset-0 before:mx-auto before:w-px before:bg-gray-100 sm:-my-6 sm:-mr-6">
                <div className="relative flex h-full flex-col justify-center space-y-3 py-6 px-6">
                  {[
                    { label: "Lebensmittel", pct: 72, color: "bg-green-400", amount: "87,21 €" },
                    { label: "Drogerie", pct: 28, color: "bg-pink-400", amount: "18,45 €" },
                    { label: "Technik", pct: 50, color: "bg-blue-400", amount: "129,00 €" },
                    { label: "Restaurant", pct: 35, color: "bg-orange-400", amount: "44,90 €" },
                  ].map((c) => (
                    <div key={c.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">{c.label}</span>
                        <span className="text-gray-400">{c.amount}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div className={`h-1.5 rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Für Händler & Kunden */}
          <Card className="relative col-span-full overflow-hidden lg:col-span-3 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-default">
            <CardContent className="grid h-full pt-6 sm:grid-cols-2">
              <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                <div className="relative flex aspect-square size-12 rounded-full border border-gray-200 before:absolute before:-inset-2 before:rounded-full before:border before:border-gray-100">
                  <Users className="m-auto size-6 text-blue-600" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">Für Händler & Kunden</h2>
                  <p className="text-sm text-gray-500">
                    Händler stellen Bons digital aus. Kunden empfangen sie sofort – beide profitieren.
                  </p>
                </div>
              </div>
              <div className="before:bg-gray-100 relative mt-6 before:absolute before:inset-0 before:mx-auto before:w-px sm:-my-6 sm:-mr-6">
                <div className="relative flex h-full flex-col justify-center space-y-6 py-6">
                  <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                    <span className="block h-fit rounded border border-gray-200 bg-white px-2 py-1 text-xs shadow-sm text-gray-600">
                      REWE Frankfurt
                    </span>
                    <div className="ring-white size-8 ring-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-700 font-bold text-xs">🛒</span>
                    </div>
                  </div>
                  <div className="relative ml-[calc(50%-1rem)] flex items-center gap-2">
                    <div className="ring-white size-8 ring-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 font-bold text-xs">👤</span>
                    </div>
                    <span className="block h-fit rounded border border-gray-200 bg-white px-2 py-1 text-xs shadow-sm text-gray-600">
                      34,87 € gespeichert
                    </span>
                  </div>
                  <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                    <span className="block h-fit rounded border border-gray-200 bg-white px-2 py-1 text-xs shadow-sm text-gray-600">
                      dm-drogerie markt
                    </span>
                    <div className="ring-white size-8 ring-4 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-pink-700 font-bold text-xs">🧴</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
}
