import React, { useEffect } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { WebSafeAreaView } from '../components/WebSafeAreaView';
import { RecommendationCard } from '../components/RecommendationCard';
import { useSleepStore } from '../store/sleepStore';
import { mockData } from '../api/sleepApi';
import { Recommendation } from '../types';
import { colors } from '../constants/colors';

export const RecommendationsScreen: React.FC = () => {
  const { recommendations, setRecommendations } = useSleepStore();

  useEffect(() => {
    if (recommendations.length === 0) {
      setRecommendations(mockData.recommendations);
    }
  }, [recommendations, setRecommendations]);

  const handleAddToRoutine = (recommendation: Recommendation) => {
    Alert.alert(
      'Add to Routine',
      `Would you like to add "${recommendation.title}" to your sleep routine?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add',
          onPress: () => {
            // In a real app, this would save to user's routine
            Alert.alert('Success', 'Added to your sleep routine!');
          },
        },
      ]
    );
  };

  const getRecommendationsByPriority = () => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return [...recommendations].sort((a, b) => 
      priorityOrder[b.priority] - priorityOrder[a.priority]
    );
  };

  const sortedRecommendations = getRecommendationsByPriority();

  return (
    <WebSafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sleep Recommendations</Text>
          <Text style={styles.headerSubtitle}>
            Personalized suggestions from our AI to improve your sleep
          </Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            🎯 Your Sleep Optimization Plan
          </Text>
          <Text style={styles.summaryDescription}>
            Based on your recent sleep patterns, we've identified {recommendations.length} key areas 
            for improvement. These recommendations are personalized using advanced machine learning 
            and sleep science research.
          </Text>
        </View>

        {/* High Priority Section */}
        {sortedRecommendations.filter(r => r.priority === 'high').length > 0 && (
          <View style={styles.prioritySection}>
            <Text style={styles.highPriorityTitle}>
              🔴 High Priority Actions
            </Text>
            {sortedRecommendations
              .filter(r => r.priority === 'high')
              .map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onAddToRoutine={handleAddToRoutine}
                />
              ))}
          </View>
        )}

        {/* Medium Priority Section */}
        {sortedRecommendations.filter(r => r.priority === 'medium').length > 0 && (
          <View style={styles.prioritySection}>
            <Text style={styles.mediumPriorityTitle}>
              🟡 Medium Priority Actions
            </Text>
            {sortedRecommendations
              .filter(r => r.priority === 'medium')
              .map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onAddToRoutine={handleAddToRoutine}
                />
              ))}
          </View>
        )}

        {/* Low Priority Section */}
        {sortedRecommendations.filter(r => r.priority === 'low').length > 0 && (
          <View style={styles.prioritySection}>
            <Text style={styles.lowPriorityTitle}>
              🔵 Low Priority Actions
            </Text>
            {sortedRecommendations
              .filter(r => r.priority === 'low')
              .map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onAddToRoutine={handleAddToRoutine}
                />
              ))}
          </View>
        )}

        {/* How It Works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.howItWorksList}>
            <View style={styles.howItWorksCard}>
              <Text style={styles.howItWorksTitle}>🧠 AI Analysis</Text>
              <Text style={styles.howItWorksDescription}>
                Our machine learning model analyzes your sleep patterns, environmental factors, 
                and health data to identify optimization opportunities.
              </Text>
            </View>
            
            <View style={styles.howItWorksCard}>
              <Text style={styles.howItWorksTitle}>🎯 Personalized Suggestions</Text>
              <Text style={styles.howItWorksDescription}>
                Recommendations are tailored to your specific sleep profile, preferences, 
                and current sleep quality metrics.
              </Text>
            </View>
            
            <View style={styles.howItWorksCard}>
              <Text style={styles.howItWorksTitle}>📱 Actionable Steps</Text>
              <Text style={styles.howItWorksDescription}>
                Each recommendation includes specific, measurable actions you can take 
                to improve your sleep environment and habits.
              </Text>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Pro Tips</Text>
          <View style={styles.tipsCard}>
            <Text style={styles.tipText}>
              💡 <Text style={styles.tipHighlight}>Start Small:</Text> Focus on implementing 
              one or two high-priority recommendations first. Small changes can have big impacts on sleep quality.
            </Text>
            <Text style={styles.tipText}>
              📊 <Text style={styles.tipHighlight}>Track Progress:</Text> Monitor your sleep 
              score improvements after implementing changes to see what works best for you.
            </Text>
            <Text style={styles.tipText}>
              🔄 <Text style={styles.tipHighlight}>Be Consistent:</Text> Sleep improvements 
              often take time. Stick with your routine for at least a week before evaluating results.
            </Text>
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
  summaryCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    color: colors.blue,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryDescription: {
    color: colors.gray[300],
    fontSize: 14,
    lineHeight: 20,
  },
  prioritySection: {
    marginBottom: 24,
  },
  highPriorityTitle: {
    color: colors.red,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  mediumPriorityTitle: {
    color: colors.yellow,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  lowPriorityTitle: {
    color: colors.blue,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  howItWorksSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  howItWorksList: {
    gap: 12,
  },
  howItWorksCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderWidth: 1,
    borderColor: colors.gray[700],
    borderRadius: 8,
    padding: 16,
  },
  howItWorksTitle: {
    color: colors.white,
    fontWeight: '500',
    marginBottom: 8,
  },
  howItWorksDescription: {
    color: colors.gray[400],
    fontSize: 14,
    lineHeight: 20,
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipsCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderWidth: 1,
    borderColor: colors.gray[700],
    borderRadius: 8,
    padding: 16,
  },
  tipText: {
    color: colors.gray[300],
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  tipHighlight: {
    color: colors.white,
    fontWeight: '500',
  },
});
