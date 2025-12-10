# Setup Instructions - GitHub Actions & Capacitor

## Prerequisites

### System Requirements
- **Node.js**: v18+ (verify with `node --version`)
- **npm**: 9+ (verify with `npm --version`)
- **Git**: Latest version
- **For iOS builds**: Mac with Xcode 14.3+ and CocoaPods
- **For Android builds**: Java 11+, Android SDK 24+, Gradle 7.0+

## Initial Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/AuthorCompanion.git
cd AuthorCompanion
```

### 2. Install Dependencies
```bash
cd frontend
npm ci  # Use ci instead of install for reproducible builds
cd ..
```

### 3. Build Web App
```bash
cd frontend
npm run build
cd ..
```

## GitHub Actions Setup

### 1. Secrets Configuration
Add these secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

```
Name: APPLE_ID
Value: your-apple-id@example.com

Name: APPLE_PASSWORD
Value: your-app-specific-password

Name: MATCH_PASSWORD
Value: your-match-password

Name: ANDROID_KEYSTORE
Value: base64-encoded-keystore-file

Name: ANDROID_KEYSTORE_PASS
Value: your-keystore-password

Name: ANDROID_KEY_ALIAS
Value: your-key-alias

Name: ANDROID_KEY_PASS
Value: your-key-password
```

### 2. Enable GitHub Actions
- Go to **Settings → Actions → General**
- Under "Actions permissions", select **Allow all actions and reusable workflows**
- Click **Save**

### 3. View Workflow Status
- Go to **Actions** tab
- See all workflow runs and their status
- Download build artifacts (APK, iOS build, etc.)

## Capacitor Setup

### 1. Setup iOS

**Requirements:**
- Xcode 14.3+
- CocoaPods installed

**Steps:**
```bash
cd frontend

# Add iOS platform
npx cap add ios

# Sync web assets to iOS
npx cap sync ios

# Open Xcode
npx cap open ios
```

**In Xcode:**
1. Select "App" in left sidebar
2. Go to **Build Settings → Search Path → Framework Search Paths**
3. Verify paths point to Pods folder
4. Build: Cmd + B
5. Archive: Product → Archive

### 2. Setup Android

**Requirements:**
- Android SDK 24+
- Java 11+
- `ANDROID_SDK_ROOT` environment variable set

**Steps:**
```bash
cd frontend

# Add Android platform
npx cap add android

# Sync web assets to Android
npx cap sync android

# Open Android Studio
npx cap open android
```

**In Android Studio:**
1. Sync Gradle files: File → Sync Now
2. Build → Build Bundle(s)/APK(s) → Build APK(s)
3. Find APK in: `android/app/build/outputs/apk/debug/`

## Build Scripts

### Web Only
```bash
cd frontend
npm run build
```

### All Platforms (using shell script)
```bash
# Make script executable (first time only)
chmod +x scripts/build-capacitor.sh

# Build all platforms
./scripts/build-capacitor.sh all

# Build specific platform
./scripts/build-capacitor.sh web
./scripts/build-capacitor.sh ios
./scripts/build-capacitor.sh android
```

## Development Workflow

### Local Development
```bash
cd frontend
npm run dev
# Visit http://localhost:5173
```

### Before Commit
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Run linter (if configured)
npm run lint

# Build to verify
npm run build
```

### Push to Repository
```bash
git add .
git commit -m "feat: Add new practice features"
git push origin main
```

**This automatically triggers:**
- ✅ Web build
- ✅ iOS build
- ✅ Android build
- ✅ Type checking
- ✅ All tests

## Troubleshooting

### Build Fails in GitHub Actions

**Android Build Error:**
```
Error: ANDROID_SDK_ROOT not set
```
**Solution:** Set environment variable or update workflow

**iOS Build Error:**
```
Error: xcodebuild not found
```
**Solution:** This only runs on macOS runners (already configured)

**Gradle Issues:**
```
Could not create service of type IdeaProject
```
**Solution:** Clear Android gradle cache: `./gradlew clean`

### Local Build Issues

**npm install fails:**
```bash
# Clear npm cache
npm cache clean --force

# Remove lock files
rm package-lock.json

# Reinstall
npm ci
```

**Capacitor sync issues:**
```bash
# Reset platform
npx cap remove ios
npx cap add ios
npx cap sync ios

# Or for Android
npx cap remove android
npx cap add android
npx cap sync android
```

**TypeScript errors after changes:**
```bash
# Check configuration
npx tsc --noEmit

# Fix with Pylance/ESLint if available
npm run lint
```

## Deployment Checklist

- [ ] All tests pass locally
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] GitHub Actions passes on all platforms
- [ ] Download and test built artifacts
- [ ] Version bump in `package.json`
- [ ] Create release on GitHub
- [ ] Upload APK to Google Play
- [ ] Upload build to TestFlight (iOS)

## Environment Variables

Create `.env.local` in `frontend/` directory:

```bash
# API Configuration
VITE_API_BASE_URL=https://api.example.com
VITE_DICTIONARY_API=https://api.dictionaryapi.dev/api/v2

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_OFFLINE_MODE=true

# App Configuration
VITE_APP_VERSION=1.0.0
VITE_BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
```

## Performance Tips

### For faster builds:
```bash
# Use npm ci instead of install
npm ci

# Build with specific packages only
npm run build -- --config custom.vite.config.ts

# Skip linting in CI
export SKIP_LINT=true
```

### For faster uploads:
```bash
# Compress artifacts
zip -r build.zip dist/

# Upload only changed files
git push --force-with-lease
```

## Monitoring

### GitHub Actions Metrics
- Visit **Insights → Actions** to see workflow performance
- Track build times, success rates
- Identify bottlenecks

### Application Metrics
- Check localStorage usage: DevTools → Application
- Monitor API calls: DevTools → Network
- Check performance: Lighthouse audit

## Support & Resources

- **GitHub Docs**: https://docs.github.com/actions
- **Capacitor Docs**: https://capacitorjs.com/docs
- **Vite Docs**: https://vitejs.dev/
- **React Docs**: https://react.dev/

---

**Setup Complete!** You're now ready to:
- ✅ Develop locally
- ✅ Build all platforms
- ✅ Deploy via GitHub Actions
- ✅ Publish to app stores

Questions? Check the [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for complete details.
