/**
 * Lightning Network Service
 * Handles LNURL-pay invoice fetching from Lightning addresses
 */

import type { LnurlPayMetadata, LnurlPayInvoice } from "../types";
import { parseLightningAddress } from "../utils/lnurl";

export interface FetchInvoiceOptions {
  lightningAddress: string;
  amountSats: number;
  comment?: string;
}

export interface InvoiceResult {
  invoice: string;
  walletUri: string;
}

/**
 * Fetch a BOLT11 invoice from a Lightning address via LNURL-pay
 * @param options - The invoice request options
 * @returns The invoice and wallet URI
 * @throws Error if the invoice cannot be fetched
 */
export async function fetchInvoice(options: FetchInvoiceOptions): Promise<InvoiceResult> {
  const { lightningAddress, amountSats, comment } = options;

  // Handle direct LNURL or invoice strings
  if (
    lightningAddress.toLowerCase().startsWith("lnurl") ||
    lightningAddress.toLowerCase().startsWith("ln")
  ) {
    return {
      invoice: lightningAddress,
      walletUri: `lightning:${lightningAddress}`,
    };
  }

  // Parse the Lightning address
  const parsed = parseLightningAddress(lightningAddress);
  if (!parsed) {
    throw new Error("Invalid Lightning Address format");
  }

  const { name, domain } = parsed;
  const lnurlpUrl = `https://${domain}/.well-known/lnurlp/${encodeURIComponent(name)}`;

  // Fetch LNURL-pay metadata
  const metaRes = await fetch(lnurlpUrl);
  if (!metaRes.ok) {
    throw new Error(`LNURL endpoint returned ${metaRes.status}`);
  }

  const meta = (await metaRes.json()) as LnurlPayMetadata;
  if (!meta.callback) {
    throw new Error("No LNURL callback found in response");
  }

  // Validate callback URL for security
  validateCallbackUrl(meta.callback, domain);

  // Convert sats to millisats
  const amountMsat = amountSats * 1000;

  // Build callback URL with amount
  const separator = meta.callback.includes("?") ? "&" : "?";
  let callbackUrl = `${meta.callback}${separator}amount=${amountMsat}`;

  // Add comment if the service supports it
  if (comment && meta.commentAllowed && meta.commentAllowed > 0) {
    const truncatedComment = comment.slice(0, meta.commentAllowed);
    callbackUrl += `&comment=${encodeURIComponent(truncatedComment)}`;
  }

  // Fetch the invoice
  const invRes = await fetch(callbackUrl);
  if (!invRes.ok) {
    throw new Error(`Invoice callback returned ${invRes.status}`);
  }

  const invData = (await invRes.json()) as LnurlPayInvoice;
  if (!invData.pr) {
    throw new Error("No invoice (pr) received from server");
  }

  // Validate BOLT11 invoice format
  validateBolt11Invoice(invData.pr);

  const invoiceUri = `lightning:${invData.pr}`;

  return {
    invoice: invoiceUri,
    walletUri: invoiceUri,
  };
}

/**
 * Validate that a callback URL is secure and matches the expected domain
 */
function validateCallbackUrl(callbackUrl: string, expectedDomain: string): void {
  try {
    const callbackUrlObj = new URL(callbackUrl);

    if (callbackUrlObj.protocol !== "https:") {
      throw new Error("Callback URL must use HTTPS");
    }

    // Allow same domain or subdomains (exact match or dot-boundary subdomain)
    const hostname = callbackUrlObj.hostname;
    if (hostname !== expectedDomain && !hostname.endsWith("." + expectedDomain)) {
      throw new Error("Callback URL domain does not match Lightning address domain");
    }
  } catch (urlErr) {
    if (urlErr instanceof Error && urlErr.message.includes("Invalid URL")) {
      throw new Error("Invalid callback URL format");
    }
    throw urlErr;
  }
}

/**
 * Validate that a string is a valid BOLT11 invoice
 */
function validateBolt11Invoice(pr: string): void {
  if (typeof pr !== "string") {
    throw new Error("Invalid invoice format received from server");
  }

  const normalizedPr = pr.toLowerCase();
  const basicBolt11Pattern = /^[0-9a-zA-Z]+$/;

  if (!normalizedPr.startsWith("ln") || pr.length < 10 || !basicBolt11Pattern.test(pr)) {
    throw new Error("Malformed Lightning invoice received from server");
  }
}

/**
 * Test if a Lightning address is valid by fetching its LNURL-pay metadata
 * @param lightningAddress - The address to test
 * @returns Object with success status and any error message
 */
export async function testLightningAddress(
  lightningAddress: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const parsed = parseLightningAddress(lightningAddress);
    if (!parsed) {
      return { valid: false, error: "Invalid Lightning Address format" };
    }

    const { name, domain } = parsed;
    const lnurlpUrl = `https://${domain}/.well-known/lnurlp/${encodeURIComponent(name)}`;

    const response = await fetch(lnurlpUrl);
    if (!response.ok) {
      return { valid: false, error: `LNURL endpoint returned ${response.status}` };
    }

    const meta = (await response.json()) as LnurlPayMetadata;
    if (!meta.callback) {
      return { valid: false, error: "No LNURL callback found" };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Failed to validate address",
    };
  }
}
