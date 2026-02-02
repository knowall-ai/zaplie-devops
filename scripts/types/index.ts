/**
 * Zaplie for DevOps - Type Definitions
 */

// Zap configuration for user settings
export interface ZapConfig {
  lightningAddress: string;
  presetAmounts: number[]; // in satoshis
  customAmountsEnabled: boolean;
}

// Represents a completed zap payment
export interface ZapPayment {
  id: string;
  workItemId: number;
  assigneeId: string;
  assigneeName: string;
  assigneeLightningAddress: string;
  amount: number; // in satoshis
  timestamp: Date;
  message?: string;
}

// Work item context from Azure DevOps
export interface WorkItemContext {
  id: number;
  workItemId: number;
  workItemTypeName?: string;
}

// Assignee information from work item
export interface Assignee {
  id: string;
  displayName: string;
  uniqueName: string;
  imageUrl?: string;
}

// LNURL-pay metadata response
export interface LnurlPayMetadata {
  callback: string;
  maxSendable: number;
  minSendable: number;
  metadata: string;
  commentAllowed?: number;
  tag: string;
}

// LNURL-pay invoice response
export interface LnurlPayInvoice {
  pr: string; // BOLT11 payment request
  routes?: unknown[];
  successAction?: {
    tag: string;
    message?: string;
    url?: string;
  };
}

// Microsoft Graph extension data
export interface GraphExtension {
  "@odata.type": string;
  extensionName: string;
  lightningAddress: string;
}

// Default preset amounts for zapping (in satoshis)
export const DEFAULT_ZAP_PRESETS = [100, 500, 1000, 5000] as const;
export type ZapPreset = (typeof DEFAULT_ZAP_PRESETS)[number];
