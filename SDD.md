# Software Design Document: Ripple

## Executive Summary

**Ripple** is a premium habit tracking mobile application for iOS that emphasizes fluid, gesture-based interactions and stunning visual animations. The app operates entirely offline, storing all data locally, and is monetized through carefully designed in-app purchases. Built with React Native, the app leverages react-native-reanimated and react-native-skia to deliver production-ready, performant animations that create an immersive user experience.

The core philosophy: every habit creates ripples in your life. The UI reflects this through wave-like animations, fluid transitions, and physics-based interactions that make habit tracking feel natural and satisfying.

---

## 1. Application Overview

### 1.1 App Identity

**Name:** Ripple

**Tagline:** "Every habit creates ripples"

**App Icon:** A series of concentric circles (ripples) emanating from a central point, rendered in a gradient from deep purple (#6366F1) to cyan (#06B6D4). The icon uses a modern, minimalist design with subtle depth through gradient overlays.

**Primary Color Palette:**
- Primary: Indigo (#6366F1)
- Secondary: Cyan (#06B6D4)
- Tertiary: Purple (#A855F7)
- Success: Emerald (#10B981)
- Warning: Amber (#F59E0B)
- Error: Rose (#F43F5E)
- Background Dark: (#0F172A)
- Background Light: (#F8FAFC)
- Surface Dark: (#1E293B)
- Surface Light: (#FFFFFF)
- Text Primary Dark: (#F1F5F9)
- Text Primary Light: (#0F172A)
- Text Secondary Dark: (#94A3B8)
- Text Secondary Light: (#64748B)

### 1.2 Core Features

1. **Habit Creation & Management** - Create, edit, archive, and delete habits with rich customization
2. **Daily Check-ins** - Quick, gesture-based habit completion with satisfying feedback
3. **Streak Tracking** - Visual streak counters with milestone celebrations
4. **Statistics & Analytics** - Comprehensive visualization of habit performance
5. **Custom Scheduling** - Flexible frequency settings (daily, specific weekdays, custom intervals)
6. **Categories & Tags** - Organize habits with customizable categories
7. **Reminders & Notifications** - Smart, contextual notifications
8. **Themes** - Light, dark, and auto theme switching with smooth transitions
9. **Widgets** - iOS home screen widgets for quick habit overview
10. **Data Export** - JSON and CSV export capabilities
11. **Backup & Restore** - Manual backup to iCloud Drive

### 1.3 Monetization Strategy (IAP)

**Free Tier:**
- Up to 5 active habits
- Basic statistics (7-day view)
- 3 reminder notifications per day
- Light and dark themes
- Basic categories (3 custom categories)

**Premium Tier (One-time purchase: $9.99):**
- Unlimited habits
- Advanced statistics (all-time, monthly, yearly views)
- Unlimited notifications
- All themes and color schemes
- Unlimited custom categories
- Priority support
- Advanced analytics (correlation insights, time-of-day analysis)
- Custom habit icons
- Widgets

**Premium+ Tier (Annual subscription: $19.99/year):**
- Everything in Premium
- Cloud sync (future feature placeholder)
- Advanced AI insights (future feature placeholder)
- Exclusive theme packs (released quarterly)
- Early access to new features

### 1.4 Technical Stack

**Framework:** React Native 0.74+

**Key Libraries:**
- **react-native-reanimated** (v3.x) - High-performance animations
- **react-native-skia** - Advanced graphics and custom rendering
- **react-native-gesture-handler** (v2.x) - Gesture recognition
- **@react-navigation/native** (v6.x) - Navigation
- **@tanstack/react-query** - Data management and caching
- **zustand** - Lightweight state management
- **realm** or **WatermelonDB** - Offline-first database
- **date-fns** - Date manipulation
- **react-native-haptic-feedback** - Tactile feedback
- **react-native-vector-icons** - Icon library (Ionicons, Feather)
- **react-native-svg** - SVG rendering
- **lottie-react-native** - Complex animations from After Effects
- **victory-native** - Data visualization charts

**Development Tools:**
- TypeScript for type safety
- ESLint + Prettier for code quality
- Jest + React Native Testing Library for testing
- Fastlane for deployment automation

---

## 2. Application Architecture

### 2.1 Architecture Pattern

The app follows a **Feature-Based Architecture** with clear separation of concerns:

```
src/
├── app/
│   ├── navigation/           # Navigation configuration
│   ├── providers/            # Context providers (theme, auth, data)
│   └── App.tsx              # Root component
├── features/
│   ├── habits/
│   │   ├── components/      # Feature-specific components
│   │   ├── screens/         # Feature screens
│   │   ├── hooks/           # Custom hooks
│   │   ├── store/           # Feature state management
│   │   └── types/           # TypeScript types
│   ├── statistics/
│   ├── settings/
│   └── onboarding/
├── shared/
│   ├── components/          # Reusable UI components
│   ├── animations/          # Shared animation configs
│   ├── constants/           # App constants
│   ├── hooks/               # Shared hooks
│   ├── utils/               # Utility functions
│   └── types/               # Global types
├── database/
│   ├── models/              # Database schemas
│   ├── migrations/          # Database migrations
│   └── repositories/        # Data access layer
└── assets/
    ├── images/
    ├── animations/          # Lottie files
    └── fonts/
```

### 2.2 Data Flow Architecture

**Offline-First Strategy:**

1. All data stored in local Realm/WatermelonDB database
2. Optimistic UI updates
3. Background sync preparation (for future cloud feature)
4. Data versioning for migration support

**State Management Layers:**

1. **Global State (Zustand):**
   - User preferences (theme, notifications)
   - IAP status
   - App settings

2. **Server State (@tanstack/react-query):**
   - Cache management (prepared for future API)
   - Optimistic updates
   - Background refetching logic

3. **Local Component State (React hooks):**
   - Form inputs
   - Animation states
   - Transient UI states

### 2.3 Database Schema

**Habit Model:**
```typescript
interface Habit {
  id: string;                    // UUID
  name: string;                  // Max 50 characters
  description?: string;          // Max 200 characters
  color: string;                 // Hex color
  icon: string;                  // Icon identifier
  categoryId?: string;           // Reference to Category
  frequency: FrequencyType;      // daily, weekly, custom
  customFrequency?: {
    type: 'specific_days' | 'interval' | 'flexible';
    days?: number[];             // For specific_days: 0-6 (Sun-Sat)
    interval?: number;           // For interval: every N days
    targetCount?: number;        // For flexible: X times per week
  };
  targetValue?: number;          // For quantifiable habits
  unit?: string;                 // e.g., "minutes", "pages", "glasses"
  reminderTime?: string;         // ISO time string
  reminderDays?: number[];       // Days to remind
  archived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  order: number;                 // For custom sorting
  isPremium: boolean;           // Requires premium to use
}

enum FrequencyType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  CUSTOM = 'custom'
}
```

**HabitCompletion Model:**
```typescript
interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: Date;
  value?: number;                // For quantifiable habits
  note?: string;                 // Optional note (max 100 chars)
  skipped: boolean;              // If user explicitly skipped
  mood?: 'great' | 'good' | 'okay' | 'bad';  // Optional mood tracking
  createdAt: Date;
}
```

**Category Model:**
```typescript
interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  order: number;
  isCustom: boolean;            // Custom vs default categories
  createdAt: Date;
  updatedAt: Date;
}
```

**AppSettings Model:**
```typescript
interface AppSettings {
  id: string;                    // Singleton: always "default"
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  firstDayOfWeek: 0 | 1;        // 0: Sunday, 1: Monday
  notificationsEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  animationsEnabled: boolean;
  premiumUnlocked: boolean;
  premiumPlusActive: boolean;
  onboardingCompleted: boolean;
  lastBackupDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Streak Model (Computed):**
```typescript
interface Streak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  successRate: number;          // Percentage
  lastCompletedDate?: Date;
}
```

---

## 3. Splash Screen Animation

### 3.1 Animation Concept

The splash screen features a **physics-based logo breakdown** where the Ripple logo (concentric circles) appears to shatter into particles that then reform before fading into the main app.

### 3.2 Animation Sequence

**Phase 1: Logo Formation (0-800ms)**
- App opens to a solid indigo background (#6366F1)
- Logo particles (100+ small circles) fly in from random off-screen positions
- Each particle uses spring physics to converge toward its final position
- Particles create the concentric circle logo pattern
- Slight overshoot and wobble as they settle into place
- Haptic feedback (light impact) when logo formation completes

**Phase 2: Ripple Effect (800-1400ms)**
- From the center of the logo, ripple waves emanate outward
- 3-4 expanding circles with opacity fade
- Each ripple has a slight gradient shimmer effect
- Background subtly shifts from indigo to cyan gradient

**Phase 3: Text Reveal (1200-1800ms)**
- "Ripple" text fades in below the logo
- Characters appear with a staggered timing (50ms delay between each)
- Each character has a slight scale-up animation with spring physics
- Text uses a modern, geometric sans-serif font (e.g., Poppins SemiBold)

**Phase 4: Transition Out (1800-2200ms)**
- If app is already initialized: logo and text scale up slightly and fade out
- Background transitions to the main app's background color
- Smooth cross-fade to home screen
- If first launch: logo stays on screen, onboarding slides in from right

### 3.3 Implementation Details

**Technology:** react-native-skia for particle system, react-native-reanimated for orchestration

**Particle System:**
```javascript
// Each particle properties
{
  x: SharedValue (animated position)
  y: SharedValue
  size: number (2-8 pixels)
  color: string (gradient between primary and secondary colors)
  initialVelocity: { x: number, y: number }
  mass: number (for physics simulation)
}
```

**Performance Considerations:**
- Particles rendered as a single Skia Canvas draw call
- Use worklet functions for animation calculations
- Limit particle count to 120 for smooth 60fps animation
- Preload necessary assets during splash screen
- Implement early abort if app state is ready before animation completes

**Haptic Feedback Points:**
- Light impact when logo forms (800ms)
- Soft impact when ripples start (1000ms)
- Selection feedback when transitioning to app (1800ms)

---

## 4. Onboarding Experience

### 4.1 Onboarding Philosophy

First-time users see a brief, gesture-interactive onboarding that teaches the core interaction patterns. The onboarding is skippable at any point and never shown again unless user resets the app.

### 4.2 Onboarding Screens

**Screen 1: Welcome**
- Full-screen gradient background (indigo to purple)
- Animated ripple logo at top (continuous gentle pulsing animation)
- Title: "Welcome to Ripple"
- Subtitle: "Build better habits, one ripple at a time"
- Large CTA button: "Get Started"
- Skip link in top-right (small, subtle)
- Gesture hint: subtle upward-pointing arrow animation at bottom

**Animation:** Logo pulses gently with a breathing effect (scale 1.0 to 1.05). Background gradient rotates slowly (360° over 20 seconds).

**Screen 2: Core Concept**
- Split screen layout
- Top half: Animated illustration showing a single habit creating expanding ripples
- Bottom half: Text content
- Title: "Every Habit Creates Ripples"
- Body: "Small, consistent actions compound into meaningful change. Track your habits and watch your progress grow."
- Interactive element: User can tap the habit icon to see ripples animate
- Progress indicator: 1 of 4 dots at bottom
- Gesture: Swipe left to continue (gesture tutorial shows a finger swiping left)

**Animation:** Tapping the habit icon triggers a ripple effect that expands outward with particle effects. Each ripple has a different color from the gradient palette.

**Screen 3: Gesture Tutorial**
- Interactive demonstration screen
- Large card UI element in center representing a habit
- Title: "Master the Gestures"
- Instructions appear one at a time with visual demonstrations:
  1. "Swipe right to complete" (shows finger gesture)
  2. "Swipe left for details" (shows finger gesture)
  3. "Long press for quick actions" (shows finger holding)
  4. "Pull down to refresh" (shows finger pulling down)
- Each instruction is interactive - user must perform the gesture to continue
- Success animation plays when gesture is correctly performed
- Progress indicator: 2 of 4

**Animation:** Ghost hand tutorial (semi-transparent finger icon) demonstrates each gesture. When user performs gesture correctly, success particles burst from the interaction point with haptic feedback.

**Screen 4: Personalization**
- Title: "Choose Your Vibe"
- Theme selector with three large cards:
  - Light theme preview
  - Dark theme preview
  - Auto (system) preview
- Each card shows a mini preview of the app interface
- Cards can be swiped through horizontally
- Selected card scales up slightly with a glowing border
- Accent color selector below (5 preset color options)
- Color selector shows small circles that animate on tap
- Progress indicator: 3 of 4

**Animation:** Theme previews have live micro-interactions. Background of entire screen transitions smoothly when theme selection changes. Selected color radiates a subtle glow effect using Skia shaders.

**Screen 5: Permissions & Final Setup**
- Title: "Stay on Track"
- Notification permission request with benefit explanation
- Toggle switches for:
  - Enable Notifications (required for reminders)
  - Enable Haptic Feedback (recommended)
- Premium feature callout card:
  - "Start with 5 free habits"
  - "Upgrade anytime for unlimited habits and advanced features"
  - Small "Learn More" link
- Large CTA: "Start Building Habits"
- Progress indicator: 4 of 4

**Animation:** Toggle switches have satisfying spring animations. Premium callout card has a subtle shimmer effect that sweeps across periodically. Final CTA button pulses gently to draw attention.

### 4.3 Onboarding Exit Animation

When user taps "Start Building Habits":
1. All onboarding content scales down and fades out (300ms)
2. Background transitions to app's main background color (400ms)
3. Home screen slides up from bottom with a spring animation (500ms)
4. First-time user prompt appears: "Create Your First Habit" with a floating action button highlight
5. Confetti animation celebrates the completion (light particle burst)

---

## 5. Navigation Structure

### 5.1 Navigation Pattern

**Primary Navigation:** Tab Bar (iOS native feel with custom animations)
**Secondary Navigation:** Stack navigation within tabs
**Modal Navigation:** Bottom sheets and full-screen modals

### 5.2 Tab Bar Structure

**4 Main Tabs:**

1. **Today Tab** (Home icon)
   - Main feed of today's habits
   - Quick completion interface
   - Daily summary card at top

2. **Statistics Tab** (Bar chart icon)
   - Overview dashboard
   - Detailed analytics per habit
   - Calendar view
   - Insights and trends

3. **Habits Tab** (List icon)
   - All habits list
   - Archived habits
   - Habit management
   - Categories view

4. **Profile Tab** (Person icon)
   - User profile
   - Settings
   - Premium/IAP
   - Backup & Export

### 5.3 Tab Bar Design & Animation

**Visual Design:**
- Height: 80pt (including safe area)
- Background: Glass morphism effect (frosted blur)
- Tab items: Icon + label
- Selected state: Icon animates with a bounce, label appears, accent color applied
- Unselected state: Gray icon, no label
- Selection indicator: Liquid-style background blob that morphs between tabs

**Tab Switch Animation:**
```
User taps new tab:
1. Liquid blob morphs from current tab to new tab (300ms elastic easing)
2. New tab icon bounces (scale 1.0 → 1.2 → 1.0) with haptic feedback
3. Label fades in for selected tab (200ms)
4. Previous tab label fades out (150ms)
5. Screen content cross-fades (250ms)
6. New screen slides in from bottom with slight spring (400ms)
```

**Scroll Behavior:**
- When user scrolls down in any tab, tab bar auto-hides (slides down)
- Scroll up or reach top to reveal tab bar again
- Smooth spring animation (400ms)
- Small upward swipe gesture at bottom edge also reveals tab bar

### 5.4 Gesture-Based Navigation

**Global Gestures:**
- **Two-finger swipe left/right:** Switch between tabs
- **Two-finger swipe down:** Reveal quick actions menu
- **Long press tab bar:** Show mini tab switcher with previews
- **Swipe from left edge:** Go back (in stack navigation)
- **Pull down from top:** Refresh current view

**Context-Specific Gestures:**
- **Habit cards:** Swipe right to complete, swipe left for actions, long press for quick edit
- **Lists:** Swipe to delete/archive
- **Modals:** Swipe down to dismiss
- **Charts:** Pinch to zoom, drag to pan

---

## 6. Screen-by-Screen Breakdown

## 6.1 TODAY SCREEN (Home)

### 6.1.1 Layout Structure

**Top Section: Date & Streak Overview (Fixed Header)**
- Height: 180pt (including safe area)
- Background: Gradient from primary color (top) to surface color (bottom)
- Subtle animated ripple pattern in background (Skia shader)

**Components:**
1. **Date Display:**
   - Large font size: 34pt (SF Pro Display Bold)
   - Format: "Thursday, Oct 18"
   - Color: White with subtle text shadow
   - Position: Top left, 20pt from edges

2. **Streak Indicator (Top Right):**
   - Circular badge with gradient border
   - Size: 64pt diameter
   - Shows current overall streak (average of all habits)
   - Format: "12 day streak" (number larger, "day streak" smaller)
   - Animated flame icon or ripple icon inside
   - Pulsing glow effect on the border

3. **Daily Summary Card:**
   - Position: Below date, centered
   - Width: Screen width - 40pt (20pt padding on each side)
   - Height: 80pt
   - Background: Glass morphism (frosted, semi-transparent)
   - Border radius: 20pt
   - Subtle shadow: 0px 4px 20px rgba(0,0,0,0.1)
   
   **Summary Card Content:**
   - Left side: "Today's Progress"
   - Center: Large circular progress ring
     - Diameter: 60pt
     - Shows completion percentage (completed habits / total habits for today)
     - Animated fill as user completes habits
     - Number in center: "3/8" (completed/total)
     - Ring color: Gradient from success to primary color
   - Right side: Motivational text
     - "Keep going!" (if < 50% complete)
     - "Halfway there!" (if 50-75% complete)
     - "Almost done!" (if 75-99% complete)
     - "Perfect!" (if 100% complete)
     - Text animates in when percentage tier changes

**Middle Section: Habit List (Scrollable)**
- Background: Surface color
- Top padding: 20pt from summary card
- Bottom padding: 80pt (tab bar) + 20pt

**Section Headers:**
- Sticky headers as user scrolls
- "Morning" (habits scheduled before 12pm)
- "Afternoon" (habits scheduled 12pm-6pm)
- "Evening" (habits scheduled after 6pm)
- "Anytime" (habits without specific time)
- Headers have slight blur background when sticky
- Header animation: Slides in from top when reached

**Habit Cards:**
- One card per habit
- Vertical spacing: 12pt between cards
- Horizontal margins: 20pt from screen edges

### 6.1.2 Habit Card Design (Today Screen)

**Dimensions:**
- Width: Screen width - 40pt
- Height: 110pt (compact view) or 140pt (expanded with details)
- Border radius: 16pt
- Background: Surface color (white in light, dark gray in dark theme)
- Border: 1pt solid border color (subtle)
- Shadow: 0px 2px 12px rgba(0,0,0,0.06)

**Visual States:**
1. **Default State:** Clean, ready to interact
2. **Completed State:** Checkmark overlay, slightly faded, success color tint
3. **Skipped State:** X overlay, even more faded, warning color tint
4. **Missed State:** Red tint, "missed" indicator (for habits scheduled in past)
5. **Swiped Right (Partial):** Green overlay fades in from right, checkmark icon appears
6. **Swiped Left (Partial):** Blue overlay fades in from left, info/edit icon appears

**Card Content Layout:**

**Left Section (60pt width):**
- **Habit Icon:**
  - Size: 40pt × 40pt
  - Background: Habit's custom color with 0.15 opacity
  - Border radius: 12pt
  - Icon: Vector icon in habit's custom color
  - Position: Centered in left section
  - Animation on completion: Bounces and rotates 360°

**Center Section (Flexible width):**
- **Habit Name:**
  - Font: 17pt (SF Pro Text Semibold)
  - Color: Text primary color
  - Max lines: 1 (truncate with ellipsis)
  - Position: Top, 16pt from top of card

- **Details Line:**
  - Font: 13pt (SF Pro Text Regular)
  - Color: Text secondary color
  - Content: Frequency info ("Daily" or "3x per week" or "Every 2 days")
  - Position: Below habit name, 4pt spacing

- **Streak Indicator:**
  - Position: Below details, 6pt spacing
  - Layout: Fire icon (8pt) + "12 day streak" text (12pt)
  - Color: Orange/gold gradient
  - Only shows if streak > 0
  - Animates (slight bounce) when streak increases

- **Progress Bar (for quantifiable habits):**
  - Position: Bottom of card, full width of center section
  - Height: 4pt
  - Background: Gray with low opacity
  - Fill: Habit's color
  - Shows current value / target value
  - Example: Reading 30/50 pages
  - Text above bar: "30 of 50 pages"
  - Animated fill as value updates

**Right Section (60pt width):**
- **Time Badge:**
  - Size: 50pt × 28pt
  - Background: Secondary background color
  - Border radius: 14pt
  - Text: Reminder time ("8:00 AM") or "Anytime"
  - Font: 12pt (SF Pro Text Medium)
  - Position: Top right, 12pt from edges
  - If past due: Red background

- **Quick Action Button:**
  - Position: Bottom right, 12pt from edges
  - Size: 32pt × 32pt
  - Circular button
  - Background: Transparent
  - Border: 1.5pt solid habit color
  - Icon: Plus or checkmark
  - Tap to show quick actions menu
  - Long press triggers haptic and shows menu

### 6.1.3 Habit Card Gestures & Animations

**Swipe Right to Complete:**
```
User swipes right on card:
1. Card translates to the right (follows finger)
2. Green overlay fades in from 0 to 0.3 opacity as swipe progresses
3. Checkmark icon scales in from 0 to 1.0 at 60% swipe
4. Haptic feedback (light impact) at 50% swipe threshold
5. If released after threshold:
   - Card continues swiping right off screen (300ms spring animation)
   - Completion animation plays:
     * Confetti particles burst from card position (20-30 particles)
     * Success sound plays (optional, user setting)
     * Haptic feedback (success notification)
   - Card fades back in from right in completed state (400ms)
   - Habit icon does a 360° rotation with bounce
   - Streak counter increments with a pop animation
   - If daily goal reached, celebration modal appears
6. If released before threshold:
   - Card springs back to original position (300ms)
```

**Swipe Left for Details:**
```
User swipes left on card:
1. Card translates to the left (follows finger)
2. Blue overlay fades in from 0 to 0.2 opacity
3. Three action buttons slide in from right edge:
   - "Details" button (info icon)
   - "Edit" button (pencil icon)
   - "Skip" button (X icon)
4. If released after 30% swipe:
   - Card settles with action buttons visible
   - Tap outside card to dismiss (springs back)
   - Tap any button to perform action
5. If released before 30%:
   - Card springs back to original position
```

**Long Press for Quick Actions:**
```
User long presses card (400ms):
1. Haptic feedback (heavy impact)
2. Card scales down slightly (0.97) with subtle shadow increase
3. Quick action menu appears above card:
   - Floating menu with rounded corners
   - Background: Blur effect
   - Options:
     * "Complete" (checkmark icon)
     * "Add Note" (note icon)
     * "Skip Today" (X icon)
     * "Edit Habit" (pencil icon)
   - Each option is a button with icon + label
   - Buttons animate in from top with stagger (50ms delay each)
4. User lifts finger:
   - If hovering over option: Execute action, menu fades out
   - If not hovering: Menu fades out, card returns to normal
```

**Tap for Quick Complete (alternative to swipe):**
```
User taps the left icon section:
1. Icon scales down (0.9) with haptic feedback
2. Completion animation plays (same as swipe right)
3. If habit requires value input:
   - Modal slides up from bottom
   - Number input or slider
   - Quick completion buttons (e.g., for reading: 10, 25, 50 pages)
   - "Done" button to confirm
```

### 6.1.4 Empty State

**When no habits are scheduled for today:**
- Centered content
- Illustration: Minimalist line drawing of person relaxing
- Source: https://pixabay.com/vectors/relaxation-person-rest-meditation-8234567/
- Title: "All Done for Today!"
- Subtitle: "Enjoy your free time or create new habits"
- CTA Button: "Browse All Habits"
- Background: Subtle animated pattern (slow-moving shapes)

**When user has no habits at all:**
- Centered content
- Illustration: Launching rocket or seed growing
- Source: https://pixabay.com/vectors/rocket-launch-startup-business-8123456/
- Title: "Start Your Journey"
- Subtitle: "Create your first habit and watch your progress grow"
- Large CTA Button: "Create Habit" with plus icon
- Subtle animation: Illustration has gentle floating motion

### 6.1.5 Floating Action Button (FAB)

**Position:** Bottom right, 20pt from edge, 100pt from bottom (above tab bar)
**Size:** 56pt × 56pt diameter
**Background:** Gradient (primary to secondary color)
**Icon:** Plus icon (white)
**Shadow:** 0px 4px 16px rgba(0,0,0,0.2)

**Animation on screen scroll:**
- Hides when scrolling down (scales to 0 with spring)
- Shows when scrolling up (scales to 1 with spring)

**Tap Animation:**
```
1. FAB scales down to 0.9 (100ms)
2. Haptic feedback (light impact)
3. FAB rotates 90° (300ms) as it transitions to X icon
4. Create habit modal slides up from bottom (400ms spring)
5. Screen content dims (overlay with 0.5 opacity black)
```

### 6.1.6 Daily Goal Celebration Modal

**Trigger:** Appears when user completes all habits for the day

**Modal Design:**
- Full screen overlay
- Background: Gradient animation (colors cycle through palette)
- Semi-transparent backdrop (user can still see completed list behind)

**Content:**
- Large animated achievement icon (trophy, star, or ripple logo)
- Animation: Icon scales in with rotation, then pulses continuously
- Particle effects: Confetti or sparkles raining down (Skia particle system)
- Title: "Perfect Day!" (large, bold, 40pt)
- Subtitle: "You completed all your habits for [Day]"
- Streak info: "12 day streak" with fire icon
- Share button: "Share Achievement" (links to iOS share sheet)
- CTA: "Awesome!" button to dismiss

**Celebration Animation Sequence:**
```
1. Backdrop fades in (200ms)
2. Particles start falling from top (continuous)
3. Achievement icon scales in from 0 to 1.2 to 1.0 (500ms elastic)
4. Title and subtitle fade in with upward slide (300ms, staggered)
5. Streak info bounces in (400ms spring)
6. Buttons fade in (300ms)
7. Haptic feedback pattern: success notification + 2 light impacts
8. Optional: Celebration sound plays
```

---

## 6.2 STATISTICS SCREEN

### 6.2.1 Screen Layout

**Fixed Header (100pt):**
- Title: "Statistics" (34pt, bold)
- Subtitle: "Your habit insights" (15pt, secondary color)
- Time range selector (segment control):
  - Options: "Week" | "Month" | "Year" | "All"
  - Selected option highlighted with sliding pill background
  - Smooth animation when switching (300ms)
  - Premium badge on "Year" and "All" if not unlocked

**Scrollable Content:**

### 6.2.2 Overview Dashboard Section

**Success Rate Card (First Card):**
- Width: Full width - 40pt margins
- Height: 200pt
- Background: Gradient card (primary color gradient)
- Border radius: 20pt

**Card Content:**
- Large percentage number: "87%" (60pt font)
- Label: "Average Success Rate"
- Small trend indicator: "+5% from last week" (green up arrow)
- Mini sparkline chart showing trend over selected period
- Sparkline: Line chart with gradient fill, rendered with Skia

**Card Animation on Load:**
```
1. Card slides in from right (400ms spring)
2. Percentage animates from 0 to actual value (800ms)
3. Sparkline draws in with path animation (600ms, delayed 200ms)
4. Trend indicator fades in (300ms, delayed 400ms)
```

**Streak Overview Card:**
- Width: (Screen width - 60pt) / 2 (two cards side by side)
- Height: 150pt
- Border radius: 16pt
- Background: Surface color with subtle gradient overlay

**Left Card Content:**
- Icon: Fire emoji styled icon (32pt)
- Label: "Current Streak"
- Value: "12 days" (32pt, bold)
- Animation: Icon flickers like a flame

**Right Card Content:**
- Icon: Trophy or medal (32pt)
- Label: "Longest Streak"
- Value: "28 days" (32pt, bold)
- Animation: Icon rotates slowly

**Total Habits Card:**
- Similar layout to streak cards
- Shows: Total habits, Active habits, Archived habits
- Three rows with icons and numbers
- Each row has a mini progress bar

### 6.2.3 Habit Performance List

**Section Header:**
- Text: "Habit Performance"
- Filter icon on right (tap to filter by category)
- Sort icon (tap to change sort: alphabetical, success rate, streak)

**Habit Performance Card:**
- Height: 100pt per habit
- Background: Surface color
- Border radius: 12pt
- Margin bottom: 12pt
- Shadow: Subtle

**Card Layout:**

**Left Side (70pt):**
- Habit icon and color
- Icon size: 48pt
- Matches habit's custom color

**Center Content:**
- **Habit name** (16pt, semibold)
- **Success rate for selected period** (13pt)
  - Format: "23/30 days" with percentage "77%"
  - Progress bar below (full width, 6pt height)
  - Bar animates fill on screen load
- **Current streak** (12pt, secondary color)
  - "12 day streak" with fire icon

**Right Side (80pt):**
- Mini calendar heatmap for selected period
- Week view: 7 squares representing last 7 days
- Month view: 4x7 grid representing 28 days
- Each square: 8pt × 8pt
- Colors:
  - Completed: Habit's color (full opacity)
  - Partially completed: Habit's color (50% opacity)
  - Missed: Gray (20% opacity)
  - Skipped: Orange (30% opacity)
  - Future: Transparent with border
- Hover effect: Square scales up slightly, shows date tooltip

**Card Tap Interaction:**
```
1. Card scales down to 0.98 (100ms)
2. Haptic feedback (light impact)
3. Navigate to Habit Detail Statistics screen
4. Transition: Card expands to fill screen (400ms)
```

### 6.2.4 Calendar Heatmap View (Full Screen Mode)

**Access:** Tap "View Calendar" button below habit list

**Layout:**
- Full month calendar view
- Each day is a square tile
- Tile size: (Screen width - 80pt) / 7
- Days of week labels at top
- Current day highlighted with border

**Tile Design:**
- Background color intensity represents completion percentage
- Example: 100% = full habit color, 50% = lighter tint, 0% = gray
- Multiple habits on one day: Tile shows aggregate (average or total completions)
- Tap tile to see details for that day

**Day Detail Modal:**
```
User taps calendar tile:
1. Modal slides up from bottom (400ms)
2. Shows all habits for that day
3. List of habits with completion status
4. Add note for the day (optional)
5. Swipe down to dismiss
```

**Animation:**
- Calendar animates in with a page curl effect
- Each row of dates fades in sequentially (staggered 50ms delay)
- Today's date pulses gently

### 6.2.5 Insights Section (Premium Feature)

**Section Header:**
- "Insights" title with sparkle icon
- Premium badge if locked
- Subtle gradient background

**Insight Cards:**

**Best Time of Day Card:**
- Shows analysis of when user completes most habits
- Bar chart showing completion count by time of day (morning, afternoon, evening)
- Chart rendered with Victory Native
- Interactive: Tap bar to see which habits completed at that time

**Habit Correlation Card:**
- "Habits that go together"
- Shows which habits are often completed on the same days
- Network-style visualization or simple list
- Example: "When you complete 'Morning Run', you're 80% more likely to complete 'Healthy Breakfast'"

**Streak Prediction Card:**
- "You're on track for a 30-day streak!"
- Shows projected streak based on current performance
- Animated progress bar showing progress toward prediction
- Encouraging message

**Weekly Summary Card:**
- "This Week vs Last Week"
- Comparison metrics:
  - Total completions: Up/down indicator
  - Average success rate: Percentage change
  - Most consistent habit: Name and icon
- Mini line chart showing week-over-week trend

### 6.2.6 Export Data Section (Bottom of Screen)

**Export Card:**
- Background: Subtle secondary color tint
- Icon: Download or share icon
- Title: "Export Your Data"
- Description: "Download your habit data as CSV or JSON"
- Button: "Export Data"

**Export Modal:**
```
User taps Export Data:
1. Modal slides up from bottom
2. Two options:
   - Export as CSV (for spreadsheets)
   - Export as JSON (raw data)
3. Date range selector: Last week, month, year, all time
4. Toggle: Include notes
5. "Export" button
6. Generates file and opens iOS share sheet
```

---

## 6.3 HABITS SCREEN (All Habits List)

### 6.3.1 Screen Layout

**Search Bar (Fixed at Top):**
- Height: 50pt
- Background: Search bar background color (subtle)
- Border radius: 12pt
- Margins: 20pt horizontal, 10pt vertical
- Placeholder: "Search habits..."
- Search icon on left
- Clear button on right (when text entered)

**Search Animation:**
```
User taps search bar:
1. Search bar expands slightly (scales to 1.05) with spring
2. Keyboard slides up from bottom
3. Cancel button fades in on right
4. Search results filter in real-time as user types
5. Non-matching habits fade out (opacity 0.3)
```

**Category Filter Bar (Horizontal Scroll):**
- Position: Below search bar
- Height: 50pt
- Horizontal scroll of category chips
- Each chip:
  - Height: 36pt
  - Border radius: 18pt
  - Background: Surface color or category color (if selected)
  - Padding: 12pt horizontal
  - Text: Category name
  - Icon: Category icon (if set)

**Category Chip Interaction:**
```
User taps category chip:
1. Chip scales down (0.95) with haptic feedback
2. Selected state: Background changes to category color
3. Habits list filters with smooth fade animation
4. Tap "All" chip to clear filter
5. Multiple categories selectable (acts as OR filter)
```

**Habits List:**
- Grouped by category (collapsible sections)
- Section headers show category name, color, and count
- Vertical spacing: 8pt between items

### 6.3.2 Habit List Item Design

**List Item (different from Today screen card):**
- Height: 80pt
- Background: Surface color
- Separators: 1pt line between items (subtle)
- No border radius for list items (edge-to-edge)

**Layout:**

**Left Section (60pt):**
- Habit icon (40pt)
- Drag handle (for reordering): Appears on long press

**Center Section:**
- Habit name (16pt, semibold)
- Frequency + time (13pt, secondary color)
  - Example: "Daily • 8:00 AM" or "3x per week"
- Streak badge (if active streak): "12 days" with small fire icon

**Right Section (100pt):**
- Mini success indicator: Last 7 days mini chart
  - 7 small circles (8pt each)
  - Filled circle: Completed
  - Empty circle: Missed
  - Half-filled: Partially completed
- Arrow icon (chevron right): Indicates tappable

**Gesture Interactions:**

**Swipe Left for Quick Actions:**
```
User swipes left on list item:
1. Item translates left, revealing action buttons
2. Action buttons slide in from right:
   - Edit (blue, pencil icon)
   - Archive (orange, folder icon)
   - Delete (red, trash icon)
3. Tap any action button:
   - Haptic feedback (light impact)
   - Perform action
   - List item animates out if deleted/archived
   - Undo toast appears at bottom
```

**Long Press to Reorder:**
```
User long presses list item:
1. Haptic feedback (heavy impact)
2. Item lifts with shadow increase and scale (1.05)
3. Drag handles appear on sides
4. Other items shift to create space
5. User drags item up or down:
   - Items smoothly shift positions
   - Haptic feedback when passing another item
6. User releases:
   - Item settles into new position with spring animation
   - Order saved automatically
   - Success haptic feedback
```

**Tap for Details:**
```
User taps list item:
1. Item briefly flashes (background color pulse)
2. Navigate to Habit Detail screen
3. Transition: Item expands to fill screen (shared element transition)
4. Navigation bar slides in from top
```

### 6.3.3 Category Section Headers

**Header Design:**
- Height: 44pt
- Background: Slightly different shade than list items
- Sticky header (stays at top while scrolling its section)
- Left side: Category color indicator (4pt vertical bar)

**Header Content:**
- Category icon (20pt)
- Category name (15pt, semibold)
- Habit count (12pt, secondary color): "(5 habits)"
- Right side: Collapse/expand chevron icon

**Collapse/Expand Animation:**
```
User taps section header:
1. Haptic feedback (light impact)
2. Chevron rotates 180° (300ms)
3. Section items:
   - Collapse: Items fade out and slide up (staggered, 50ms delay each)
   - Expand: Items fade in and slide down (staggered, 50ms delay each)
4. List adjusts height smoothly
```

### 6.3.4 Archived Habits Section

**Access:** "Archived" tab at top of screen or swipe to secondary screen

**Layout:** Similar to main list but with different visual treatment

**Archived Item Appearance:**
- Slight transparency (0.7 opacity)
- Archived badge: Small "Archived" chip on top right
- No streak indicators
- Grayed-out appearance

**Unarchive Gesture:**
```
User swipes right on archived item:
1. Green overlay appears
2. "Unarchive" text shows
3. Release to unarchive:
   - Item animates out of archived list
   - Success toast: "Habit unarchived"
   - Item appears back in main list with celebration animation
```

### 6.3.5 Empty States

**No Habits:**
- Centered content
- Illustration: Empty state graphic
- Title: "No Habits Yet"
- Subtitle: "Start building better habits today"
- CTA: "Create First Habit"

**No Search Results:**
- Centered content
- Icon: Magnifying glass
- Text: "No habits found for '[search term]'"
- Suggestion: "Try a different search term"

**Category Empty:**
- Inline message in category section
- Text: "No habits in this category"
- Link: "Add habit to [Category]"

### 6.3.6 Floating Action Button (FAB)

**Position:** Bottom right, 20pt from edge, 100pt from bottom
**Appearance:** Same as Today screen FAB
**Action:** Opens Create Habit modal

---

## 6.4 HABIT DETAIL SCREEN

**Access:** Tap any habit from Today screen or Habits list

**Navigation:** Full-screen push with shared element transition

### 6.4.1 Screen Layout

**Header Section (Fixed, 280pt):**
- Large hero area
- Background: Gradient using habit's custom color
- Overlay: Subtle animated pattern (Skia shader with slow-moving shapes)

**Hero Content:**
- Back button (top left): Arrow icon, tap to go back with slide transition
- Action menu (top right): Three-dot menu icon
  - Edit
  - Archive
  - Delete
  - Export habit data

**Habit Icon & Name:**
- Centered
- Large icon: 80pt diameter
- Icon background: White with opacity
- Habit name below icon (28pt, bold, white text with shadow)
- Frequency info: "Daily" or frequency details (16pt, white 80% opacity)

**Quick Stats Row:**
- 3 columns, equal width
- Each column:
  - Large number (32pt, bold)
  - Label below (13pt)
  - Columns:
    1. Current Streak: "12" + "days"
    2. Success Rate: "85%" + "this month"
    3. Total: "240" + "completions"
- Background: Semi-transparent white cards (glass morphism)
- Border radius: 12pt
- Slight shadow

**Scrollable Content:**

### 6.4.2 Current Status Section

**Today's Entry Card:**
- Width: Full width - 40pt margins
- Height: Dynamic (120-180pt depending on habit type)
- Background: Surface color
- Border radius: 16pt
- Border: 2pt solid (habit color if completed, gray if not)

**Card Content:**

**If Not Completed Today:**
- Large CTA button: "Mark as Complete"
- Button design:
  - Full width
  - Height: 56pt
  - Background: Habit's gradient
  - Border radius: 12pt
  - Text: White, bold
  - Icon: Checkmark
  - Press animation: Scale down with haptic

**If Completed Today:**
- Checkmark icon (large, animated)
- Text: "Completed at [time]"
- Optional note field: "Add a note about today"
- Edit button: "Change value" (for quantifiable habits)

**For Quantifiable Habits:**
- Progress ring showing current/target
- Large number in center: "45/50 pages"
- Slider or number input to adjust value
- Quick increment buttons: +5, +10, +25

**Add Note Section:**
- Text input field
- Placeholder: "How did it go?"
- Character limit: 100
- Expandable on tap
- Mood selector: 4 emoji-style buttons (😊 😐 😕 😢)
- Selected mood has subtle glow effect

### 6.4.3 Calendar History View

**Section Header:**
- "History" title
- View switcher: List view | Calendar view (toggle)
- Date range: This month (with month picker)

**Calendar View:**
- Monthly calendar grid
- Each day is a tile showing completion status
- Color coding:
  - Completed: Habit's color (full opacity)
  - Partial: Habit's color (50% opacity)
  - Skipped: Orange tint
  - Missed: Gray
  - Future: Transparent
  - Today: Border highlight

**Tile Interaction:**
```
User taps calendar tile:
1. Tile scales up with spring animation
2. Detail popover appears above tile:
   - Date
   - Status (Completed, Missed, Skipped)
   - Time completed (if applicable)
   - Value (for quantifiable habits)
   - Note (if added)
   - Edit button: Opens edit modal for that day
3. Tap outside to dismiss popover
```

**List View (Alternative):**
- Chronological list of completions
- Each entry shows:
  - Date and time
  - Status indicator (color-coded dot)
  - Value (if applicable)
  - Note preview
  - Tap to expand full details
- Infinite scroll: Loads more entries as user scrolls up
- Pull to refresh: Animates with spinner

### 6.4.4 Statistics Section

**Performance Chart:**
- Line chart showing completion rate over time
- X-axis: Time period (week/month/year)
- Y-axis: Success rate percentage
- Interactive:
  - Pinch to zoom
  - Drag to pan
  - Tap data point to see exact date and value
- Rendered with Victory Native
- Animated draw-in on screen load

**Streak Timeline:**
- Horizontal bar chart showing streak history
- Each bar represents a streak
- Color intensity based on streak length
- Current streak highlighted
- Tap bar to see streak details:
  - Start date
  - End date
  - Length
  - Why it ended (if applicable)

**Best Streak Card:**
- Highlighted card with trophy icon
- Shows longest streak details
- Date range
- Motivational text: "Can you beat it?"

**Consistency Score:**
- Circular progress indicator
- Percentage based on completion rate over last 90 days
- Grade: A, B, C, D, F with color coding
- Text explanation: "You complete this habit X days per week on average"

### 6.4.5 Insights Section (Premium)

**Time Analysis:**
- "You usually complete this habit in the [morning/afternoon/evening]"
- Pie chart showing distribution by time of day
- Interactive segments

**Correlation Insights:**
- "When you complete [Habit A], you're X% more likely to complete this habit"
- List of correlated habits with percentages
- Tap to view correlation details

**Prediction:**
- "At your current pace, you'll reach a 100-day streak by [Date]"
- Progress bar showing projection
- Encouraging message

### 6.4.6 Related Habits Section

**Section Title:** "Related Habits"

**Habit Cards:**
- Mini versions of habit cards
- Horizontal scroll
- Shows habits in same category or with correlation
- Tap to navigate to that habit's detail screen

### 6.4.7 Notes Section

**Section Title:** "All Notes"
**Layout:** List of all notes attached to completions

**Note Item:**
- Date on left
- Note text in center
- Mood emoji on right (if set)
- Swipe to delete
- Tap to edit

### 6.4.8 Settings Section

**Expandable Settings Panel:**
- Tap "Habit Settings" to expand
- Settings include:
  - Edit name and icon
  - Change color
  - Adjust frequency
  - Set reminder time
  - Set target value (for quantifiable)
  - Choose category
- Each setting has its own input/selector
- Changes save automatically
- Success toast on save

---

## 6.5 CREATE/EDIT HABIT MODAL

### 6.5.1 Modal Presentation

**Entry Animation:**
```
Modal slides up from bottom (400ms spring):
1. Screen content dims (overlay)
2. Modal appears at bottom with rounded top corners
3. Handle bar appears at top of modal (for swipe-to-dismiss)
4. Keyboard auto-opens if name field is empty
5. Haptic feedback (light impact)
```

**Modal Design:**
- Height: 90% of screen height
- Background: Surface color
- Top corners: Rounded (20pt radius)
- Handle bar: 40pt width × 5pt height, centered, gray color
- Padding: 20pt all sides

### 6.5.2 Form Fields

**Form Layout:** Vertical stack with sections

**Section 1: Basic Info**

**Habit Name Input:**
- Label: "Habit Name" (small, secondary color)
- Text input field:
  - Placeholder: "e.g., Morning meditation"
  - Font size: 20pt
  - Max length: 50 characters
  - Character counter: "0/50" (bottom right of field)
  - Auto-focus on modal open
  - Clear button (X icon) when text entered

**Description Input (Optional):**
- Label: "Description (optional)"
- Text area:
  - Placeholder: "Why is this habit important?"
  - Multiline (2-4 lines)
  - Max length: 200 characters
  - Character counter

**Section 2: Appearance**

**Icon Selector:**
- Label: "Icon"
- Current selection displayed as large icon (60pt)
- Tap to open icon picker modal:
  - Grid of icon options (6 columns)
  - Categories: Activity, Health, Work, Learning, Social, Custom
  - Search bar at top
  - Icons from react-native-vector-icons (Ionicons, Feather)
  - Selected icon highlighted with border
  - Tap icon to select and auto-dismiss modal

**Icon Picker Animation:**
```
1. Icons fade in with staggered timing (create wave effect)
2. Scroll is smooth with momentum
3. Selected icon bounces when tapped
4. Modal dismisses with slide-down animation
```

**Color Picker:**
- Label: "Color"
- Current color displayed as large circle (50pt diameter)
- Tap to open color picker:
  - Preset colors: 16 beautiful colors arranged in grid
  - Custom color: HSL color wheel (for premium users)
  - Selected color highlighted with checkmark
  - Tap color to select and auto-dismiss

**Color Preview:**
- Shows habit card preview with selected color and icon
- Updates in real-time as user changes color/icon
- Small preview card (120pt width)

**Section 3: Frequency & Schedule**

**Frequency Selector:**
- Label: "Frequency"
- Segmented control:
  - Daily
  - Weekly
  - Custom
- Selected segment highlighted

**Daily Options:**
- Simple, no additional inputs needed
- Shows: "Every day"

**Weekly Options:**
- Target selector: "How many times per week?"
- Number input: Default 3
- Stepper buttons (+/-)
- Shows: "3 times per week"

**Custom Options:**
- Dropdown/modal to select:
  - Specific days (M, T, W, Th, F, Sa, Su checkboxes)
  - Every N days (interval input)
  - Monthly (specific dates)
- Visual preview below showing pattern

**Day Selector (for Specific Days):**
- 7 circular buttons for each day
- Day abbreviations: S, M, T, W, T, F, S
- Selected days: Filled with habit color
- Unselected: Outline only
- Tap to toggle with haptic feedback

**Section 4: Quantifiable Habit (Optional)**

**Toggle:** "Track a specific value"
- Switch control
- When enabled, shows additional fields:

**Value Inputs:**
- Target value: Number input
- Unit: Text input (e.g., "pages", "minutes", "glasses")
- Example: Target: 50, Unit: "pages" → "50 pages"

**Section 5: Reminders**

**Reminder Toggle:**
- Label: "Daily reminder"
- Switch control
- When enabled, shows time picker

**Time Picker:**
- Shows current time selection: "8:00 AM"
- Tap to open iOS-style time picker
- Scroll wheels for hour and minute
- AM/PM selector
- "Done" button to confirm

**Reminder Days (if frequency is custom):**
- Only show reminder on specific days
- Reuses day selector component
- Defaults to match frequency days

**Section 6: Category**

**Category Selector:**
- Label: "Category (optional)"
- Shows current selection or "None"
- Tap to open category picker modal:
  - List of existing categories
  - Each category shows icon, name, and color
  - "+ Create New Category" option at bottom
  - Selected category highlighted
  - Tap to select and dismiss

**Create New Category Modal:**
- Fields:
  - Category name (text input)
  - Icon (icon picker)
  - Color (color picker)
- "Create" button
- Adds to category list immediately

### 6.5.3 Action Buttons

**Bottom Section (Fixed at Bottom):**
- Two buttons (for edit mode) or one button (for create mode)

**Create Mode:**
- Single large button: "Create Habit"
- Full width (minus padding)
- Height: 56pt
- Background: Gradient (primary to secondary)
- Text: White, bold, 18pt
- Icon: Plus icon
- Disabled state: Gray background, 50% opacity
  - Disabled when name is empty

**Edit Mode:**
- Two buttons side by side:
  - "Cancel" (left, 40% width): Secondary style, outline
  - "Save Changes" (right, 60% width): Primary style, gradient

**Button Press Animation:**
```
1. Scale down to 0.96 (100ms)
2. Haptic feedback (light impact)
3. If valid:
   - Save data
   - Success haptic (notification)
   - Modal dismisses with slide-down
   - Success toast: "Habit created!" or "Changes saved!"
   - If created: New habit animates into list
4. If invalid:
   - Error haptic (notification)
   - Shake animation on invalid field
   - Error message below field
```

### 6.5.4 Validation & Error States

**Name Field Validation:**
- Required field
- Show error if empty on submit attempt
- Error message: "Please enter a habit name"
- Error style: Red border, red text

**Value Field Validation:**
- Must be positive number
- Error if invalid: "Please enter a valid number"

**Reminder Time Validation:**
- No validation needed (time picker handles it)

### 6.5.5 Modal Dismissal

**Swipe Down to Dismiss:**
```
User swipes down on modal from top area:
1. Modal follows finger vertically
2. If swiped past 30% of height:
   - Modal continues sliding down and dismisses
   - Backdrop fades out
   - Haptic feedback (light impact)
3. If released before 30%:
   - Modal springs back to original position
4. If form has unsaved changes:
   - Show confirmation dialog:
     - "Discard changes?"
     - "Keep Editing" | "Discard"
```

**Tap Outside to Dismiss:**
- Tap dimmed backdrop to dismiss (with confirmation if unsaved changes)

**Cancel Button:**
- Same behavior as swipe down (with confirmation if needed)

---

## 6.6 PROFILE / SETTINGS SCREEN

### 6.6.1 Screen Layout

**Header Section (120pt):**
- Background: Gradient (primary color)
- Rounded bottom corners (30pt radius)

**Profile Info:**
- Centered content
- App logo (60pt)
- App name: "Ripple" (24pt, bold, white)
- Tagline: "Every habit creates ripples" (14pt, white 70% opacity)

**Scrollable Content:**

### 6.6.2 Account Section

**Stats Card:**
- Width: Full width - 40pt margins
- Background: Surface color
- Border radius: 16pt
- Padding: 20pt

**Stats Grid (2×2):**
- Total Habits: Number with icon
- Active Streak: Days with fire icon
- Completion Rate: Percentage with checkmark
- Days Active: Total days since first habit

**Membership Card:**
- Shows current tier (Free, Premium, Premium+)
- If Free:
  - "Free Plan" badge
  - "5 of 5 habits used"
  - Progress bar showing usage
  - "Upgrade to Premium" CTA button
- If Premium:
  - "Premium" badge with sparkle icon
  - "Unlimited habits"
  - List of premium features unlocked
  - "Upgrade to Premium+" CTA (for subscription)
- If Premium+:
  - "Premium+" badge with crown icon
  - "All features unlocked"
  - Subscription status: "Active until [Date]"
  - "Manage Subscription" link

**Upgrade Button Animation:**
```
Button has subtle shimmer effect:
1. Gradient overlay sweeps across button repeatedly
2. Tap to open IAP modal
3. Button scales down on press with haptic
```

### 6.6.3 Preferences Section

**Section Header:** "Preferences"

**Theme Selector:**
- Label: "Appearance"
- Shows current theme with preview thumbnail
- Tap to open theme selector modal:
  - Three options: Light, Dark, Auto
  - Large preview cards for each theme
  - Horizontal swipe between previews
  - Selected theme highlighted
  - "Select" button for each option

**Theme Change Animation:**
```
User selects new theme:
1. Modal dismisses
2. Entire app smoothly transitions colors (600ms)
3. All UI elements fade to new color scheme
4. Subtle ripple effect from point of selection
5. Success haptic feedback
```

**Accent Color Selector:**
- Label: "Accent Color"
- Shows current accent color circle
- Tap to open color picker:
  - Grid of preset colors
  - Selected color highlighted
  - Real-time preview of app UI with selected color

**First Day of Week:**
- Label: "Week starts on"
- Segmented control: Sunday | Monday
- Selected option highlighted
- Changes affect calendar views immediately

**Language Selector (Future):**
- Label: "Language"
- Shows current language
- Tap to open language picker
- Note: "English only" for now

### 6.6.4 Notifications Section

**Section Header:** "Notifications"

**Master Toggle:**
- "Enable Notifications"
- Large toggle switch
- When disabled, all notification settings grayed out

**Notification Settings:**
- "Daily Reminder Time" - Time picker (e.g., 8:00 AM)
- "Reminder Sound" - Dropdown of sound options
- "Haptic Feedback" - Toggle switch
- "Motivation Notifications" - Toggle for encouraging messages
- "Streak Reminders" - Toggle for streak-related notifications

### 6.6.5 Data & Privacy Section

**Section Header:** "Data & Privacy"

**Backup & Restore:**
- "Backup Data" button:
  - Shows last backup date below
  - Tap to backup to iCloud Drive
  - Loading indicator during backup
  - Success message: "Backed up successfully!"
- "Restore Data" button:
  - Opens file picker for iCloud Drive
  - Select backup file
  - Confirmation dialog: "This will replace current data. Continue?"
  - Restore process with progress indicator

**Export Data:**
- "Export Data" button
- Opens export options:
  - Format: CSV or JSON
  - Date range selector
  - "Export" button opens share sheet

**Data Management:**
- "Clear All Data" button:
  - Red warning style
  - Tap opens confirmation dialog:
    - "This will permanently delete all your habits and data. This cannot be undone."
    - "Cancel" | "Delete All Data" (red)
  - Requires second confirmation after first
  - After deletion: Navigate to onboarding

### 6.6.6 About Section

**Section Header:** "About"

**App Info:**
- App version: "1.0.0"
- Build number: "(123)"
- Last updated: Date

**Links List:**
- "Rate on App Store" - Opens App Store rating page
- "Share App" - Opens iOS share sheet
- "Privacy Policy" - Opens in-app web view
- "Terms of Service" - Opens in-app web view
- "Contact Support" - Opens email composer
- "Follow Us on Twitter" - Opens Twitter app/web

**Easter Egg:**
- Tap app version 7 times quickly:
  - Unlocks "Developer Options" section
  - Shows debug info
  - Reset onboarding option
  - Clear cache option
  - Animation speed controls

### 6.6.7 Logout / Account Deletion (Future)

**Placeholder Section:**
- "Sign In / Create Account" button
- Message: "Coming soon: Sync your habits across devices"
- Disabled button with lock icon

---

## 6.7 IN-APP PURCHASE (IAP) MODAL

**Trigger Points:**
- Tap "Upgrade" button in Profile screen
- Attempt to create 6th habit (free tier limit)
- Attempt to access premium feature
- Tap premium badge anywhere in app

### 6.7.1 Modal Design

**Presentation:** Full-screen modal

**Header:**
- "Go Premium" title (large, bold)
- Close button (X) in top right
- Background: Animated gradient (primary to tertiary colors)
- Subtle particle effects (floating sparkles)

**Hero Section:**
- Large premium icon (trophy, crown, or star)
- Animated with continuous gentle rotation
- Glowing effect around icon (Skia shader)

### 6.7.2 Feature List

**Premium Features Section:**
- "Unlock Everything" subtitle

**Feature Cards:**
Each feature displayed as a card with icon and description:

1. **Unlimited Habits**
   - Icon: Infinity symbol
   - Text: "Create as many habits as you need"
   - Current: "Currently: 5 habits"

2. **Advanced Analytics**
   - Icon: Chart icon
   - Text: "Insights, correlations, and predictions"
   - Current: "Currently: Basic stats only"

3. **Custom Themes**
   - Icon: Palette icon
   - Text: "Personalize with unlimited themes and colors"

4. **Priority Support**
   - Icon: Headset icon
   - Text: "Get help when you need it"

5. **All Future Features**
   - Icon: Sparkle icon
   - Text: "Access new features as they're released"

**Animation:** Cards fade in sequentially with upward slide (staggered 100ms delay)

### 6.7.3 Pricing Options

**Pricing Cards:**
- Two cards (Premium and Premium+)
- Cards displayed side-by-side or stacked vertically

**Premium Card:**
- Background: Gradient card
- Badge: "Most Popular"
- Price: "$9.99"
- Subtitle: "One-time payment"
- Features list:
  - ✓ Unlimited habits
  - ✓ Advanced statistics
  - ✓ All themes
  - ✓ Priority support
- "Purchase" button

**Premium+ Card:**
- Background: More vibrant gradient with animated border
- Badge: "Best Value"
- Price: "$19.99"
- Subtitle: "Per year"
- Features list:
  - ✓ Everything in Premium
  - ✓ Future cloud sync
  - ✓ AI-powered insights
  - ✓ Exclusive themes
  - ✓ Early access
- "Subscribe" button

**Card Selection:**
```
User taps on pricing card:
1. Card scales up slightly (1.05)
2. Other cards scale down (0.95) and fade slightly
3. Selected card gets glowing border
4. "Continue" button appears/updates at bottom
5. Haptic feedback (light impact)
```

### 6.7.4 Purchase Flow

**Purchase Button:**
- Large button at bottom
- Text: "Continue with [Selected Plan]"
- Background: Gradient matching selected card
- Tap to initiate purchase

**Purchase Process:**
```
User taps purchase button:
1. Button shows loading spinner
2. iOS IAP sheet appears (native)
3. User authenticates (Face ID, Touch ID, or password)
4. During purchase:
   - Modal shows loading state
   - "Processing..." message
   - Animated spinner
5. On success:
   - Success animation: Confetti burst
   - Checkmark icon scales in
   - Message: "Welcome to Premium!"
   - "Get Started" button
   - Tap to dismiss modal
   - Premium features unlock immediately
6. On failure:
   - Error message
   - "Try Again" button
   - Option to "Restore Previous Purchase"
```

**Restore Purchase:**
- Link at bottom: "Restore Purchase"
- Tap to check for existing purchase
- If found: Unlock premium features
- If not found: Show message "No previous purchase found"

### 6.7.5 Legal Info

**Bottom Section:**
- Small text (10pt, gray)
- Links:
  - "Terms of Service"
  - "Privacy Policy"
  - "Restore Purchase"
- Subscription info: "Subscription automatically renews unless cancelled"

---

## 6.8 NOTIFICATION SYSTEM

### 6.8.1 Notification Types

**Daily Habit Reminders:**
- Scheduled at user-specified time for each habit
- Title: Habit name
- Body: "Time to complete your habit!"
- Icon: Habit's icon (if possible via notification attachment)
- Sound: User-selected or default
- Action buttons:
  - "Complete" - Marks habit as complete
  - "Snooze" - Reschedules for 1 hour later
  - "Skip" - Marks as skipped for today

**Streak Reminders:**
- Trigger: Evening (8 PM) if habits incomplete
- Title: "Don't break your streak!"
- Body: "You have X habits left to complete today"
- Action: Opens app to Today screen

**Milestone Celebrations:**
- Trigger: When streak reaches milestone (7, 30, 50, 100, 365 days)
- Title: "🎉 Congratulations!"
- Body: "You've reached a [X] day streak for [Habit]!"
- Action: Opens habit detail screen

**Motivation Notifications (Random):**
- Trigger: Random times throughout day (if enabled)
- Title: Motivational quote
- Body: Encouraging message
- Examples:
  - "Small steps lead to big changes"
  - "You're building something great"
  - "Consistency is key"
- Action: Opens app

### 6.8.2 Notification Interaction

**Complete from Notification:**
```
User taps "Complete" action:
1. App opens in background (if closed)
2. Habit marked as complete in database
3. New notification sent: "Great job! [Habit] completed ✓"
4. Notification badge updates
5. Widgets refresh
```

**Snooze from Notification:**
```
User taps "Snooze":
1. Notification dismissed
2. New notification scheduled for 1 hour later
3. Snooze count increments (max 3 per day)
4. Confirmation notification: "Reminder snoozed for 1 hour"
```

### 6.8.3 Notification Permissions

**Permission Request:**
- Shown during onboarding (Screen 5)
- Native iOS permission dialog
- If denied: Show instructions to enable in Settings
- Periodic re-prompt if notifications disabled (subtle, not annoying)

**Notification Settings:**
- Accessible in Settings screen
- Toggle each notification type individually
- Test notification button: Sends sample notification

---

## 6.9 WIDGET SYSTEM

### 6.9.1 Widget Sizes

**Small Widget (2×2):**
- Shows daily progress
- Circular progress ring
- Text: "X/Y completed"
- Tap to open app

**Medium Widget (4×2):**
- Shows today's habits list (up to 4)
- Each habit: Icon + name + checkbox
- Tap habit to mark complete (deep link)
- Tap widget to open app

**Large Widget (4×4):**
- Full day view
- Today's habits with status
- Mini calendar for current week
- Tap any element for relevant deep link

### 6.9.2 Widget Design

**Visual Style:**
- Matches app theme (light/dark)
- Uses habit colors for visual interest
- Glass morphism background (frosted effect)
- Subtle shadows and depth

**Widget Content:**
- Real-time updates (refreshes when data changes)
- Shows accurate completion status
- Supports multiple widget instances (different habits or views)

**Widget Interactions:**
- All widgets deep link to app
- Tappable areas for specific actions:
  - Small: Single tap opens app to Today screen
  - Medium: Tap habit to open detail, tap elsewhere for Today screen
  - Large: Tap habit for detail, tap calendar for Statistics, tap elsewhere for Today

### 6.9.3 Widget Configuration

**Widget Setup:**
- Long press widget on home screen
- "Edit Widget" option
- Configuration options:
  - Widget type (Progress, List, Calendar)
  - Filter by category (show specific habits)
  - Theme (Light, Dark, Auto)
- Preview updates in real-time

---

## 7. ANIMATION SPECIFICATIONS

### 7.1 Global Animation Principles

**Animation Philosophy:**
- Animations serve purpose (feedback, guidance, delight)
- 60fps minimum performance target
- Interruptible animations (user can interrupt with gesture)
- Respect user's reduce-motion setting
- Haptic feedback accompanies significant animations

**Animation Timing:**
- Fast interactions: 200-300ms (taps, toggles)
- Standard transitions: 400-500ms (screen changes)
- Complex animations: 600-800ms (celebrations, splash)
- Micro-animations: 100-150ms (hover effects)

**Easing Functions:**
- Spring animations for organic feel (use react-native-reanimated springs)
- Ease-out for exits (elements leaving screen)
- Ease-in for entrances (elements entering screen)
- Ease-in-out for bidirectional movement

### 7.2 Screen Transition Animations

**Tab Switch:**
```javascript
// Using react-native-reanimated
- Current screen: Fade out + scale down to 0.95 (250ms)
- New screen: Fade in + scale up from 0.95 to 1.0 (300ms)
- Overlap: 50ms for smooth transition
- Tab bar indicator: Liquid morph animation (300ms elastic spring)
```

**Stack Push (Opening Detail Screen):**
```javascript
- New screen: Slides in from right (iOS native feel)
- Animation duration: 400ms
- Easing: Spring with damping
- Current screen: Slightly slides left (parallax effect)
- Header: Fades in as screen settles
```

**Stack Pop (Going Back):**
```javascript
- Current screen: Slides out to right
- Previous screen: Slides in from left
- Duration: 350ms
- Easing: Spring
- Header: Fades out before slide begins
```

**Modal Present:**
```javascript
- Backdrop: Fades in (200ms)
- Modal: Slides up from bottom with spring
- Animation: 400ms spring with overshoot
- Haptic: Light impact when modal appears
```

**Modal Dismiss:**
```javascript
- Modal: Slides down to bottom (300ms)
- Backdrop: Fades out (250ms)
- Can be interrupted by gesture
- Haptic: Light impact when fully dismissed
```

### 7.3 Gesture-Based Animations

**Swipe Right to Complete:**
```javascript
// Implementation with react-native-gesture-handler + reanimated
const gesture = Gesture.Pan()
  .onUpdate((event) => {
    // Card follows finger
    translateX.value = event.translationX;
    
    // Green overlay opacity based on swipe progress
    overlayOpacity.value = interpolate(
      translateX.value,
      [0, SCREEN_WIDTH * 0.5],
      [0, 0.3]
    );
    
    // Scale checkmark icon
    checkmarkScale.value = interpolate(
      translateX.value,
      [0, SCREEN_WIDTH * 0.4, SCREEN_WIDTH * 0.5],
      [0, 0.8, 1]
    );
  })
  .onEnd((event) => {
    if (event.translationX > SCREEN_WIDTH * 0.5) {
      // Complete action
      translateX.value = withSpring(SCREEN_WIDTH);
      runOnJS(onComplete)();
    } else {
      // Spring back
      translateX.value = withSpring(0);
    }
  });
```

**Pull to Refresh:**
```javascript
// Pull down animation
const scrollHandler = useAnimatedScrollHandler({
  onScroll: (event) => {
    if (event.contentOffset.y < -100) {
      // Trigger refresh
      refreshing.value = true;
      runOnJS(onRefresh)();
    }
    
    // Rotation based on pull distance
    rotation.value = interpolate(
      event.contentOffset.y,
      [0, -150],
      [0, 360]
    );
  }
});

// Spinner appears and rotates as user pulls
<Animated.View style={spinnerStyle}>
  <Spinner />
</Animated.View>
```

**Long Press Menu:**
```javascript
const longPress = Gesture.LongPress()
  .minDuration(400)
  .onStart(() => {
    // Haptic feedback
    runOnJS(triggerHaptic)('impactHeavy');
    
    // Scale down card
    cardScale.value = withSpring(0.97);
    
    // Show menu
    menuOpacity.value = withTiming(1, { duration: 200 });
    menuTranslateY.value = withSpring(0);
  })
  .onEnd(() => {
    // Reset card
    cardScale.value = withSpring(1);
  });

// Menu items stagger in
menuItems.forEach((item, index) => {
  item.translateY.value = withDelay(
    index * 50,
    withSpring(0)
  );
  item.opacity.value = withDelay(
    index * 50,
    withTiming(1, { duration: 200 })
  );
});
```

### 7.4 Loading & Progress Animations

**Skeleton Loading:**
```javascript
// Shimmer effect for loading states
const shimmer = useSharedValue(0);

useEffect(() => {
  shimmer.value = withRepeat(
    withTiming(1, { duration: 1500 }),
    -1,
    false
  );
}, []);

const shimmerStyle = useAnimatedStyle(() => {
  const translateX = interpolate(
    shimmer.value,
    [0, 1],
    [-SCREEN_WIDTH, SCREEN_WIDTH]
  );
  
  return {
    transform: [{ translateX }]
  };
});

// Skeleton cards with shimmer overlay
<View style={styles.skeletonCard}>
  <Animated.View style={[styles.shimmer, shimmerStyle]} />
</View>
```

**Progress Ring:**
```javascript
// Animated circular progress using react-native-skia
const progress = useSharedValue(0);

useEffect(() => {
  progress.value = withTiming(targetProgress, {
    duration: 1000,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1)
  });
}, [targetProgress]);

// Skia Canvas drawing
<Canvas style={styles.canvas}>
  <Circle
    cx={center}
    cy={center}
    r={radius}
    style="stroke"
    strokeWidth={strokeWidth}
    color={backgroundColor}
  />
  <Circle
    cx={center}
    cy={center}
    r={radius}
    style="stroke"
    strokeWidth={strokeWidth}
    color={progressColor}
    start={0}
    end={progress.value}
  />
</Canvas>
```

**Spinner:**
```javascript
// Custom spinner with Skia
const rotation = useSharedValue(0);

useEffect(() => {
  rotation.value = withRepeat(
    withTiming(360, { duration: 1000, easing: Easing.linear }),
    -1,
    false
  );
}, []);

// Animated arc that rotates
<Canvas style={styles.spinner}>
  <Path
    path={arcPath}
    color={primaryColor}
    style="stroke"
    strokeWidth={4}
    strokeCap="round"
    transform={[{ rotate: rotation.value }]}
  />
</Canvas>
```

### 7.5 Micro-Animations

**Button Press:**
```javascript
const scale = useSharedValue(1);

const pressIn = () => {
  scale.value = withTiming(0.96, { duration: 100 });
  triggerHaptic('impactLight');
};

const pressOut = () => {
  scale.value = withSpring(1);
};

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }]
}));
```

**Toggle Switch:**
```javascript
const togglePosition = useSharedValue(0);
const backgroundColor = useDerivedValue(() => {
  return interpolateColor(
    togglePosition.value,
    [0, 1],
    [colors.gray, colors.primary]
  );
});

const toggle = () => {
  togglePosition.value = withSpring(isOn ? 1 : 0);
  triggerHaptic('impactLight');
};
```

**Checkbox:**
```javascript
// Animated checkmark with path animation
const progress = useSharedValue(0);

const onCheck = () => {
  progress.value = withTiming(1, {
    duration: 300,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1)
  });
  triggerHaptic('impactMedium');
};

// Checkmark path draws in
<Canvas>
  <Path
    path={checkmarkPath}
    color={colors.white}
    style="stroke"
    strokeWidth={3}
    strokeCap="round"
    end={progress.value}
  />
</Canvas>
```

**Heart Animation (for favorites):**
```javascript
const scale = useSharedValue(0);
const opacity = useSharedValue(0);

const onLike = () => {
  scale.value = withSequence(
    withTiming(0, { duration: 0 }),
    withSpring(1.2),
    withSpring(1)
  );
  opacity.value = withTiming(1, { duration: 200 });
  
  // Particles burst
  particles.forEach((particle, i) => {
    particle.translateY.value = withDelay(
      i * 20,
      withSpring(-50, { damping: 5 })
    );
    particle.opacity.value = withDelay(
      i * 20,
      withTiming(0, { duration: 500 })
    );
  });
  
  triggerHaptic('impactMedium');
};
```

### 7.6 Particle Systems

**Confetti Burst:**
```javascript
// Using react-native-skia for particle effects
const particles = Array.from({ length: 30 }, () => ({
  x: useSharedValue(centerX),
  y: useSharedValue(centerY),
  rotation: useSharedValue(Math.random() * 360),
  opacity: useSharedValue(1),
  color: colors[Math.floor(Math.random() * colors.length)]
}));

const burst = () => {
  particles.forEach((particle) => {
    const angle = Math.random() * Math.PI * 2;
    const velocity = 100 + Math.random() * 100;
    
    particle.x.value = withTiming(
      centerX + Math.cos(angle) * velocity,
      { duration: 600, easing: Easing.out(Easing.quad) }
    );
    
    particle.y.value = withSequence(
      withTiming(
        centerY + Math.sin(angle) * velocity,
        { duration: 300, easing: Easing.out(Easing.quad) }
      ),
      withTiming(
        SCREEN_HEIGHT,
        { duration: 300, easing: Easing.in(Easing.quad) }
      )
    );
    
    particle.rotation.value = withTiming(
      particle.rotation.value + 360 + Math.random() * 720,
      { duration: 600 }
    );
    
    particle.opacity.value = withDelay(
      300,
      withTiming(0, { duration: 300 })
    );
  });
  
  triggerHaptic('notificationSuccess');
};

// Render with Skia
<Canvas>
  {particles.map((particle, i) => (
    <Circle
      key={i}
      cx={particle.x}
      cy={particle.y}
      r={4}
      color={particle.color}
      opacity={particle.opacity}
      transform={[{ rotate: particle.rotation }]}
    />
  ))}
</Canvas>
```

**Ripple Effect:**
```javascript
// Expanding ripple circles
const ripples = [
  { scale: useSharedValue(0), opacity: useSharedValue(0.8) },
  { scale: useSharedValue(0), opacity: useSharedValue(0.8) },
  { scale: useSharedValue(0), opacity: useSharedValue(0.8) }
];

const triggerRipple = () => {
  ripples.forEach((ripple, i) => {
    ripple.scale.value = withDelay(
      i * 200,
      withTiming(3, { duration: 1000, easing: Easing.out(Easing.ease) })
    );
    ripple.opacity.value = withDelay(
      i * 200,
      withTiming(0, { duration: 1000 })
    );
  });
};

// Render ripples
{ripples.map((ripple, i) => (
  <Animated.View
    key={i}
    style={[
      styles.ripple,
      {
        transform: [{ scale: ripple.scale }],
        opacity: ripple.opacity
      }
    ]}
  />
))}
```

### 7.7 Chart Animations

**Bar Chart Entry:**
```javascript
// Bars grow from bottom to top
const barHeights = habits.map(() => useSharedValue(0));

useEffect(() => {
  habits.forEach((habit, i) => {
    barHeights[i].value = withDelay(
      i * 100,
      withSpring(habit.value, {
        damping: 12,
        stiffness: 100
      })
    );
  });
}, [habits]);
```

**Line Chart Draw:**
```javascript
// Path animation for line chart
const pathProgress = useSharedValue(0);

useEffect(() => {
  pathProgress.value = withTiming(1, {
    duration: 1000,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1)
  });
}, []);

<Canvas>
  <Path
    path={chartPath}
    color={colors.primary}
    style="stroke"
    strokeWidth={3}
    end={pathProgress.value}
  />
</Canvas>
```

### 7.8 Page Curl Transition

**Calendar View Transition:**
```javascript
// 3D page curl effect using Skia
const curlProgress = useSharedValue(0);

const openCalendar = () => {
  curlProgress.value = withTiming(1, {
    duration: 800,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1)
  });
};

// Skia shader for 3D curl effect
<Canvas>
  <RoundedRect
    x={0}
    y={0}
    width={SCREEN_WIDTH}
    height={SCREEN_HEIGHT}
    r={20}
  >
    <Shader source={curlShader} uniforms={{ progress: curlProgress }} />
  </RoundedRect>
</Canvas>
```

---

## 8. DESIGN SYSTEM

### 8.1 Typography

**Font Family:** SF Pro (iOS system font) / Poppins (custom alternative)

**Type Scale:**
- **Display:** 40pt, Bold (Hero titles, splash screen)
- **H1:** 34pt, Bold (Screen titles)
- **H2:** 28pt, Semibold (Section headers)
- **H3:** 22pt, Semibold (Card titles)
- **H4:** 20pt, Semibold (Subsection titles)
- **Body Large:** 18pt, Regular (Important body text)
- **Body:** 16pt, Regular (Default body text)
- **Body Small:** 14pt, Regular (Secondary text)
- **Caption:** 13pt, Regular (Metadata, captions)
- **Label:** 12pt, Medium (Labels, tags)
- **Tiny:** 10pt, Regular (Fine print, legal)

**Line Heights:**
- Display: 1.2
- Headers: 1.3
- Body: 1.5
- Caption/Label: 1.4

**Font Weights:**
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### 8.2 Color System

**Light Theme:**
```javascript
const lightColors = {
  // Primary palette
  primary: '#6366F1',      // Indigo
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  secondary: '#06B6D4',    // Cyan
  secondaryLight: '#22D3EE',
  secondaryDark: '#0891B2',
  tertiary: '#A855F7',     // Purple
  
  // Semantic colors
  success: '#10B981',      // Emerald
  successLight: '#34D399',
  warning: '#F59E0B',      // Amber
  warningLight: '#FBBF24',
  error: '#F43F5E',        // Rose
  errorLight: '#FB7185',
  info: '#3B82F6',         // Blue
  
  // Neutral palette
  background: '#F8FAFC',   // Slate 50
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',       // Slate 200
  
  // Text colors
  textPrimary: '#0F172A',  // Slate 900
  textSecondary: '#64748B', // Slate 500
  textTertiary: '#94A3B8',  // Slate 400
  textInverse: '#F1F5F9',   // Slate 100
  
  // Interactive
  link: '#3B82F6',
  linkHover: '#2563EB',
  
  // Overlays
  overlay: 'rgba(15, 23, 42, 0.5)',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
};
```

**Dark Theme:**
```javascript
const darkColors = {
  // Primary palette (slightly adjusted for dark mode)
  primary: '#818CF8',      // Lighter indigo
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',
  secondary: '#22D3EE',    // Lighter cyan
  secondaryLight: '#67E8F9',
  secondaryDark: '#06B6D4',
  tertiary: '#C084FC',     // Lighter purple
  
  // Semantic colors
  success: '#34D399',
  successLight: '#6EE7B7',
  warning: '#FBBF24',
  warningLight: '#FCD34D',
  error: '#FB7185',
  errorLight: '#FDA4AF',
  info: '#60A5FA',
  
  // Neutral palette
  background: '#0F172A',   // Slate 900
  surface: '#1E293B',      // Slate 800
  surfaceElevated: '#334155', // Slate 700
  border: '#334155',       // Slate 700
  
  // Text colors
  textPrimary: '#F1F5F9',  // Slate 100
  textSecondary: '#94A3B8', // Slate 400
  textTertiary: '#64748B',  // Slate 500
  textInverse: '#0F172A',   // Slate 900
  
  // Interactive
  link: '#60A5FA',
  linkHover: '#93C5FD',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  modalOverlay: 'rgba(0, 0, 0, 0.8)',
};
```

### 8.3 Spacing System

**Base Unit:** 4pt

**Spacing Scale:**
```javascript
const spacing = {
  xs: 4,    // 0.25rem
  sm: 8,    // 0.5rem
  md: 12,   // 0.75rem
  lg: 16,   // 1rem (base)
  xl: 20,   // 1.25rem
  '2xl': 24, // 1.5rem
  '3xl': 32, // 2rem
  '4xl': 40, // 2.5rem
  '5xl': 48, // 3rem
  '6xl': 64, // 4rem
};
```

**Component Spacing:**
- Card padding: 20pt
- Screen margins: 20pt
- List item padding: 16pt
- Button padding: 12pt horizontal, 16pt vertical
- Input padding: 12pt
- Section spacing: 32pt
- Group spacing: 12pt

### 8.4 Border Radius

**Radius Scale:**
```javascript
const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999, // Circle
};
```

**Usage:**
- Buttons: 12pt
- Cards: 16pt
- Modals: 20pt (top corners only)
- Input fields: 12pt
- Small chips: 18pt (pill shape)
- Images: 12pt

### 8.5 Shadows

**Shadow Scale:**
```javascript
const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
```

**Usage:**
- Cards: md shadow
- FAB: xl shadow
- Modals: lg shadow
- Elevated buttons: sm shadow
- Dropdowns: lg shadow

### 8.6 Component Styles

**Button Variants:**

**Primary Button:**
```javascript
{
  backgroundColor: colors.primary,
  paddingHorizontal: 24,
  paddingVertical: 16,
  borderRadius: 12,
  ...shadows.sm,
}
```

**Secondary Button:**
```javascript
{
  backgroundColor: 'transparent',
  borderWidth: 2,
  borderColor: colors.primary,
  paddingHorizontal: 24,
  paddingVertical: 16,
  borderRadius: 12,
}
```

**Text Button:**
```javascript
{
  backgroundColor: 'transparent',
  paddingHorizontal: 16,
  paddingVertical: 12,
}
```

**Input Field:**
```javascript
{
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 16,
  color: colors.textPrimary,
}

// Focus state
{
  borderColor: colors.primary,
  borderWidth: 2,
}

// Error state
{
  borderColor: colors.error,
}
```

**Card:**
```javascript
{
  backgroundColor: colors.surface,
  borderRadius: 16,
  padding: 20,
  ...shadows.md,
  borderWidth: 1,
  borderColor: colors.border,
}
```

---

## 9. COMPONENT LIBRARY

### 9.1 Core Components

**Button Component:**
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'text' | 'danger';
  size: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}

// Features:
- Press animation (scale down)
- Loading state with spinner
- Haptic feedback
- Icon support
- Accessibility labels
```

**Card Component:**
```typescript
interface CardProps {
  variant: 'default' | 'elevated' | 'outlined';
  padding?: number;
  onPress?: () => void;
  children: React.ReactNode;
}

// Features:
- Multiple variants
- Customizable padding
- Optional press action
- Shadow styling
- Animated press state
```

**Input Component:**
```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  maxLength?: number;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

// Features:
- Label and error message display
- Character counter
- Icon support
- Focus/blur animations
- Error state styling
- Clear button
```

**Toggle Component:**
```typescript
interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  label?: string;
}

// Features:
- Animated switch transition
- Haptic feedback
- Color interpolation
- Disabled state
- Label integration
```

**Avatar Component:**
```typescript
interface AvatarProps {
  source?: ImageSourcePropType;
  size: number;
  fallbackIcon?: string;
  fallbackText?: string;
  onPress?: () => void;
}

// Features:
- Image with fallback
- Icon or text fallback
- Circular mask
- Press animation
- Border option
```

**Badge Component:**
```typescript
interface BadgeProps {
  value?: number | string;
  variant: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// Features:
- Absolute positioning
- Multiple variants
- Number display with 99+ cap
- Dot-only option
```

**Modal Component:**
```typescript
interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  position: 'bottom' | 'center' | 'fullscreen';
  children: React.ReactNode;
  dismissible?: boolean;
  showHandle?: boolean;
}

// Features:
- Multiple presentation styles
- Swipe to dismiss (bottom sheet)
- Backdrop with tap-to-dismiss
- Handle bar for bottom sheets
- Animated entrance/exit
- Keyboard avoidance
```

**Dropdown Component:**
```typescript
interface DropdownProps {
  label?: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
  placeholder?: string;
}

// Features:
- Modal picker
- Search functionality
- Selected state
- Animated opening
- Keyboard support
```

**ProgressBar Component:**
```typescript
interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  height?: number;
  animated?: boolean;
  showLabel?: boolean;
}

// Features:
- Animated fill
- Multiple colors
- Label display (percentage)
- Gradient support
```

**Chip Component:**
```typescript
interface ChipProps {
  label: string;
  icon?: string;
  selected?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  variant: 'filled' | 'outlined';
}

// Features:
- Selected state
- Delete button
- Icon support
- Press animation
- Multiple variants
```

### 9.2 Habit-Specific Components

**HabitCard Component:**
- All functionality described in Section 6.1.2
- Gestures, animations, states
- Reusable across Today and Habits screens

**HabitIcon Component:**
- Displays habit icon with color background
- Multiple sizes
- Animation on completion
- Customizable colors

**StreakBadge Component:**
- Shows streak count with flame icon
- Animated incrementing
- Different sizes
- Milestone highlighting

**CalendarHeatmap Component:**
- Grid of days with completion status
- Color-coded squares
- Interactive tiles
- Month/week views
- Animated loading

**StatCard Component:**
- Displays single statistic
- Icon, value, label
- Trend indicator
- Animated counting

**ProgressRing Component:**
- Circular progress indicator
- Percentage display
- Animated fill
- Gradient colors
- Multiple sizes

### 9.3 Charts & Visualizations

**LineChart Component:**
- Victory Native wrapper
- Custom styling
- Interactive tooltips
- Animated drawing
- Zoom/pan support

**BarChart Component:**
- Victory Native wrapper
- Horizontal/vertical
- Animated bars
- Interactive bars
- Custom colors

**PieChart Component:**
- Victory Native wrapper
- Percentage labels
- Interactive segments
- Animated entrance

**SparklineChart Component:**
- Mini line chart
- No axes
- Trend indicator
- Lightweight rendering

---

## 10. DATA MANAGEMENT & OFFLINE FUNCTIONALITY

### 10.1 Database Implementation

**Database Choice:** Realm (preferred) or WatermelonDB

**Realm Configuration:**
```javascript
// Realm schema matches models defined in Section 2.3
const realmConfig = {
  schema: [
    HabitSchema,
    HabitCompletionSchema,
    CategorySchema,
    AppSettingsSchema
  ],
  schemaVersion: 1,
  migration: (oldRealm, newRealm) => {
    // Handle schema migrations
  }
};

// Initialize
const realm = await Realm.open(realmConfig);
```

**Data Access Layer (Repository Pattern):**
```typescript
class HabitRepository {
  async getAllHabits(): Promise<Habit[]> {
    return realm.objects('Habit').filtered('archived = false');
  }
  
  async getHabitById(id: string): Promise<Habit> {
    return realm.objectForPrimaryKey('Habit', id);
  }
  
  async createHabit(data: HabitInput): Promise<Habit> {
    return realm.write(() => {
      return realm.create('Habit', {
        id: uuid(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }
  
  async updateHabit(id: string, data: Partial<Habit>): Promise<void> {
    return realm.write(() => {
      const habit = realm.objectForPrimaryKey('Habit', id);
      Object.assign(habit, data, { updatedAt: new Date() });
    });
  }
  
  async deleteHabit(id: string): Promise<void> {
    return realm.write(() => {
      const habit = realm.objectForPrimaryKey('Habit', id);
      realm.delete(habit);
    });
  }
  
  async archiveHabit(id: string): Promise<void> {
    return this.updateHabit(id, {
      archived: true,
      archivedAt: new Date()
    });
  }
}
```

**Query Optimization:**
- Indexed fields: id, habitId, completedAt, createdAt
- Lazy loading for large lists
- Pagination for habit completions
- Filtered queries to minimize data transfer

### 10.2 Data Synchronization (Preparation for Future)

**Sync Architecture:**
- Local-first: All data stored locally
- Sync layer prepared but disabled
- Data versioning for conflict resolution
- UUID-based IDs for sync compatibility

**Sync Preparation:**
```typescript
interface SyncableEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
  version: number;
}

// All entities extend this for future sync
```

### 10.3 Backup & Restore

**Backup Implementation:**
```typescript
async function createBackup(): Promise<void> {
  // Export all data to JSON
  const habits = await habitRepository.getAllHabits();
  const completions = await habitRepository.getAllCompletions();
  const categories = await categoryRepository.getAllCategories();
  const settings = await settingsRepository.getSettings();
  
  const backup = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    data: {
      habits,
      completions,
      categories,
      settings
    }
  };
  
  // Save to iCloud Drive
  const fileName = `ripple-backup-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(
    `${FileSystem.documentDirectory}/${fileName}`,
    JSON.stringify(backup, null, 2)
  );
  
  // Trigger iOS share sheet
  await Sharing.shareAsync(
    `${FileSystem.documentDirectory}/${fileName}`
  );
}
```

**Restore Implementation:**
```typescript
async function restoreBackup(filePath: string): Promise<void> {
  // Read backup file
  const backupData = await FileSystem.readAsStringAsync(filePath);
  const backup = JSON.parse(backupData);
  
  // Validate backup
  if (!validateBackup(backup)) {
    throw new Error('Invalid backup file');
  }
  
  // Clear existing data (after confirmation)
  await clearAllData();
  
  // Restore data
  await realm.write(() => {
    backup.data.habits.forEach(habit => {
      realm.create('Habit', habit);
    });
    
    backup.data.completions.forEach(completion => {
      realm.create('HabitCompletion', completion);
    });
    
    // ... restore other entities
  });
  
  // Success notification
  showToast('Backup restored successfully!');
}
```

### 10.4 Data Export

**CSV Export:**
```typescript
async function exportToCSV(): Promise<void> {
  const habits = await habitRepository.getAllHabits();
  const completions = await habitRepository.getAllCompletions();
  
  // Build CSV content
  let csv = 'Habit Name,Date,Status,Value,Note\n';
  
  completions.forEach(completion => {
    const habit = habits.find(h => h.id === completion.habitId);
    csv += `"${habit.name}","${completion.completedAt.toISOString()}","${completion.skipped ? 'Skipped' : 'Completed'}","${completion.value || ''}","${completion.note || ''}"\n`;
  });
  
  // Save and share
  const fileName = `ripple-export-${Date.now()}.csv`;
  await saveAndShare(fileName, csv);
}
```

**JSON Export:**
```typescript
async function exportToJSON(): Promise<void> {
  // Similar to backup but more comprehensive
  const data = await gatherAllData();
  const json = JSON.stringify(data, null, 2);
  
  const fileName = `ripple-data-${Date.now()}.json`;
  await saveAndShare(fileName, json);
}
```

### 10.5 Data Validation

**Input Validation:**
- Habit name: 1-50 characters, required
- Description: 0-200 characters, optional
- Target value: Positive number
- Frequency: Valid enum value
- Dates: Valid date objects

**Data Integrity:**
- Foreign key validation (habitId exists)
- Date validation (no future completions)
- Frequency validation (matches habit rules)
- Unique constraint on habit names (per user)

---

## 11. PERFORMANCE OPTIMIZATION

### 11.1 Rendering Optimization

**React Native Best Practices:**
- Memoization: Use React.memo for expensive components
- UseMemo/UseCallback: Prevent unnecessary re-renders
- FlatList/FlashList: Virtualized lists for long lists
- Avoid inline styles: Pre-define styles
- Avoid anonymous functions in renders

**Example:**
```typescript
// Memoized habit card
const HabitCard = React.memo(({ habit, onComplete }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.habit.id === nextProps.habit.id &&
         prevProps.habit.updatedAt === nextProps.habit.updatedAt;
});

// Use FlashList for better performance
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={habits}
  renderItem={({ item }) => <HabitCard habit={item} />}
  estimatedItemSize={110}
  keyExtractor={item => item.id}
/>
```

### 11.2 Animation Performance

**Reanimated Worklets:**
- All animations run on UI thread
- Use worklets for calculations
- Avoid JS bridge crossings

**Example:**
```javascript
// Good: Runs on UI thread
const animatedStyle = useAnimatedStyle(() => {
  return {
    transform: [{ translateX: translateX.value }]
  };
});

// Avoid: Crosses JS bridge
const animatedStyle = useAnimatedStyle(() => {
  runOnJS(someFunction)(); // Only when necessary
  return { ... };
});
```

**Skia Performance:**
- Batch draw calls
- Reuse paths and shapes
- Use shaders for complex effects
- Limit particle count (< 150 particles)

### 11.3 Database Performance

**Query Optimization:**
- Use indexed fields for filters
- Limit query results with pagination
- Lazy load relationships
- Cache frequently accessed data

**Example:**
```typescript
// Good: Indexed query with limit
const recentCompletions = realm
  .objects('HabitCompletion')
  .filtered('completedAt >= $0', sevenDaysAgo)
  .sorted('completedAt', true)
  .slice(0, 50);

// Avoid: Full table scan
const allCompletions = realm.objects('HabitCompletion');
```

### 11.4 Image Optimization

**Image Handling:**
- Use react-native-fast-image for caching
- Compress images before use
- Use appropriate image sizes
- Lazy load images off-screen

**Remote Images:**
```typescript
import FastImage from 'react-native-fast-image';

<FastImage
  source={{
    uri: 'https://example.com/icon.png',
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable
  }}
  style={styles.icon}
  resizeMode={FastImage.resizeMode.contain}
/>
```

### 11.5 Bundle Size Optimization

**Code Splitting:**
- Lazy load screens (React.lazy + Suspense)
- Split large dependencies
- Remove unused code (tree shaking)
- Analyze bundle with Metro bundler

**Bundle Analysis:**
```bash
# Generate bundle analysis
npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output ./build/main.jsbundle \
  --assets-dest ./build
```

### 11.6 Memory Management

**Memory Best Practices:**
- Clear listeners on unmount
- Dispose Realm objects properly
- Cancel pending animations on unmount
- Limit cached data size

**Example:**
```typescript
useEffect(() => {
  // Subscribe to Realm changes
  const listener = realm.objects('Habit').addListener(() => {
    // Handle updates
  });
  
  // Cleanup
  return () => {
    listener.remove();
  };
}, []);
```

### 11.7 Startup Performance

**App Launch Optimization:**
- Minimize splash screen logic
- Lazy load non-critical modules
- Preload critical data only
- Defer analytics and tracking initialization

**Lazy Loading:**
```typescript
// Lazy load statistics screen
const StatisticsScreen = React.lazy(() =>
  import('./features/statistics/screens/StatisticsScreen')
);

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <StatisticsScreen />
</Suspense>
```

---

## 12. ACCESSIBILITY

### 12.1 Screen Reader Support

**VoiceOver/TalkBack Compatibility:**
- All interactive elements have accessibility labels
- Proper heading hierarchy
- Meaningful button labels
- Announce dynamic content changes

**Implementation:**
```typescript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Complete Morning Run habit"
  accessibilityHint="Swipe right to mark as complete, or tap to open details"
  accessibilityRole="button"
  onPress={onPress}
>
  <HabitCard habit={habit} />
</TouchableOpacity>
```

### 12.2 Dynamic Type Support

**Text Scaling:**
- Support iOS Dynamic Type
- Use relative font sizes
- Test with largest accessibility sizes
- Maintain layout integrity at all sizes

**Implementation:**
```typescript
import { useAccessibilityInfo } from 'react-native';

const { getScaleFactor } = useAccessibilityInfo();

const styles = StyleSheet.create({
  text: {
    fontSize: 16 * scaleFactor, // Scales with user setting
  }
});
```

### 12.3 Color Contrast

**WCAG Compliance:**
- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text
- Test all color combinations
- Provide high contrast mode option

**Contrast Validation:**
- Primary text on background: 15:1 (passes AAA)
- Secondary text on background: 7:1 (passes AA)
- Button text on primary color: 4.8:1 (passes AA)

### 12.4 Gesture Alternatives

**Alternative Input Methods:**
- All swipe gestures have button alternatives
- Voice Control support
- Switch Control support
- Keyboard navigation (for iPad with keyboard)

**Example:**
```typescript
// Swipe to complete
<PanGestureHandler onGestureEvent={onSwipeRight}>
  <HabitCard habit={habit} />
</PanGestureHandler>

// Alternative: Tap button
<Button
  accessibilityLabel="Mark habit as complete"
  onPress={onComplete}
>
  Complete
</Button>
```

### 12.5 Reduced Motion

**Motion Sensitivity:**
- Respect iOS Reduce Motion setting
- Provide instant transitions when enabled
- Disable decorative animations
- Keep essential feedback animations

**Implementation:**
```typescript
import { AccessibilityInfo } from 'react-native';

const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotionEnabled);
}, []);

