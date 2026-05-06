import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

const CATEGORIES: Record<
  string,
  { icon: string; bg: string; badge: string }
> = {
  Lebensmittel: {
    icon: "🛒",
    bg: "bg-green-100",
    badge: "bg-green-100 text-green-700",
  },
  Drogerie: {
    icon: "🧴",
    bg: "bg-pink-100",
    badge: "bg-pink-100 text-pink-700",
  },
  Technik: {
    icon: "💻",
    bg: "bg-blue-100",
    badge: "bg-blue-100 text-blue-700",
  },
  Restaurant: {
    icon: "🍽️",
    bg: "bg-orange-100",
    badge: "bg-orange-100 text-orange-700",
  },
  Kleidung: {
    icon: "👕",
    bg: "bg-purple-100",
    badge: "bg-purple-100 text-purple-700",
  },
  Sonstiges: {
    icon: "📦",
    bg: "bg-gray-100",
    badge: "bg-gray-100 text-gray-700",
  },
};

export function categoryColor(category: string) {
  return (
    CATEGORIES[category] ?? {
      icon: "📦",
      bg: "bg-gray-100",
      badge: "bg-gray-100 text-gray-700",
    }
  );
}
