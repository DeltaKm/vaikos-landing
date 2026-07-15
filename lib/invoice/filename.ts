/**
 * Builds a safe PDF filename from the invoice number and customer name,
 * e.g. "Invoice-1-LEGENDA-Kft.pdf".
 *
 * Sanitization rules:
 * - Only alphanumeric characters, dashes and underscores are kept.
 * - Whitespace is converted to dashes.
 * - Any other character (accents, punctuation, slashes, etc.) is stripped.
 * - Consecutive dashes are collapsed.
 */
export function sanitizeFilenamePart(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildInvoiceFilename(invoiceNumber: string, customerName: string): string {
  const safeNumber = sanitizeFilenamePart(invoiceNumber) || "0";
  const safeCustomer = sanitizeFilenamePart(customerName) || "customer";
  return `Invoice-${safeNumber}-${safeCustomer}.pdf`;
}
