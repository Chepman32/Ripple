import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useHaptic } from '../../../shared/hooks/useHaptic';
import { spacing, typography } from '../../../shared/constants';
import { habitRepository, categoryRepository } from '../../../database/repositories';
import { Habit, Category } from '../../../shared/types';

export const HabitsListScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const haptic = useHaptic();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [filteredHabits, setFilteredHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterHabits();
  }, [searchQuery, selectedCategory, habits]);

  const loadData = async () => {
    const allHabits = await habitRepository.getAllHabits();
    const allCategories = await categoryRepository.getAllCategories();
    setHabits(allHabits);
    setCategories(allCategories);
  };

  const filterHabits = () => {
    let filtered = [...habits];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(habit =>
        habit.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(habit => habit.categoryId === selectedCategory);
    }

    setFilteredHabits(filtered);
  };

  const handleDelete = (habitId: string, habitName: string) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habitName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await habitRepository.deleteHabit(habitId);
            await loadData();
          },
        },
      ],
    );
  };

  const handleArchive = async (habitId: string) => {
    await habitRepository.archiveHabit(habitId);
    await loadData();
  };

  const handleCategorySelect = (categoryId: string | null) => {
    haptic.light();
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleHabitPress = (habitId: string) => {
    navigation.navigate('HabitDetail' as never, { habitId } as never);
  };

  const renderHabitItem = ({ item }: { item: Habit }) => (
    <HabitListItem
      habit={item}
      onDelete={handleDelete}
      onArchive={handleArchive}
      onPress={handleHabitPress}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          All Habits
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {filteredHabits.length} of {habits.length}{' '}
          {habits.length === 1 ? 'habit' : 'habits'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.searchIcon, { color: colors.textSecondary }]}>
            🔍
          </Text>
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search habits..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Text style={[styles.clearText, { color: colors.textSecondary }]}>
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          <CategoryChip
            label="All"
            selected={selectedCategory === null}
            onPress={() => handleCategorySelect(null)}
          />
          {categories.map(category => (
            <CategoryChip
              key={category.id}
              label={category.name}
              color={category.color}
              icon={category.icon}
              selected={selectedCategory === category.id}
              onPress={() => handleCategorySelect(category.id)}
            />
          ))}
        </ScrollView>
      )}

      <FlatList
        data={filteredHabits}
        renderItem={renderHabitItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {searchQuery || selectedCategory
                ? 'No Matching Habits'
                : 'No Habits Yet'}
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              {searchQuery || selectedCategory
                ? 'Try a different search or filter'
                : 'Create your first habit to get started'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

interface CategoryChipProps {
  label: string;
  color?: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  color,
  icon,
  selected,
  onPress,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 15 }, () => {
      scale.value = withSpring(1);
    });
    runOnJS(onPress)();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.categoryChip,
          {
            backgroundColor: selected ? (color || colors.primary) : colors.surface,
            borderColor: selected ? (color || colors.primary) : colors.border,
          },
          animatedStyle,
        ]}
      >
        {icon && <Text style={styles.chipIcon}>{icon}</Text>}
        <Text
          style={[
            styles.chipLabel,
            { color: selected ? '#FFFFFF' : colors.textPrimary },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

interface HabitListItemProps {
  habit: Habit;
  onDelete: (id: string, name: string) => void;
  onArchive: (id: string) => void;
  onPress: (id: string) => void;
}

const HabitListItem: React.FC<HabitListItemProps> = ({
  habit,
  onDelete,
  onArchive,
  onPress,
}) => {
  const { colors } = useTheme();
  const haptic = useHaptic();
  const translateX = useSharedValue(0);
  const [actionsVisible, setActionsVisible] = useState(false);

  const gesture = Gesture.Pan()
    .onUpdate(event => {
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -150);
      }
    })
    .onEnd(event => {
      if (event.translationX < -75) {
        translateX.value = withTiming(-150);
        runOnJS(setActionsVisible)(true);
        runOnJS(haptic.light)();
      } else {
        translateX.value = withTiming(0);
        runOnJS(setActionsVisible)(false);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleDeletePress = () => {
    translateX.value = withTiming(0);
    setActionsVisible(false);
    onDelete(habit.id, habit.name);
  };

  const handleArchivePress = () => {
    translateX.value = withTiming(0);
    setActionsVisible(false);
    haptic.success();
    onArchive(habit.id);
  };

  return (
    <View style={styles.itemContainer}>
      {/* Action Buttons (Behind) */}
      {actionsVisible && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.warning }]}
            onPress={handleArchivePress}
          >
            <Text style={styles.actionText}>Archive</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={handleDeletePress}
          >
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Habit Item */}
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.habitItem,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
            cardStyle,
          ]}
        >
          <TouchableOpacity
            style={styles.habitItemContent}
            onPress={() => onPress(habit.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.habitIcon,
                { backgroundColor: habit.color + '26' },
              ]}
            >
              <Text style={styles.habitIconText}>{habit.icon}</Text>
            </View>
            <View style={styles.habitInfo}>
              <Text style={[styles.habitName, { color: colors.textPrimary }]}>
                {habit.name}
              </Text>
              <Text
                style={[styles.habitFrequency, { color: colors.textSecondary }]}
              >
                {habit.frequency}
                {habit.targetValue && ` • ${habit.targetValue} ${habit.unit}`}
              </Text>
            </View>
            <Text style={[styles.chevron, { color: colors.textTertiary }]}>
              ›
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
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
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    height: '100%',
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearText: {
    fontSize: 18,
  },
  categoryScroll: {
    maxHeight: 50,
    marginBottom: spacing.md,
  },
  categoryScrollContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    borderWidth: 2,
    gap: spacing.xs,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  listContent: {
    flexGrow: 1,
  },
  itemContainer: {
    position: 'relative',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 75,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    ...typography.body,
    fontWeight: '600',
  },
  habitItem: {
    borderBottomWidth: 1,
  },
  habitItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  habitIconText: {
    fontSize: 20,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitFrequency: {
    ...typography.caption,
  },
  chevron: {
    fontSize: 32,
    fontWeight: '300',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['6xl'],
  },
  emptyTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
  },
});
