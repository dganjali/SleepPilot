import React, { useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { WebSafeAreaView } from '../components/WebSafeAreaView';
import { SleepScoreGauge } from '../components/SleepScoreGauge';
import { MetricCard } from '../components/MetricCard';
import { useSleepStore } from '../store/sleepStore';
import { mockData } from '../api/sleepApi';
import { colors } from '../constants/colors';

export const HomeScreen: React.FC = () => {
  const {
    currentSleepData,
    setCurrentSleepData,
    setSleepHistory,
    isLoading,
    setLoading,
  } = useSleepStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // In a real app, this would call the API
      // For now, using mock data
      setCurrentSleepData(mockData.currentSleepData);
      setSleepHistory(mockData.sleepHistory);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBanner = () => {
    if (!currentSleepData) return null;
    
    if (currentSleepData.apneaRisk === 'High') {
      return (
        <View style={styles.highRiskBanner}>
          <Text style={styles.highRiskText}>
            ⚠️ High Risk of Apnea Tonight
          </Text>
        </View>
      );
    }
    
    if (currentSleepData.apneaRisk === 'Medium') {
      return (
        <View style={styles.mediumRiskBanner}>
          <Text style={styles.mediumRiskText}>
            ⚠️ Medium Risk of Apnea Tonight
          </Text>
        </View>
      );
    }
    
    return null;
  };

  if (!currentSleepData) {
    return (
      <WebSafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading sleep data...</Text>
        </View>
      </WebSafeAreaView>
    );
  }

  return (
    <WebSafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadData} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Good Morning</Text>
          <Text style={styles.headerSubtitle}>
            Here's your sleep summary for today
          </Text>
        </View>

        {/* Risk Banner */}
        {getRiskBanner()}

        {/* Sleep Score Gauge */}
        <View style={styles.gaugeContainer}>
          <SleepScoreGauge score={currentSleepData.sleepScore} />
        </View>

        {/* Key Metrics Grid */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricsRow}>
              <View style={styles.metricHalf}>
                <MetricCard
                  title="Snoring Intensity"
                  value={currentSleepData.snoringIntensity}
                  unit="dB"
                  subtitle={currentSleepData.snoringIntensity > 50 ? "High" : "Normal"}
                  variant={currentSleepData.snoringIntensity > 50 ? "warning" : "default"}
                />
              </View>
              <View style={styles.metricHalf}>
                <MetricCard
                  title="Apnea Risk"
                  value={currentSleepData.apneaRisk}
                  subtitle="Tonight's assessment"
                  variant={
                    currentSleepData.apneaRisk === 'High' ? 'danger' :
                    currentSleepData.apneaRisk === 'Medium' ? 'warning' : 'success'
                  }
                />
              </View>
            </View>
            
            <View style={styles.metricsRow}>
              <View style={styles.metricHalf}>
                <MetricCard
                  title="Fragmentation"
                  value={currentSleepData.fragmentation}
                  unit="events/hr"
                  subtitle={currentSleepData.fragmentation > 15 ? "High" : "Low"}
                  variant={currentSleepData.fragmentation > 15 ? "warning" : "success"}
                />
              </View>
              <View style={styles.metricHalf}>
                <MetricCard
                  title="Sleep Duration"
                  value={currentSleepData.duration}
                  unit="hours"
                  subtitle={currentSleepData.duration >= 7 ? "Optimal" : "Short"}
                  variant={currentSleepData.duration >= 7 ? "success" : "warning"}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsList}>
            <View style={styles.actionCard}>
              <Text style={styles.actionTitle}>📊 View Detailed Report</Text>
              <Text style={styles.actionDescription}>
                See your complete sleep analysis and trends
              </Text>
            </View>
            
            <View style={styles.actionCard}>
              <Text style={styles.actionTitle}>🎯 Get Recommendations</Text>
              <Text style={styles.actionDescription}>
                Personalized suggestions to improve your sleep
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
  highRiskBanner: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  highRiskText: {
    color: colors.red,
    textAlign: 'center',
    fontWeight: '500',
  },
  mediumRiskBanner: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  mediumRiskText: {
    color: colors.yellow,
    textAlign: 'center',
    fontWeight: '500',
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  metricsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  metricsGrid: {
    gap: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricHalf: {
    flex: 1,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionsList: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderWidth: 1,
    borderColor: colors.gray[700],
    borderRadius: 8,
    padding: 16,
  },
  actionTitle: {
    color: colors.white,
    fontWeight: '500',
    marginBottom: 8,
  },
  actionDescription: {
    color: colors.gray[400],
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.white,
    fontSize: 18,
  },
});
