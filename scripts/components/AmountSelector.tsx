import * as React from "react";
import { Button, Input, makeStyles, tokens } from "@fluentui/react-components";
import { DEFAULT_ZAP_PRESETS } from "../types";

const useStyles = makeStyles({
  container: {
    marginBottom: "24px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    color: tokens.colorNeutralForeground3,
  },
  presetGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
    marginBottom: "12px",
  },
  presetButton: {
    minWidth: "auto",
  },
  presetButtonSelected: {
    minWidth: "auto",
    backgroundColor: "rgba(247, 147, 26, 0.2)",
    color: "#f7931a",
  },
  customRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  customInput: {
    flex: 1,
  },
  satsLabel: {
    fontSize: "14px",
    color: tokens.colorNeutralForeground3,
    paddingRight: "12px",
  },
});

interface AmountSelectorProps {
  selectedAmount: number;
  customAmount: string;
  isCustom: boolean;
  onPresetSelect: (amount: number) => void;
  onCustomAmountChange: (value: string) => void;
  onCustomFocus: () => void;
}

export function AmountSelector({
  selectedAmount,
  customAmount,
  isCustom,
  onPresetSelect,
  onCustomAmountChange,
  onCustomFocus,
}: AmountSelectorProps) {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <label className={styles.label}>Amount (sats)</label>
      <div className={styles.presetGrid}>
        {DEFAULT_ZAP_PRESETS.map((amount) => (
          <Button
            key={amount}
            appearance={!isCustom && selectedAmount === amount ? "primary" : "secondary"}
            className={
              !isCustom && selectedAmount === amount
                ? styles.presetButtonSelected
                : styles.presetButton
            }
            onClick={() => onPresetSelect(amount)}
          >
            {amount.toLocaleString()}
          </Button>
        ))}
      </div>
      <div className={styles.customRow}>
        <Input
          className={styles.customInput}
          type="number"
          placeholder="Custom amount"
          value={customAmount}
          onChange={(_e, data) => onCustomAmountChange(data.value)}
          onFocus={onCustomFocus}
          min={1}
          max={1000000}
        />
        <span className={styles.satsLabel}>sats</span>
      </div>
    </div>
  );
}
