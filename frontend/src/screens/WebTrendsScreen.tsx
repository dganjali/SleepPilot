import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { WebSafeAreaView } from '../components/WebSafeAreaView';
import { colors } from '../constants/colors';

interface ChartData {
  date: string;
  value: number;
  label: string;
}

export const WebTrendsScreen: React.FC = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Smooth entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Mock data for trends
  const sleepScoreData: ChartData[] = [
    { date: 'Mon', value: 85, label: '85' },
    { date: 'Tue', value: 78, label: '78' },
    { date: 'Wed', value: 92, label: '92' },
    { date: 'Thu', value: 88, label: '88' },
    { date: 'Fri', value: 95, label: '95' },
    { date: 'Sat', value: 82, label: '82' },
    { date: 'Sun', value: 89, label: '89' },
  ];

  const sleepDurationData: ChartData[] = [
    { date: 'Mon', value: 7.5, label: '7.5h' },
    { date: 'Tue', value: 6.8, label: '6.8h' },
    { date: 'Wed', value: 8.2, label: '8.2h' },
    { date: 'Thu', value: 7.9, label: '7.9h' },
    { date: 'Fri', value: 8.5, label: '8.5h' },
    { date: 'Sat', value: 7.2, label: '7.2h' },
    { date: 'Sun', value: 8.0, label: '8.0h' },
  ];

  const efficiencyData: ChartData[] = [
    { date: 'Mon', value: 92, label: '92%' },
    { date: 'Tue', value: 87, label: '87%' },
    { date: 'Wed', value: 95, label: '95%' },
    { date: 'Thu', value: 91, label: '91%' },
    { date: 'Fri', value: 96, label: '96%' },
    { date: 'Sat', value: 89, label: '89%' },
    { date: 'Sun', value: 93, label: '93%' },
  ];

  const renderChart = (data: ChartData[], title: string, color: string, unit: string) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));

    return (
      <Animated.View 
        style={[styles.chartCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.chartContainer}>
          {data.map((item, index) => {
            const height = ((item.value - minValue) / (maxValue - minValue)) * 120 + 20;
            return (
              <View key={index} style={styles.chartBar}>
                <Animated.View 
                  style={[
                    styles.chartBarFill, 
                    { 
                      backgroundColor: color,
                      height: height,
                    }
                  ]}
                />
                <Text style={styles.chartLabel}>{item.date}</Text>
                <Text style={styles.chartValue}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </Animated.View>
    );
  };

  return (
    <WebSafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View 
          style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <Text style={styles.headerTitle}>Sleep Trends</Text>
          <Text style={styles.headerSubtitle}>Your weekly sleep performance overview</Text>
        </Animated.View>

        {/* Summary Cards */}
        <Animated.View 
          style={[styles.summarySection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>87</Text>
            <Text style={styles.summaryLabel}>Average Score</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>7.7h</Text>
            <Text style={styles.summaryLabel}>Avg Duration</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>92%</Text>
            <Text style={styles.summaryLabel}>Avg Efficiency</Text>
          </View>
        </Animated.View>

        {/* Charts */}
        {renderChart(sleepScoreData, 'Sleep Score Trend', colors.purple, '')}
        {renderChart(sleepDurationData, 'Sleep Duration', colors.blue, 'h')}
        {renderChart(efficiencyData, 'Sleep Efficiency', colors.purple, '%')}
      </ScrollView>
    </WebSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: colors.text.secondary,
    fontSize: 16,
    textAlign: 'center',
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.muted,
  },
  summaryValue: {
    color: colors.purple,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryLabel: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartCard: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border.muted,
  },
  chartTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 160,
    justifyContent: 'space-around',
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarFill: {
    width: 24,
    minHeight: 4,
    borderRadius: 12,
    marginBottom: 12,
    transition: 'height 0.3s ease',
  },
  chartLabel: {
    color: colors.text.muted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  chartValue: {
    color: colors.text.secondary,
    fontSize: 10,
    textAlign: 'center',
  },
});
