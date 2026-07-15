import { describe, expect, it } from "vitest";
import { invoiceFormSchema } from "@/lib/invoice/schema";

function validInput() {
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
  };
}

describe("invoiceFormSchema - date validation", () => {
  it("accepts a due date on or after the invoice date", () => {
    const result = invoiceFormSchema.safeParse(validInput());
    expect(result.success).toBe(true);
  });

  it("rejects a due date before the invoice date", () => {
    const input = { ...validInput(), dueDate: "2026-08-01" };
    const result = invoiceFormSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid date string", () => {
    const input = { ...validInput(), invoiceDate: "not-a-date" };
    const result = invoiceFormSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("invoiceFormSchema - reverse charge", () => {
  it("requires customer VAT ID when reverse charge is active", () => {
    const input = { ...validInput(), customer: { ...validInput().customer, vatId: "" } };
    const result = invoiceFormSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("does not require VAT ID when reverse charge is disabled", () => {
    const input = {
      ...validInput(),
      reverseCharge: false,
      vatRatePercent: 22,
      customer: { ...validInput().customer, vatId: "" },
    };
    const result = invoiceFormSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});

describe("invoiceFormSchema - required fields", () => {
  it("rejects an empty invoice number", () => {
    const input = { ...validInput(), invoiceNumber: "" };
    expect(invoiceFormSchema.safeParse(input).success).toBe(false);
  });

  it("rejects when there are no items", () => {
    const input = { ...validInput(), items: [] };
    expect(invoiceFormSchema.safeParse(input).success).toBe(false);
  });

  it("rejects a negative unit price", () => {
    const input = {
      ...validInput(),
      items: [{ description: "A", quantity: 1, unit: "pcs", unitPrice: -5 }],
    };
    expect(invoiceFormSchema.safeParse(input).success).toBe(false);
  });

  it("rejects a zero quantity", () => {
    const input = {
      ...validInput(),
      items: [{ description: "A", quantity: 0, unit: "pcs", unitPrice: 5 }],
    };
    expect(invoiceFormSchema.safeParse(input).success).toBe(false);
  });
});
