"use client";

import { useEffect, useMemo, useState } from "react";
import type { InvoiceConfig } from "@/config/invoice-config";
import type { InvoiceFormInput } from "@/lib/invoice/types";
import { invoiceFormSchema } from "@/lib/invoice/schema";
import { calculateInvoice } from "@/lib/invoice/calculations";
import { buildInvoiceFilename } from "@/lib/invoice/filename";
import { InvoiceItemsEditor } from "./InvoiceItemsEditor";
import { InvoicePreview } from "./InvoicePreview";

const DRAFT_STORAGE_KEY = "vaikos_invoice_draft";
const LAST_NUMBER_STORAGE_KEY = "vaikos_invoice_last_number";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyInput(currency: string, defaultUnit: string): InvoiceFormInput {
  return {
    invoiceNumber: "",
    invoiceDate: todayIso(),
    dueDate: todayIso(),
    currency,
    reverseCharge: true,
    vatRatePercent: 0,
    note: "",
    customer: {
      name: "",
      addressLines: [""],
      postalCode: "",
      city: "",
      country: "",
      vatId: "",
    },
    items: [
      {
        description: "Affiliate commission services",
        quantity: 1,
        unit: defaultUnit,
        unitPrice: 0,
      },
    ],
  };
}

type FormErrors = Record<string, string>;

interface InvoiceFormProps {
  config: InvoiceConfig;
}

