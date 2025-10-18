# Quick Start Guide - Ripple

This guide will help you get the Ripple app running on your development machine in under 5 minutes.

## Prerequisites Check

Before starting, ensure you have:

```bash
# Check Node.js version (should be >= 20)
node --version

# Check Yarn version
yarn --version

# Check if Xcode is installed (macOS only)
xcode-select --version

# Check if CocoaPods is installed
pod --version
```

If any of these are missing, install them first.

## Installation Steps

### 1. Install Dependencies

```bash
# Install JavaScript dependencies
yarn install
```

### 2. Install iOS Dependencies

```bash
# Navigate to iOS folder and install pods
cd ios
pod install
cd ..
```

### 3. Start the Development Server

```bash
# Start Metro bundler
yarn start
```

Keep this terminal window open.

### 4. Run the App

Open a new terminal window and run:

```bash
# For iOS
yarn ios

# Or for a specific simulator
yarn ios --simulator="iPhone 15 Pro"
```

## First Launch

When you first launch the app, you'll see:

1. **Splash Screen** - The Ripple logo with initialization
2. **Today Screen** - Your main habit tracking interface
3. **Empty State** - Since you have no habits yet

## Creating Your First Habit

1. Tap the **+** button (FAB) in the bottom right
2. Enter a habit name (e.g., "Morning Meditation")
3. Choose an icon and color
4. Set the frequency (Daily, Weekly, or Custom)
5. Tap "Create Habit"

## Navigation

The app has 4 main tabs:

- **Today** 🏠 - Your daily habit checklist
- **Statistics** 📊 - View your progress and insights
- **Habits** 📋 - Manage all your habits
- **Settings** ⚙️ - Configure app preferences

## Common Issues

### Metro Bundler Won't Start

```bash
# Clear Metro cache
yarn start --reset-cache
```

### iOS Build Fails

```bash
# Clean iOS build
cd ios
rm -rf build
pod deintegrate
pod install
cd ..
```

### Realm Database Issues

```bash
# The app will automatically initialize the database
# If you need to reset it, delete the app from simulator and reinstall
```

## Development Tips

### Hot Reload

- Press `r` in Metro terminal to reload
- Press `d` to open developer menu
- Shake device/simulator to open developer menu

### Debugging

- Press `Cmd + D` (iOS) to open debug menu
- Enable "Debug JS Remotely" for Chrome DevTools
- Use React Native Debugger for better experience

### Viewing Database

```bash
# Realm Studio can be used to inspect the database
# Download from: https://realm.io/realm-studio
```

## Next Steps

1. **Explore the Code**

   - Start with `App.tsx` - the entry point
   - Check `src/features/habits/screens/TodayScreen.tsx` - main screen
   - Review `src/database/` - data layer

2. **Customize**

   - Modify colors in `src/shared/constants/colors.ts`
   - Adjust spacing in `src/shared/constants/spacing.ts`
   - Update typography in `src/shared/constants/typography.ts`

3. **Add Features**
   - Create new screens in `src/features/`
   - Add new components in `src/shared/components/`
   - Extend database models in `src/database/models/`

## Useful Commands

```bash
# Type checking
yarn tsc --noEmit

# Linting
yarn lint

# Run tests
yarn test

# iOS specific
yarn ios --configuration Release  # Production build
yarn ios --device                 # Run on physical device

# Clean everything
watchman watch-del-all
rm -rf node_modules
yarn install
cd ios && pod install && cd ..
```

## Getting Help

- Check the main README.md for detailed documentation
- Review the Software Design Document for architecture details
- Check React Native docs: https://reactnative.dev
- Check Realm docs: https://realm.io/docs

## Performance Tips

- Use Flipper for performance profiling
- Enable Hermes engine (already configured)
- Use React DevTools for component inspection
- Monitor memory usage in Xcode Instruments

---

Happy coding! 🚀
