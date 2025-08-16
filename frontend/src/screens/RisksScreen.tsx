import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Text, Card, Button, Chip, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { useSleepStore } from '../store/sleepStore';
import { mockRisks } from '../services/api';

const RisksScreen: React.FC = () => {
  const theme = useTheme();
  const { risks } = useSleepStore();
  
  // Use mock data for now
  const data = mockRisks;

  const getRiskColor = (severity: string) => {
    switch (severity) {
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

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'apnea':
        return 'heart-pulse';
      case 'snoring':
        return 'volume-high';
      case 'fragmentation':
        return 'bed';
      case 'insomnia':
        return 'moon';
      default:
        return 'warning';
    }
  };

  const getRiskDescription = (type: string) => {
    switch (type) {
      case 'apnea':
        return 'Sleep apnea is a serious sleep disorder where breathing repeatedly stops and starts during sleep.';
      case 'snoring':
        return 'Snoring is the vibration of respiratory structures and the resulting sound due to obstructed air movement during breathing while sleeping.';
      case 'fragmentation':
        return 'Sleep fragmentation refers to frequent interruptions during sleep, preventing deep, restorative sleep cycles.';
      case 'insomnia':
        return 'Insomnia is a sleep disorder characterized by difficulty falling asleep, staying asleep, or both.';
      default:
        return 'Sleep disorder risk assessment based on your sleep patterns.';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Sleep Risk Assessment
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Monitor potential sleep disorders and health risks
          </Text>
        </View>

        {/* Risk Cards */}
        <View style={styles.risksContainer}>
          {data.map((risk) => (
            <Card
              key={risk.id}
              style={[styles.riskCard, { backgroundColor: theme.colors.surface }]}
            >
              <Card.Content>
                <View style={styles.riskHeader}>
                  <View style={styles.riskIcon}>
                    <Ionicons
                      name={getRiskIcon(risk.type) as any}
                      size={28}
                      color={getRiskColor(risk.severity)}
                    />
                  </View>
                  <View style={styles.riskContent}>
                    <Text style={[styles.riskTitle, { color: theme.colors.onSurface }]}>
                      {risk.type.charAt(0).toUpperCase() + risk.type.slice(1)} Risk
                    </Text>
                    <Text style={[styles.riskSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                      {getRiskDescription(risk.type)}
                    </Text>
                  </View>
                  <Chip
                    mode="outlined"
                    textStyle={{ color: getRiskColor(risk.severity) }}
                    style={{ borderColor: getRiskColor(risk.severity) }}
                  >
                    {risk.severity}
                  </Chip>
                </View>

                <View style={styles.riskDetails}>
                  <View style={styles.probabilityContainer}>
                    <Text style={[styles.probabilityLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Probability: {risk.probability}%
                    </Text>
                    <ProgressBar
                      progress={risk.probability / 100}
                      color={getRiskColor(risk.severity)}
                      style={styles.probabilityBar}
                    />
                  </View>

                  <Text style={[styles.riskDescription, { color: theme.colors.onSurface }]}>
                    {risk.description}
                  </Text>

                  <View style={styles.recommendationsContainer}>
                    <Text style={[styles.recommendationsTitle, { color: theme.colors.onSurface }]}>
                      Recommendations:
                    </Text>
                    {risk.recommendations.map((recommendation, index) => (
                      <View key={index} style={styles.recommendationItem}>
                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                        <Text style={[styles.recommendationText, { color: theme.colors.onSurfaceVariant }]}>
                          {recommendation}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.riskActions}>
                  <Button
                    mode="outlined"
                    icon="information-circle"
                    onPress={() => {
                      // Show educational modal
                    }}
                    style={styles.actionButton}
                  >
                    Learn More
                  </Button>
                  <Button
                    mode="contained"
                    icon="medical"
                    onPress={() => {
                      // Navigate to specialist finder
                    }}
                    style={[styles.actionButton, { backgroundColor: getRiskColor(risk.severity) }]}
                  >
                    Find Specialist
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Health Summary */}
        <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.summaryTitle, { color: theme.colors.onSurface }]}>
              Overall Health Assessment
            </Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Text style={[styles.summaryNumber, { color: theme.colors.success }]}>
                  {data.filter(r => r.severity === 'low').length}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Low Risk
                </Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={[styles.summaryNumber, { color: theme.colors.warning }]}>
                  {data.filter(r => r.severity === 'medium' || r.severity === 'high').length}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Monitor
                </Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={[styles.summaryNumber, { color: theme.colors.error }]}>
                  {data.filter(r => r.severity === 'critical').length}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Critical
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Educational Resources */}
        <Card style={[styles.educationCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.educationTitle, { color: theme.colors.onSurface }]}>
              Educational Resources
            </Text>
            <View style={styles.educationItems}>
              <Button
                mode="outlined"
                icon="book"
                onPress={() => {
                  // Open sleep education
                }}
                style={styles.educationButton}
              >
                Sleep Education
              </Button>
              <Button
                mode="outlined"
                icon="people"
                onPress={() => {
                  // Open support groups
                }}
                style={styles.educationButton}
              >
                Support Groups
              </Button>
              <Button
                mode="outlined"
                icon="calendar"
                onPress={() => {
                  // Schedule consultation
                }}
                style={styles.educationButton}
              >
                Schedule Consultation
              </Button>
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
  risksContainer: {
    marginBottom: 24,
  },
  riskCard: {
    marginBottom: 16,
    elevation: 4,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  riskIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  riskContent: {
    flex: 1,
    marginRight: 12,
  },
  riskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  riskSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  riskDetails: {
    marginBottom: 16,
  },
  probabilityContainer: {
    marginBottom: 12,
  },
  probabilityLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  probabilityBar: {
    height: 8,
    borderRadius: 4,
  },
  riskDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  recommendationsContainer: {
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  recommendationText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  riskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  summaryCard: {
    marginBottom: 16,
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
  educationCard: {
    elevation: 4,
  },
  educationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  educationItems: {
    gap: 12,
  },
  educationButton: {
    marginBottom: 8,
  },
});

export default RisksScreen;
