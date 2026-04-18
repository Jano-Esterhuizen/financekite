import { useState, useEffect } from "react";
import { type CurrencyCode, detectCurrency, PRICES, CURRENCY_SYMBOLS } from "@/lib/currency";

export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  useEffect(() => {
    setCurrency(detectCurrency());
  }, []);

  return {
    currency,
    prices: PRICES[currency],
    symbol: CURRENCY_SYMBOLS[currency],
  };
}
