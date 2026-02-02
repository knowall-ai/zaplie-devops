///<reference types="vss-web-extension-sdk" />
import "promise-polyfill/src/polyfill";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

import { ZapDialog } from "./components/ZapDialog";
import type { Assignee } from "./types";
import { getLightningAddress, getGraphToken } from "./services/graphService";
import {
  getWorkItemAssignee,
  addWorkItemComment,
  formatZapComment,
  getCurrentUserName,
} from "./services/workItemService";

interface ZapActionState {
  isLoading: boolean;
  assignee: Assignee | null;
  lightningAddress: string | null;
  isLoadingAddress: boolean;
  workItemId: number;
  error: string | null;
}

class ZapAction extends React.Component<Record<string, never>, ZapActionState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      isLoading: true,
      assignee: null,
      lightningAddress: null,
      isLoadingAddress: false,
      workItemId: 0,
      error: null,
    };
  }

  componentDidMount() {
    this.initialize();
  }

  async initialize() {
    try {
      // Get work item context from action invocation
      const config = VSS.getConfiguration();
      const workItemIds = config.workItemIds || [];
      const workItemId = config.workItemId || (workItemIds.length > 0 ? workItemIds[0] : 0);

      if (!workItemId) {
        this.setState({
          isLoading: false,
          error: "No work item selected",
        });
        return;
      }

      this.setState({ workItemId });

      // Get assignee
      const assignee = await getWorkItemAssignee(workItemId);
      if (!assignee) {
        this.setState({
          isLoading: false,
          error: "This work item has no assignee",
        });
        return;
      }

      this.setState({
        isLoading: false,
        assignee,
        isLoadingAddress: true,
      });

      // Fetch Lightning address for assignee
      await this.fetchLightningAddress(assignee);
    } catch (error) {
      console.error("Failed to initialize zap action:", error);
      this.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load work item",
      });
    }
  }

  async fetchLightningAddress(assignee: Assignee) {
    try {
      const token = await getGraphToken();
      const userId = assignee.uniqueName || assignee.id;
      const address = await getLightningAddress(token, userId);
      this.setState({
        lightningAddress: address,
        isLoadingAddress: false,
      });
    } catch (error) {
      console.error("Failed to fetch Lightning address:", error);
      this.setState({
        isLoadingAddress: false,
      });
    }
  }

  handleClose = () => {
    // Close the dialog/panel
    const config = VSS.getConfiguration();
    if (config.close) {
      config.close();
    }
  };

  handleZapSent = async (amount: number) => {
    const { workItemId, assignee } = this.state;
    if (!assignee) return;

    try {
      const senderName = getCurrentUserName();
      const comment = formatZapComment(senderName, amount, assignee.displayName);
      await addWorkItemComment(workItemId, comment);
    } catch (error) {
      console.error("Failed to post zap comment:", error);
      throw error;
    }
  };

  render() {
    const { isLoading, assignee, lightningAddress, isLoadingAddress, workItemId, error } =
      this.state;

    if (isLoading) {
      return (
        <FluentProvider theme={webLightTheme}>
          <div className="zap-loading">
            <div className="loading-spinner"></div>
            <span>Loading...</span>
          </div>
        </FluentProvider>
      );
    }

    if (error) {
      return (
        <FluentProvider theme={webLightTheme}>
          <div className="zap-error">
            <span>{error}</span>
          </div>
        </FluentProvider>
      );
    }

    if (!assignee) {
      return (
        <FluentProvider theme={webLightTheme}>
          <div className="zap-error">
            <span>Work item has no assignee</span>
          </div>
        </FluentProvider>
      );
    }

    return (
      <FluentProvider theme={webLightTheme}>
        <ZapDialog
          isOpen={true}
          onClose={this.handleClose}
          assignee={assignee}
          workItemId={workItemId}
          lightningAddress={lightningAddress}
          isLoadingAddress={isLoadingAddress}
          onZapSent={this.handleZapSent}
        />
      </FluentProvider>
    );
  }
}

VSS.init({
  explicitNotifyLoaded: true,
  usePlatformScripts: true,
  applyTheme: true,
});

VSS.ready(() => {
  const container = document.querySelector(".zap-container");
  if (container) {
    const root: Root = createRoot(container);
    root.render(<ZapAction />);
  }
  VSS.notifyLoadSucceeded();
});
