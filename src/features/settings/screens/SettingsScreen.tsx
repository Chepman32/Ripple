import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
} from 'react-native';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useHaptic } from '../../../shared/hooks/useHaptic';
import { spacing, typography } from '../../../shared/constants';
import {
  settingsRepository,
  habitRepository,
} from '../../../database/repositories';
import { AppSettings } from '../../../shared/types';

export const SettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const haptic = useHaptic();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [habitCount, setHabitCount] = useState(0);

  useEffect(() => {
    loadSettings();
    loadHabitCount();
  }, []);

  const loadSettings = async () => {
    const appSettings = await settingsRepository.getSettings();
    setSettings(appSettings);
  };

  const loadHabitCount = async () => {
    const habits = await habitRepository.getAllHabits();
    setHabitCount(habits.length);
  };

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    haptic.light();
    await settingsRepository.updateSettings({ [key]: value });
    await loadSettings();
  };

  const handleExportData = async () => {
    haptic.light();
    try {
      const habits = await habitRepository.getAllHabits();
      const data = {
        habits,
        exportDate: new Date().toISOString(),
        version: '1.0',
      };

      const jsonString = JSON.stringify(data, null, 2);

      await Share.share({
        message: jsonString,
        title: 'Ripple Habits Export',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleClearData = () => {
    haptic.warning();
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your habits and data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            const habits = await habitRepository.getAllHabits();
            for (const habit of habits) {
              await habitRepository.deleteHabit(habit.id);
            }
            await loadHabitCount();
            haptic.success();
            Alert.alert('Success', 'All data has been cleared');
          },
        },
      ],
    );
  };

  const handleResetOnboarding = async () => {
    haptic.light();
    await updateSetting('onboardingCompleted', false);
    Alert.alert(
      'Onboarding Reset',
      'Please restart the app to see the onboarding again.',
      [{ text: 'OK' }],
    );
  };

  if (!settings) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.textSecondary }]}>
          Loading...
        </Text>
      </View>
    );
  }

  const SettingItem = ({
    title,
    value,
    onPress,
    showChevron = true,
  }: {
    title: string;
    value?: string;
    onPress?: () => void;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      {value && (
        <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
          {value}
        </Text>
      )}
      {showChevron && onPress && (
        <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
      )}
    </TouchableOpacity>
  );

  const SettingToggle = ({
    title,
    value,
    onValueChange,
  }: {
    title: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View
      style={[
        styles.settingItem,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Settings
        </Text>
      </View>

      <ScrollView>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ACCOUNT
          </Text>
          <View
            style={[
              styles.statsCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Habits
              </Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {habitCount}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Premium Status
              </Text>
              <Text style={[styles.statValue, { color: colors.textSecondary }]}>
                {settings.premiumUnlocked ? 'Premium' : 'Free'}
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            PREFERENCES
          </Text>
          <SettingItem
            title="Theme"
            value={
              settings.theme === 'auto'
                ? 'Auto'
                : settings.theme === 'dark'
                ? 'Dark'
                : 'Light'
            }
            onPress={() => {
              const themes: Array<'light' | 'dark' | 'auto'> = [
                'light',
                'dark',
                'auto',
              ];
              const currentIndex = themes.indexOf(settings.theme);
              const nextTheme = themes[(currentIndex + 1) % themes.length];
              updateSetting('theme', nextTheme);
            }}
          />
          <SettingToggle
            title="Notifications"
            value={settings.notificationsEnabled}
            onValueChange={value =>
              updateSetting('notificationsEnabled', value)
            }
          />
          <SettingToggle
            title="Haptic Feedback"
            value={settings.hapticFeedbackEnabled}
            onValueChange={value =>
              updateSetting('hapticFeedbackEnabled', value)
            }
          />
          <SettingToggle
            title="Animations"
            value={settings.animationsEnabled}
            onValueChange={value => updateSetting('animationsEnabled', value)}
          />
          <SettingItem
            title="First Day of Week"
            value={settings.firstDayOfWeek === 0 ? 'Sunday' : 'Monday'}
            onPress={() => {
              updateSetting(
                'firstDayOfWeek',
                settings.firstDayOfWeek === 0 ? 1 : 0,
              );
            }}
          />
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            DATA
          </Text>
          <SettingItem title="Export Data" onPress={handleExportData} />
          <SettingItem
            title="Last Backup"
            value={
              settings.lastBackupDate
                ? new Date(settings.lastBackupDate).toLocaleDateString()
                : 'Never'
            }
            showChevron={false}
          />
          <SettingItem title="Clear All Data" onPress={handleClearData} />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ABOUT
          </Text>
          <SettingItem title="Version" value="1.0.0" showChevron={false} />
          <SettingItem
            title="Reset Onboarding"
            onPress={handleResetOnboarding}
          />
          <SettingItem
            title="Share App"
            onPress={async () => {
              haptic.light();
              await Share.share({
                message: 'Check out Ripple - Build better habits!',
              });
            }}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Made with ❤️ for better habits
          </Text>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            © 2025 Ripple
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
  },
  loading: {
    ...typography.body,
    textAlign: 'center',
    marginTop: 100,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  statsCard: {
    marginHorizontal: spacing.xl,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statLabel: {
    ...typography.body,
  },
  statValue: {
    ...typography.body,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  settingTitle: {
    ...typography.body,
    flex: 1,
  },
  settingValue: {
    ...typography.body,
    marginRight: spacing.sm,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    gap: spacing.sm,
  },
  footerText: {
    ...typography.caption,
  },
});
