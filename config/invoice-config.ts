import { z } from "zod";

const companySchema = z.object({
  name: z.string().min(1),
  addressLine1: z.string().min(1),
  postalCode: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  registrationNumber: z.string().min(1),
  vatId: z.string().min(1),
});

const bankSchema = z.object({
  name: z.string().min(1),
  iban: z.string().min(1),
  bic: z.string().min(1),
});

const reverseChargeSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
});

const invoiceConfigSchema = z.object({
  company: companySchema,
  bank: bankSchema,
  currency: z.string().min(1),
  defaultUnit: z.string().min(1),
  reverseCharge: reverseChargeSchema,
});

export type InvoiceCompanyConfig = z.infer<typeof companySchema>;
export type InvoiceBankConfig = z.infer<typeof bankSchema>;
export type InvoiceReverseChargeConfig = z.infer<typeof reverseChargeSchema>;
export type InvoiceConfig = z.infer<typeof invoiceConfigSchema>;

/**
 * Fixed company data for invoice generation.
 *
 * These fields do not change per invoice and are NOT editable through the
 * invoice form. To update them, edit this file directly and redeploy.
 */
const rawInvoiceConfig: InvoiceConfig = {
  company: {
    name: "vaikos OÜ",
    addressLine1: "Tuukri 19 - 202",
    postalCode: "10120",
    city: "Tallinn",
    country: "Estonia",
    registrationNumber: "17527645",
    vatId: "EE102995547",
  },
  bank: {
    name: "Revolut",
    iban: "LT393250001374763295",
    bic: "REVOLT21",
  },
  currency: "EUR",
  defaultUnit: "pcs",
  reverseCharge: {
    title: "Reverse Charge:",
    text: "This supply is subject to the reverse charge mechanism according to Article 196 of Council Directive 2006/112/EC. The customer is liable to account for VAT in the customer's country.",
  },
};

// Fail fast at startup if the fixed configuration is malformed.
export const invoiceConfig: InvoiceConfig = invoiceConfigSchema.parse(rawInvoiceConfig);
