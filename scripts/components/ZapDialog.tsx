import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  Button,
  Spinner,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { Dismiss24Regular, Flash24Filled, Checkmark24Regular } from "@fluentui/react-icons";

import type { Assignee } from "../types";
import { DEFAULT_ZAP_PRESETS } from "../types";
import { AmountSelector } from "./AmountSelector";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { fetchInvoice } from "../services/lightningService";

const useStyles = makeStyles({
  surface: {
    maxWidth: "420px",
    width: "100%",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "16px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  zapIcon: {
    color: "#f7931a",
  },
  closeButton: {
    minWidth: "32px",
    padding: "4px",
  },
  content: {
    padding: "24px",
  },
  assigneeInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: tokens.colorBrandBackground,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "600",
    fontSize: "18px",
  },
  assigneeName: {
    fontWeight: "600",
    color: tokens.colorNeutralForeground1,
  },
  workItemId: {
    fontSize: "14px",
    color: tokens.colorNeutralForeground3,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px",
    gap: "12px",
  },
  noAddressContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px",
    textAlign: "center",
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: "8px",
  },
  noAddressIcon: {
    color: tokens.colorNeutralForeground3,
    marginBottom: "8px",
  },
  noAddressText: {
    fontSize: "14px",
    color: tokens.colorNeutralForeground2,
  },
  noAddressHint: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    marginTop: "4px",
  },
  successContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px",
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: "8px",
  },
  successIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
  },
  successIconInner: {
    color: "#22c55e",
  },
  successText: {
    fontWeight: "600",
    color: tokens.colorNeutralForeground1,
  },
  successAmount: {
    fontSize: "14px",
    color: tokens.colorNeutralForeground3,
    marginTop: "4px",
  },
  confirmButton: {
    width: "100%",
    backgroundColor: "#f7931a",
    color: "white",
    "&:hover": {
      backgroundColor: "#e8850f",
    },
    "&:disabled": {
      opacity: 0.5,
    },
  },
  footerText: {
    marginTop: "16px",
    textAlign: "center",
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
  },
});

interface ZapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assignee: Assignee;
  workItemId: number;
  lightningAddress: string | null;
  isLoadingAddress: boolean;
  onZapSent?: (amount: number) => Promise<void>;
}

