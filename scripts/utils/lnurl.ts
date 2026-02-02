/**
 * LNURL utilities for Lightning Network payments
 */

/**
 * Generate a Lightning URI for wallet deep links
 * @param lightningAddress - e.g. 'alice@example.com'
 * @returns Lightning URI (e.g. 'lightning:alice@example.com')
 */
export function lightningUri(lightningAddress: string): string {
  return `lightning:${lightningAddress}`;
}

/**
 * Validate a Lightning address format
 * @param address - The Lightning address to validate
 * @returns true if valid format (name@domain with exactly one @)
 */
export function isValidLightningAddress(address: string): boolean {
  if (!address) {
    return false;
  }
  const trimmed = address.trim();
  const parts = trimmed.split("@");
  // Must have exactly one @ (resulting in exactly 2 parts)
  if (parts.length !== 2) {
    return false;
  }
  const [name, domain] = parts;
  return Boolean(name && domain && domain.includes("."));
}

/**
 * Parse a Lightning address into name and domain
 * @param address - The Lightning address to parse
 * @returns Object with name and domain, or null if invalid
 */
export function parseLightningAddress(address: string): { name: string; domain: string } | null {
  if (!isValidLightningAddress(address)) {
    return null;
  }
  const trimmed = address.trim();
  const [name, domain] = trimmed.split("@");
  return { name, domain };
}
