export interface HabitIconConfig {
  name: string;
  type: 'Ionicons' | 'Feather' | 'MaterialCommunityIcons';
  label: string;
}

export const HABIT_ICONS: HabitIconConfig[] = [
  { name: 'barbell', type: 'Ionicons', label: 'Exercise' },
  { name: 'book', type: 'Ionicons', label: 'Reading' },
  { name: 'walk', type: 'Ionicons', label: 'Running' },
  { name: 'body', type: 'Ionicons', label: 'Yoga' },
  { name: 'water', type: 'Ionicons', label: 'Hydration' },
  { name: 'target', type: 'Feather', label: 'Goals' },
  { name: 'edit-3', type: 'Feather', label: 'Writing' },
  { name: 'color-palette', type: 'Ionicons', label: 'Art' },
  { name: 'musical-notes', type: 'Ionicons', label: 'Music' },
  { name: 'fast-food', type: 'Ionicons', label: 'Nutrition' },
  { name: 'moon', type: 'Ionicons', label: 'Sleep' },
  { name: 'school', type: 'Ionicons', label: 'Learning' },
  { name: 'briefcase', type: 'Feather', label: 'Work' },
  { name: 'home', type: 'Ionicons', label: 'Home' },
  { name: 'leaf', type: 'Ionicons', label: 'Nature' },
  { name: 'star', type: 'Ionicons', label: 'Favorite' },
  { name: 'heart', type: 'Ionicons', label: 'Health' },
  { name: 'trending-up', type: 'Feather', label: 'Growth' },
  { name: 'clock', type: 'Feather', label: 'Time' },
  { name: 'cafe', type: 'Ionicons', label: 'Coffee' },
];

export const getDefaultIcon = (): HabitIconConfig => HABIT_ICONS[0];

export const findIconConfig = (iconName: string): HabitIconConfig | undefined => {
  return HABIT_ICONS.find(icon => icon.name === iconName);
};
