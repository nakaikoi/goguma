#!/bin/bash
# Script to upgrade Node.js to version 20

echo "🔄 Upgrading Node.js to version 20..."

# Remove old Node.js if installed via apt
echo "📦 Removing old Node.js installation..."
sudo apt remove -y nodejs npm 2>/dev/null || true

# Add NodeSource repository for Node.js 20
echo "📥 Adding NodeSource repository..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js 20
echo "⬇️  Installing Node.js 20..."
sudo apt-get install -y nodejs

# Verify installation
echo ""
echo "✅ Installation complete!"
echo ""
node --version
npm --version

echo ""
echo "🎉 Node.js upgraded successfully!"

