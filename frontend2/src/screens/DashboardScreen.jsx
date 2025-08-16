import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Moon, 
  Activity, 
  Volume2, 
  AlertTriangle, 
  TrendingUp, 
  Brain 
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const sleepScore = 87;
  const sleepDuration = '7h 23m';
  const sleepEfficiency = '94%';
  const deepSleep = '2h 15m';

  const quickInsights = [
    {
      title: 'Sleep Quality Improved',
      description: 'Your sleep score increased by 12 points this week',
      trend: 'up',
      icon: TrendingUp,
      color: '#34C759',
    },
    {
      title: 'Deep Sleep Optimal',
      description: 'You\'re getting the recommended amount of deep sleep',
      trend: 'stable',
      icon: Brain,
      color: '#A890FE',
    },
    {
      title: 'Room Temperature',
      description: 'Consider lowering room temperature by 2°C',
      trend: 'down',
      icon: Activity,
      color: '#FF9500',
    },
  ];

  const metrics = [
    { label: 'Sleep Score', value: sleepScore, unit: '', icon: Moon, color: '#A890FE' },
    { label: 'Duration', value: sleepDuration, unit: '', icon: Activity, color: '#34C759' },
    { label: 'Efficiency', value: sleepEfficiency, unit: '', icon: TrendingUp, color: '#FF9500' },
    { label: 'Deep Sleep', value: deepSleep, unit: '', icon: Brain, color: '#C9B9FF' },
  ];

  const renderMetricCard = (metric) => {
    const IconComponent = metric.icon;
    return (
      <View key={metric.label} style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <IconComponent size={20} color={metric.color} />
          <Text style={styles.metricLabel}>{metric.label}</Text>
        </View>
        <Text style={styles.metricValue}>
          {metric.value}
          {metric.unit && <Text style={styles.metricUnit}>{metric.unit}</Text>}
        </Text>
      </View>
    );
  };

  const renderQuickInsight = (insight, index) => {
    const IconComponent = insight.icon;
    return (
      <View key={index} style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <IconComponent size={20} color={insight.color} />
          <Text style={styles.insightTitle}>{insight.title}</Text>
        </View>
        <Text style={styles.insightDescription}>{insight.description}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Good morning! Here's your sleep summary</Text>
        </View>

        {/* Sleep Score Gauge */}
        <View style={styles.scoreSection}>
          <LinearGradient
            colors={['rgba(168, 144, 254, 0.2)', 'rgba(201, 185, 255, 0.1)']}
            style={styles.scoreCard}
          >
            <View style={styles.scoreContent}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>{sleepScore}</Text>
                <Text style={styles.scoreLabel}>Sleep Score</Text>
              </View>
              <View style={styles.scoreDetails}>
                <Text style={styles.scoreDescription}>
                  Excellent sleep quality! You're well-rested and ready for the day.
                </Text>
                <TouchableOpacity style={styles.viewDetailsButton}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Today's Metrics</Text>
          <View style={styles.metricsGrid}>
            {metrics.map(renderMetricCard)}
          </View>
        </View>

        {/* Quick Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Quick Insights</Text>
          <View style={styles.insightsList}>
            {quickInsights.map(renderQuickInsight)}
          </View>
        </View>

        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <LinearGradient
            colors={['rgba(52, 199, 89, 0.2)', 'rgba(52, 199, 89, 0.1)']}
            style={styles.bannerContent}
          >
            <View style={styles.bannerIcon}>
              <AlertTriangle size={24} color="#34C759" />
            </View>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>All Systems Optimal</Text>
              <Text style={styles.bannerDescription}>
                Your sleep environment is perfectly configured for optimal rest
              </Text>
            </View>
          </LinearGradient>
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
    paddingBottom: 32,
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
  scoreSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  scoreCard: {
    borderRadius: 20,
    padding: 24,
  },
  scoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(168, 144, 254, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#EBEBF599',
    marginTop: 4,
  },
  scoreDetails: {
    flex: 1,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#EBEBF599',
    lineHeight: 20,
    marginBottom: 16,
  },
  viewDetailsButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(168, 144, 254, 0.3)',
    borderRadius: 20,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A890FE',
  },
  metricsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 64) / 2,
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: '#EBEBF599',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  metricUnit: {
    fontSize: 16,
    color: '#EBEBF599',
  },
  insightsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  insightsList: {
    gap: 16,
  },
  insightCard: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  statusBanner: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
  },
  bannerIcon: {
    marginRight: 16,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerDescription: {
    fontSize: 14,
    color: '#EBEBF599',
    lineHeight: 20,
  },
});
