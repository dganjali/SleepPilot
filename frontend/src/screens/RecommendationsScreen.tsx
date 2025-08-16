import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Text, Card, Button, Chip, ProgressBar, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { useSleepStore } from '../store/sleepStore';
import { mockRecommendations } from '../services/api';

const RecommendationsScreen: React.FC = () => {
  const theme = useTheme();
  const { recommendations, completeRecommendation } = useSleepStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Use mock data for now
  const data = mockRecommendations;

  const categories = [
    { key: 'temperature', label: 'Temperature', icon: 'thermometer' },
    { key: 'lighting', label: 'Lighting', icon: 'bulb' },
    { key: 'noise', label: 'Noise', icon: 'volume-high' },
    { key: 'humidity', label: 'Humidity', icon: 'water' },
    { key: 'routine', label: 'Routine', icon: 'time' },
    { key: 'health', label: 'Health', icon: 'heart' },
  ];

  const filteredRecommendations = selectedCategory
    ? data.filter(rec => rec.category === selectedCategory)
    : data;

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.key === category);
    return cat?.icon || 'settings';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return theme.colors.error;
      case 'high':
        return theme.colors.warning;
      case 'medium':
        return theme.colors.info;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return theme.colors.success;
    if (confidence >= 0.6) return theme.colors.warning;
    return theme.colors.error;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Sleep Recommendations
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            AI-powered suggestions to optimize your sleep environment
          </Text>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          <Button
            mode={selectedCategory === null ? 'contained' : 'outlined'}
            onPress={() => setSelectedCategory(null)}
            style={styles.categoryButton}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.key}
              mode={selectedCategory === category.key ? 'contained' : 'outlined'}
              icon={category.icon}
              onPress={() => setSelectedCategory(category.key)}
              style={styles.categoryButton}
            >
              {category.label}
            </Button>
          ))}
        </ScrollView>

        {/* Recommendations */}
        <View style={styles.recommendationsContainer}>
          {filteredRecommendations.map((recommendation) => (
            <Card
              key={recommendation.id}
              style={[styles.recommendationCard, { backgroundColor: theme.colors.surface }]}
            >
              <Card.Content>
                <View style={styles.recommendationHeader}>
                  <View style={styles.recommendationIcon}>
                    <Ionicons
                      name={getCategoryIcon(recommendation.category) as any}
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.recommendationContent}>
                    <Text style={[styles.recommendationTitle, { color: theme.colors.onSurface }]}>
                      {recommendation.title}
                    </Text>
                    <Text style={[styles.recommendationDescription, { color: theme.colors.onSurfaceVariant }]}>
                      {recommendation.description}
                    </Text>
                  </View>
                  <Chip
                    mode="outlined"
                    textStyle={{ color: getPriorityColor(recommendation.priority) }}
                    style={{ borderColor: getPriorityColor(recommendation.priority) }}
                  >
                    {recommendation.priority}
                  </Chip>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.recommendationDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Category:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                      {categories.find(c => c.key === recommendation.category)?.label}
                    </Text>
                  </View>
                  
                  {recommendation.value && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                        Recommended Value:
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.colors.primary }]}>
                        {recommendation.value}{recommendation.unit}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Confidence:
                    </Text>
                    <View style={styles.confidenceContainer}>
                      <ProgressBar
                        progress={recommendation.confidence}
                        color={getConfidenceColor(recommendation.confidence)}
                        style={styles.confidenceBar}
                      />
                      <Text style={[styles.confidenceText, { color: getConfidenceColor(recommendation.confidence) }]}>
                        {Math.round(recommendation.confidence * 100)}%
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.recommendationActions}>
                  {recommendation.actionable && !recommendation.completed && (
                    <Button
                      mode="contained"
                      icon="check"
                      onPress={() => completeRecommendation(recommendation.id)}
                      style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
                    >
                      Mark Complete
                    </Button>
                  )}
                  {recommendation.completed && (
                    <Button
                      mode="outlined"
                      icon="check-circle"
                      disabled
                      style={styles.actionButton}
                    >
                      Completed
                    </Button>
                  )}
                  <Button
                    mode="outlined"
                    icon="information-circle"
                    onPress={() => {
                      // Show more details
                    }}
                    style={styles.actionButton}
                  >
                    Learn More
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Summary */}
        <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.summaryTitle, { color: theme.colors.onSurface }]}>
              Recommendation Summary
            </Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Text style={[styles.summaryNumber, { color: theme.colors.primary }]}>
                  {data.length}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Total Recommendations
                </Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={[styles.summaryNumber, { color: theme.colors.success }]}>
                  {data.filter(r => r.completed).length}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Completed
                </Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={[styles.summaryNumber, { color: theme.colors.warning }]}>
                  {data.filter(r => r.priority === 'high' || r.priority === 'critical').length}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                  High Priority
                </Text>
              </View>
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
  categoryScroll: {
    marginBottom: 24,
  },
  categoryContainer: {
    paddingHorizontal: 4,
  },
  categoryButton: {
    marginHorizontal: 4,
  },
  recommendationsContainer: {
    marginBottom: 24,
  },
  recommendationCard: {
    marginBottom: 16,
    elevation: 4,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  recommendationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  recommendationContent: {
    flex: 1,
    marginRight: 12,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    marginVertical: 16,
  },
  recommendationDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 35,
  },
  recommendationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  summaryCard: {
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default RecommendationsScreen;