export function ZapDialog({
  isOpen,
  onClose,
  assignee,
  workItemId,
  lightningAddress,
  isLoadingAddress,
  onZapSent,
}: ZapDialogProps) {
  const styles = useStyles();

  const [selectedAmount, setSelectedAmount] = useState<number>(DEFAULT_ZAP_PRESETS[1]);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [zapConfirmed, setZapConfirmed] = useState(false);

  // Invoice fetching state
  const [invoice, setInvoice] = useState<string | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  const actualAmount = isCustom ? parseInt(customAmount) || 0 : selectedAmount;

  // Fetch invoice when address or amount changes
  const fetchInvoiceForAmount = useCallback(async () => {
    if (!lightningAddress || actualAmount <= 0) {
      setInvoice(null);
      return;
    }

    setInvoiceLoading(true);
    setInvoiceError(null);

    try {
      const result = await fetchInvoice({
        lightningAddress,
        amountSats: actualAmount,
        comment: `Zaplie Work Item #${workItemId}`,
      });
      setInvoice(result.invoice);
    } catch (err) {
      console.error("[ZapDialog] Invoice fetch failed:", err);
      setInvoiceError(err instanceof Error ? err.message : "Failed to fetch invoice");
      setInvoice(null);
    } finally {
      setInvoiceLoading(false);
    }
  }, [lightningAddress, actualAmount, workItemId]);

  useEffect(() => {
    if (isOpen && lightningAddress) {
      fetchInvoiceForAmount();
    }
  }, [isOpen, fetchInvoiceForAmount, lightningAddress]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAmount(DEFAULT_ZAP_PRESETS[1]);
      setCustomAmount("");
      setIsCustom(false);
      setZapConfirmed(false);
      setInvoice(null);
      setInvoiceError(null);
    }
  }, [isOpen]);

  const copyAddressToClipboard = async () => {
    if (!lightningAddress) return;
    try {
      await navigator.clipboard.writeText(lightningAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const copyInvoiceToClipboard = async () => {
    if (!invoice) return;
    const invoiceStr = invoice.startsWith("lightning:") ? invoice.slice(10) : invoice;
    try {
      await navigator.clipboard.writeText(invoiceStr);
      setCopiedInvoice(true);
      setTimeout(() => setCopiedInvoice(false), 2000);
    } catch (err) {
      console.error("Failed to copy invoice:", err);
    }
  };

  const handleConfirmZap = async () => {
    if (!actualAmount || actualAmount <= 0) return;

    setZapConfirmed(true);

    if (onZapSent) {
      try {
        await onZapSent(actualAmount);
      } catch (err) {
        console.error("[ZapDialog] Failed to post zap comment:", err);
      }
    }

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handlePresetSelect = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setIsCustom(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface className={styles.surface}>
        <DialogTitle>
          <div className={styles.header}>
            <div className={styles.titleRow}>
              <Flash24Filled className={styles.zapIcon} />
              <span>Send a Zap</span>
            </div>
            <Button
              className={styles.closeButton}
              appearance="subtle"
              icon={<Dismiss24Regular />}
              onClick={onClose}
              aria-label="Close"
              title="Close"
            />
          </div>
        </DialogTitle>
        <DialogBody>
          <DialogContent className={styles.content}>
            {/* Assignee info */}
            <div className={styles.assigneeInfo}>
              {assignee.imageUrl ? (
                <img src={assignee.imageUrl} alt={assignee.displayName} className={styles.avatar} />
              ) : (
                <div className={styles.avatar}>{getInitials(assignee.displayName)}</div>
              )}
              <div>
                <div className={styles.assigneeName}>{assignee.displayName}</div>
                <div className={styles.workItemId}>Work Item #{workItemId}</div>
              </div>
            </div>

            {isLoadingAddress ? (
              <div className={styles.loadingContainer}>
                <Spinner size="medium" />
                <span>Loading Lightning address...</span>
              </div>
            ) : !lightningAddress ? (
              <div className={styles.noAddressContainer}>
                <Flash24Filled className={styles.noAddressIcon} />
                <span className={styles.noAddressText}>
                  This user hasn&apos;t configured a Lightning address yet.
                </span>
                <span className={styles.noAddressHint}>
                  Ask them to add one in Organization Settings → Zaplie Settings.
                </span>
              </div>
            ) : zapConfirmed ? (
              <div className={styles.successContainer}>
                <div className={styles.successIcon}>
                  <Checkmark24Regular className={styles.successIconInner} />
                </div>
                <span className={styles.successText}>Zap recorded!</span>
                <span className={styles.successAmount}>
                  {actualAmount.toLocaleString()} sats sent to {assignee.displayName}
                </span>
              </div>
            ) : (
              <>
                <AmountSelector
                  selectedAmount={selectedAmount}
                  customAmount={customAmount}
                  isCustom={isCustom}
                  onPresetSelect={handlePresetSelect}
                  onCustomAmountChange={handleCustomAmountChange}
                  onCustomFocus={() => setIsCustom(true)}
                />

                <QRCodeDisplay
                  invoice={invoice}
                  lightningAddress={lightningAddress}
                  loading={invoiceLoading}
                  error={invoiceError}
                  onCopyAddress={copyAddressToClipboard}
                  onCopyInvoice={copyInvoiceToClipboard}
                  copiedAddress={copiedAddress}
                  copiedInvoice={copiedInvoice}
                />

                <Button
                  className={styles.confirmButton}
                  appearance="primary"
                  icon={<Flash24Filled />}
                  disabled={actualAmount <= 0}
                  onClick={handleConfirmZap}
                >
                  Let {assignee.displayName.split(" ")[0]} know you&apos;ve sent{" "}
                  {actualAmount > 0 ? actualAmount.toLocaleString() : "..."} sats
                </Button>

                <p className={styles.footerText}>
                  Pay with any Lightning wallet. Your tip will be recorded on the work item.
                </p>
              </>
            )}
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
