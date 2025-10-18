import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
} from 'victory-native';
import { useTheme } from '../../../shared/hooks/useTheme';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface BarChartData {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarChartData[];
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
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

  // Transform data for Victory
  const chartData = data.map(item => ({
    x: item.label,
    y: item.value,
    fill: item.color,
  }));

  return (
    <View style={styles.container}>
      <VictoryChart
        width={SCREEN_WIDTH - 80}
        height={200}
        domainPadding={{ x: 20 }}
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
        <VictoryBar
          data={chartData}
          style={{
            data: {
              fill: ({ datum }) => datum.fill,
            },
          }}
          animate={{
            duration: 1000,
            onLoad: { duration: 500 },
          }}
          cornerRadius={{ top: 4 }}
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
