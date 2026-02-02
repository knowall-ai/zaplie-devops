import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button, Spinner, makeStyles, tokens } from "@fluentui/react-components";
import { Copy24Regular, Checkmark24Regular, Open24Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: tokens.colorNeutralBackground3,
    marginBottom: "24px",
  },
  qrWrapper: {
    backgroundColor: "white",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "12px",
  },
  spinnerContainer: {
    display: "flex",
    height: "160px",
    width: "160px",
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    display: "flex",
    height: "160px",
    width: "160px",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "16px",
    backgroundColor: tokens.colorNeutralBackground4,
    borderRadius: "8px",
  },
  errorText: {
    fontSize: "14px",
    color: tokens.colorNeutralForeground2,
  },
  placeholderContainer: {
    display: "flex",
    height: "160px",
    width: "160px",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: "14px",
    color: tokens.colorNeutralForeground3,
  },
  scanText: {
    fontSize: "14px",
    color: tokens.colorNeutralForeground2,
    marginBottom: "8px",
  },
  addressRow: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  addressCode: {
    flex: 1,
    padding: "4px 8px",
    borderRadius: "4px",
    backgroundColor: tokens.colorNeutralBackground4,
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: "monospace",
  },
  copyButton: {
    flexShrink: 0,
    minWidth: "32px",
    padding: "4px",
  },
  walletButton: {
    marginTop: "8px",
  },
});

interface QRCodeDisplayProps {
  invoice: string | null;
  lightningAddress: string;
  loading: boolean;
  error: string | null;
  onCopyAddress: () => void;
  onCopyInvoice: () => void;
  copiedAddress: boolean;
  copiedInvoice: boolean;
}

export function QRCodeDisplay({
  invoice,
  lightningAddress,
  loading,
  error,
  onCopyAddress,
  onCopyInvoice,
  copiedAddress,
  copiedInvoice,
}: QRCodeDisplayProps) {
  const styles = useStyles();

  // Normalize invoice URI to always include lightning: prefix for proper deep linking
  const rawInvoice = invoice ?? "";
  const hasInvoicePrefix = rawInvoice.startsWith("lightning:");
  const invoiceUri = rawInvoice ? (hasInvoicePrefix ? rawInvoice : `lightning:${rawInvoice}`) : "";

  const qrValue = invoiceUri || "";
  const walletUri = invoiceUri || `lightning:${lightningAddress}`;
  const invoiceStr = hasInvoicePrefix ? rawInvoice.slice("lightning:".length) : rawInvoice || null;

  return (
    <div className={styles.container}>
      {loading ? (
        <div className={styles.spinnerContainer}>
          <Spinner size="medium" label="Loading invoice..." />
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <span className={styles.errorText}>{error}</span>
        </div>
      ) : qrValue ? (
        <div className={styles.qrWrapper}>
          <QRCodeSVG value={qrValue} size={160} level="M" />
        </div>
      ) : (
        <div className={styles.placeholderContainer}>
          <span className={styles.placeholderText}>Select an amount</span>
        </div>
      )}

      <span className={styles.scanText}>Scan with a Lightning wallet</span>

      {/* Lightning Address */}
      <div className={styles.addressRow}>
        <code className={styles.addressCode} title={lightningAddress}>
          {lightningAddress}
        </code>
        <Button
          className={styles.copyButton}
          appearance="subtle"
          icon={copiedAddress ? <Checkmark24Regular /> : <Copy24Regular />}
          onClick={onCopyAddress}
          title="Copy Lightning address"
          aria-label="Copy Lightning address"
        />
      </div>

      {/* Invoice String */}
      {invoice && (
        <div className={styles.addressRow}>
          <code className={styles.addressCode} title={invoiceStr || ""}>
            {invoiceStr}
          </code>
          <Button
            className={styles.copyButton}
            appearance="subtle"
            icon={copiedInvoice ? <Checkmark24Regular /> : <Copy24Regular />}
            onClick={onCopyInvoice}
            title="Copy invoice"
            aria-label="Copy invoice"
          />
        </div>
      )}

      {/* Open in Wallet */}
      <Button
        className={styles.walletButton}
        appearance="secondary"
        icon={<Open24Regular />}
        as="a"
        href={walletUri}
      >
        Open in Wallet
      </Button>
    </div>
  );
}
