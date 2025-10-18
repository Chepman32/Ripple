import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  VictoryLine,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
} from 'victory-native';
import { useTheme } from '../../../shared/hooks/useTheme';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface LineChartProps {
  data: Array<{ x: string; y: number }>;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, color }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <VictoryChart
        width={SCREEN_WIDTH - 40}
        height={200}
        theme={VictoryTheme.material}
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
});
