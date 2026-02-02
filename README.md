# Zaplie for DevOps

Azure DevOps extension for Bitcoin Lightning tipping (zaps) on work items.

## Overview

Zaplie enables team members to send Bitcoin Lightning tips to each other directly from Azure DevOps work items. Recognize great work with sats!

## Features

- Zap work item assignees from the context menu
- Preset amounts: 100, 500, 1000, 5000 sats
- Custom amount support
- QR code for Lightning wallet scanning
- Automatic comment posting on zap confirmation
- Settings hub for Lightning address configuration

## Installation

### From Marketplace

Install from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=knowall-ai.zaplie-devops)

### From Source

```bash
# Install dependencies
bun install

# Build development package
bun run package-dev

# Upload VSIX to your organization
```

## Development

### Prerequisites

- Bun (or Node.js 18+)
- tfx-cli (`npm install -g tfx-cli`)

### Commands

```bash
# Install dependencies
bun install

# Build dev package
bun run package-dev

# Build release package
bun run package-release

# Lint
bun run lint

# Format check
bun run format:check

# Format fix
bun run format

# Type check
bun run typecheck
```

### Project Structure

```
zaplie-devops/
├── scripts/
│   ├── components/      # React components
│   ├── services/        # API services
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities
│   ├── zapAction.tsx    # Zap dialog entry point
│   └── settings.tsx     # Settings hub entry point
├── styles/              # SCSS styles
├── img/                 # Extension icons
├── docs/                # Documentation
├── vss-extension.json   # Extension manifest
└── package.json
```

## Configuration

### User Setup

1. Go to Organization Settings → Zaplie Settings
2. Enter your Lightning address
3. Test and save

### CI/CD

Add `MARKETPLACE_PAT` secret to your GitHub repository for automated publishing.

## Documentation

- [Solution Design](docs/SOLUTION_DESIGN.adoc)
- [Deployment Guide](docs/DEPLOY.adoc)
- [Troubleshooting](docs/TROUBLESHOOTING.adoc)

## Tech Stack

- React 18
- TypeScript 5
- Fluent UI v9
- Webpack 5
- qrcode.react

## License

MIT

## Author

[Knowall AI](https://knowall.ai)
