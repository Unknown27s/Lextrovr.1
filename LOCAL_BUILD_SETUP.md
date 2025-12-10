# 🚀 Local Build Setup - Android (Windows)

## Current Status
✅ Web app built and ready
✅ Capacitor Android platform added
✅ Web assets synced

## Next Steps - Build Android APK

### Option 1: Using Gradle Command (Recommended)

```powershell
cd frontend/android

# Build Debug APK
./gradlew assembleDebug

# Build Release APK (requires signing)
./gradlew assembleRelease

# Output location:
# Debug: app\build\outputs\apk\debug\app-debug.apk
# Release: app\build\outputs\apk\release\app-release.apk
```

### Option 2: Using Android Studio

```powershell
cd frontend

# Open Android Studio
npx cap open android

# In Android Studio:
# 1. Wait for Gradle sync
# 2. Build → Build Bundle(s)/APK(s) → Build APK(s)
# 3. Find APK in: app → build → outputs → apk
```

## Prerequisites Check

Run this to verify all requirements:

```powershell
# Check Java
java -version

# Check Android SDK
$env:ANDROID_SDK_ROOT
# Should show: C:\Users\<YourUser>\AppData\Local\Android\Sdk

# Check Gradle (in android folder)
cd frontend/android
./gradlew -version
```

## Common Issues

### "gradlew not found"
```powershell
cd frontend/android
./gradlew --version  # This will initialize gradle if missing
```

### "JAVA_HOME not set"
```powershell
# Find Java installation
dir "C:\Program Files\Java"

# Set temporary (this session only)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-11"

# Set permanent (add to PATH)
# System Properties → Environment Variables → New
# JAVA_HOME = C:\Program Files\Java\jdk-11
```

### "Android SDK not found"
```powershell
# Install Android SDK via Android Studio or:
# Download from: https://developer.android.com/studio

# Set SDK path
$env:ANDROID_SDK_ROOT = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
```

## Build Commands Quick Reference

```powershell
# From: frontend/android

# Show available tasks
./gradlew tasks

# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# Build and run on connected device
./gradlew installDebug

# Clean build
./gradlew clean

# Check dependencies
./gradlew dependencies
```

## Testing Built APK

### On Physical Device
```powershell
# Connect device via USB, enable Developer Mode
# Then:
cd frontend/android
./gradlew installDebug
```

### On Android Emulator
```powershell
# Via Android Studio
npx cap open android
# Run → Run 'app'

# Or via command line:
./gradlew installDebug
```

## For iOS (macOS only)

If you have Mac access:

```bash
cd frontend
npx cap sync ios
npx cap open ios

# In Xcode:
# 1. Product → Build (⌘B)
# 2. Product → Run (⌘R)
# 3. Select simulator or device
```

---

## 📋 Build Checklist

- [ ] Web app builds: `npm run build`
- [ ] Capacitor Android set up: `npx cap add android`
- [ ] Web synced: `npx cap sync android`
- [ ] Java installed: `java -version`
- [ ] Android SDK set up
- [ ] Gradle initialized: `./gradlew -version`
- [ ] Build APK: `./gradlew assembleDebug`
- [ ] APK created: Check `app/build/outputs/apk/`
- [ ] Test on device/emulator

---

## Next: GitHub Actions Setup

After local build works, push to GitHub:

```powershell
cd f:\Git floder(Project)\AuthorCompanion

git add .
git commit -m "feat: Add Capacitor native builds and Lextro icons"
git push origin main
```

Then GitHub Actions will automatically:
- ✅ Build web app
- ✅ Build Android APK
- ✅ Build iOS app (if Mac runner available)
- ✅ Create release artifacts

Monitor at: https://github.com/Unknown27s/Lextro/actions

---

**Status:** Ready for local build! 🎉
