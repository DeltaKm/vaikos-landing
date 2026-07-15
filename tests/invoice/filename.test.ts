import { describe, expect, it } from "vitest";
import { buildInvoiceFilename, sanitizeFilenamePart } from "@/lib/invoice/filename";

describe("sanitizeFilenamePart", () => {
  it("replaces spaces with dashes", () => {
    expect(sanitizeFilenamePart("LEGENDA Kft.")).toBe("LEGENDA-Kft");
  });

  it("strips accents and special characters", () => {
    expect(sanitizeFilenamePart("Café / Société S.à r.l.")).toBe("Cafe-Societe-Sa-rl");
  });

  it("collapses consecutive dashes", () => {
    expect(sanitizeFilenamePart("A   B---C")).toBe("A-B-C");
  });
});

describe("buildInvoiceFilename", () => {
  it("builds the expected filename pattern", () => {
    expect(buildInvoiceFilename("1", "LEGENDA Kft.")).toBe("Invoice-1-LEGENDA-Kft.pdf");
  });

  it("falls back to safe defaults when parts are empty", () => {
    expect(buildInvoiceFilename("", "")).toBe("Invoice-0-customer.pdf");
  });
});
