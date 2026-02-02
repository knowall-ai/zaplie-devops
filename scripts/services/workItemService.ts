/**
 * Azure DevOps Work Item Service
 * Handles work item operations via the DevOps REST API
 */

import type { Assignee, WorkItemContext } from "../types";

/**
 * Get the work item context from the action invocation
 * @returns Promise resolving to the work item context
 */
export function getWorkItemContext(): Promise<WorkItemContext> {
  return new Promise((resolve, reject) => {
    VSS.require(["VSS/SDK/Services/Navigation"], () => {
      try {
        const context = VSS.getConfiguration();
        if (context && context.workItemId) {
          resolve({
            id: context.workItemId,
            workItemId: context.workItemId,
            workItemTypeName: context.workItemTypeName,
          });
        } else {
          reject(new Error("Work item context not available"));
        }
      } catch (error) {
        reject(error);
      }
    });
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IdentityRef = any;

/**
 * Get the assignee of a work item
 * @param workItemId - The work item ID
 * @returns Promise resolving to the assignee info or null if unassigned
 */
export async function getWorkItemAssignee(workItemId: number): Promise<Assignee | null> {
  return new Promise((resolve, reject) => {
    VSS.require(
      ["TFS/WorkItemTracking/RestClient"],
      (WitClient: typeof import("TFS/WorkItemTracking/RestClient")) => {
        const client = WitClient.getClient();
        client
          .getWorkItem(workItemId, ["System.AssignedTo"])
          .then((workItem) => {
            const assignedTo = workItem.fields["System.AssignedTo"] as string | IdentityRef;
            if (!assignedTo) {
              resolve(null);
              return;
            }

            // AssignedTo can be a string or an IdentityRef object
            if (typeof assignedTo === "string") {
              resolve({
                id: "",
                displayName: assignedTo,
                uniqueName: assignedTo,
              });
            } else {
              resolve({
                id: assignedTo.id || "",
                displayName: assignedTo.displayName || "Unknown",
                uniqueName: assignedTo.uniqueName || assignedTo.displayName || "",
                imageUrl: assignedTo.imageUrl,
              });
            }
          })
          .then(undefined, (error: unknown) => {
            console.error("Failed to get work item assignee:", error);
            reject(error);
          });
      }
    );
  });
}

/**
 * Add a comment to a work item
 * @param workItemId - The work item ID
 * @param comment - The comment text (supports HTML)
 * @returns Promise resolving when comment is added
 */
export async function addWorkItemComment(workItemId: number, comment: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const webContext = VSS.getWebContext();
    const project = webContext.project.name;
    const baseUrl = webContext.collection.uri;

    // Use the Comments API (7.0-preview)
    const url = `${baseUrl}${encodeURIComponent(project)}/_apis/wit/workitems/${workItemId}/comments?api-version=7.0-preview`;

    VSS.getAccessToken()
      .then(async (sessionToken: ISessionToken) => {
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${sessionToken.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: comment,
            }),
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to add comment: ${response.status} - ${error}`);
          }

          resolve();
        } catch (error) {
          console.error("Failed to add work item comment:", error);
          reject(error);
        }
      })
      .then(undefined, (error: unknown) => {
        console.error("Failed to get access token:", error);
        reject(error);
      });
  });
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Format a zap comment for posting to a work item
 * @param senderName - Name of the person sending the zap
 * @param amount - Amount in satoshis
 * @param recipientName - Name of the recipient
 * @returns Formatted HTML comment
 */
export function formatZapComment(
  senderName: string,
  amount: number,
  recipientName: string
): string {
  const formattedAmount = amount.toLocaleString();
  // Escape user-controlled strings to prevent XSS
  const safeSenderName = escapeHtml(senderName);
  const safeRecipientName = escapeHtml(recipientName);
  const safeAmount = escapeHtml(formattedAmount);

  return `<div style="display: flex; align-items: center; gap: 8px;">
    <span style="color: #f7931a; font-size: 20px;">⚡</span>
    <span><strong>${safeSenderName}</strong> zapped <strong>${safeRecipientName}</strong> with <strong>${safeAmount} sats</strong></span>
  </div>`;
}

/**
 * Get the current user's display name
 * @returns The current user's display name
 */
export function getCurrentUserName(): string {
  const webContext = VSS.getWebContext();
  return webContext.user.name || "Unknown User";
}

/**
 * Get the current user's ID (email/unique name)
 * @returns The current user's unique identifier
 */
export function getCurrentUserId(): string {
  const webContext = VSS.getWebContext();
  return webContext.user.uniqueName || webContext.user.email || webContext.user.id;
}
