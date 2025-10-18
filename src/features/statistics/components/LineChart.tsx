import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
  VictoryLine,
  VictoryChart,
  VictoryAxis,
} from 'victory-native';
import { useTheme } from '../../../shared/hooks/useTheme';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface LineChartProps {
  data: Array<{ x: string; y: number }>;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, color }) => {
  const { colors } = useTheme();

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, styles.emptyState]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No data available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VictoryChart
        width={SCREEN_WIDTH - 80}
        height={200}
        padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
      >
        <VictoryAxis
          style={{
            axis: { stroke: colors.border },
            tickLabels: { fill: colors.textSecondary, fontSize: 10 },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: colors.border },
            tickLabels: { fill: colors.textSecondary, fontSize: 10 },
            grid: { stroke: colors.border, strokeDasharray: '4,4' },
          }}
        />
        <VictoryLine
          data={data}
          style={{
            data: { stroke: color || colors.primary, strokeWidth: 3 },
          }}
          animate={{
            duration: 1000,
            onLoad: { duration: 500 },
          }}
        />
      </VictoryChart>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  emptyState: {
    height: 200,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
