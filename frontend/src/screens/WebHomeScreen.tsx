import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { WebSafeAreaView } from '../components/WebSafeAreaView';
import { colors } from '../constants/colors';

export const WebHomeScreen: React.FC = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const renderMetricCard = (title: string, value: string, subtitle: string, color: string, delay: number = 0) => {
    const cardAnim = new Animated.Value(0);
    
    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View 
        style={[
          styles.metricCard,
          { 
            opacity: cardAnim,
            transform: [{ scale: cardAnim }],
          }
        ]}
      >
        <View style={[styles.metricIcon, { backgroundColor: color }]}>
          <Text style={styles.metricIconText}>📊</Text>
        </View>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
        <Text style={styles.metricSubtitle}>{subtitle}</Text>
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
          <Text style={styles.greeting}>Good morning, Pilot! 👋</Text>
          <Text style={styles.subtitle}>Here's your sleep summary for today</Text>
        </Animated.View>

        {/* Main Sleep Score */}
        <Animated.View 
          style={[
            styles.mainScoreCard,
            { 
              opacity: fadeAnim, 
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }] 
            }
          ]}
        >
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>87</Text>
            <Text style={styles.scoreLabel}>Sleep Score</Text>
          </View>
          <Text style={styles.scoreDescription}>
            Excellent! You're well above the recommended 7-8 hours of sleep.
          </Text>
        </Animated.View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          {renderMetricCard('Sleep Duration', '7.5h', 'Last night', colors.blue, 200)}
          {renderMetricCard('Sleep Efficiency', '92%', 'Very good', colors.purple, 400)}
          {renderMetricCard('Deep Sleep', '2.1h', 'Optimal', colors.blue, 600)}
          {renderMetricCard('REM Sleep', '1.8h', 'Good', colors.purple, 800)}
        </View>

        {/* Quick Actions */}
        <Animated.View 
          style={[
            styles.actionsSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.blue }]}>
              <Text style={styles.actionButtonText}>View Trends</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.purple }]}>
              <Text style={styles.actionButtonText}>Get Tips</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
    marginBottom: 32,
    alignItems: 'center',
  },
  greeting: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 16,
    textAlign: 'center',
  },
  mainScoreCard: {
    backgroundColor: colors.background.card,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border.muted,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  scoreValue: {
    color: colors.text.primary,
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: colors.text.primary,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreDescription: {
    color: colors.text.secondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.muted,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  metricIconText: {
    fontSize: 24,
  },
  metricValue: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metricTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  metricSubtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
