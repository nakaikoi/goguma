# Installing Node.js for Goguma

Since we can't install Node.js automatically (requires sudo), here are the options:

## Option 1: Install Node.js with sudo (Recommended)

Run these commands in your terminal:

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 9.x.x or higher
```

## Option 2: Install Node.js using NVM (No sudo required)

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js 20
nvm install 20
nvm use 20

# Verify
node --version
npm --version
```

## Option 3: Use Snap (if available)

```bash
sudo snap install node --classic
```

## After Installation

Once Node.js is installed, run:

```bash
cd /home/book/Projects/goguma

# Install all dependencies
npm install

# Test the environment
cd packages/backend
npx tsx src/test-env.ts

# Start the server
npm run dev
```

## Quick Test

After installing, test your setup:

```bash
# Test environment variables
cd packages/backend
bash scripts/validate-env.sh

# Test Supabase connection (requires Node.js)
npx tsx src/test-env.ts
```

