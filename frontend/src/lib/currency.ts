export type CurrencyCode = "ZAR" | "USD" | "EUR" | "GBP";

const TIMEZONE_CURRENCY_MAP: Record<string, CurrencyCode> = {
  // South Africa
  "Africa/Johannesburg": "ZAR",

  // United Kingdom
  "Europe/London": "GBP",
  "Europe/Belfast": "GBP",
  "Europe/Jersey": "GBP",
  "Europe/Guernsey": "GBP",
  "Europe/Isle_of_Man": "GBP",

  // Eurozone
  "Europe/Berlin": "EUR",
  "Europe/Paris": "EUR",
  "Europe/Amsterdam": "EUR",
  "Europe/Brussels": "EUR",
  "Europe/Vienna": "EUR",
  "Europe/Rome": "EUR",
  "Europe/Madrid": "EUR",
  "Europe/Lisbon": "EUR",
  "Europe/Dublin": "EUR",
  "Europe/Helsinki": "EUR",
  "Europe/Athens": "EUR",
  "Europe/Tallinn": "EUR",
  "Europe/Riga": "EUR",
  "Europe/Vilnius": "EUR",
  "Europe/Luxembourg": "EUR",
  "Europe/Malta": "EUR",
  "Europe/Bratislava": "EUR",
  "Europe/Ljubljana": "EUR",
  "Europe/Nicosia": "EUR",
};

export const PRICES: Record<
  CurrencyCode,
  { starter: { monthly: number; annual: number }; pro: { monthly: number; annual: number } }
> = {
  ZAR: { starter: { monthly: 99, annual: 990 }, pro: { monthly: 249, annual: 2490 } },
  USD: { starter: { monthly: 6, annual: 55 }, pro: { monthly: 14, annual: 139 } },
  EUR: { starter: { monthly: 5, annual: 50 }, pro: { monthly: 13, annual: 129 } },
  GBP: { starter: { monthly: 4, annual: 42 }, pro: { monthly: 11, annual: 109 } },
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  ZAR: "R",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function detectCurrency(): CurrencyCode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_CURRENCY_MAP[tz] ?? "USD";
  } catch {
    return "USD";
  }
}