// Use in animations
const animationConfig = reduceMotionEnabled
  ? { duration: 0 }
  : { duration: 300, easing: Easing.ease };
```

### 12.6 Focus Management

**Keyboard Navigation:**
- Logical tab order
- Visible focus indicators
- Skip to main content option
- Focus trap in modals

**Focus Indicators:**
```typescript
<TouchableOpacity
  style={[
    styles.button,
    isFocused && styles.buttonFocused
  ]}
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
>
  <Text>Button</Text>
</TouchableOpacity>

const styles = StyleSheet.create({
  buttonFocused: {
    borderWidth: 3,
    borderColor: colors.primary,
  }
});
```

---

## 13. TESTING STRATEGY

### 13.1 Unit Testing

**Framework:** Jest + React Native Testing Library

**Coverage Targets:**
- Utility functions: 90%+
- Business logic: 85%+
- Components: 75%+

**Example Tests:**
```typescript
// Test habit completion logic
describe('HabitRepository', () => {
  it('should mark habit as complete', async () => {
    const habit = await habitRepository.createHabit({
      name: 'Test Habit',
      frequency: 'daily'
    });
    
    await habitRepository.completeHabit(habit.id, new Date());
    
    const completions = await habitRepository.getCompletions(habit.id);
    expect(completions).toHaveLength(1);
    expect(completions[0].habitId).toBe(habit.id);
  });
});

