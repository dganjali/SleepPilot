import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface ChartData {
  x: number;
  y: number;
  date: string;
}

interface WebCompatibleChartProps {
  data: ChartData[];
  title: string;
  yAxisLabel: string;
  color: string;
}

export const WebCompatibleChart: React.FC<WebCompatibleChartProps> = ({ 
  data, 
  title, 
  yAxisLabel, 
  color 
}) => {
  if (Platform.OS === 'web') {
    // Simple web chart using HTML/CSS
    const maxValue = Math.max(...data.map(d => d.y));
    const minValue = Math.min(...data.map(d => d.y));
    
    return (
      <View style={styles.webChartContainer}>
        <Text style={styles.webChartTitle}>{title}</Text>
        <View style={styles.webChartContent}>
          {data.map((item, index) => (
            <View key={index} style={styles.webChartBar}>
              <View 
                style={[
                  styles.webChartBarFill, 
                  { 
                    backgroundColor: color,
                    height: `${((item.y - minValue) / (maxValue - minValue)) * 100}%`
                  }
                ]} 
              />
              <Text style={styles.webChartLabel}>{item.date}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.webChartYAxis}>{yAxisLabel}</Text>
      </View>
    );
  }
  
  // For native platforms, use Victory Native
  try {
    const { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme } = require('victory-native');
    
    return (
      <View style={styles.chartContainer}>
        <VictoryChart
          width={300}
          height={200}
          theme={VictoryTheme.material}
          padding={{ left: 50, top: 20, right: 20, bottom: 50 }}
        >
          <VictoryLine
            data={data}
            style={{
              data: {
                stroke: color,
                strokeWidth: 3,
              },
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `${t}`}
            style={{
              axis: { stroke: '#64748b' },
              tickLabels: { fill: '#64748b', fontSize: 10 },
              grid: { stroke: '#334155', strokeDasharray: '5,5' },
            }}
          />
          <VictoryAxis
            tickFormat={(t) => data[t - 1]?.date || ''}
            style={{
              axis: { stroke: '#64748b' },
              tickLabels: { fill: '#64748b', fontSize: 10 },
            }}
          />
        </VictoryChart>
      </View>
    );
  } catch (error) {
    // Fallback if Victory Native fails
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>Chart not available</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  webChartContainer: {
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  webChartTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  webChartContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    justifyContent: 'space-around',
  },
  webChartBar: {
    alignItems: 'center',
    flex: 1,
  },
  webChartBarFill: {
    width: 20,
    minHeight: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  webChartLabel: {
    color: colors.gray[400],
    fontSize: 10,
    textAlign: 'center',
  },
  webChartYAxis: {
    color: colors.gray[400],
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  chartContainer: {
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  fallbackContainer: {
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  fallbackText: {
    color: colors.gray[400],
    fontSize: 14,
  },
});
