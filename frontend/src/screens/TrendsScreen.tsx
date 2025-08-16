import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Text, Card, SegmentedButtons, Chip, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryBar, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer } from 'victory-native';
import { Ionicons } from '@expo/vector-icons';

import { useSleepStore } from '../store/sleepStore';
import { mockSleepData } from '../services/api';

const { width } = Dimensions.get('window');

const TrendsScreen: React.FC = () => {
  const theme = useTheme();
  const { sleepData } = useSleepStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('sleepScore');

  // Use mock data for now
  const data = mockSleepData;

  const getChartData = () => {
    const periods = {
      week: 7,
      month: 30,
      year: 365,
    };
    
    const days = periods[selectedPeriod as keyof typeof periods];
    const recentData = data.slice(-days);
    
    return recentData.map((item, index) => ({
      x: index + 1,
      y: item[selectedMetric as keyof typeof item] as number,
      label: `${item.date}\n${item[selectedMetric as keyof typeof item]}`,
    }));
  };

  const getMetricInfo = () => {
    switch (selectedMetric) {
      case 'sleepScore':
        return {
          title: 'Sleep Score',
          unit: '',
          color: theme.colors.primary,
          icon: 'bed',
          description: 'Overall sleep quality score (0-100)',
        };
      case 'snoringIntensity':
        return {
          title: 'Snoring Intensity',
          unit: 'dB',
          color: theme.colors.warning,
          icon: 'volume-high',
          description: 'Average snoring volume in decibels',
        };
      case 'apneaRisk':
        return {
          title: 'Apnea Risk',
          unit: '%',
          color: theme.colors.error,
          icon: 'heart-pulse',
          description: 'Probability of sleep apnea',
        };
      case 'fragmentation':
        return {
          title: 'Sleep Fragmentation',
          unit: '/hr',
          color: theme.colors.secondary,
          icon: 'time',
          description: 'Number of sleep disruptions per hour',
        };
      default:
        return {
          title: 'Sleep Score',
          unit: '',
          color: theme.colors.primary,
          icon: 'bed',
          description: 'Overall sleep quality score',
        };
    }
  };

  const getInsights = () => {
    const recentData = data.slice(-7);
    const avgScore = recentData.reduce((sum, item) => sum + item.sleepScore, 0) / recentData.length;
    const prevWeekData = data.slice(-14, -7);
    const prevAvgScore = prevWeekData.reduce((sum, item) => sum + item.sleepScore, 0) / prevWeekData.length;
    
    const improvement = avgScore - prevAvgScore;
    
    return [
      {
        type: 'improvement' as const,
        title: 'Sleep Quality Trend',
        message: improvement > 0 
          ? `Your sleep quality has improved ${Math.abs(improvement).toFixed(1)} points this week!`
          : `Your sleep quality has declined ${Math.abs(improvement).toFixed(1)} points this week.`,
        icon: improvement > 0 ? 'trending-up' : 'trending-down',
        color: improvement > 0 ? theme.colors.success : theme.colors.error,
      },
      {
        type: 'insight' as const,
        title: 'Sleep Pattern Insight',
        message: 'Your best sleep occurs when room temperature is between 18-22°C and noise levels are below 40dB.',
        icon: 'bulb',
        color: theme.colors.info,
      },
      {
        type: 'recommendation' as const,
        title: 'Optimization Tip',
        message: 'Try reducing light exposure 30 minutes before bedtime to improve sleep onset.',
        icon: 'moon',
        color: theme.colors.primary,
      },
    ];
  };

  const metricInfo = getMetricInfo();
  const insights = getInsights();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Sleep Trends & Insights
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Track your sleep patterns and discover insights
          </Text>
        </View>

        {/* Period Selector */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Time Period
            </Text>
            <SegmentedButtons
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
              buttons={[
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
                { value: 'year', label: 'Year' },
              ]}
              style={styles.segmentedButtons}
            />
          </Card.Content>
        </Card>

        {/* Metric Selector */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Sleep Metrics
            </Text>
            <View style={styles.metricButtons}>
              {[
                { value: 'sleepScore', label: 'Sleep Score', icon: 'bed' },
                { value: 'snoringIntensity', label: 'Snoring', icon: 'volume-high' },
                { value: 'apneaRisk', label: 'Apnea Risk', icon: 'heart-pulse' },
                { value: 'fragmentation', label: 'Fragmentation', icon: 'time' },
              ].map((metric) => (
                <Button
                  key={metric.value}
                  mode={selectedMetric === metric.value ? 'contained' : 'outlined'}
                  icon={metric.icon}
                  onPress={() => setSelectedMetric(metric.value)}
                  style={[
                    styles.metricButton,
                    selectedMetric === metric.value && { backgroundColor: metricInfo.color },
                  ]}
                  labelStyle={[
                    styles.metricButtonLabel,
                    selectedMetric === metric.value && { color: theme.colors.onPrimary },
                  ]}
                >
                  {metric.label}
                </Button>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Chart */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.chartHeader}>
              <View style={styles.chartTitleContainer}>
                <Ionicons name={metricInfo.icon as any} size={24} color={metricInfo.color} />
                <Text style={[styles.chartTitle, { color: theme.colors.onSurface }]}>
                  {metricInfo.title} Trend
                </Text>
              </View>
              <Chip mode="outlined" textStyle={{ color: metricInfo.color }}>
                {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
              </Chip>
            </View>
            
            <View style={styles.chartContainer}>
              <VictoryChart
                width={width - 80}
                height={250}
                theme={VictoryTheme.material}
                containerComponent={
                  <VictoryVoronoiContainer
                    labels={({ datum }) => `${datum.y}${metricInfo.unit}`}
                    labelComponent={<VictoryTooltip style={{ fontSize: 12 }} />}
                  />
                }
              >
                <VictoryAxis
                  style={{
                    axis: { stroke: theme.colors.outline },
                    tickLabels: { fill: theme.colors.onSurfaceVariant, fontSize: 10 },
                    grid: { stroke: theme.colors.outline, strokeDasharray: '5,5' },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  style={{
                    axis: { stroke: theme.colors.outline },
                    tickLabels: { fill: theme.colors.onSurfaceVariant, fontSize: 10 },
                    grid: { stroke: theme.colors.outline, strokeDasharray: '5,5' },
                  }}
                />
                <VictoryLine
                  data={getChartData()}
                  style={{
                    data: { stroke: metricInfo.color, strokeWidth: 3 },
                  }}
                  animate={{
                    duration: 1000,
                    onLoad: { duration: 500 },
                  }}
                />
              </VictoryChart>
            </View>
            
            <Text style={[styles.chartDescription, { color: theme.colors.onSurfaceVariant }]}>
              {metricInfo.description}
            </Text>
          </Card.Content>
        </Card>

        {/* AI Insights */}
        <View style={styles.insightsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            AI Insights
          </Text>
          {insights.map((insight, index) => (
            <Card
              key={index}
              style={[styles.insightCard, { backgroundColor: theme.colors.surface }]}
            >
              <Card.Content>
                <View style={styles.insightHeader}>
                  <View style={styles.insightIconContainer}>
                    <Ionicons name={insight.icon as any} size={20} color={insight.color} />
                  </View>
                  <View style={styles.insightContent}>
                    <Text style={[styles.insightTitle, { color: theme.colors.onSurface }]}>
                      {insight.title}
                    </Text>
                    <Text style={[styles.insightMessage, { color: theme.colors.onSurfaceVariant }]}>
                      {insight.message}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Sleep Stages Comparison */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Sleep Stages Comparison
            </Text>
            <View style={styles.stagesContainer}>
              {[
                { stage: 'Deep Sleep', current: 2.1, optimal: 2.0, color: theme.colors.primary },
                { stage: 'REM Sleep', current: 1.8, optimal: 2.0, color: theme.colors.secondary },
                { stage: 'Light Sleep', current: 3.2, optimal: 3.0, color: theme.colors.tertiary },
              ].map((stageData, index) => (
                <View key={index} style={styles.stageItem}>
                  <View style={styles.stageHeader}>
                    <View style={[styles.stageColor, { backgroundColor: stageData.color }]} />
                    <Text style={[styles.stageName, { color: theme.colors.onSurface }]}>
                      {stageData.stage}
                    </Text>
                  </View>
                  <View style={styles.stageValues}>
                    <Text style={[styles.stageValue, { color: theme.colors.onSurface }]}>
                      {stageData.current}h
                    </Text>
                    <Text style={[styles.stageOptimal, { color: theme.colors.onSurfaceVariant }]}>
                      Optimal: {stageData.optimal}h
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  metricButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricButton: {
    width: '48%',
    marginBottom: 8,
  },
  metricButtonLabel: {
    fontSize: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chartDescription: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  insightsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  insightCard: {
    marginBottom: 12,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  insightMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  stagesContainer: {
    marginTop: 8,
  },
  stageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stageColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  stageName: {
    fontSize: 16,
    fontWeight: '500',
  },
  stageValues: {
    alignItems: 'flex-end',
  },
  stageValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stageOptimal: {
    fontSize: 12,
  },
});

export default TrendsScreen;
