"use client";

import type { InvoiceLineItemInput } from "@/lib/invoice/types";

interface InvoiceItemsEditorProps {
  items: InvoiceLineItemInput[];
  defaultUnit: string;
  onChange: (items: InvoiceLineItemInput[]) => void;
  errors?: Record<number, Partial<Record<keyof InvoiceLineItemInput, string>>>;
}

export function InvoiceItemsEditor({ items, defaultUnit, onChange, errors }: InvoiceItemsEditorProps) {
  function updateItem(index: number, patch: Partial<InvoiceLineItemInput>) {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  }

  function addItem() {
    onChange([
      ...items,
      { description: "", quantity: 1, unit: defaultUnit, unitPrice: 0 },
    ]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <fieldset className="border border-gray-200 rounded-lg p-4">
      <legend className="text-sm font-semibold text-gray-700 px-1">Righe fattura</legend>
      <div className="flex flex-col gap-4">
        {items.map((item, index) => {
          const itemErrors = errors?.[index];
          return (
            <div
              key={index}
              className="flex flex-col gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
            >
              <div>
                <label htmlFor={`item-description-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <input
                  id={`item-description-${index}`}
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  aria-invalid={Boolean(itemErrors?.description)}
                  aria-describedby={itemErrors?.description ? `item-description-${index}-error` : undefined}
                />
                {itemErrors?.description ? (
                  <p id={`item-description-${index}-error`} className="text-xs text-red-600 mt-1">
                    {itemErrors.description}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3">
                <div>
                  <label htmlFor={`item-quantity-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                    Quantità
                  </label>
                  <input
                    id={`item-quantity-${index}`}
                    type="number"
                    min={0}
                    step="any"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    aria-invalid={Boolean(itemErrors?.quantity)}
                    aria-describedby={itemErrors?.quantity ? `item-quantity-${index}-error` : undefined}
                  />
                  {itemErrors?.quantity ? (
                    <p id={`item-quantity-${index}-error`} className="text-xs text-red-600 mt-1">
                      {itemErrors.quantity}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor={`item-unit-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                    Unità
                  </label>
                  <input
                    id={`item-unit-${index}`}
                    type="text"
                    value={item.unit}
                    onChange={(e) => updateItem(index, { unit: e.target.value })}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    aria-invalid={Boolean(itemErrors?.unit)}
                    aria-describedby={itemErrors?.unit ? `item-unit-${index}-error` : undefined}
                  />
                  {itemErrors?.unit ? (
                    <p id={`item-unit-${index}-error`} className="text-xs text-red-600 mt-1">
                      {itemErrors.unit}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor={`item-price-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                    Prezzo unitario
                  </label>
                  <input
                    id={`item-price-${index}`}
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    aria-invalid={Boolean(itemErrors?.unitPrice)}
                    aria-describedby={itemErrors?.unitPrice ? `item-price-${index}-error` : undefined}
                  />
                  {itemErrors?.unitPrice ? (
                    <p id={`item-price-${index}-error`} className="text-xs text-red-600 mt-1">
                      {itemErrors.unitPrice}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                    className="w-full sm:w-auto px-3 py-2 text-sm rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label={`Elimina riga ${index + 1}`}
                  >
                    Elimina
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-4 px-4 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      >
        + Aggiungi riga
      </button>
    </fieldset>
  );
}
