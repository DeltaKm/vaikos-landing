import type { Metadata } from "next";
import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { invoiceConfig } from "@/config/invoice-config";

export const metadata: Metadata = {
  title: "Invoice generator - Vaikos",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function InvoicePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <InvoiceForm config={invoiceConfig} />
    </main>
  );
}
