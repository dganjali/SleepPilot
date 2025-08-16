import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { VictoryPie, VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';

import { useSleepStore } from '../store/sleepStore';
import { sleepHealthAPI, mockSleepData, mockRecommendations, mockRisks } from '../services/api';
import { theme } from '../theme/theme';
import SleepScoreGauge from '../components/SleepScoreGauge';
import MetricCard from '../components/MetricCard';
import StatusBanner from '../components/StatusBanner';
import { useQuery } from '@tanstack/react-query';

const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const {
    sleepData,
    recommendations,
    risks,
    userProfile,
    hasNewAlerts,
    isLoading,
    setSleepData,
    setRecommendations,
    setRisks,
    setHasNewAlerts,
    setLoading,
    getLatestSleepData,
    getAverageSleepScore,
    getSleepTrend,
  } = useSleepStore();

  const [refreshing, setRefreshing] = useState(false);

  // Fetch data using React Query
  const { data: latestData, refetch: refetchData } = useQuery({
    queryKey: ['sleepData'],
    queryFn: async () => {
      // For now, use mock data. In production, this would call the API
      return mockSleepData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: latestRecommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      return mockRecommendations;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: latestRisks } = useQuery({
    queryKey: ['risks'],
    queryFn: async () => {
      return mockRisks;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Update store when data changes
  useEffect(() => {
    if (latestData) {
      setSleepData(latestData);
    }
  }, [latestData, setSleepData]);

  useEffect(() => {
    if (latestRecommendations) {
      setRecommendations(latestRecommendations);
    }
  }, [latestRecommendations, setRecommendations]);

  useEffect(() => {
    if (latestRisks) {
      setRisks(latestRisks);
    }
  }, [latestRisks, setRisks]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchData();
      // Check for new alerts
      const criticalRisks = latestRisks?.filter(risk => risk.severity === 'critical') || [];
      setHasNewAlerts(criticalRisks.length > 0);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const latestSleepData = getLatestSleepData();
  const averageScore = getAverageSleepScore(7);
  const sleepTrend = getSleepTrend(7);

  const getSleepScoreColor = (score: number) => {
    if (score >= 90) return theme.colors.sleepScore.excellent;
    if (score >= 70) return theme.colors.sleepScore.good;
    if (score >= 50) return theme.colors.sleepScore.fair;
    return theme.colors.sleepScore.poor;
  };

  const getSleepScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'trending-up';
      case 'declining':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return theme.colors.success;
      case 'declining':
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
            Loading your sleep data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.onBackground }]}>
            Good morning, {userProfile?.name || 'User'}!
          </Text>
          <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Sleep Score Gauge */}
        {latestSleepData && (
          <Card style={[styles.gaugeCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.gaugeContent}>
              <SleepScoreGauge
                score={latestSleepData.sleepScore}
                size={200}
                strokeWidth={12}
              />
              <View style={styles.scoreInfo}>
                <Text style={[styles.scoreLabel, { color: theme.colors.onSurface }]}>
                  Sleep Score
                </Text>
                <Text style={[styles.scoreValue, { color: getSleepScoreColor(latestSleepData.sleepScore) }]}>
                  {latestSleepData.sleepScore}
                </Text>
                <Text style={[styles.scoreDescription, { color: theme.colors.onSurfaceVariant }]}>
                  {getSleepScoreLabel(latestSleepData.sleepScore)}
                </Text>
                <View style={styles.trendContainer}>
                  <Ionicons
                    name={getTrendIcon(sleepTrend) as any}
                    size={16}
                    color={getTrendColor(sleepTrend)}
                  />
                  <Text style={[styles.trendText, { color: getTrendColor(sleepTrend) }]}>
                    {sleepTrend.charAt(0).toUpperCase() + sleepTrend.slice(1)} this week
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Status Banner */}
        {hasNewAlerts && (
          <StatusBanner
            type="warning"
            title="High Risk Alert"
            message="Critical sleep apnea risk detected. Consider consulting a specialist."
            onPress={() => {
              // Navigate to risks screen
            }}
          />
        )}

        {/* Key Metrics */}
        <View style={styles.metricsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Key Metrics
          </Text>
          <View style={styles.metricsGrid}>
            {latestSleepData && (
              <>
                <MetricCard
                  title="Snoring Intensity"
                  value={`${latestSleepData.snoringIntensity} dB`}
                  subtitle={latestSleepData.snoringIntensity > 50 ? 'High' : 'Normal'}
                  icon="volume-high"
                  color={latestSleepData.snoringIntensity > 50 ? theme.colors.warning : theme.colors.success}
                />
                <MetricCard
                  title="Apnea Risk"
                  value={`${latestSleepData.apneaRisk}%`}
                  subtitle={latestSleepData.apneaRisk > 15 ? 'High' : 'Low'}
                  icon="heart-pulse"
                  color={latestSleepData.apneaRisk > 15 ? theme.colors.error : theme.colors.success}
                />
                <MetricCard
                  title="Fragmentation"
                  value={`${latestSleepData.fragmentation}/hr`}
                  subtitle={latestSleepData.fragmentation > 10 ? 'High' : 'Normal'}
                  icon="bed"
                  color={latestSleepData.fragmentation > 10 ? theme.colors.warning : theme.colors.success}
                />
                <MetricCard
                  title="Sleep Duration"
                  value={`${latestSleepData.duration}h`}
                  subtitle={latestSleepData.duration >= 7 ? 'Optimal' : 'Short'}
                  icon="time"
                  color={latestSleepData.duration >= 7 ? theme.colors.success : theme.colors.warning}
                />
              </>
            )}
          </View>
        </View>

        {/* Sleep Stages Chart */}
        {latestSleepData && (
          <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.chartTitle, { color: theme.colors.onSurface }]}>
                Sleep Stages
              </Text>
              <View style={styles.chartContainer}>
                <VictoryPie
                  data={[
                    { x: 'Deep Sleep', y: latestSleepData.deepSleep },
                    { x: 'REM Sleep', y: latestSleepData.remSleep },
                    { x: 'Light Sleep', y: latestSleepData.lightSleep },
                    { x: 'Awake', y: latestSleepData.awakeTime },
                  ]}
                  colorScale={[
                    theme.colors.primary,
                    theme.colors.secondary,
                    theme.colors.tertiary,
                    theme.colors.outline,
                  ]}
                  width={250}
                  height={250}
                  innerRadius={50}
                  labelRadius={80}
                  style={{
                    labels: {
                      fill: theme.colors.onSurface,
                      fontSize: 12,
                      fontWeight: 'bold',
                    },
                  }}
                />
              </View>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: theme.colors.primary }]} />
                  <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>
                    Deep Sleep
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: theme.colors.secondary }]} />
                  <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>
                    REM Sleep
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: theme.colors.tertiary }]} />
                  <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>
                    Light Sleep
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: theme.colors.outline }]} />
                  <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>
                    Awake
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <Button
              mode="contained"
              icon="microphone"
              onPress={() => {
                // Navigate to audio recording
              }}
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            >
              Record Sleep
            </Button>
            <Button
              mode="outlined"
              icon="bulb"
              onPress={() => {
                // Navigate to recommendations
              }}
              style={styles.actionButton}
            >
              View Tips
            </Button>
            <Button
              mode="outlined"
              icon="trending-up"
              onPress={() => {
                // Navigate to trends
              }}
              style={styles.actionButton}
            >
              See Trends
            </Button>
            <Button
              mode="outlined"
              icon="warning"
              onPress={() => {
                // Navigate to risks
              }}
              style={styles.actionButton}
            >
              Check Risks
            </Button>
          </View>
        </View>

        {/* Recent Recommendations */}
        {recommendations.length > 0 && (
          <View style={styles.recommendationsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Recent Recommendations
            </Text>
            {recommendations.slice(0, 2).map((recommendation) => (
              <Card
                key={recommendation.id}
                style={[styles.recommendationCard, { backgroundColor: theme.colors.surface }]}
              >
                <Card.Content>
                  <View style={styles.recommendationHeader}>
                    <Text style={[styles.recommendationTitle, { color: theme.colors.onSurface }]}>
                      {recommendation.title}
                    </Text>
                    <Chip
                      mode="outlined"
                      textStyle={{ color: theme.colors.primary }}
                      style={{ borderColor: theme.colors.primary }}
                    >
                      {recommendation.priority}
                    </Chip>
                  </View>
                  <Text style={[styles.recommendationDescription, { color: theme.colors.onSurfaceVariant }]}>
                    {recommendation.description}
                  </Text>
                  <View style={styles.recommendationFooter}>
                    <Text style={[styles.confidenceText, { color: theme.colors.onSurfaceVariant }]}>
                      {Math.round(recommendation.confidence * 100)}% confidence
                    </Text>
                    <Button
                      mode="text"
                      onPress={() => {
                        // Mark as completed
                      }}
                    >
                      Mark Complete
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
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
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
  },
  gaugeCard: {
    marginBottom: 16,
    elevation: 4,
  },
  gaugeContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  scoreInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  scoreLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 18,
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    marginLeft: 4,
    fontSize: 14,
  },
  metricsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chartCard: {
    marginBottom: 24,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: 12,
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  recommendationCard: {
    marginBottom: 12,
    elevation: 2,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 12,
  },
});

export default DashboardScreen;
