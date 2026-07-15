import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { InvoiceConfig } from "@/config/invoice-config";
import type { InvoiceCalculated, InvoiceFormInput } from "@/lib/invoice/types";
import { formatDate, formatMoney } from "@/lib/invoice/formatting";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  logo: {
    width: 90,
    height: 90,
    alignSelf: "center",
    marginBottom: 8,
  },
  companyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 24,
  },
  companyNameUnderLogo: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 16,
  },
  companyBlock: {
    marginBottom: 24,
  },
  line: {
    marginBottom: 2,
  },
  metaBlock: {
    alignItems: "center",
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 2,
    width: 220,
  },
  metaLabel: {
    width: 110,
    fontFamily: "Helvetica-Bold",
  },
  metaValue: {
    fontFamily: "Helvetica-Bold",
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    marginTop: 16,
  },
  customerBlock: {
    marginBottom: 16,
  },
  customerName: {
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  table: {
    marginTop: 12,
    borderTop: "1px solid #333333",
    borderBottom: "1px solid #333333",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#e8e8e8",
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottom: "1px solid #333333",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottom: "1px solid #dddddd",
  },
  colDescription: { width: "40%" },
  colQuantity: { width: "12%", textAlign: "right" },
  colUnit: { width: "12%", textAlign: "right" },
  colPrice: { width: "18%", textAlign: "right" },
  colTotal: { width: "18%", textAlign: "right" },
  headerCellBold: { fontFamily: "Helvetica-Bold" },
  totalsBlock: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  totalsRow: {
    flexDirection: "row",
    width: 220,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  totalsLabel: {},
  totalsLabelBold: { fontFamily: "Helvetica-Bold" },
  totalsValueBold: { fontFamily: "Helvetica-Bold" },
  totalsDivider: {
    width: 220,
    borderTop: "1px solid #333333",
    marginVertical: 4,
  },
  footerBlock: {
    marginTop: 24,
  },
  footerTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  footerText: {
    lineHeight: 1.4,
  },
  noteBlock: {
    marginTop: 16,
  },
});

interface InvoiceDocumentProps {
  input: InvoiceFormInput;
  calculated: InvoiceCalculated;
  config: InvoiceConfig;
  logoSrc?: string;
}

export function InvoiceDocument({ input, calculated, config, logoSrc }: InvoiceDocumentProps) {
  const { company, bank, reverseCharge } = config;
  const { items, totals } = calculated;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {logoSrc ? (
          // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image has no alt prop
          <Image src={logoSrc} style={styles.logo} />
        ) : null}

        <Text style={logoSrc ? styles.companyNameUnderLogo : styles.companyName}>{company.name}</Text>

        <View style={styles.companyBlock}>
          <Text style={styles.line}>{company.addressLine1}</Text>
          <Text style={styles.line}>
            {company.postalCode} {company.city}, {company.country}
          </Text>
          <Text style={styles.line}>Reg. No.: {company.registrationNumber}</Text>
          <Text style={styles.line}>VAT ID: {company.vatId}</Text>
        </View>

        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Invoice No.:</Text>
            <Text style={styles.metaValue}>{input.invoiceNumber}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date:</Text>
            <Text style={styles.metaValue}>{formatDate(input.invoiceDate)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Due date:</Text>
            <Text style={styles.metaValue}>{formatDate(input.dueDate)}</Text>
          </View>
        </View>

        <View style={styles.customerBlock} wrap={false}>
          <Text style={styles.sectionTitle}>Invoice to:</Text>
          <Text style={styles.customerName}>{input.customer.name}</Text>
          {input.customer.addressLines
            .filter((line) => line.trim().length > 0)
            .map((line, index) => (
              <Text key={index} style={styles.line}>
                {line}
              </Text>
            ))}
          <Text style={styles.line}>
            {input.customer.postalCode} {input.customer.city}
          </Text>
          <Text style={styles.line}>{input.customer.country}</Text>
          {input.customer.vatId ? (
            <Text style={styles.line}>VAT ID: {input.customer.vatId}</Text>
          ) : null}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.colDescription, styles.headerCellBold]}>Description</Text>
            <Text style={[styles.colQuantity, styles.headerCellBold]}>Quantity</Text>
            <Text style={[styles.colUnit, styles.headerCellBold]}>Unit</Text>
            <Text style={[styles.colPrice, styles.headerCellBold]}>Price</Text>
            <Text style={[styles.colTotal, styles.headerCellBold]}>Total excl. VAT</Text>
          </View>

          {items.map((item, index) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQuantity}>{item.quantity}</Text>
              <Text style={styles.colUnit}>{item.unit}</Text>
              <Text style={styles.colPrice}>{formatMoney(item.unitPrice, input.currency)}</Text>
              <Text style={styles.colTotal}>{formatMoney(item.totalExclVat, input.currency)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock} wrap={false}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text>{formatMoney(totals.subtotal, input.currency)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>
              {totals.reverseCharge ? "VAT (Reverse Charge)" : `VAT (${totals.vatRatePercent}%)`}
            </Text>
            <Text>{formatMoney(totals.vatAmount, input.currency)}</Text>
          </View>
          <View style={styles.totalsDivider} />
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabelBold}>Invoice total ({input.currency})</Text>
            <Text style={styles.totalsValueBold}>{formatMoney(totals.total, input.currency)}</Text>
          </View>
        </View>

        {totals.reverseCharge ? (
          <View style={styles.footerBlock} wrap={false}>
            <Text style={styles.footerTitle}>{reverseCharge.title}</Text>
            <Text style={styles.footerText}>{reverseCharge.text}</Text>
          </View>
        ) : null}

        <View style={styles.footerBlock} wrap={false}>
          <Text style={styles.footerTitle}>Payment details:</Text>
          <Text style={styles.line}>Bank: {bank.name}</Text>
          <Text style={styles.line}>IBAN: {bank.iban}</Text>
          <Text style={styles.line}>BIC/SWIFT: {bank.bic}</Text>
          <Text style={styles.line}>Currency: {input.currency}</Text>
        </View>

        {input.note ? (
          <View style={styles.noteBlock} wrap={false}>
            <Text style={styles.footerTitle}>Note:</Text>
            <Text style={styles.footerText}>{input.note}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
