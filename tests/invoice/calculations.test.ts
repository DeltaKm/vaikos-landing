import { describe, expect, it } from "vitest";
import { calculateInvoice, calculateLineTotal } from "@/lib/invoice/calculations";
import type { InvoiceFormInput } from "@/lib/invoice/types";

function baseInput(overrides: Partial<InvoiceFormInput> = {}): InvoiceFormInput {
  return {
    invoiceNumber: "1",
    invoiceDate: "2026-08-05",
    dueDate: "2026-08-20",
    currency: "EUR",
    reverseCharge: true,
    vatRatePercent: 0,
    note: "",
    customer: {
      name: "LEGENDA Kft.",
      addressLines: ["19-25 Vegyész utca"],
      postalCode: "1117",
      city: "Budapest",
      country: "Hungary",
      vatId: "HU10346406",
    },
    items: [{ description: "Affiliate commission services", quantity: 1, unit: "pcs", unitPrice: 100 }],
    ...overrides,
  };
}

describe("calculateLineTotal", () => {
  it("multiplies quantity by unit price", () => {
    expect(calculateLineTotal({ description: "x", quantity: 3, unit: "pcs", unitPrice: 10 })).toBe(30);
  });

  it("avoids floating point rounding errors", () => {
    expect(calculateLineTotal({ description: "x", quantity: 3, unit: "pcs", unitPrice: 0.1 })).toBe(0.3);
  });
});

describe("calculateInvoice - subtotal", () => {
  it("sums all line totals into the subtotal", () => {
    const input = baseInput({
      items: [
        { description: "A", quantity: 2, unit: "pcs", unitPrice: 10 },
        { description: "B", quantity: 1, unit: "pcs", unitPrice: 5.5 },
      ],
      reverseCharge: false,
      vatRatePercent: 0,
    });
    const result = calculateInvoice(input);
    expect(result.totals.subtotal).toBe(25.5);
  });
});

describe("calculateInvoice - reverse charge", () => {
  it("sets VAT to zero and total equal to subtotal when reverse charge is active", () => {
    const input = baseInput({ reverseCharge: true });
    const result = calculateInvoice(input);
    expect(result.totals.vatAmount).toBe(0);
    expect(result.totals.total).toBe(result.totals.subtotal);
    expect(result.totals.reverseCharge).toBe(true);
  });
});

describe("calculateInvoice - VAT", () => {
  it("computes VAT amount and total correctly for a given rate", () => {
    const input = baseInput({ reverseCharge: false, vatRatePercent: 22 });
    const result = calculateInvoice(input);
    expect(result.totals.subtotal).toBe(100);
    expect(result.totals.vatAmount).toBe(22);
    expect(result.totals.total).toBe(122);
  });

  it("rounds VAT amount to two decimal places", () => {
    const input = baseInput({
      reverseCharge: false,
      vatRatePercent: 21,
      items: [{ description: "A", quantity: 1, unit: "pcs", unitPrice: 33.33 }],
    });
    const result = calculateInvoice(input);
    expect(result.totals.vatAmount).toBe(7);
    expect(result.totals.total).toBe(40.33);
  });
});
