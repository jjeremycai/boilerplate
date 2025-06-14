#!/bin/bash

echo "🚀 CI/CD Build Script"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Navigate to web app
cd apps/web || exit 1

# Clean previous builds
echo -e "${YELLOW}Cleaning previous builds...${NC}"
rm -rf dist
rm -rf node_modules/.vite
rm -rf .turbo

# Always install dependencies in CI to ensure they're up to date
echo -e "${YELLOW}Installing dependencies...${NC}"
bun install --frozen-lockfile || bun install

# Build with error handling
echo -e "${YELLOW}Building web application with Remix...${NC}"

# Build with Remix
echo -e "${YELLOW}Running Remix build...${NC}"
if NODE_OPTIONS="--max-old-space-size=8192" bun run build 2>&1; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    echo -e "${RED}Trying to get more error details...${NC}"
    # Try running build with more verbose output
    NODE_OPTIONS="--max-old-space-size=8192" npx remix build --sourcemap 2>&1 || true
    exit 1
fi

# Verify output (Remix outputs to build/ directory)
if [ -d "build" ] && [ -n "$(ls -A build)" ]; then
    echo -e "${GREEN}✓ Build output verified${NC}"
    ls -la build/
    
    # Create dist directory for compatibility with worker
    echo -e "${YELLOW}Creating dist directory for worker compatibility...${NC}"
    mkdir -p dist
    cp -r public/* dist/ 2>/dev/null || true
    cp -r build/client/* dist/ 2>/dev/null || true
    
    exit 0
else
    echo -e "${RED}✗ No build output found${NC}"
    exit 1
fi