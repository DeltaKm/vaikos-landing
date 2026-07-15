export interface InvoiceLineItemInput {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface InvoiceCustomerInput {
  name: string;
  addressLines: string[];
  postalCode: string;
  city: string;
  country: string;
  vatId: string;
}

export interface InvoiceFormInput {
  invoiceNumber: string;
  invoiceDate: string; // ISO date string (yyyy-mm-dd)
  dueDate: string; // ISO date string (yyyy-mm-dd)
  currency: string;
  reverseCharge: boolean;
  vatRatePercent: number; // used only when reverseCharge is false
  note: string;
  customer: InvoiceCustomerInput;
  items: InvoiceLineItemInput[];
}

export interface InvoiceLineItemCalculated extends InvoiceLineItemInput {
  totalExclVat: number;
}

export interface InvoiceTotals {
  subtotal: number;
  vatAmount: number;
  total: number;
  vatRatePercent: number;
  reverseCharge: boolean;
}

export interface InvoiceCalculated {
  items: InvoiceLineItemCalculated[];
  totals: InvoiceTotals;
}
