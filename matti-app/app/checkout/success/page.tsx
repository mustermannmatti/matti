import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Zahlung erfolgreich!</h1>
        <p className="text-gray-500 mb-8">
          Dein Plan wurde aktiviert. Du hast jetzt Zugriff auf alle Features.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Zum Dashboard →
          </Link>
          <Link href="/" className="text-gray-500 text-sm hover:text-gray-700">
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