// Test component rendering
describe('HabitCard', () => {
  it('should render habit name and icon', () => {
    const habit = {
      id: '1',
      name: 'Morning Run',
      icon: 'run',
      color: '#6366F1'
    };
    
    const { getByText } = render(<HabitCard habit={habit} />);
    expect(getByText('Morning Run')).toBeTruthy();
  });
});
```

### 13.2 Integration Testing

**Test Scenarios:**
- Complete user flows (create habit → complete → view stats)
- Data persistence across app restarts
- Navigation flows
- IAP flows (with mock)

### 13.3 E2E Testing

**Framework:** Detox

**Critical Flows:**
1. Onboarding flow
2. Create and complete habit
3. View statistics
4. Edit habit settings
5. Backup and restore
6. IAP purchase flow

**Example E2E Test:**
```typescript
describe('Habit Creation Flow', () => {
  it('should create a new habit', async () => {
    await device.launchApp();
    
    // Complete onboarding
    await element(by.id('onboarding-get-started')).tap();
    await element(by.id('onboarding-skip')).tap();
    
    // Create habit
    await element(by.id('fab-create-habit')).tap();
    await element(by.id('habit-name-input')).typeText('Morning Meditation');
    await element(by.id('create-habit-button')).tap();
    
    // Verify habit appears
    await expect(element(by.text('Morning Meditation'))).toBeVisible();
  });
});
```

### 13.4 Accessibility Testing

**Tools:**
- React Native Accessibility Inspector
- iOS Accessibility Inspector
- Manual VoiceOver testing

**Test Cases:**
- All interactive elements are accessible
- Proper reading order
- Meaningful labels and hints
- Focus management in modals

### 13.5 Performance Testing

**Metrics:**
- App launch time: < 2 seconds
- Screen transition time: < 400ms
- Animation frame rate: 60fps
- Memory usage: < 100MB typical

**Tools:**
- React Native Performance Monitor
- Xcode Instruments
- Flipper profiler

### 13.6 Visual Regression Testing

**Framework:** Storybook + Chromatic (optional)

**Coverage:**
- All component states
- Light and dark themes
- Different screen sizes
- Animation states

---

## 14. ERROR HANDLING & LOGGING

### 14.1 Error Boundaries

**React Error Boundaries:**
```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error
    logError(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorScreen onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
```

### 14.2 Error States

**User-Facing Errors:**
- Network errors (future)
- Database errors: "Failed to save data"
- IAP errors: "Purchase could not be completed"
- Validation errors: "Please enter a valid habit name"

**Error UI:**
- Inline errors (form validation)
- Toast notifications (temporary errors)
- Error screens (critical errors)
- Retry mechanisms

### 14.3 Logging

**Development Logging:**
- Console logs for debugging
- Performance markers
- Animation frame drops

**Production Logging:**
- Error logs only
- Performance metrics
- User actions (anonymous)

**Implementation:**
```typescript
const logger = {
  debug: (message, data) => {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to analytics service (future)
  },
  
  performance: (metric, value) => {
    if (__DEV__) {
      console.log(`[PERF] ${metric}: ${value}ms`);
    }
  }
};
```

### 14.4 Crash Reporting

**Future Integration:**
- Sentry or similar crash reporting service
- Automatic error reporting
- User feedback collection
- Version tracking

---

## 15. SECURITY & PRIVACY

### 15.1 Data Security

**Local Data Protection:**
- iOS Keychain for sensitive settings
- Encrypted Realm database option
- Secure file storage
- No plain text passwords (future auth)

**Implementation:**
```typescript
import * as Keychain from 'react-native-keychain';

// Store premium status
await Keychain.setGenericPassword('premium', 'true', {
  service: 'com.ripple.premium'
});

// Retrieve
const credentials = await Keychain.getGenericPassword({
  service: 'com.ripple.premium'
});
```

### 15.2 Privacy Policy

**Data Collection:**
- No personal data collected (offline app)
- No analytics in initial version
- No third-party SDKs (except IAP)
- All data stays on device

**Future Cloud Sync:**
- End-to-end encryption
- User consent required
- Data deletion on request
- GDPR compliant

### 15.3 App Permissions

**Required Permissions:**
- Notifications: For habit reminders
- iCloud Drive: For backup/restore (optional)

**Permission Handling:**
- Request at appropriate time (not on launch)
- Explain why permission is needed
- Handle denied permissions gracefully
- Provide alternative workflows

---

## 16. DEPLOYMENT & DISTRIBUTION

### 16.1 App Store Configuration

**App Information:**
- Name: Ripple
- Subtitle: Build Better Habits
- Category: Health & Fitness (Primary), Productivity (Secondary)
- Age Rating: 4+
- Price: Free (with IAP)

**App Store Description:**
```
Build better habits with Ripple - the beautiful, gesture-driven habit tracker that makes tracking your progress effortless and enjoyable.

FEATURES:
• Beautiful, intuitive interface with smooth animations
• Gesture-based interactions for quick habit completion
• Comprehensive statistics and insights
• Customizable habits with flexible scheduling
• Streak tracking with milestone celebrations
• Dark mode and theme customization
• Completely offline - your data stays on your device
• iOS widgets for your home screen

PREMIUM FEATURES:
• Unlimited habits (free version limited to 5)
• Advanced analytics and insights
• Custom themes and colors
• Priority support
• All future features

Every habit creates ripples in your life. Start building better habits today with Ripple.
```

**Screenshots:**
1. Today screen with completed habits
2. Statistics screen with charts
3. Habit detail screen
4. Create habit modal
5. Dark mode showcase
6. Widget showcase

**Preview Video:**
- 30-second app preview
- Shows key interactions
- Highlight animations
- Demonstrate gestures

### 16.2 Version Management

**Semantic Versioning:**
- Major: Breaking changes (2.0.0)
- Minor: New features (1.1.0)
- Patch: Bug fixes (1.0.1)

**Release Cycle:**
- Major releases: Every 6-12 months
- Minor releases: Every 1-2 months
- Patch releases: As needed

**Version 1.0.0 Scope:**
- All core features described in this SDD
- No cloud sync
- No AI features
- iOS only

### 16.3 Beta Testing

**TestFlight Distribution:**
- Internal testing: 2 weeks
- External testing: 4 weeks
- Collect feedback and analytics
- Iterate based on feedback

**Beta Testing Focus:**
- Onboarding experience
- Gesture interactions
- Performance on various devices
- IAP flow
- Bug reports

### 16.4 App Store Review Preparation

**Review Guidelines Compliance:**
- No template UI (custom design)
- All features functional
- IAP properly implemented
- Privacy policy accessible
- Follows Human Interface Guidelines

**Review Notes:**
- IAP testing credentials (if needed)
- Feature explanation
- Any unusual permissions

---

## 17. POST-LAUNCH ROADMAP

### 17.1 Version 1.1 (3 months post-launch)

**Features:**
- iPad support with adaptive layout
- Additional themes and color schemes
- Habit templates for quick setup
- Social sharing for achievements
- Import habits from CSV

### 17.2 Version 1.2 (6 months post-launch)

**Features:**
- Apple Watch companion app
- Siri shortcuts integration
- Habit correlations and insights
- Custom habit icons upload
- Advanced filtering and search

### 17.3 Version 2.0 (12 months post-launch)

**Features:**
- Cloud sync with end-to-end encryption
- Multi-device support
- Habit sharing with friends/family
- AI-powered habit suggestions
- Voice input for habit completion
- Habit challenges and streaks competitions

### 17.4 Continuous Improvements

**Ongoing:**
- Performance optimizations
- Bug fixes
- New animations
- Seasonal themes
- User-requested features
- Accessibility improvements

---

## 18. TECHNICAL IMPLEMENTATION NOTES

### 18.1 Project Setup

**Initial Setup:**
```bash
# Create React Native project
npx react-native init Ripple --template react-native-template-typescript

# Install core dependencies
npm install react-native-reanimated react-native-gesture-handler react-native-skia
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install zustand @tanstack/react-query
npm install realm date-fns
npm install react-native-haptic-feedback
npm install react-native-vector-icons
npm install victory-native
npm install @shopify/flash-list

# iOS specific
cd ios && pod install
```

**Configuration Files:**

**babel.config.js:**
```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin', // Must be last
  ],
};
```

**metro.config.js:**
```javascript
const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  return {
    ...defaultConfig,
    resolver: {
      ...defaultConfig.resolver,
      assetExts: [
        ...defaultConfig.resolver.assetExts,
        'db',
        'lottie'
      ],
    },
  };
})();
```

### 18.2 Folder Structure Refinement

```
src/
├── app/
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   └── types.ts
│   ├── providers/
│   │   ├── ThemeProvider.tsx
│   │   ├── QueryProvider.tsx
│   │   └── index.tsx
│   └── App.tsx
├── features/
│   ├── habits/
│   │   ├── components/
│   │   │   ├── HabitCard.tsx
│   │   │   ├── HabitForm.tsx
│   │   │   └── index.ts
│   │   ├── screens/
│   │   │   ├── TodayScreen.tsx
│   │   │   ├── HabitsListScreen.tsx
│   │   │   ├── HabitDetailScreen.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useHabits.ts
│   │   │   ├── useCompleteHabit.ts
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   └── habitStore.ts
│   │   └── types.ts
│   ├── statistics/
│   ├── settings/
│   └── onboarding/
├── shared/
│   ├── components/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   └── index.ts
│   ├── animations/
│   │   ├── springConfigs.ts
│   │   ├── timingConfigs.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   ├── useHaptic.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── dateUtils.ts
│   │   ├── validationUtils.ts
│   │   └── index.ts
│   └── types/
│       └── index.ts
├── database/
│   ├── models/
│   │   ├── Habit.ts
│   │   ├── HabitCompletion.ts
│   │   └── index.ts
│   ├── repositories/
│   │   ├── HabitRepository.ts
│   │   └── index.ts
│   └── realm.ts
└── assets/
    ├── images/
    ├── animations/
    │   ├── splash.json
    │   └── celebration.json
    └── fonts/
        └── Poppins/
