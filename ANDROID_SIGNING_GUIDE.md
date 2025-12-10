# 🔐 Android App Signing Guide

## Overview

This guide explains how to sign your Android app for release. Proper signing is **required** to install the app on devices and publish to the Google Play Store.

## Understanding the Problem

When you see errors like:
- "App not installed"
- "Package appears to be invalid"
- App shows as "unsigned"

This happens because the **release APK was not properly signed** with a keystore.

## What We Fixed

✅ Added signing configuration to `build.gradle`
✅ Updated app name from "Author Vocabulary Companion" to "Lextro"
✅ Created automatic fallback to debug signing for development
✅ Added keystore.properties support for production builds

## Quick Start

### For Development/Testing (No Setup Required)

The app now automatically uses **debug signing** for development:

```bash
cd frontend
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

The debug APK will be **signed automatically** and installable on any device.

**Output:** `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

### For Production Release (Keystore Required)

To build a properly signed release APK:

#### Step 1: Generate a Keystore (One-Time Setup)

```bash
cd frontend/android

# Generate a new keystore
keytool -genkey -v -keystore lextro-release.keystore -alias lextro-key -keyalg RSA -keysize 2048 -validity 10000

# You'll be prompted for:
# - Keystore password: (choose a strong password)
# - Key password: (can be same as keystore password)
# - Your name, organization, etc.
```

**⚠️ IMPORTANT:** Keep this keystore file and passwords **safe**! You'll need them for all future app updates.

#### Step 2: Configure Signing

Create `frontend/android/keystore.properties`:

```properties
storeFile=lextro-release.keystore
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=lextro-key
keyPassword=YOUR_KEY_PASSWORD
```

**⚠️ SECURITY:** Never commit `keystore.properties` to git! It's already in `.gitignore`.

#### Step 3: Build Release APK

```bash
cd frontend
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```

**Output:** `frontend/android/app/build/outputs/apk/release/app-release.apk`

This APK is now **properly signed** and ready for:
- ✅ Installing on any device
- ✅ Publishing to Google Play Store
- ✅ Distribution via other channels

## GitHub Actions / CI/CD Setup

To sign releases in GitHub Actions, add these secrets:

1. Go to: **Repository Settings → Secrets and variables → Actions**

2. Add these secrets:

```
ANDROID_KEYSTORE: (Base64-encoded keystore file)
ANDROID_KEYSTORE_PASSWORD: your_keystore_password
ANDROID_KEY_ALIAS: lextro-key
ANDROID_KEY_PASSWORD: your_key_password
```

3. Encode your keystore to Base64:

```bash
# macOS/Linux
base64 -i lextro-release.keystore | tr -d '\n'

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("lextro-release.keystore"))
```

4. Update `.github/workflows/build.yml` to use the secrets:

```yaml
- name: Setup Keystore
  run: |
    echo "${{ secrets.ANDROID_KEYSTORE }}" | base64 --decode > frontend/android/lextro-release.keystore
    echo "storeFile=lextro-release.keystore" > frontend/android/keystore.properties
    echo "storePassword=${{ secrets.ANDROID_KEYSTORE_PASSWORD }}" >> frontend/android/keystore.properties
    echo "keyAlias=${{ secrets.ANDROID_KEY_ALIAS }}" >> frontend/android/keystore.properties
    echo "keyPassword=${{ secrets.ANDROID_KEY_PASSWORD }}" >> frontend/android/keystore.properties

- name: Build Release APK
  working-directory: frontend/android
  run: ./gradlew assembleRelease
```

## App Naming

The app is now named **"Lextro"** as it appears:
- On the device home screen
- In the app drawer
- In the Android settings

Location: `frontend/android/app/src/main/res/values/strings.xml`

## Signing Configuration Details

The `build.gradle` now includes:

### Debug Build (Development)
- Uses Android's default debug keystore
- Automatically available on all development machines
- Location: `~/.android/debug.keystore`
- **No setup required**

### Release Build (Production)
- Uses your custom keystore if `keystore.properties` exists
- Falls back to debug keystore if not configured
- Recommended for Play Store releases

## Verification

### Check if APK is Signed

```bash
# View signature information
jarsigner -verify -verbose -certs app-release.apk

# Should show "jar verified" if properly signed
```

### Check App Name

```bash
# Extract app name from APK
aapt dump badging app-release.apk | grep "application-label"

# Should show: application-label:'Lextro'
```

## Troubleshooting

### "App not installed" Error

**Cause:** APK not signed properly

**Solution:** 
1. Ensure `keystore.properties` exists with correct values
2. Rebuild: `./gradlew clean assembleRelease`
3. Verify signing: `jarsigner -verify -verbose app-release.apk`

### "Cannot find keystore file"

**Cause:** Path in `keystore.properties` is incorrect

**Solution:** Use absolute path or place keystore in `frontend/android/` directory:
```properties
storeFile=lextro-release.keystore  # if in same directory
# OR
storeFile=/absolute/path/to/lextro-release.keystore
```

### "Wrong keystore password"

**Cause:** Password in `keystore.properties` doesn't match

**Solution:** Double-check passwords in `keystore.properties`

### Release builds still using debug signing

**Cause:** `keystore.properties` not found or has errors

**Solution:** The build falls back to debug signing automatically. Check:
1. `keystore.properties` exists in `frontend/android/`
2. File paths are correct
3. No syntax errors in the properties file

## Best Practices

✅ **Store keystore safely:** Keep backups in secure locations (password managers, encrypted drives)
✅ **Never commit keystore:** Already in `.gitignore`, but verify
✅ **Use strong passwords:** Minimum 8 characters, mix of letters/numbers/symbols
✅ **Document for your team:** Share keystore location securely with authorized team members
✅ **Use CI/CD secrets:** Never hardcode passwords in workflow files

## Files Changed

- ✅ `frontend/android/app/build.gradle` - Added signing configuration
- ✅ `frontend/android/app/src/main/res/values/strings.xml` - Updated app name to "Lextro"
- ✅ `frontend/android/.gitignore` - Ensured keystore files are ignored
- ✅ `frontend/android/keystore.properties.example` - Template for keystore config

## Next Steps

1. **For Development:** Just run `./gradlew assembleDebug` - signing is automatic
2. **For Production:** Follow the "Production Release" steps above to generate and configure a keystore
3. **For CI/CD:** Configure GitHub Actions secrets as described above

## Additional Resources

- [Android App Signing Documentation](https://developer.android.com/studio/publish/app-signing)
- [Managing Keystores](https://developer.android.com/studio/publish/app-signing#manage-keys)
- [Google Play Signing](https://support.google.com/googleplay/android-developer/answer/9842756)

---

**Status:** ✅ App signing is now properly configured!

For questions or issues, refer to this guide or check the Android documentation.
