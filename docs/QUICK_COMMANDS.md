# Quick Commands Reference

Common commands for Goguma development.

## From Project Root (`/home/book/Projects/goguma`)

### Clear All Ports
```bash
npm run clear-ports
```
Kills all development servers (backend, Expo, Metro bundler).

### Start Backend
```bash
npm run dev:backend
# OR
cd packages/backend && npm run dev
```

### Start Mobile App
```bash
npm run dev:mobile
# OR
cd packages/mobile && npm start
```

### Install Dependencies
```bash
npm install
```

---

## From Backend Directory (`packages/backend`)

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Type Check
```bash
npm run type-check
```

---

## From Mobile Directory (`packages/mobile`)

### Start Expo Dev Server
```bash
npm start
```

### Run on iOS Simulator
```bash
npm run ios
```

### Run on Android Emulator
```bash
npm run android
```

---

## Common Workflows

### Full Restart (Clear and Start Fresh)
```bash
# From project root
npm run clear-ports
npm run dev:backend    # Terminal 1
npm run dev:mobile     # Terminal 2
```

### Quick Restart Backend
```bash
# From project root
npm run clear-ports
cd packages/backend && npm run dev
```

### Quick Restart Mobile
```bash
# From project root
npm run clear-ports
cd packages/mobile && npm start
```

---

## Troubleshooting Commands

### Check What's Running on Ports
```bash
# Check port 3000 (backend)
lsof -i:3000

# Check port 8081 (Expo)
lsof -i:8081

# Check all ports
lsof -i -P -n | grep LISTEN
```

### Kill Specific Port Manually
```bash
# Kill port 3000
kill -9 $(lsof -ti:3000)

# Kill port 8081
kill -9 $(lsof -ti:8081)
```

### Check Node Processes
```bash
ps aux | grep node
```

---

## Git Commands

### Commit Changes
```bash
git add .
git commit -m "Your message"
git push
```

### Check Status
```bash
git status
```

---

**Remember:** Most commands should be run from the **project root** (`/home/book/Projects/goguma`)!

