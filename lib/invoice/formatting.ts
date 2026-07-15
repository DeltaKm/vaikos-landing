/**
 * Formats a numeric amount using European style (comma as decimal
 * separator, dot as thousands separator) with the currency symbol/code
 * appended, e.g. "100,00 €".
 */
export function formatMoney(amount: number, currency: string): string {
  const formattedNumber = new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  const symbol = currencySymbol(currency);
  return `${formattedNumber} ${symbol}`;
}

function currencySymbol(currency: string): string {
  switch (currency.toUpperCase()) {
    case "EUR":
      return "€";
    case "USD":
      return "$";
    case "GBP":
      return "£";
    default:
      return currency.toUpperCase();
  }
}

/**
 * Formats an ISO date string (yyyy-mm-dd) as dd.mm.yyyy, matching the
 * reference invoice layout.
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
}
