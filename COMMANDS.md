# Helpful Commands Reference

Quick reference for common development tasks.

## 🚀 Running the App

### Start Development Server

```bash
# Start Metro bundler
yarn start

# Start with cache reset
yarn start --reset-cache
```

### Run on iOS

```bash
# Default simulator
yarn ios

# Specific simulator
yarn ios --simulator="iPhone 15 Pro"
yarn ios --simulator="iPhone 14"
yarn ios --simulator="iPad Pro (12.9-inch)"

# Physical device
yarn ios --device

# Release build
yarn ios --configuration Release
```

### Run on Android (when configured)

```bash
# Default emulator
yarn android

# Release build
yarn android --variant=release
```

## 🧹 Cleaning & Resetting

### Clean Metro Cache

```bash
yarn start --reset-cache
```

### Clean iOS Build

```bash
cd ios
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData
cd ..
```

### Clean Pods

```bash
cd ios
rm -rf Pods
rm Podfile.lock
pod install
cd ..
```

### Clean Everything

```bash
# Clean watchman
watchman watch-del-all

# Clean Metro
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# Clean node modules
rm -rf node_modules
yarn install

# Clean iOS
cd ios
rm -rf build Pods
pod install
cd ..
```

### Reset App Data

```bash
# Delete app from simulator
# Then reinstall with:
yarn ios
```

## 🔍 Development Tools

### Type Checking

```bash
# Check types
yarn tsc --noEmit

# Watch mode
yarn tsc --noEmit --watch
```

### Linting

```bash
# Run ESLint
yarn lint

# Fix auto-fixable issues
yarn lint --fix
```

### Testing

```bash
# Run tests
yarn test

# Watch mode
yarn test --watch

# Coverage
yarn test --coverage
```

## 📱 iOS Specific

### List Available Simulators

```bash
xcrun simctl list devices
```

### Open Simulator

```bash
open -a Simulator
```

### Install Pods

```bash
cd ios
pod install
cd ..
```

### Update Pods

```bash
cd ios
pod update
cd ..
```

### Clean Derived Data

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
```

## 🐛 Debugging

### Open Developer Menu

- **iOS Simulator**: `Cmd + D`
- **Android Emulator**: `Cmd + M`
- **Physical Device**: Shake device

### Enable Debug Mode

```bash
# In Metro terminal, press:
# d - Open developer menu
# r - Reload app
# i - Run on iOS
# a - Run on Android
```

### React Native Debugger

```bash
# Install
brew install --cask react-native-debugger

# Run
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

### Flipper

```bash
# Install
brew install --cask flipper

# Run
open -a Flipper
```

## 📦 Dependencies

### Add Package

```bash
yarn add package-name

# Dev dependency
yarn add -D package-name
```

### Remove Package

```bash
yarn remove package-name
```

### Update Packages

```bash
# Update all
yarn upgrade

# Update specific
yarn upgrade package-name

# Interactive update
yarn upgrade-interactive
```

### Check Outdated

```bash
yarn outdated
```

## 🗄️ Database

### View Realm Database

```bash
# Install Realm Studio
# Download from: https://realm.io/realm-studio

# Database location (simulator):
# ~/Library/Developer/CoreSimulator/Devices/[DEVICE_ID]/data/Containers/Data/Application/[APP_ID]/Documents/default.realm
```

### Reset Database

```bash
# Delete app from simulator and reinstall
# Or use the clearAllHabits function in seedData.ts
```

## 🎨 Assets

### Generate App Icons

```bash
# Use online tool or:
# https://appicon.co
# Upload 1024x1024 icon, download iOS set
```

### Optimize Images

```bash
# Install ImageOptim
brew install --cask imageoptim

# Or use online tools
```

## 📊 Performance

### Profile with Xcode Instruments

```bash
# Build release version
yarn ios --configuration Release

# Open Xcode
open ios/Ripple.xcworkspace

# Product > Profile (Cmd + I)
```