export function InvoiceForm({ config }: InvoiceFormProps) {
  const [input, setInput] = useState<InvoiceFormInput>(() =>
    createEmptyInput(config.currency, config.defaultUnit)
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPreviewOnMobile, setShowPreviewOnMobile] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [lastSuggestedNumber, setLastSuggestedNumber] = useState<string | null>(null);

  useEffect(() => {
    setLastSuggestedNumber(window.localStorage.getItem(LAST_NUMBER_STORAGE_KEY));
  }, []);

  const calculated = useMemo(() => calculateInvoice(input), [input]);

  function updateField<K extends keyof InvoiceFormInput>(key: K, value: InvoiceFormInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function updateCustomerField<K extends keyof InvoiceFormInput["customer"]>(
    key: K,
    value: InvoiceFormInput["customer"][K]
  ) {
    setInput((prev) => ({ ...prev, customer: { ...prev.customer, [key]: value } }));
  }

  function updateAddressLine(index: number, value: string) {
    setInput((prev) => {
      const addressLines = [...prev.customer.addressLines];
      addressLines[index] = value;
      return { ...prev, customer: { ...prev.customer, addressLines } };
    });
  }

  function addAddressLine() {
    setInput((prev) => ({
      ...prev,
      customer: { ...prev.customer, addressLines: [...prev.customer.addressLines, ""] },
    }));
  }

  function removeAddressLine(index: number) {
    setInput((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        addressLines: prev.customer.addressLines.filter((_, i) => i !== index),
      },
    }));
  }

  function hasFormData(): boolean {
    return (
      input.invoiceNumber.trim().length > 0 ||
      input.customer.name.trim().length > 0 ||
      input.items.some((item) => item.description.trim().length > 0 || item.unitPrice > 0)
    );
  }

  function handleReset() {
    if (hasFormData()) {
      const confirmed = window.confirm(
        "Il modulo contiene dati non salvati. Vuoi davvero azzerarlo?"
      );
      if (!confirmed) return;
    }
    setInput(createEmptyInput(config.currency, config.defaultUnit));
    setErrors({});
    setGenerateError(null);
  }

  function saveDraft() {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(input));
    setDraftMessage("Bozza salvata solo su questo browser.");
  }

  function loadDraft() {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) {
      setDraftMessage("Nessuna bozza salvata su questo browser.");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as InvoiceFormInput;
      setInput(parsed);
      setDraftMessage("Bozza caricata da questo browser.");
    } catch {
      setDraftMessage("La bozza salvata non è leggibile.");
    }
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraftMessage("Bozza eliminata da questo browser.");
  }

  function validate(): boolean {
    const result = invoiceFormSchema.safeParse(input);
    if (result.success) {
      setErrors({});
      return true;
    }
    const nextErrors: FormErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".");
      nextErrors[key] = issue.message;
    }
    setErrors(nextErrors);
    return false;
  }

  async function handleGeneratePdf() {
    setGenerateError(null);
    if (!validate()) {
      setGenerateError("Correggi gli errori nel modulo prima di generare il PDF.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (response.status === 401) {
        window.location.href = "/invoice/login";
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setGenerateError(data?.error ?? "Errore durante la generazione del PDF.");
        return;
      }

      const blob = await response.blob();
      const filename = buildInvoiceFilename(input.invoiceNumber, input.customer.name);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      window.localStorage.setItem(LAST_NUMBER_STORAGE_KEY, input.invoiceNumber);
    } catch {
      setGenerateError("Errore di rete durante la generazione del PDF.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      await fetch("/api/invoice-auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/invoice/login";
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invoice generator</h1>
        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutLoading}
          className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {logoutLoading ? "Uscita in corso..." : "Logout"}
        </button>
      </div>

      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setShowPreviewOnMobile((prev) => !prev)}
          className="w-full px-4 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          {showPreviewOnMobile ? "Torna al modulo" : "Visualizza anteprima"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={showPreviewOnMobile ? "hidden lg:block" : ""}>
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleGeneratePdf();
            }}
          >
            <fieldset className="border border-gray-200 rounded-lg p-4">
              <legend className="text-sm font-semibold text-gray-700 px-1">Dati fattura</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="invoiceNumber" className="block text-xs font-medium text-gray-700 mb-1">
                    Invoice number *
                  </label>
                  <input
                    id="invoiceNumber"
                    type="text"
                    value={input.invoiceNumber}
                    onChange={(e) => updateField("invoiceNumber", e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    aria-invalid={Boolean(errors.invoiceNumber)}
                    aria-describedby={errors.invoiceNumber ? "invoiceNumber-error" : undefined}
                  />
                  {lastSuggestedNumber ? (
                    <p className="text-xs text-gray-700 mt-1">
                      Ultimo numero usato su questo browser: <strong>{lastSuggestedNumber}</strong>.
                      Verifica e confermalo manualmente.
                    </p>
                  ) : null}
                  {errors.invoiceNumber ? (
                    <p id="invoiceNumber-error" className="text-xs text-red-600 mt-1">
                      {errors.invoiceNumber}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="currency" className="block text-xs font-medium text-gray-700 mb-1">
                    Currency *
                  </label>
                  <input
                    id="currency"
                    type="text"
                    value={input.currency}
                    onChange={(e) => updateField("currency", e.target.value.toUpperCase())}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    aria-invalid={Boolean(errors.currency)}
                    aria-describedby={errors.currency ? "currency-error" : undefined}
                  />
                  {errors.currency ? (
                    <p id="currency-error" className="text-xs text-red-600 mt-1">
                      {errors.currency}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="invoiceDate" className="block text-xs font-medium text-gray-700 mb-1">
                    Invoice date *
                  </label>
                  <input
                    id="invoiceDate"
                    type="date"
                    value={input.invoiceDate}
                    onChange={(e) => updateField("invoiceDate", e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    aria-invalid={Boolean(errors.invoiceDate)}
                    aria-describedby={errors.invoiceDate ? "invoiceDate-error" : undefined}
                  />
                  {errors.invoiceDate ? (
                    <p id="invoiceDate-error" className="text-xs text-red-600 mt-1">
                      {errors.invoiceDate}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="dueDate" className="block text-xs font-medium text-gray-700 mb-1">
                    Due date *
                  </label>
                  <input
                    id="dueDate"
                    type="date"
                    value={input.dueDate}
                    onChange={(e) => updateField("dueDate", e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    aria-invalid={Boolean(errors.dueDate)}
                    aria-describedby={errors.dueDate ? "dueDate-error" : undefined}
                  />
                  {errors.dueDate ? (
                    <p id="dueDate-error" className="text-xs text-red-600 mt-1">
                      {errors.dueDate}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="reverseCharge"
                    type="checkbox"
                    checked={input.reverseCharge}
                    onChange={(e) => updateField("reverseCharge", e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="reverseCharge" className="text-sm text-gray-700">
                    Reverse Charge attivo
                  </label>
                </div>

                {!input.reverseCharge ? (
                  <div>
                    <label htmlFor="vatRatePercent" className="block text-xs font-medium text-gray-700 mb-1">
                      Aliquota IVA (%) *
                    </label>
                    <input
                      id="vatRatePercent"
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={input.vatRatePercent}
                      onChange={(e) => updateField("vatRatePercent", Number(e.target.value))}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                      aria-invalid={Boolean(errors.vatRatePercent)}
                      aria-describedby={errors.vatRatePercent ? "vatRatePercent-error" : undefined}
                    />
                    {errors.vatRatePercent ? (
                      <p id="vatRatePercent-error" className="text-xs text-red-600 mt-1">
                        {errors.vatRatePercent}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="sm:col-span-2">
                  <label htmlFor="note" className="block text-xs font-medium text-gray-700 mb-1">
                    Nota aggiuntiva
                  </label>
                  <textarea
                    id="note"
                    value={input.note}
                    onChange={(e) => updateField("note", e.target.value)}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="border border-gray-200 rounded-lg p-4">
              <legend className="text-sm font-semibold text-gray-700 px-1">Dati cliente</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="customerName" className="block text-xs font-medium text-gray-700 mb-1">
                    Ragione sociale *
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    value={input.customer.name}
                    onChange={(e) => updateCustomerField("name", e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    aria-invalid={Boolean(errors["customer.name"])}
                    aria-describedby={errors["customer.name"] ? "customerName-error" : undefined}
                  />
                  {errors["customer.name"] ? (
                    <p id="customerName-error" className="text-xs text-red-600 mt-1">
                      {errors["customer.name"]}
                    </p>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <span className="block text-xs font-medium text-gray-700 mb-1">Indirizzo *</span>
                  <div className="flex flex-col gap-2">
                    {input.customer.addressLines.map((line, index) => (
                      <div key={index} className="flex gap-2">
                        <label htmlFor={`addressLine-${index}`} className="sr-only">
                          Riga indirizzo {index + 1}
                        </label>
                        <input
                          id={`addressLine-${index}`}
                          type="text"
                          value={line}
                          onChange={(e) => updateAddressLine(index, e.target.value)}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                        {input.customer.addressLines.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeAddressLine(index)}
                            className="px-3 py-2 text-sm rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                            aria-label={`Elimina riga indirizzo ${index + 1}`}
                          >
                            −
                          </button>
                        ) : null}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addAddressLine}
                      className="self-start px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      + Aggiungi riga indirizzo
                    </button>
                  </div>
                  {errors["customer.addressLines"] ? (
                    <p className="text-xs text-red-600 mt-1">{errors["customer.addressLines"]}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="customerPostalCode" className="block text-xs font-medium text-gray-700 mb-1">
                    Postal code *
                  </label>
                  <input
                    id="customerPostalCode"
                    type="text"
                    value={input.customer.postalCode}
                    onChange={(e) => updateCustomerField("postalCode", e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    aria-invalid={Boolean(errors["customer.postalCode"])}
                  />
                  {errors["customer.postalCode"] ? (
                    <p className="text-xs text-red-600 mt-1">{errors["customer.postalCode"]}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="customerCity" className="block text-xs font-medium text-gray-700 mb-1">
                    Città *
                  </label>
                  <input
                    id="customerCity"
                    type="text"
                    value={input.customer.city}
                    onChange={(e) => updateCustomerField("city", e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    aria-invalid={Boolean(errors["customer.city"])}
                  />
                  {errors["customer.city"] ? (
                    <p className="text-xs text-red-600 mt-1">{errors["customer.city"]}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="customerCountry" className="block text-xs font-medium text-gray-700 mb-1">
                    Paese *
                  </label>
                  <input
                    id="customerCountry"
                    type="text"
                    value={input.customer.country}
                    onChange={(e) => updateCustomerField("country", e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    aria-invalid={Boolean(errors["customer.country"])}
                  />
                  {errors["customer.country"] ? (
                    <p className="text-xs text-red-600 mt-1">{errors["customer.country"]}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="customerVatId" className="block text-xs font-medium text-gray-700 mb-1">
                    VAT ID {input.reverseCharge ? "*" : ""}
                  </label>
                  <input
                    id="customerVatId"
                    type="text"
                    value={input.customer.vatId}
                    onChange={(e) => updateCustomerField("vatId", e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    aria-invalid={Boolean(errors["customer.vatId"])}
                  />
                  {errors["customer.vatId"] ? (
                    <p className="text-xs text-red-600 mt-1">{errors["customer.vatId"]}</p>
                  ) : null}
                </div>
              </div>
            </fieldset>

            <InvoiceItemsEditor
              items={input.items}
              defaultUnit={config.defaultUnit}
              onChange={(items) => updateField("items", items)}
            />
            {errors.items ? <p className="text-xs text-red-600">{errors.items}</p> : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isGenerating}
                aria-busy={isGenerating}
                className="px-5 py-2.5 rounded-md bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700 disabled:opacity-60"
              >
                {isGenerating ? "Generazione in corso..." : "Generate PDF"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={saveDraft}
                className="px-5 py-2.5 rounded-md border border-gray-300 bg-white text-gray-700 text-sm hover:bg-gray-50"
              >
                Salva bozza in questo browser
              </button>
              <button
                type="button"
                onClick={loadDraft}
                className="px-5 py-2.5 rounded-md border border-gray-300 bg-white text-gray-700 text-sm hover:bg-gray-50"
              >
                Carica bozza
              </button>
              <button
                type="button"
                onClick={clearDraft}
                className="px-5 py-2.5 rounded-md border border-gray-300 bg-white text-gray-700 text-sm hover:bg-gray-50"
              >
                Cancella bozza
              </button>
            </div>

            {draftMessage ? (
              <p role="status" className="text-xs text-gray-700">
                {draftMessage} La bozza è salvata soltanto sul dispositivo corrente (localStorage).
              </p>
            ) : null}

            {generateError ? (
              <p role="alert" className="text-sm text-red-600 font-medium">
                {generateError}
              </p>
            ) : null}
          </form>
        </div>

        <div className={showPreviewOnMobile ? "" : "hidden lg:block"}>
          <InvoicePreview input={input} calculated={calculated} config={config} />
          {showPreviewOnMobile ? (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={handleGeneratePdf}
                disabled={isGenerating}
                aria-busy={isGenerating}
                className="px-5 py-2.5 rounded-md bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700 disabled:opacity-60"
              >
                {isGenerating ? "Generazione in corso..." : "Generate PDF"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
