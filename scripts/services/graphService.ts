/**
 * Microsoft Graph API Service
 * Handles user profile extensions for storing Lightning Addresses
 *
 * Uses the zaplie.knowall.ai extension name for unified storage across Zaplie apps
 */

import type { GraphExtension } from "../types";

const GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";
const EXTENSION_NAME = "zaplie.knowall.ai";

/**
 * Get a Graph API token from the VSS SDK
 * @returns Promise resolving to the access token
 */
export async function getGraphToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    VSS.getAccessToken().then(
      (sessionToken: ISessionToken) => {
        resolve(sessionToken.token);
      },
      (error: unknown) => {
        reject(new Error(`Failed to get auth token: ${error}`));
      }
    );
  });
}

/**
 * Get the Lightning Address for a user from their Microsoft profile extension
 * @param graphToken - Bearer token for Graph API
 * @param userId - User ID or email address
 * @returns The Lightning address or null if not set
 */
export async function getLightningAddress(
  graphToken: string,
  userId: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${GRAPH_BASE_URL}/users/${encodeURIComponent(userId)}/extensions/${EXTENSION_NAME}`,
      {
        headers: {
          Authorization: `Bearer ${graphToken}`,
        },
      }
    );

    if (response.status === 404) {
      // Extension doesn't exist yet
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to get Lightning Address:", error);
      return null;
    }

    const data = (await response.json()) as GraphExtension;
    return data.lightningAddress || null;
  } catch (error) {
    console.error("Error getting Lightning Address:", error);
    return null;
  }
}

/**
 * Save the Lightning Address to a user's Microsoft profile extension
 * @param graphToken - Bearer token for Graph API
 * @param userId - User ID or email address
 * @param lightningAddress - The Lightning address to save
 * @returns true if successful
 */
export async function saveLightningAddress(
  graphToken: string,
  userId: string,
  lightningAddress: string
): Promise<boolean> {
  try {
    // First, try to update existing extension
    const updateResponse = await fetch(
      `${GRAPH_BASE_URL}/users/${encodeURIComponent(userId)}/extensions/${EXTENSION_NAME}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${graphToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lightningAddress,
        }),
      }
    );

    if (updateResponse.ok) {
      return true;
    }

    // If extension doesn't exist (404), create it
    if (updateResponse.status === 404) {
      const createResponse = await fetch(
        `${GRAPH_BASE_URL}/users/${encodeURIComponent(userId)}/extensions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${graphToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "@odata.type": "microsoft.graph.openTypeExtension",
            extensionName: EXTENSION_NAME,
            lightningAddress,
          }),
        }
      );

      if (createResponse.ok) {
        return true;
      }

      const error = await createResponse.json();
      console.error("Failed to create Lightning Address extension:", error);
      return false;
    }

    const error = await updateResponse.json();
    console.error("Failed to update Lightning Address:", error);
    return false;
  } catch (error) {
    console.error("Error saving Lightning Address:", error);
    return false;
  }
}

/**
 * Delete the Lightning Address extension from a user's profile
 * @param graphToken - Bearer token for Graph API
 * @param userId - User ID or email address
 * @returns true if successful or already deleted
 */
export async function deleteLightningAddress(graphToken: string, userId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${GRAPH_BASE_URL}/users/${encodeURIComponent(userId)}/extensions/${EXTENSION_NAME}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${graphToken}`,
        },
      }
    );

    return response.ok || response.status === 404;
  } catch (error) {
    console.error("Error deleting Lightning Address:", error);
    return false;
  }
}
