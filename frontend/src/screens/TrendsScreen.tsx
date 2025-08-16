import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { WebSafeAreaView } from '../components/WebSafeAreaView';
import { WebCompatibleChart } from '../components/WebCompatibleChart';
import { useSleepStore } from '../store/sleepStore';
import { mockData } from '../api/sleepApi';
import { colors } from '../constants/colors';

export const TrendsScreen: React.FC = () => {
  const { sleepHistory, setSleepHistory, getWeeklyTrend } = useSleepStore();

  useEffect(() => {
    if (sleepHistory.length === 0) {
      setSleepHistory(mockData.sleepHistory);
    }
  }, [sleepHistory, setSleepHistory]);

  const weeklyData = getWeeklyTrend();
  
  const chartData = weeklyData.map((item, index) => ({
    x: index + 1,
    y: item.sleepScore,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const snoringData = weeklyData.map((item, index) => ({
    x: index + 1,
    y: item.snoringIntensity,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const fragmentationData = weeklyData.map((item, index) => ({
    x: index + 1,
    y: item.fragmentation,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const getInsight = () => {
    if (weeklyData.length < 2) return null;
    
    const current = weeklyData[0];
    const previous = weeklyData[1];
    const improvement = current.sleepScore - previous.sleepScore;
    
    if (improvement > 0) {
      return {
        type: 'positive',
        message: `Your sleep quality has improved ${Math.abs(improvement)} points this week.`,
        icon: '📈',
      };
    } else if (improvement < 0) {
      return {
        type: 'negative',
        message: `Your sleep quality decreased ${Math.abs(improvement)} points this week.`,
        icon: '📉',
      };
    } else {
      return {
        type: 'neutral',
        message: 'Your sleep quality has remained stable this week.',
        icon: '➡️',
      };
    }
  };

  const insight = getInsight();

  return (
    <WebSafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sleep Trends</Text>
          <Text style={styles.headerSubtitle}>
            Track your progress over time
          </Text>
        </View>

        {/* AI Insights */}
        {insight && (
          <View style={[
            styles.insightCard,
            insight.type === 'positive' ? styles.positiveInsight :
            insight.type === 'negative' ? styles.negativeInsight :
            styles.neutralInsight
          ]}>
            <View style={styles.insightContent}>
              <Text style={styles.insightIcon}>{insight.icon}</Text>
              <Text style={[
                styles.insightMessage,
                insight.type === 'positive' ? styles.positiveText :
                insight.type === 'negative' ? styles.negativeText :
                styles.neutralText
              ]}>
                {insight.message}
              </Text>
            </View>
          </View>
        )}

        {/* Sleep Score Trend */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Sleep Score Trend</Text>
          <WebCompatibleChart
            data={chartData}
            title="Sleep Score Trend"
            yAxisLabel="Score"
            color="#3b82f6"
          />
        </View>

        {/* Snoring Intensity Trend */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Snoring Intensity</Text>
          <WebCompatibleChart
            data={snoringData}
            title="Snoring Intensity"
            yAxisLabel="dB"
            color="#f59e0b"
          />
        </View>

        {/* Fragmentation Trend */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Sleep Fragmentation</Text>
          <WebCompatibleChart
            data={fragmentationData}
            title="Sleep Fragmentation"
            yAxisLabel="events/hr"
            color="#ef4444"
          />
        </View>

        {/* Additional Insights */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Weekly Summary</Text>
          <View style={styles.summaryList}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>📊 Average Sleep Score</Text>
              <Text style={styles.summaryValue}>
                {Math.round(weeklyData.reduce((acc, item) => acc + item.sleepScore, 0) / weeklyData.length)} points
              </Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>🎯 Best Night</Text>
              <Text style={styles.summaryValue}>
                {weeklyData.reduce((best, current) => 
                  current.sleepScore > best.sleepScore ? current : best
                ).sleepScore} points on {new Date(weeklyData.reduce((best, current) => 
                  current.sleepScore > best.sleepScore ? current : best
                ).date).toLocaleDateString('en-US', { weekday: 'long' })}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </WebSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sleep.darker,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 24,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: colors.gray[400],
    fontSize: 16,
  },
  insightCard: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  positiveInsight: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    borderColor: 'rgba(5, 150, 105, 0.3)',
  },
  negativeInsight: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  neutralInsight: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insightMessage: {
    flex: 1,
    fontSize: 16,
  },
  positiveText: {
    color: colors.green,
  },
  negativeText: {
    color: colors.red,
  },
  neutralText: {
    color: colors.blue,
  },
  chartSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryList: {
    gap: 12,
  },
  summaryCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderWidth: 1,
    borderColor: colors.gray[700],
    borderRadius: 8,
    padding: 16,
  },
  summaryTitle: {
    color: colors.white,
    fontWeight: '500',
    marginBottom: 8,
  },
  summaryValue: {
    color: colors.gray[400],
    fontSize: 14,
  },
});