### Check Bundle Size

```bash
npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output ./build/main.jsbundle \
  --assets-dest ./build

# Check size
du -sh ./build/main.jsbundle
```

## 🚢 Building & Deployment

### Build Release (iOS)

```bash
cd ios
xcodebuild -workspace Ripple.xcworkspace \
  -scheme Ripple \
  -configuration Release \
  -archivePath build/Ripple.xcarchive \
  archive
```

### Increment Version

```bash
# Update version in:
# - ios/Ripple/Info.plist (CFBundleShortVersionString)
# - package.json (version)
# - app.json (version)
```

### TestFlight Upload

```bash
# Use Xcode or Fastlane
# Xcode: Product > Archive > Distribute App
```

## 🔧 Troubleshooting

### Metro Bundler Issues

```bash
# Kill Metro
lsof -ti:8081 | xargs kill -9

# Restart
yarn start --reset-cache
```

### Pod Install Issues

```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Build Errors

```bash
# Clean everything
rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/build
yarn install
cd ios && pod install && cd ..
```

### Simulator Issues

```bash
# Reset simulator
xcrun simctl erase all

# Or reset specific device
xcrun simctl erase [DEVICE_ID]
```

## 📝 Git Commands

### Common Workflow

```bash
# Check status
git status

# Create branch
git checkout -b feature/habit-creation

# Stage changes
git add .

# Commit
git commit -m "feat: add habit creation modal"

# Push
git push origin feature/habit-creation
```

### Useful Git Commands

```bash
# View changes
git diff

# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard changes
git checkout -- .

# Update from main
git pull origin main
```

## 🎯 Quick Tasks

### Add a New Screen

```bash
# 1. Create screen file
touch src/features/[feature]/screens/NewScreen.tsx

# 2. Add to navigation
# Edit src/app/navigation/AppNavigator.tsx

# 3. Import and use
```

### Add a New Component

```bash
# 1. Create component folder
mkdir -p src/shared/components/NewComponent

# 2. Create files
touch src/shared/components/NewComponent/NewComponent.tsx
touch src/shared/components/NewComponent/index.ts

# 3. Export from index
```

### Add a Database Model

```bash
# 1. Create model file
touch src/database/models/NewModel.ts

# 2. Add to realm.ts schema array

# 3. Create repository
touch src/database/repositories/NewRepository.ts
```

## 📚 Documentation

### Generate Docs

```bash
# TypeDoc (if installed)
npx typedoc --out docs src
```

### View Docs

```bash
# Open in browser
open docs/index.html
```

## 🎨 Code Quality

### Format Code

```bash
# Format all files
yarn prettier --write .

# Check formatting
yarn prettier --check .
```

### Type Coverage

```bash
# Check type coverage
npx type-coverage
```

## 🔐 Environment

### Set Environment Variables

```bash
# Create .env file
touch .env

# Add variables
echo "API_URL=https://api.example.com" >> .env
```

## 📱 Device Logs

### iOS Logs

```bash
# View simulator logs
xcrun simctl spawn booted log stream --predicate 'processImagePath endswith "Ripple"'

# Or use Console.app
open -a Console
```

### Android Logs

```bash
# View logcat
adb logcat | grep ReactNative
```

---

## 💡 Pro Tips

1. **Use aliases** - Add to your `.zshrc` or `.bashrc`:

   ```bash
   alias rn-start="yarn start --reset-cache"
   alias rn-ios="yarn ios"
   alias rn-clean="watchman watch-del-all && rm -rf node_modules && yarn install"
   ```

2. **Keep Metro running** - Always have Metro bundler running in a separate terminal

3. **Use Flipper** - Great for debugging network, database, and performance

4. **Hot reload** - Press `r` in Metro terminal for quick reload

5. **Debug remotely** - Use Chrome DevTools for debugging

---

**Last Updated**: October 18, 2025
