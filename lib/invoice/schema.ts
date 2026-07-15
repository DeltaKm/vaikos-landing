import { z } from "zod";

const isoDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Data non valida",
  });

export const invoiceLineItemSchema = z.object({
  description: z.string().trim().min(1, "La descrizione è obbligatoria"),
  quantity: z.number({ message: "Quantità non valida" }).gt(0, "La quantità deve essere maggiore di zero"),
  unit: z.string().trim().min(1, "L'unità è obbligatoria"),
  unitPrice: z.number({ message: "Prezzo non valido" }).min(0, "Il prezzo non può essere negativo"),
});

export const invoiceCustomerSchema = z.object({
  name: z.string().trim().min(1, "La ragione sociale del cliente è obbligatoria"),
  addressLines: z
    .array(z.string().trim())
    .min(1, "L'indirizzo del cliente è obbligatorio")
    .refine((lines) => lines.some((line) => line.length > 0), {
      message: "L'indirizzo del cliente è obbligatorio",
    }),
  postalCode: z.string().trim().min(1, "Il CAP è obbligatorio"),
  city: z.string().trim().min(1, "La città è obbligatoria"),
  country: z.string().trim().min(1, "Il paese è obbligatorio"),
  vatId: z.string().trim(),
});

export const invoiceFormSchema = z
  .object({
    invoiceNumber: z.string().trim().min(1, "Il numero fattura è obbligatorio"),
    invoiceDate: isoDateSchema,
    dueDate: isoDateSchema,
    currency: z.string().trim().min(1, "La valuta è obbligatoria"),
    reverseCharge: z.boolean(),
    vatRatePercent: z
      .number({ message: "Aliquota IVA non valida" })
      .min(0, "L'aliquota IVA non può essere negativa")
      .max(100, "L'aliquota IVA non può superare il 100%"),
    note: z.string().trim(),
    customer: invoiceCustomerSchema,
    items: z.array(invoiceLineItemSchema).min(1, "Aggiungi almeno una riga alla fattura"),
  })
  .refine((data) => new Date(data.dueDate).getTime() >= new Date(data.invoiceDate).getTime(), {
    message: "La scadenza non può precedere la data della fattura",
    path: ["dueDate"],
  })
  .refine(
    (data) => !data.reverseCharge || data.customer.vatId.trim().length > 0,
    {
      message: "La VAT ID del cliente è obbligatoria quando il Reverse Charge è attivo",
      path: ["customer", "vatId"],
    }
  );

export type InvoiceFormSchema = z.infer<typeof invoiceFormSchema>;
