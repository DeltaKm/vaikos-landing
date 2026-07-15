import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import fs from "node:fs";
import path from "node:path";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/invoice/auth";
import { isOriginAllowed } from "@/lib/invoice/origin";
import { invoiceFormSchema } from "@/lib/invoice/schema";
import { calculateInvoice } from "@/lib/invoice/calculations";
import { buildInvoiceFilename } from "@/lib/invoice/filename";
import { invoiceConfig } from "@/config/invoice-config";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

function getLogoDataUrl(): string | undefined {
  const logoPath = path.join(process.cwd(), "public", "vaikos1-no-sfondo.png");
  try {
    const file = fs.readFileSync(logoPath);
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 401 });
  }

  if (!isOriginAllowed(request)) {
    return NextResponse.json({ error: "Origine della richiesta non valida." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  const parsed = invoiceFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dati fattura non validi.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const calculated = calculateInvoice(input);
  const logoSrc = getLogoDataUrl();

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderToBuffer(
      InvoiceDocument({ input, calculated, config: invoiceConfig, logoSrc })
    );
  } catch (error) {
    console.error("Errore durante la generazione del PDF:", error);
    return NextResponse.json({ error: "Errore durante la generazione del PDF." }, { status: 500 });
  }

  const filename = buildInvoiceFilename(input.invoiceNumber, input.customer.name);
  const pdfBytes = new Uint8Array(pdfBuffer);

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
