///<reference types="vss-web-extension-sdk" />
import "promise-polyfill/src/polyfill";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

import { SettingsForm } from "./components/SettingsForm";
import {
  getLightningAddress,
  saveLightningAddress,
  deleteLightningAddress,
  getGraphToken,
} from "./services/graphService";
import { getCurrentUserId } from "./services/workItemService";

interface SettingsState {
  isLoading: boolean;
  currentAddress: string | null;
  userId: string;
  graphToken: string | null;
}

class Settings extends React.Component<Record<string, never>, SettingsState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      isLoading: true,
      currentAddress: null,
      userId: "",
      graphToken: null,
    };
  }

  componentDidMount() {
    this.initialize();
  }

  async initialize() {
    try {
      const userId = getCurrentUserId();
      const token = await getGraphToken();

      this.setState({
        userId,
        graphToken: token,
      });

      // Fetch current Lightning address
      const address = await getLightningAddress(token, userId);
      this.setState({
        isLoading: false,
        currentAddress: address,
      });
    } catch (error) {
      console.error("Failed to initialize settings:", error);
      this.setState({
        isLoading: false,
      });
    }
  }

  handleSave = async (address: string): Promise<boolean> => {
    const { graphToken, userId } = this.state;
    if (!graphToken || !userId) return false;

    try {
      const success = await saveLightningAddress(graphToken, userId, address);
      if (success) {
        this.setState({ currentAddress: address });
      }
      return success;
    } catch (error) {
      console.error("Failed to save Lightning address:", error);
      return false;
    }
  };

  handleDelete = async (): Promise<boolean> => {
    const { graphToken, userId } = this.state;
    if (!graphToken || !userId) return false;

    try {
      const success = await deleteLightningAddress(graphToken, userId);
      if (success) {
        this.setState({ currentAddress: null });
      }
      return success;
    } catch (error) {
      console.error("Failed to delete Lightning address:", error);
      return false;
    }
  };

  render() {
    const { isLoading, currentAddress } = this.state;

    return (
      <FluentProvider theme={webLightTheme}>
        <SettingsForm
          currentAddress={currentAddress}
          isLoading={isLoading}
          onSave={this.handleSave}
          onDelete={this.handleDelete}
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
  const container = document.querySelector(".settings-container");
  if (container) {
    const root: Root = createRoot(container);
    root.render(<Settings />);
  }
  VSS.notifyLoadSucceeded();
});
