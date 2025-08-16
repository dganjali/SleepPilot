import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme, VictoryGroup } from 'victory-native';
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Moon,
  TrendingDown,
  Minus
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function TrendsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('sleep_score');

  const periods = [
    { key: 'week', label: 'Week', icon: Calendar },
    { key: 'month', label: 'Month', icon: BarChart3 },
    { key: 'quarter', label: 'Quarter', icon: TrendingUp },
  ];

  const metrics = [
    { key: 'sleep_score', label: 'Sleep Score', icon: Moon },
    { key: 'duration', label: 'Duration', icon: TrendingUp },
    { key: 'efficiency', label: 'Efficiency', icon: BarChart3 },
    { key: 'deep_sleep', label: 'Deep Sleep', icon: TrendingDown },
  ];

  const trendData = {
    sleep_score: {
      current: 87,
      previous: 82,
      trend: 'up',
      change: '+5',
      percentage: '+6.1%',
    },
    duration: {
      current: '7h 23m',
      previous: '7h 15m',
      trend: 'up',
      change: '+8m',
      percentage: '+1.8%',
    },
    efficiency: {
      current: '94%',
      previous: '91%',
      trend: 'up',
      change: '+3%',
      percentage: '+3.3%',
    },
    deep_sleep: {
      current: '2h 15m',
      previous: '2h 30m',
      trend: 'down',
      change: '-15m',
      percentage: '-10%',
    },
  };

  const weeklyData = [
    { day: 'Mon', score: 85, duration: 7.2, efficiency: 92, deepSleep: 2.1 },
    { day: 'Tue', score: 88, duration: 7.5, efficiency: 94, deepSleep: 2.3 },
    { day: 'Wed', score: 82, duration: 6.8, efficiency: 89, deepSleep: 1.9 },
    { day: 'Thu', score: 90, duration: 7.8, efficiency: 96, deepSleep: 2.4 },
    { day: 'Fri', score: 87, duration: 7.3, efficiency: 93, deepSleep: 2.2 },
    { day: 'Sat', score: 89, duration: 8.1, efficiency: 95, deepSleep: 2.5 },
    { day: 'Sun', score: 87, duration: 7.4, efficiency: 94, deepSleep: 2.1 },
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return '#34C759';
      case 'down': return '#FF3B30';
      default: return '#FF9500';
    }
  };

  const renderPeriodButton = (period) => {
    const Icon = period.icon;
    const isActive = selectedPeriod === period.key;
    
    return (
      <TouchableOpacity
        key={period.key}
        onPress={() => setSelectedPeriod(period.key)}
        style={[
          styles.periodButton,
          isActive && styles.periodButtonActive
        ]}
      >
        <Icon size={20} color={isActive ? '#000000' : '#EBEBF599'} />
        <Text style={[
          styles.periodButtonText,
          isActive && styles.periodButtonTextActive
        ]}>
          {period.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMetricButton = (metric) => {
    const Icon = metric.icon;
    const isActive = selectedMetric === metric.key;
    
    return (
      <TouchableOpacity
        key={metric.key}
        onPress={() => setSelectedMetric(metric.key)}
        style={[
          styles.metricButton,
          isActive && styles.metricButtonActive
        ]}
      >
        <Icon size={20} color={isActive ? '#000000' : '#EBEBF599'} />
        <Text style={[
          styles.metricButtonText,
          isActive && styles.metricButtonTextActive
        ]}>
          {metric.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTrendCard = (metricKey) => {
    const data = trendData[metricKey];
    const TrendIcon = getTrendIcon(data.trend);
    const trendColor = getTrendColor(data.trend);

    return (
      <View key={metricKey} style={styles.trendCard}>
        <View style={styles.trendHeader}>
          <Text style={styles.trendLabel}>{metrics.find(m => m.key === metricKey)?.label}</Text>
          <View style={[styles.trendBadge, { backgroundColor: `${trendColor}20` }]}>
            <TrendIcon size={16} color={trendColor} />
            <Text style={[styles.trendBadgeText, { color: trendColor }]}>
              {data.percentage}
            </Text>
          </View>
        </View>
        
        <View style={styles.trendValues}>
          <Text style={styles.trendCurrent}>{data.current}</Text>
          <View style={styles.trendComparison}>
            <Text style={styles.trendPrevious}>vs {data.previous}</Text>
            <Text style={[styles.trendChange, { color: trendColor }]}>
              {data.change}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderWeeklyChart = () => {
    const getChartData = () => {
      return weeklyData.map((day, index) => {
        let value, color;
        switch (selectedMetric) {
          case 'sleep_score':
            value = day.score;
            color = '#A890FE';
            break;
          case 'duration':
            value = day.duration;
            color = '#34C759';
            break;
          case 'efficiency':
            value = day.efficiency;
            color = '#FF9500';
            break;
          case 'deep_sleep':
            value = day.deepSleep;
            color = '#C9B9FF';
            break;
          default:
            value = day.score;
            color = '#A890FE';
        }
        return { x: day.day, y: value, fill: color };
      });
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Progress</Text>
        <VictoryChart
          theme={VictoryTheme.material}
          width={width - 88}
          height={200}
          padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
        >
          <VictoryAxis
            style={{
              axis: { stroke: '#EBEBF599' },
              tickLabels: { fill: '#EBEBF599', fontSize: 12 }
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: '#EBEBF599' },
              tickLabels: { fill: '#EBEBF599', fontSize: 12 }
            }}
          />
          <VictoryBar
            data={getChartData()}
            style={{
              data: {
                fill: ({ datum }) => datum.fill,
                stroke: '#000000',
                strokeWidth: 1,
              }
            }}
            barWidth={20}
            cornerRadius={4}
          />
        </VictoryChart>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trends</Text>
          <Text style={styles.headerSubtitle}>
            Track your sleep patterns and progress over time
          </Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSection}>
          <Text style={styles.sectionTitle}>Time Period</Text>
          <View style={styles.periodButtons}>
            {periods.map(renderPeriodButton)}
          </View>
        </View>

        {/* Metric Selector */}
        <View style={styles.metricSection}>
          <Text style={styles.sectionTitle}>Metric</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.metricButtons}
          >
            {metrics.map(renderMetricButton)}
          </ScrollView>
        </View>

        {/* Trend Overview */}
        <View style={styles.trendsSection}>
          <Text style={styles.sectionTitle}>Trend Overview</Text>
          <View style={styles.trendsGrid}>
            {Object.keys(trendData).map(renderTrendCard)}
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.chartSection}>
          {renderWeeklyChart()}
        </View>

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <TrendingUp size={20} color="#34C759" />
              <Text style={styles.insightTitle}>Consistent Improvement</Text>
            </View>
            <Text style={styles.insightDescription}>
              Your sleep score has improved by 6.1% this week. You're maintaining a consistent 
              sleep schedule and following recommendations effectively.
            </Text>
          </View>
          
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <TrendingDown size={20} color="#FF3B30" />
              <Text style={styles.insightTitle}>Deep Sleep Decline</Text>
            </View>
            <Text style={styles.insightDescription}>
              Deep sleep has decreased by 10% this week. Consider reducing evening screen time 
              and maintaining a cooler room temperature.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#EBEBF599',
    lineHeight: 22,
  },
  periodSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
  },
  periodButtonActive: {
    backgroundColor: '#A890FE',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EBEBF599',
  },
  periodButtonTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  metricSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  metricButtons: {
    gap: 12,
  },
  metricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
  },
  metricButtonActive: {
    backgroundColor: '#A890FE',
  },
  metricButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EBEBF599',
  },
  metricButtonTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  trendsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  trendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trendCard: {
    width: (width - 64) / 2,
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EBEBF599',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendValues: {
    alignItems: 'flex-start',
  },
  trendCurrent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  trendComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendPrevious: {
    fontSize: 12,
    color: '#EBEBF599',
  },
  trendChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  chartContainer: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  insightsSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  insightCard: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  insightDescription: {
    fontSize: 14,
    color: '#EBEBF599',
    lineHeight: 20,
    marginLeft: 32,
  },
});
