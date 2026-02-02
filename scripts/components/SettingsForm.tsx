import * as React from "react";
import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Label,
  Spinner,
  makeStyles,
  tokens,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from "@fluentui/react-components";
import {
  Flash24Filled,
  Checkmark24Regular,
  Dismiss24Regular,
  ArrowSync24Regular,
} from "@fluentui/react-icons";

import { isValidLightningAddress } from "../utils/lnurl";
import { testLightningAddress } from "../services/lightningService";

const useStyles = makeStyles({
  container: {
    maxWidth: "600px",
    padding: "24px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
  },
  headerIcon: {
    color: "#f7931a",
    fontSize: "32px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: tokens.colorNeutralForeground1,
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: tokens.colorNeutralForeground3,
    marginTop: "4px",
  },
  section: {
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: tokens.colorNeutralForeground1,
    marginBottom: "8px",
  },
  sectionDescription: {
    fontSize: "14px",
    color: tokens.colorNeutralForeground3,
    marginBottom: "16px",
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "4px",
    fontWeight: "500",
  },
  inputRow: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
  },
  input: {
    flex: 1,
  },
  buttonGroup: {
    display: "flex",
    gap: "8px",
    marginTop: "16px",
  },
  saveButton: {
    backgroundColor: "#f7931a",
    color: "white",
  },
  messageBar: {
    marginBottom: "16px",
  },
  validationResult: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "8px",
    fontSize: "14px",
  },
  validIcon: {
    color: "#22c55e",
  },
  invalidIcon: {
    color: "#ef4444",
  },
  infoBox: {
    padding: "16px",
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: "8px",
    marginTop: "24px",
  },
  infoTitle: {
    fontWeight: "600",
    marginBottom: "8px",
  },
  infoList: {
    margin: 0,
    paddingLeft: "20px",
  },
});

interface SettingsFormProps {
  currentAddress: string | null;
  isLoading: boolean;
  onSave: (address: string) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}

export function SettingsForm({ currentAddress, isLoading, onSave, onDelete }: SettingsFormProps) {
  const styles = useStyles();

  const [address, setAddress] = useState(currentAddress || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    setAddress(currentAddress || "");
  }, [currentAddress]);

  const handleTest = async () => {
    if (!address || !isValidLightningAddress(address)) {
      setTestResult({ valid: false, error: "Invalid Lightning address format" });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testLightningAddress(address);
      setTestResult(result);
    } catch (err) {
      setTestResult({
        valid: false,
        error: err instanceof Error ? err.message : "Test failed",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!address) {
      setMessage({ type: "error", text: "Please enter a Lightning address" });
      return;
    }

    if (!isValidLightningAddress(address)) {
      setMessage({
        type: "error",
        text: "Invalid Lightning address format (expected: name@domain)",
      });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const success = await onSave(address);
      if (success) {
        setMessage({ type: "success", text: "Lightning address saved successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to save Lightning address" });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentAddress) return;

    setIsDeleting(true);
    setMessage(null);

    try {
      const success = await onDelete();
      if (success) {
        setAddress("");
        setMessage({ type: "success", text: "Lightning address removed" });
      } else {
        setMessage({ type: "error", text: "Failed to remove Lightning address" });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to remove",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Spinner size="medium" label="Loading settings..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Flash24Filled className={styles.headerIcon} />
        <div>
          <h1 className={styles.title}>Zaplie Settings</h1>
          <p className={styles.subtitle}>Configure your Lightning address to receive zaps</p>
        </div>
      </div>

      {message && (
        <MessageBar
          className={styles.messageBar}
          intent={
            message.type === "error" ? "error" : message.type === "success" ? "success" : "info"
          }
        >
          <MessageBarBody>
            <MessageBarTitle>
              {message.type === "error" ? "Error" : message.type === "success" ? "Success" : "Info"}
            </MessageBarTitle>
            {message.text}
          </MessageBarBody>
        </MessageBar>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Your Lightning Address</h2>
        <p className={styles.sectionDescription}>
          Enter your Lightning address so others can send you sats when they zap your work items.
        </p>

        <div className={styles.formGroup}>
          <Label className={styles.label} htmlFor="lightning-address">
            Lightning Address
          </Label>
          <div className={styles.inputRow}>
            <Input
              id="lightning-address"
              className={styles.input}
              placeholder="you@wallet.com"
              value={address}
              onChange={(_e, data) => {
                setAddress(data.value);
                setTestResult(null);
              }}
            />
            <Button
              appearance="secondary"
              icon={isTesting ? <Spinner size="tiny" /> : <ArrowSync24Regular />}
              onClick={handleTest}
              disabled={isTesting || !address}
            >
              Test
            </Button>
          </div>

          {testResult && (
            <div className={styles.validationResult}>
              {testResult.valid ? (
                <>
                  <Checkmark24Regular className={styles.validIcon} />
                  <span style={{ color: "#22c55e" }}>Lightning address is valid!</span>
                </>
              ) : (
                <>
                  <Dismiss24Regular className={styles.invalidIcon} />
                  <span style={{ color: "#ef4444" }}>{testResult.error}</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className={styles.buttonGroup}>
          <Button
            className={styles.saveButton}
            appearance="primary"
            icon={isSaving ? <Spinner size="tiny" /> : <Checkmark24Regular />}
            onClick={handleSave}
            disabled={isSaving || !address}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
          {currentAddress && (
            <Button
              appearance="secondary"
              icon={isDeleting ? <Spinner size="tiny" /> : <Dismiss24Regular />}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Removing..." : "Remove"}
            </Button>
          )}
        </div>
      </div>

      <div className={styles.infoBox}>
        <div className={styles.infoTitle}>How to get a Lightning address</div>
        <ul className={styles.infoList}>
          <li>Use a Lightning-enabled wallet like Alby, Phoenix, or Strike</li>
          <li>Your Lightning address looks like an email: yourname@getalby.com</li>
          <li>Once set up, teammates can zap you directly from work items</li>
        </ul>
      </div>
    </div>
  );
}
