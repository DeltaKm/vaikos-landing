import Decimal from "decimal.js";
import type {
  InvoiceCalculated,
  InvoiceFormInput,
  InvoiceLineItemCalculated,
  InvoiceLineItemInput,
} from "./types";

Decimal.set({ rounding: Decimal.ROUND_HALF_UP });

/**
 * Rounds a Decimal value to 2 decimal places and returns a plain number.
 * Using decimal.js avoids classic floating point rounding errors
 * (e.g. 0.1 + 0.2 !== 0.3) when working with monetary amounts.
 */
function toRoundedNumber(value: Decimal): number {
  return value.toDecimalPlaces(2).toNumber();
}

export function calculateLineTotal(item: InvoiceLineItemInput): number {
  const quantity = new Decimal(item.quantity);
  const unitPrice = new Decimal(item.unitPrice);
  return toRoundedNumber(quantity.times(unitPrice));
}

export function calculateInvoice(input: InvoiceFormInput): InvoiceCalculated {
  const items: InvoiceLineItemCalculated[] = input.items.map((item) => ({
    ...item,
    totalExclVat: calculateLineTotal(item),
  }));

  const subtotalDecimal = items.reduce(
    (acc, item) => acc.plus(new Decimal(item.totalExclVat)),
    new Decimal(0)
  );
  const subtotal = toRoundedNumber(subtotalDecimal);

  if (input.reverseCharge) {
    return {
      items,
      totals: {
        subtotal,
        vatAmount: 0,
        total: subtotal,
        vatRatePercent: 0,
        reverseCharge: true,
      },
    };
  }

  const vatRate = new Decimal(input.vatRatePercent).dividedBy(100);
  const vatAmount = toRoundedNumber(subtotalDecimal.times(vatRate));
  const total = toRoundedNumber(subtotalDecimal.plus(new Decimal(vatAmount)));

  return {
    items,
    totals: {
      subtotal,
      vatAmount,
      total,
      vatRatePercent: input.vatRatePercent,
      reverseCharge: false,
    },
  };
}
