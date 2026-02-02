# Zaplie for DevOps - Claude Code Context

This is an Azure DevOps extension that enables Bitcoin Lightning tipping (zaps) on work items.

## Project Overview

- **Type**: Azure DevOps Extension (VSIX)
- **Framework**: React 18 + TypeScript 5 + Fluent UI v9
- **Build System**: Webpack 5 + Gulp 4
- **Package Manager**: Bun

## Key Commands

```bash
# Install dependencies
bun install

# Build dev package (creates VSIX)
bun run package-dev

# Build release package
bun run package-release

# Lint
bun run lint

# Format
bun run format
```

## Architecture

### Entry Points

- `scripts/zapAction.tsx` - Work item context menu action (Zap dialog)
- `scripts/settings.tsx` - Organization settings hub (Lightning address config)

### Services

- `scripts/services/graphService.ts` - Microsoft Graph API for Lightning address storage
- `scripts/services/lightningService.ts` - LNURL-pay invoice fetching
- `scripts/services/workItemService.ts` - Azure DevOps REST API operations

### Components

- `scripts/components/ZapDialog.tsx` - Main zap dialog
- `scripts/components/AmountSelector.tsx` - Satoshi amount selection
- `scripts/components/QRCodeDisplay.tsx` - Lightning invoice QR code
- `scripts/components/SettingsForm.tsx` - Lightning address settings

## Extension Manifest

The `vss-extension.json` defines two contributions:

1. **zap-work-item-action** - Context menu action on work items
2. **zaplie-settings-hub** - Organization settings page

## Lightning Address Storage

Uses Microsoft Graph user profile extensions:
- Extension name: `zaplie.knowall.ai`
- Shared across all Zaplie apps (ZapDesk, Zaplie for DevOps)

## Testing

1. Build with `bun run package-dev`
2. Upload VSIX to Azure DevOps organization
3. Navigate to a work item with an assignee
4. Click "Zap" from context menu

## CI/CD

- `.github/workflows/ci.yml` - Lint, format, build on push/PR to main
- `.github/workflows/publish.yml` - Publish to marketplace on version tags

## Important Notes

- The VSS SDK uses PromiseLike (not Promise), so use `.then(success, error)` instead of `.catch()`
- Fluent UI v9 `makeStyles` doesn't support nested selectors like `&:hover`
- The extension bundles React 18 (doesn't use host's React 16)
