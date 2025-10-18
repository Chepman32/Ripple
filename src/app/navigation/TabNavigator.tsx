import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TodayScreen } from '../../features/habits/screens/TodayScreen';
import { StatisticsScreen } from '../../features/statistics/screens/StatisticsScreen';
import { HabitsListScreen } from '../../features/habits/screens/HabitsListScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
import { useTheme } from '../../shared/hooks/useTheme';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} />,
        }}
      />
      <Tab.Screen
        name="Habits"
        component={HabitsListScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="📋" color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const TabIcon: React.FC<{ icon: string; color: string }> = ({ icon }) => {
  return <Text style={styles.icon}>{icon}</Text>;
};

const styles = StyleSheet.create({
  icon: {
    fontSize: 24,
  },
});
