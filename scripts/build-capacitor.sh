#!/bin/bash

# Capacitor Build Script
# This script handles building the Capacitor apps for both iOS and Android

set -e

echo "🔨 Capacitor Build Script"
echo "========================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
WEB_DIR="frontend"
PLATFORMS=("ios" "android")

# Functions
build_web() {
    echo -e "${BLUE}📦 Building web app...${NC}"
    cd "$WEB_DIR"
    npm ci
    npm run build
    cd ..
    echo -e "${GREEN}✓ Web build complete${NC}"
}

setup_capacitor() {
    local platform=$1
    echo -e "${BLUE}⚙️  Setting up Capacitor for $platform...${NC}"
    
    cd "$WEB_DIR"
    
    # Check if platform already exists
    if [ ! -d "$platform" ]; then
        npx cap add "$platform"
    fi
    
    # Sync latest changes
    npx cap sync "$platform"
    
    cd ..
    echo -e "${GREEN}✓ Capacitor $platform setup complete${NC}"
}

build_ios() {
    echo -e "${BLUE}🍎 Building iOS app...${NC}"
    
    setup_capacitor "ios"
    
    cd "$WEB_DIR/ios/App"
    
    # Install pods
    if [ ! -d "Pods" ]; then
        pod install
    fi
    
    # Build for device
    xcodebuild -workspace App.xcworkspace \
              -scheme App \
              -configuration Release \
              -arch arm64 \
              -derivedDataPath build \
              BUILD_FOR_DEVICE=1
    
    cd ../../..
    echo -e "${GREEN}✓ iOS build complete${NC}"
}

build_android() {
    echo -e "${BLUE}🤖 Building Android app...${NC}"
    
    setup_capacitor "android"
    
    cd "$WEB_DIR/android"
    
    # Build APK
    chmod +x ./gradlew
    ./gradlew assembleRelease
    
    cd ../..
    echo -e "${GREEN}✓ Android build complete${NC}"
}

# Parse arguments
if [ $# -eq 0 ]; then
    # Build all by default
    echo "Building all platforms (web, iOS, Android)..."
    build_web
    build_ios
    build_android
else
    case "$1" in
        web)
            build_web
            ;;
        ios)
            build_web
            build_ios
            ;;
        android)
            build_web
            build_android
            ;;
        all)
            build_web
            build_ios
            build_android
            ;;
        *)
            echo "Usage: $0 [web|ios|android|all]"
            exit 1
            ;;
    esac
fi

echo -e "${GREEN}✅ Build complete!${NC}"