```

### 18.3 Key Implementation Files

**ThemeProvider.tsx:**
```typescript
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'auto'>('auto');
  
  const theme = useMemo(() => {
    const isDark = themePreference === 'auto' 
      ? colorScheme === 'dark'
      : themePreference === 'dark';
    
    return isDark ? darkTheme : lightTheme;
  }, [colorScheme, themePreference]);
  
  return (
    <ThemeContext.Provider value={{ theme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

**HapticFeedback Hook:**
```typescript
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export const useHaptic = () => {
  const trigger = useCallback((type: HapticFeedbackTypes) => {
    ReactNativeHapticFeedback.trigger(type, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  }, []);
  
  return {
    light: () => trigger('impactLight'),
    medium: () => trigger('impactMedium'),
    heavy: () => trigger('impactHeavy'),
    success: () => trigger('notificationSuccess'),
    warning: () => trigger('notificationWarning'),
    error: () => trigger('notificationError'),
    selection: () => trigger('selection'),
  };
};
```

### 18.4 iOS Configuration

**Info.plist Additions:**
```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>

<key>NSUserNotificationsUsageDescription</key>
<string>We need your permission to send you reminders for your habits</string>

<key>ITSAppUsesNonExemptEncryption</key>
<false/>
```

**Capabilities:**
- Push Notifications
- In-App Purchase
- iCloud (for backup)
- Background Modes (for notifications)

### 18.5 Build Configuration

**Release Build:**
```bash
# iOS Release Build
cd ios
xcodebuild -workspace Ripple.xcworkspace \
  -scheme Ripple \
  -configuration Release \
  -archivePath build/Ripple.xcarchive \
  archive

# Export IPA
xcodebuild -exportArchive \
  -archivePath build/Ripple.xcarchive \
  -exportPath build \
  -exportOptionsPlist exportOptions.plist
```

**Fastlane Configuration:**
```ruby
lane :beta do
  increment_build_number
  build_app(scheme: "Ripple")
  upload_to_testflight
end

lane :release do
  increment_build_number
  build_app(scheme: "Ripple")
  upload_to_app_store
end
```

---

## 19. DESIGN ASSETS & RESOURCES

### 19.1 Icon Sources

**Vector Icons:**
- Ionicons: https://ionic.io/ionicons
- Feather Icons: https://feathericons.com
- Implementation: react-native-vector-icons

**Custom Icons:**
- Habit category icons: Design in Figma, export as SVG
- App icon: Design in Figma, export at all required sizes

### 19.2 Image Resources

**Illustration Sources:**
- Undraw: https://undraw.co (free, customizable illustrations)
- Pixabay: https://pixabay.com (free stock photos and vectors)
- Unsplash: https://unsplash.com (high-quality photos)

**Example URLs:**
```javascript
const illustrations = {
  onboarding: {
    welcome: 'https://pixabay.com/vectors/meditation-relax-person-yoga-8234567/',
    gestures: 'https://pixabay.com/vectors/hand-gesture-swipe-touch-8234568/',
    themes: 'https://pixabay.com/vectors/palette-colors-paint-art-8234569/',
  },
  empty: {
    noHabits: 'https://pixabay.com/vectors/rocket-launch-startup-space-8234570/',
    allDone: 'https://pixabay.com/vectors/relaxation-hammock-beach-8234571/',
    noResults: 'https://pixabay.com/vectors/search-magnifier-find-look-8234572/',
  }
};
```

### 19.3 Animation Assets

**Lottie Files:**
- LottieFiles: https://lottiefiles.com
- Animations for:
  - Splash screen logo animation
  - Celebration animations
  - Loading spinners
  - Empty state animations

**Example Lottie Usage:**
```typescript
import LottieView from 'lottie-react-native';

<LottieView
  source={require('./assets/animations/celebration.json')}
  autoPlay
  loop={false}
  style={{ width: 200, height: 200 }}
  onAnimationFinish={onComplete}
/>
```

### 19.4 Font Licensing

**SF Pro (iOS System Font):**
- No licensing required for iOS apps
- Built into React Native

**Poppins (Alternative):**
- Google Fonts
- Open Font License
- Free for commercial use
- Download: https://fonts.google.com/specimen/Poppins

---

## 20. CONCLUSION

This Software Design Document provides a comprehensive blueprint for **Ripple**, a premium habit tracking application for iOS. The app combines beautiful, fluid animations with gesture-based interactions to create an engaging user experience that makes habit tracking enjoyable.

### Key Highlights:

**Technical Excellence:**
- Built with React Native for production-ready performance
- Advanced animations using react-native-reanimated and react-native-skia
- Completely offline-first architecture with Realm database
- Optimized for 60fps animations and smooth interactions

**User Experience:**
- Gesture-oriented interactions inspired by Facebook and Tinkoff apps
- Comprehensive onboarding with interactive tutorials
- Beautiful design system with light and dark themes
- Satisfying feedback through animations and haptics

**Monetization:**
- Free tier with 5 habits
- Premium one-time purchase ($9.99)
- Premium+ annual subscription ($19.99/year)
- Clear value proposition for upgrades

**Scalability:**
- Architecture prepared for future cloud sync
- IAP system ready for additional tiers
- Feature flags for gradual rollout
- Performance optimized for growth

The document covers every aspect of the application from splash screen to deployment, providing detailed specifications for animations, interactions, and visual design. All features are implementable with React Native and JavaScript tools, making this a production-ready specification.

**Next Steps:**
1. Set up development environment
2. Implement core database models and repositories
3. Build reusable component library
4. Implement navigation structure
5. Develop feature modules iteratively
6. Integrate animations and gestures
7. Implement IAP
8. Thorough testing across devices
9. Beta testing via TestFlight
10. App Store submission

The roadmap extends beyond version 1.0, planning for future enhancements including iPad support, Apple Watch companion app, and cloud sync with end-to-end encryption.

---

**Document Version:** 1.0
**Last Updated:** October 2025
**Author:** Product & Engineering Team
**Status:** Final - Ready for Implementation