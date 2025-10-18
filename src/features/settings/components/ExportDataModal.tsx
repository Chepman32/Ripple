import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useHaptic } from '../../../shared/hooks/useHaptic';
import { Button } from '../../../shared/components';
import { spacing, typography } from '../../../shared/constants';
import { habitRepository } from '../../../database/repositories';
import { exportToJSON, exportToCSV } from '../../../shared/utils/dataExport';

interface ExportDataModalProps {
  visible: boolean;
  onClose: () => void;
}

type ExportFormat = 'json' | 'csv';
type DateRange = 'week' | 'month' | 'year' | 'all';

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const haptic = useHaptic();
  const translateY = useSharedValue(1000);

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [selectedRange, setSelectedRange] = useState<DateRange>('all');
  const [includeNotes, setIncludeNotes] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
    } else {
      translateY.value = withSpring(1000);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleExport = async () => {
    try {
      setIsExporting(true);
      haptic.light();

      const habits = await habitRepository.getAllHabits();
      const allCompletions = [];

      for (const habit of habits) {
        const completions = await habitRepository.getCompletions(habit.id);
        allCompletions.push(...completions.map(c => ({ ...c, habitId: habit.id })));
      }

      const data = {
        habits,
        completions: includeNotes ? allCompletions : allCompletions.map(({ note, ...rest }) => rest),
        exportDate: new Date().toISOString(),
        dateRange: selectedRange,
        version: '1.0',
      };

      let exportData: string;
      let filename: string;

      if (selectedFormat === 'json') {
        exportData = exportToJSON(data);
        filename = `ripple-export-${new Date().toISOString().split('T')[0]}.json`;
      } else {
        exportData = exportToCSV(habits, allCompletions);
        filename = `ripple-export-${new Date().toISOString().split('T')[0]}.csv`;
      }

      await Share.share({
        message: exportData,
        title: `Ripple Export (${selectedFormat.toUpperCase()})`,
      });

      haptic.success();
      onClose();
    } catch (error) {
      haptic.error();
      Alert.alert('Export Failed', 'There was an error exporting your data.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.backdrop, { backgroundColor: colors.modalOverlay }]}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.modal,
            { backgroundColor: colors.surface },
            animatedStyle,
          ]}
        >
          <View style={styles.handleBar}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Export Data
            </Text>

            {/* Format Selection */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Export Format
              </Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor:
                        selectedFormat === 'json' ? colors.primary : colors.background,
                      borderColor:
                        selectedFormat === 'json' ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => {
                    haptic.selection();
                    setSelectedFormat('json');
                  }}
                >
                  <Text style={styles.optionIcon}>📄</Text>
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          selectedFormat === 'json' ? '#FFFFFF' : colors.textPrimary,
                      },
                    ]}
                  >
                    JSON
                  </Text>
                  <Text
                    style={[
                      styles.optionSubtext,
                      {
                        color:
                          selectedFormat === 'json'
                            ? 'rgba(255,255,255,0.8)'
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    For backup
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor:
                        selectedFormat === 'csv' ? colors.primary : colors.background,
                      borderColor:
                        selectedFormat === 'csv' ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => {
                    haptic.selection();
                    setSelectedFormat('csv');
                  }}
                >
                  <Text style={styles.optionIcon}>📊</Text>
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          selectedFormat === 'csv' ? '#FFFFFF' : colors.textPrimary,
                      },
                    ]}
                  >
                    CSV
                  </Text>
                  <Text
                    style={[
                      styles.optionSubtext,
                      {
                        color:
                          selectedFormat === 'csv'
                            ? 'rgba(255,255,255,0.8)'
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    For spreadsheets
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Range Selection */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Date Range
              </Text>
              <View style={styles.rangeRow}>
                {(['week', 'month', 'year', 'all'] as DateRange[]).map(range => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.rangeButton,
                      {
                        backgroundColor:
                          selectedRange === range ? colors.primary : colors.background,
                        borderColor:
                          selectedRange === range ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      haptic.selection();
                      setSelectedRange(range);
                    }}
                  >
                    <Text
                      style={[
                        styles.rangeText,
                        {
                          color:
                            selectedRange === range ? '#FFFFFF' : colors.textPrimary,
                        },
                      ]}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Include Notes Toggle */}
            <TouchableOpacity
              style={[
                styles.toggleRow,
                { borderColor: colors.border },
              ]}
              onPress={() => {
                haptic.selection();
                setIncludeNotes(!includeNotes);
              }}
            >
              <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>
                Include Notes
              </Text>
              <View
                style={[
                  styles.toggle,
                  {
                    backgroundColor: includeNotes ? colors.primary : colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      transform: [{ translateX: includeNotes ? 20 : 0 }],
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Button variant="secondary" onPress={onClose} style={styles.button}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onPress={handleExport}
              disabled={isExporting}
              style={styles.button}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing['2xl'],
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  label: {
    ...typography.label,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  optionButton: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  optionText: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  optionSubtext: {
    ...typography.caption,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  rangeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  toggleLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.xl,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
  },
});
