# Zaplie for DevOps

Send Bitcoin Lightning tips (zaps) to your teammates directly from Azure DevOps work items!

## Features

- **One-Click Zapping**: Tip work item assignees with a single click from the context menu
- **Preset Amounts**: Quick selection of 100, 500, 1000, or 5000 satoshis
- **Custom Amounts**: Enter any amount you'd like to send
- **QR Code Display**: Scan with any Lightning wallet to pay
- **Automatic Comments**: Zaps are recorded as comments on the work item
- **Unified Lightning Address**: Your Lightning address is shared across all Zaplie apps

## How It Works

1. Open a work item and click the context menu (⋮)
2. Select "Zap"
3. Choose an amount
4. Scan the QR code with your Lightning wallet
5. Confirm the zap - a comment is automatically posted to the work item

## Setup

### Configure Your Lightning Address

1. Go to **Organization Settings** → **Zaplie Settings**
2. Enter your Lightning address (e.g., yourname@getalby.com)
3. Click **Test** to verify it works
4. Click **Save**

### Getting a Lightning Address

If you don't have a Lightning address yet, you can get one from:

- [Alby](https://getalby.com) - Browser extension wallet
- [Phoenix](https://phoenix.acinq.co) - Mobile wallet
- [Strike](https://strike.me) - Mobile app
- [Wallet of Satoshi](https://www.walletofsatoshi.com) - Simple mobile wallet

## Privacy

- Lightning addresses are stored in your Microsoft profile
- Only the zap amount and sender/recipient are visible in work item comments
- No transaction data is stored by the extension

## Support

- [Documentation](https://github.com/knowall-ai/zaplie-devops)
- [Report Issues](https://github.com/knowall-ai/zaplie-devops/issues)

## About

Built by [Knowall AI](https://knowall.ai) - Bringing Bitcoin to the enterprise.
