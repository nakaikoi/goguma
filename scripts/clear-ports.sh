#!/bin/bash

# Clear all ports used by Goguma development servers
# This kills processes running on common development ports

echo "🔍 Finding processes on Goguma ports..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to kill process on a port
kill_port() {
    local port=$1
    local name=$2
    
    # Find process using the port
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ -z "$pid" ]; then
        echo -e "${YELLOW}⚠️  Port $port ($name): No process found${NC}"
    else
        echo -e "${GREEN}✅ Killing process on port $port ($name) - PID: $pid${NC}"
        kill -9 $pid 2>/dev/null
        sleep 0.5
    fi
}

# Kill backend server (port 3000)
kill_port 3000 "Backend API"

# Kill Expo dev server (port 8081)
kill_port 8081 "Expo Dev Server"

# Kill Expo Metro bundler ports
kill_port 19000 "Expo Metro (19000)"
kill_port 19001 "Expo Metro (19001)"
kill_port 19002 "Expo Metro (19002)"

# Kill any tsx watch processes (backend dev server)
echo ""
echo "🔍 Finding tsx watch processes..."
TSX_PIDS=$(pgrep -f "tsx watch" 2>/dev/null)
if [ -z "$TSX_PIDS" ]; then
    echo -e "${YELLOW}⚠️  No tsx watch processes found${NC}"
else
    for pid in $TSX_PIDS; do
        echo -e "${GREEN}✅ Killing tsx watch process - PID: $pid${NC}"
        kill -9 $pid 2>/dev/null
    done
fi

# Kill any node processes related to expo
echo ""
echo "🔍 Finding Expo/Node processes..."
EXPO_PIDS=$(pgrep -f "expo start\|expo-cli\|@expo/cli" 2>/dev/null)
if [ -z "$EXPO_PIDS" ]; then
    echo -e "${YELLOW}⚠️  No Expo processes found${NC}"
else
    for pid in $EXPO_PIDS; do
        echo -e "${GREEN}✅ Killing Expo process - PID: $pid${NC}"
        kill -9 $pid 2>/dev/null
    done
fi

echo ""
echo -e "${GREEN}✨ Port clearing complete!${NC}"
echo ""
echo "You can now start fresh:"
echo "  Backend:  cd packages/backend && npm run dev"
echo "  Mobile:   cd packages/mobile && npm start"

