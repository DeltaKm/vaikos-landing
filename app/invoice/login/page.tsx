"use client";

import { useState, type FormEvent } from "react";

export const dynamic = "force-dynamic";

export default function InvoiceLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/invoice-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Errore durante l'accesso.");
        return;
      }

      window.location.href = "/invoice";
    } catch {
      setError("Errore di rete durante l'accesso.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm p-8"
      >
        <h1 className="text-xl font-bold text-gray-900 mb-1">Vaikos Invoice Area</h1>
        <p className="text-sm text-gray-700 mb-6">Accesso riservato agli amministratori.</p>

        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "login-error" : undefined}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="w-full px-4 py-2.5 rounded-md bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700 disabled:opacity-60"
        >
          {isSubmitting ? "Accesso in corso..." : "Accedi"}
        </button>

        {error ? (
          <p id="login-error" role="alert" className="text-sm text-red-600 font-medium mt-4">
            {error}
          </p>
        ) : null}
      </form>
    </main>
  );
}
