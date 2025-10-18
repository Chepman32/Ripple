import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../../shared/hooks/useTheme';
import { spacing, typography } from '../../../shared/constants';

export const SettingsScreen: React.FC = () => {
  const { colors } = useTheme();

  const SettingItem = ({ title, value }: { title: string; value?: string }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      {value && (
        <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
          {value}
        </Text>
      )}
      <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Settings
        </Text>
      </View>

      <ScrollView>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            PREFERENCES
          </Text>
          <SettingItem title="Appearance" value="Auto" />
          <SettingItem title="Notifications" value="Enabled" />
          <SettingItem title="Haptic Feedback" value="Enabled" />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            DATA
          </Text>
          <SettingItem title="Backup Data" />
          <SettingItem title="Export Data" />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ABOUT
          </Text>
          <SettingItem title="Version" value="1.0.0" />
          <SettingItem title="Privacy Policy" />
          <SettingItem title="Terms of Service" />
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
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
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
});
