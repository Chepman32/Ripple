# Ripple - Habit Tracking App

**Every habit creates ripples** 🌊

A premium habit tracking mobile application for iOS that emphasizes fluid, gesture-based interactions and stunning visual animations. Built with React Native.

## Features

### Core Features

- ✅ **Habit Creation & Management** - Create, edit, archive, and delete habits
- 📅 **Daily Check-ins** - Quick, gesture-based habit completion
- 🔥 **Streak Tracking** - Visual streak counters with milestone celebrations
- 📊 **Statistics & Analytics** - Comprehensive visualization of habit performance
- ⏰ **Custom Scheduling** - Flexible frequency settings (daily, specific weekdays, custom intervals)
- 🏷️ **Categories & Tags** - Organize habits with customizable categories
- 🌓 **Themes** - Light, dark, and auto theme switching
- 💾 **Offline-First** - All data stored locally with Realm database

### Premium Features (Planned)

- Unlimited habits (free tier limited to 5)
- Advanced analytics and insights
- Custom themes and colors
- Priority support
- Cloud sync (future)
- AI-powered insights (future)

## Tech Stack

- **Framework**: React Native 0.82+
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **Animations**: React Native Reanimated v3
- **Gestures**: React Native Gesture Handler v2
- **Database**: Realm
- **State Management**: Zustand
- **Date Handling**: date-fns
- **UI Components**: Custom component library

## Project Structure

```
src/
├── app/
│   ├── navigation/          # Navigation configuration
│   └── App.tsx             # Root component
├── features/
│   ├── habits/             # Habit tracking features
│   ├── statistics/         # Analytics and stats
│   └── settings/           # App settings
├── shared/
│   ├── components/         # Reusable UI components
│   ├── constants/          # Design tokens (colors, spacing, typography)
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── database/
│   ├── models/             # Realm database schemas
│   ├── repositories/       # Data access layer
│   └── realm.ts            # Database configuration
└── assets/
    ├── images/
    └── animations/
```

## Getting Started

### Prerequisites

- Node.js >= 20
- Yarn 4.1.1+
- Xcode 14+ (for iOS development)
- CocoaPods (for iOS dependencies)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Ripple
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Install iOS dependencies**

   ```bash
   cd ios && pod install && cd ..
   ```

4. **Start Metro bundler**

   ```bash
   yarn start
   ```

5. **Run on iOS**
   ```bash
   yarn ios
   ```

### Development

- **Run on iOS**: `yarn ios`
- **Run on Android**: `yarn android`
- **Run tests**: `yarn test`
- **Lint code**: `yarn lint`
- **Type check**: `tsc --noEmit`

## Design System

### Colors

The app uses a carefully crafted color palette:

- **Primary**: Indigo (#6366F1)
- **Secondary**: Cyan (#06B6D4)
- **Tertiary**: Purple (#A855F7)
- **Success**: Emerald (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Rose (#F43F5E)

### Typography

- **Display**: 40pt, Bold
- **H1**: 34pt, Bold
- **H2**: 28pt, Semibold
- **Body**: 16pt, Regular
- **Caption**: 13pt, Regular

### Spacing

Base unit: 4pt
Scale: xs(4), sm(8), md(12), lg(16), xl(20), 2xl(24), 3xl(32), 4xl(40), 5xl(48), 6xl(64)

## Database Schema

### Habit Model

- id, name, description, color, icon
- frequency, customFrequency
- targetValue, unit
- reminderTime, reminderDays
- archived, createdAt, updatedAt

### HabitCompletion Model

- id, habitId, completedAt
- value, note, skipped, mood

### Category Model

- id, name, color, icon, order

### AppSettings Model

- theme, accentColor, firstDayOfWeek
- notificationsEnabled, hapticFeedbackEnabled
- premiumUnlocked, onboardingCompleted

## Key Features Implementation

### Offline-First Architecture

All data is stored locally using Realm database. The app works completely offline with no internet connection required.

### Gesture-Based Interactions

- Swipe right to complete habits
- Swipe left for quick actions
- Long press for context menus
- Pull to refresh

### Smooth Animations

All animations run at 60fps using React Native Reanimated's worklet-based architecture.

### Theme Support

Automatic theme switching based on system preferences, with manual override options.

## Roadmap

### Version 1.0 (Current)

- ✅ Core habit tracking
- ✅ Basic statistics
- ✅ Local data storage
- ✅ Theme support

### Version 1.1 (Planned)

- iPad support
- Additional themes
- Habit templates
- Social sharing

### Version 2.0 (Future)

- Cloud sync
- Multi-device support
- AI-powered insights
- Apple Watch app

## Contributing

This is a proprietary project. Contributions are not currently accepted.

## License

Copyright © 2025 Ripple. All rights reserved.

## Contact

For support or inquiries, please contact: support@ripple-app.com

---

**Built with ❤️ using React Native**
