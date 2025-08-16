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
  AlertTriangle, 
  Info, 
  TrendingUp, 
  Activity,
  ExternalLink,
  Heart,
  Brain,
  Shield
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function RisksScreen() {
  const [selectedRisk, setSelectedRisk] = useState(null);

  const riskLevels = {
    low: { color: '#34C759', label: 'Low Risk' },
    medium: { color: '#FF9500', label: 'Medium Risk' },
    high: { color: '#FF3B30', label: 'High Risk' },
  };

  const currentRisks = [
    {
      id: 1,
      title: 'Sleep Apnea Risk',
      description: 'Irregular breathing patterns detected during sleep',
      level: 'medium',
      probability: '65%',
      impact: 'Moderate impact on sleep quality and health',
      recommendations: [
        'Consult a sleep specialist for evaluation',
        'Monitor breathing patterns during sleep',
        'Consider positional therapy',
      ],
      trend: 'stable',
    },
    {
      id: 2,
      title: 'Insomnia Risk',
      description: 'Difficulty falling or staying asleep',
      level: 'low',
      probability: '25%',
      impact: 'Minor impact on daily functioning',
      recommendations: [
        'Maintain consistent sleep schedule',
        'Practice relaxation techniques',
        'Limit caffeine intake',
      ],
      trend: 'decreasing',
    },
    {
      id: 3,
      title: 'Circadian Rhythm Disruption',
      description: 'Irregular sleep-wake cycle patterns',
      level: 'high',
      probability: '80%',
      impact: 'Significant impact on sleep quality and health',
      recommendations: [
        'Expose yourself to morning sunlight',
        'Avoid screens 2 hours before bedtime',
        'Establish consistent sleep schedule',
      ],
      trend: 'increasing',
    },
  ];

  const riskTrends = [
    { month: 'Jan', sleep_apnea: 45, insomnia: 30, circadian: 60 },
    { month: 'Feb', sleep_apnea: 50, insomnia: 28, circadian: 65 },
    { month: 'Mar', sleep_apnea: 55, insomnia: 25, circadian: 70 },
    { month: 'Apr', sleep_apnea: 60, insomnia: 22, circadian: 75 },
    { month: 'May', sleep_apnea: 65, insomnia: 25, circadian: 80 },
  ];

  const educationTopics = [
    {
      title: 'Understanding Sleep Apnea',
      description: 'Learn about the causes, symptoms, and treatment options for sleep apnea.',
      icon: Heart,
      color: '#FF3B30',
    },
    {
      title: 'Sleep Hygiene Basics',
      description: 'Essential practices for maintaining healthy sleep patterns and routines.',
      icon: Brain,
      color: '#A890FE',
    },
    {
      title: 'Circadian Rhythm Health',
      description: 'How your body\'s internal clock affects sleep and overall health.',
      icon: Shield,
      color: '#34C759',
    },
  ];

  const getRiskColor = (level) => {
    return riskLevels[level]?.color || '#EBEBF599';
  };

  const getRiskLabel = (level) => {
    return riskLevels[level]?.label || 'Unknown Risk';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return TrendingUp;
      case 'decreasing': return TrendingUp;
      default: return Activity;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return '#FF3B30';
      case 'decreasing': return '#34C759';
      default: return '#FF9500';
    }
  };

  const renderRiskCard = (risk) => {
    const riskColor = getRiskColor(risk.level);
    const riskLabel = getRiskLabel(risk.level);
    const TrendIcon = getTrendIcon(risk.trend);
    const trendColor = getTrendColor(risk.trend);

    return (
      <TouchableOpacity
        key={risk.id}
        style={styles.riskCard}
        onPress={() => setSelectedRisk(selectedRisk === risk.id ? null : risk.id)}
      >
        <View style={styles.riskHeader}>
          <View style={styles.riskInfo}>
            <View style={styles.riskTitleRow}>
              <AlertTriangle size={20} color={riskColor} />
              <Text style={styles.riskTitle}>{risk.title}</Text>
            </View>
            <View style={styles.riskMeta}>
              <View style={[styles.riskLevel, { backgroundColor: `${riskColor}20` }]}>
                <Text style={[styles.riskLevelText, { color: riskColor }]}>
                  {riskLabel}
                </Text>
              </View>
              <View style={styles.riskProbability}>
                <Text style={styles.riskProbabilityText}>{risk.probability} probability</Text>
              </View>
            </View>
          </View>
          <View style={styles.riskTrend}>
            <TrendIcon size={16} color={trendColor} />
          </View>
        </View>

        <Text style={styles.riskDescription}>{risk.description}</Text>
        
        {selectedRisk === risk.id && (
          <View style={styles.riskDetails}>
            <View style={styles.impactSection}>
              <Text style={styles.impactTitle}>Impact</Text>
              <Text style={styles.impactText}>{risk.impact}</Text>
            </View>
            
            <View style={styles.recommendationsSection}>
              <Text style={styles.recommendationsTitle}>Recommendations</Text>
              {risk.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <View style={[styles.recommendationDot, { backgroundColor: riskColor }]} />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEducationCard = (topic) => {
    const Icon = topic.icon;
    
    return (
      <TouchableOpacity key={topic.title} style={styles.educationCard}>
        <View style={styles.educationIcon}>
          <Icon size={24} color={topic.color} />
        </View>
        <View style={styles.educationContent}>
          <Text style={styles.educationTitle}>{topic.title}</Text>
          <Text style={styles.educationDescription}>{topic.description}</Text>
        </View>
        <ExternalLink size={20} color="#EBEBF599" />
      </TouchableOpacity>
    );
  };

  const renderTrendChart = () => {
    const chartData = riskTrends.map(month => ({
      x: month.month,
      sleep_apnea: month.sleep_apnea,
      insomnia: month.insomnia,
      circadian: month.circadian,
    }));

    return (
      <View style={styles.trendChartContainer}>
        <Text style={styles.trendChartTitle}>Risk Trends Over Time</Text>
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
          <VictoryGroup offset={8}>
            <VictoryBar
              data={chartData}
              x="x"
              y="sleep_apnea"
              style={{
                data: {
                  fill: '#FF3B30',
                  stroke: '#000000',
                  strokeWidth: 1,
                }
              }}
              barWidth={6}
              cornerRadius={2}
            />
            <VictoryBar
              data={chartData}
              x="x"
              y="insomnia"
              style={{
                data: {
                  fill: '#FF9500',
                  stroke: '#000000',
                  strokeWidth: 1,
                }
              }}
              barWidth={6}
              cornerRadius={2}
            />
            <VictoryBar
              data={chartData}
              x="x"
              y="circadian"
              style={{
                data: {
                  fill: '#34C759',
                  stroke: '#000000',
                  strokeWidth: 1,
                }
              }}
              barWidth={6}
              cornerRadius={2}
            />
          </VictoryGroup>
        </VictoryChart>
        <View style={styles.trendChartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
            <Text style={styles.legendText}>Sleep Apnea</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
            <Text style={styles.legendText}>Insomnia</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
            <Text style={styles.legendText}>Circadian</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Risk Assessment</Text>
          <Text style={styles.headerSubtitle}>
            Monitor and understand potential sleep-related health risks
          </Text>
        </View>

        {/* Risk Overview */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Current Risk Status</Text>
          <View style={styles.overviewCards}>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewNumber}>{currentRisks.length}</Text>
              <Text style={styles.overviewLabel}>Active Risks</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewNumber}>
                {currentRisks.filter(r => r.level === 'high').length}
              </Text>
              <Text style={styles.overviewLabel}>High Risk</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewNumber}>
                {currentRisks.filter(r => r.trend === 'decreasing').length}
              </Text>
              <Text style={styles.overviewLabel}>Improving</Text>
            </View>
          </View>
        </View>

        {/* Risk Trends Chart */}
        <View style={styles.trendsSection}>
          {renderTrendChart()}
        </View>

        {/* Current Risks */}
        <View style={styles.risksSection}>
          <Text style={styles.sectionTitle}>Current Risks</Text>
          <View style={styles.risksList}>
            {currentRisks.map(renderRiskCard)}
          </View>
        </View>

        {/* Education Resources */}
        <View style={styles.educationSection}>
          <Text style={styles.sectionTitle}>Learn More</Text>
          <View style={styles.educationList}>
            {educationTopics.map(renderEducationCard)}
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
  overviewSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  overviewCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewCard: {
    flex: 1,
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#EBEBF599',
    textAlign: 'center',
  },
  trendsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  trendChartContainer: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  trendChartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  trendChartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#EBEBF599',
  },
  risksSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  risksList: {
    gap: 16,
  },
  riskCard: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  riskInfo: {
    flex: 1,
  },
  riskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  riskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  riskLevel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskLevelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  riskProbability: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(56, 56, 58, 0.8)',
    borderRadius: 12,
  },
  riskProbabilityText: {
    fontSize: 12,
    color: '#EBEBF599',
  },
  riskTrend: {
    marginLeft: 12,
  },
  riskDescription: {
    fontSize: 14,
    color: '#EBEBF599',
    lineHeight: 20,
    marginBottom: 16,
  },
  riskDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(56, 56, 58, 0.8)',
    paddingTop: 16,
  },
  impactSection: {
    marginBottom: 16,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  impactText: {
    fontSize: 14,
    color: '#EBEBF599',
    lineHeight: 20,
  },
  recommendationsSection: {
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  recommendationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#EBEBF599',
    lineHeight: 20,
  },
  educationSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  educationList: {
    gap: 16,
  },
  educationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  educationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 144, 254, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  educationContent: {
    flex: 1,
  },
  educationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  educationDescription: {
    fontSize: 14,
    color: '#EBEBF599',
    lineHeight: 20,
  },
});
