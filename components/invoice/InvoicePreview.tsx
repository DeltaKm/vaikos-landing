"use client";

import Image from "next/image";
import type { InvoiceConfig } from "@/config/invoice-config";
import type { InvoiceCalculated, InvoiceFormInput } from "@/lib/invoice/types";
import { formatDate, formatMoney } from "@/lib/invoice/formatting";

interface InvoicePreviewProps {
  input: InvoiceFormInput;
  calculated: InvoiceCalculated;
  config: InvoiceConfig;
}

export function InvoicePreview({ input, calculated, config }: InvoicePreviewProps) {
  const { company, bank, reverseCharge } = config;
  const { items, totals } = calculated;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-sm text-gray-900 max-w-2xl mx-auto">
      <div className="flex justify-center mb-4">
        <Image
          src="/vaikos1-no-sfondo.png"
          alt="Vaikos logo"
          width={90}
          height={90}
          style={{ width: 90, height: "auto" }}
        />
      </div>

      <p className="text-center font-bold text-base mb-4">{company.name}</p>

      <div className="mb-6">
        <p>{company.addressLine1}</p>
        <p>
          {company.postalCode} {company.city}, {company.country}
        </p>
        <p>Reg. No.: {company.registrationNumber}</p>
        <p>VAT ID: {company.vatId}</p>
      </div>

      <div className="mb-6 space-y-1 flex flex-col items-center">
        <div className="flex gap-4 w-56">
          <span className="w-28 font-semibold">Invoice No.:</span>
          <span className="font-semibold">{input.invoiceNumber || "—"}</span>
        </div>
        <div className="flex gap-4 w-56">
          <span className="w-28 font-semibold">Date:</span>
          <span className="font-semibold">{input.invoiceDate ? formatDate(input.invoiceDate) : "—"}</span>
        </div>
        <div className="flex gap-4 w-56">
          <span className="w-28 font-semibold">Due date:</span>
          <span className="font-semibold">{input.dueDate ? formatDate(input.dueDate) : "—"}</span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-1">Invoice to:</h3>
        <p className="font-semibold">{input.customer.name || "—"}</p>
        {input.customer.addressLines
          .filter((line) => line.trim().length > 0)
          .map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        <p>
          {input.customer.postalCode} {input.customer.city}
        </p>
        <p>{input.customer.country}</p>
        {input.customer.vatId ? <p>VAT ID: {input.customer.vatId}</p> : null}
      </div>

      <table className="w-full border-t border-b border-gray-800 mb-4">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-800">
            <th className="text-left font-bold py-2 px-2">Description</th>
            <th className="text-right font-bold py-2 px-2">Quantity</th>
            <th className="text-right font-bold py-2 px-2">Unit</th>
            <th className="text-right font-bold py-2 px-2">Price</th>
            <th className="text-right font-bold py-2 px-2">Total excl. VAT</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-2 px-2">{item.description || "—"}</td>
              <td className="text-right py-2 px-2">{item.quantity}</td>
              <td className="text-right py-2 px-2">{item.unit}</td>
              <td className="text-right py-2 px-2">{formatMoney(item.unitPrice, input.currency)}</td>
              <td className="text-right py-2 px-2">{formatMoney(item.totalExclVat, input.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatMoney(totals.subtotal, input.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>{totals.reverseCharge ? "VAT (Reverse Charge)" : `VAT (${totals.vatRatePercent}%)`}</span>
            <span>{formatMoney(totals.vatAmount, input.currency)}</span>
          </div>
          <div className="border-t border-gray-800 my-1" />
          <div className="flex justify-between font-bold">
            <span>Invoice total ({input.currency})</span>
            <span>{formatMoney(totals.total, input.currency)}</span>
          </div>
        </div>
      </div>

      {totals.reverseCharge ? (
        <div className="mb-6">
          <h3 className="font-bold mb-1">{reverseCharge.title}</h3>
          <p>{reverseCharge.text}</p>
        </div>
      ) : null}

      <div className="mb-6">
        <h3 className="font-bold mb-1">Payment details:</h3>
        <p>Bank: {bank.name}</p>
        <p>IBAN: {bank.iban}</p>
        <p>BIC/SWIFT: {bank.bic}</p>
        <p>Currency: {input.currency}</p>
      </div>

      {input.note ? (
        <div>
          <h3 className="font-bold mb-1">Note:</h3>
          <p>{input.note}</p>
        </div>
      ) : null}
    </div>
  );
}
