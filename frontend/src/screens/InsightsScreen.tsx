import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const InsightsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 Insights</Text>
          <Text style={styles.subtitle}>Lifestyle Analytics</Text>
        </View>

        {/* Sleep Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep Trends</Text>
          
          <View style={styles.chartContainer}>
            <Text style={styles.chartPlaceholder}>
              📈 Sleep Score Chart{'\n'}(7-day trend)
            </Text>
          </View>
        </View>

        {/* Weekly Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          
          <View style={styles.statsGrid}>
            <StatCard
              title="Avg Sleep Score"
              value="75"
              change="+5"
              isPositive={true}
            />
            <StatCard
              title="Total Sleep Time"
              value="52.5h"
              change="-2.5h"
              isPositive={false}
            />
            <StatCard
              title="Snoring Episodes"
              value="12"
              change="-3"
              isPositive={true}
            />
            <StatCard
              title="Sleep Efficiency"
              value="82%"
              change="+7%"
              isPositive={true}
            />
          </View>
        </View>

        {/* Lifestyle Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifestyle Insights</Text>
          
          <View style={styles.insightsList}>
            <InsightCard
              icon="🕘"
              title="Earlier Bedtime"
              description="Try going to bed 30 minutes earlier for better sleep duration"
              impact="positive"
            />
            <InsightCard
              icon="☕"
              title="Caffeine Timing"
              description="Avoid caffeine after 3 PM for improved sleep quality"
              impact="neutral"
            />
            <InsightCard
              icon="🏃"
              title="Exercise Routine"
              description="Regular morning exercise could improve your sleep score by 10%"
              impact="positive"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive }) => (
  <View style={styles.statCard}>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={[styles.statChange, { color: isPositive ? '#10b981' : '#ef4444' }]}>
      {change}
    </Text>
  </View>
);

interface InsightCardProps {
  icon: string;
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

const InsightCard: React.FC<InsightCardProps> = ({ icon, title, description, impact }) => {
  const getImpactColor = () => {
    switch (impact) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      case 'neutral': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  return (
    <View style={styles.insightCard}>
      <Text style={styles.insightIcon}>{icon}</Text>
      <View style={styles.insightContent}>
        <Text style={styles.insightTitle}>{title}</Text>
        <Text style={styles.insightDescription}>{description}</Text>
      </View>
      <View style={[styles.impactIndicator, { backgroundColor: getImpactColor() }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholder: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
  },
  statTitle: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  insightsList: {
    gap: 12,
  },
  insightCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightDescription: {
    color: '#94a3b8',
    fontSize: 14,
  },
  impactIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
});

export default InsightsScreen;
