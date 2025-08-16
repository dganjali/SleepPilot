import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { WebSafeAreaView } from '../components/WebSafeAreaView';
import { useSleepStore } from '../store/sleepStore';
import { mockData } from '../api/sleepApi';
import { RiskAssessment } from '../types';
import { colors } from '../constants/colors';

export const RisksScreen: React.FC = () => {
  const { riskAssessment, setRiskAssessment } = useSleepStore();

  useEffect(() => {
    if (!riskAssessment) {
      setRiskAssessment(mockData.riskAssessment);
    }
  }, [riskAssessment, setRiskAssessment]);

  const getRiskLevel = (percentage: number) => {
    if (percentage >= 70) return { level: 'High', color: styles.highRiskText, bg: styles.highRiskBg, border: styles.highRiskBorder };
    if (percentage >= 40) return { level: 'Medium', color: styles.mediumRiskText, bg: styles.mediumRiskBg, border: styles.mediumRiskBorder };
    return { level: 'Low', color: styles.lowRiskText, bg: styles.lowRiskBg, border: styles.lowRiskBorder };
  };

  const getOverallRiskStyles = (risk: string) => {
    switch (risk) {
      case 'High':
        return { text: styles.highRiskText, bg: styles.highRiskBg, border: styles.highRiskBorder };
      case 'Medium':
        return { text: styles.mediumRiskText, bg: styles.mediumRiskBg, border: styles.mediumRiskBorder };
      case 'Low':
        return { text: styles.lowRiskText, bg: styles.lowRiskBg, border: styles.lowRiskBorder };
      default:
        return { text: styles.defaultRiskText, bg: styles.defaultRiskBg, border: styles.defaultRiskBorder };
    }
  };

  const showRiskExplanation = (type: string) => {
    const explanations = {
      apnea: {
        title: 'Sleep Apnea Risk',
        message: 'Sleep apnea is a serious sleep disorder where breathing repeatedly stops and starts during sleep. High risk factors include loud snoring, observed breathing pauses, and excessive daytime sleepiness. Consult a healthcare provider if you experience these symptoms.',
        symptoms: ['Loud snoring', 'Breathing pauses', 'Gasping for air', 'Excessive daytime sleepiness', 'Morning headaches']
      },
      snoring: {
        title: 'Snoring Severity',
        message: 'Snoring can range from mild to severe and may indicate underlying health issues. Severe snoring can disrupt sleep quality and may be associated with sleep apnea.',
        symptoms: ['Loud, disruptive snoring', 'Snoring in all sleep positions', 'Snoring that disturbs others', 'Waking up feeling unrested']
      },
      fragmentation: {
        title: 'Sleep Fragmentation Risk',
        message: 'Sleep fragmentation refers to frequent awakenings during the night, which can significantly reduce sleep quality and leave you feeling tired during the day.',
        symptoms: ['Frequent night awakenings', 'Difficulty staying asleep', 'Light, restless sleep', 'Feeling tired despite adequate sleep time']
      }
    };

    const explanation = explanations[type as keyof typeof explanations];
    if (!explanation) return;

    Alert.alert(
      explanation.title,
      explanation.message,
      [
        { text: 'OK', style: 'default' },
        {
          text: 'Learn More',
          onPress: () => {
            Alert.alert(
              'Common Symptoms',
              explanation.symptoms.join('\n• '),
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  if (!riskAssessment) {
    return (
      <WebSafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading risk assessment...</Text>
        </View>
      </WebSafeAreaView>
    );
  }

  const overallRiskStyles = getOverallRiskStyles(riskAssessment.overallRisk);

  return (
    <WebSafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sleep Risk Assessment</Text>
          <Text style={styles.headerSubtitle}>
            Monitor your risk factors for sleep disorders
          </Text>
        </View>

        {/* Overall Risk Summary */}
        <View style={[styles.overallRiskCard, overallRiskStyles.bg, overallRiskStyles.border]}>
          <Text style={styles.overallRiskTitle}>Overall Risk Level</Text>
          <Text style={[styles.overallRiskValue, overallRiskStyles.text]}>{riskAssessment.overallRisk}</Text>
          <Text style={styles.overallRiskSubtitle}>
            Based on your recent sleep patterns and health indicators
          </Text>
        </View>

        {/* Individual Risk Factors */}
        <View style={styles.riskFactorsSection}>
          <Text style={styles.sectionTitle}>Risk Factors</Text>
          
          {/* Apnea Risk */}
          <TouchableOpacity
            onPress={() => showRiskExplanation('apnea')}
            style={styles.riskFactorCard}
            activeOpacity={0.7}
          >
            <View style={styles.riskFactorHeader}>
              <Text style={styles.riskFactorTitle}>Sleep Apnea Risk</Text>
              <Text style={styles.riskFactorIcon}>😴</Text>
            </View>
            
            <View style={styles.riskFactorContent}>
              <View style={styles.riskLevelRow}>
                <Text style={styles.riskLevelLabel}>Risk Level</Text>
                <Text style={[styles.riskLevelValue, getRiskLevel(riskAssessment.apneaLikelihood).color]}>
                  {getRiskLevel(riskAssessment.apneaLikelihood).level}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    getRiskLevel(riskAssessment.apneaLikelihood).bg,
                    { width: `${riskAssessment.apneaLikelihood}%` }
                  ]}
                />
              </View>
              <Text style={styles.riskPercentage}>
                {riskAssessment.apneaLikelihood}% likelihood
              </Text>
            </View>
            
            <Text style={styles.riskFactorDescription}>
              Tap to learn more about sleep apnea symptoms and risk factors
            </Text>
          </TouchableOpacity>

          {/* Snoring Severity */}
          <TouchableOpacity
            onPress={() => showRiskExplanation('snoring')}
            style={styles.riskFactorCard}
            activeOpacity={0.7}
          >
            <View style={styles.riskFactorHeader}>
              <Text style={styles.riskFactorTitle}>Snoring Severity</Text>
              <Text style={styles.riskFactorIcon}>😴</Text>
            </View>
            
            <View style={styles.riskFactorContent}>
              <View style={styles.riskLevelRow}>
                <Text style={styles.riskLevelLabel}>Severity Level</Text>
                <Text style={[styles.riskLevelValue, getRiskLevel(riskAssessment.snoringSeverity).color]}>
                  {getRiskLevel(riskAssessment.snoringSeverity).level}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    getRiskLevel(riskAssessment.snoringSeverity).bg,
                    { width: `${riskAssessment.snoringSeverity}%` }
                  ]}
                />
              </View>
              <Text style={styles.riskPercentage}>
                {riskAssessment.snoringSeverity}% severity
              </Text>
            </View>
            
            <Text style={styles.riskFactorDescription}>
              Tap to learn more about snoring and its health implications
            </Text>
          </TouchableOpacity>

          {/* Fragmentation Risk */}
          <TouchableOpacity
            onPress={() => showRiskExplanation('fragmentation')}
            style={styles.riskFactorCard}
            activeOpacity={0.7}
          >
            <View style={styles.riskFactorHeader}>
              <Text style={styles.riskFactorTitle}>Sleep Fragmentation</Text>
              <Text style={styles.riskFactorIcon}>🔄</Text>
            </View>
            
            <View style={styles.riskFactorContent}>
              <View style={styles.riskLevelRow}>
                <Text style={styles.riskLevelLabel}>Risk Level</Text>
                <Text style={[styles.riskLevelValue, getRiskLevel(riskAssessment.fragmentationRisk).color]}>
                  {getRiskLevel(riskAssessment.fragmentationRisk).level}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    getRiskLevel(riskAssessment.fragmentationRisk).bg,
                    { width: `${riskAssessment.fragmentationRisk}%` }
                  ]}
                />
              </View>
              <Text style={styles.riskPercentage}>
                {riskAssessment.fragmentationRisk}% risk
              </Text>
            </View>
            
            <Text style={styles.riskFactorDescription}>
              Tap to learn more about sleep fragmentation and its effects
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Items */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Recommended Actions</Text>
          
          {riskAssessment.overallRisk === 'High' && (
            <View style={styles.highRiskAction}>
              <Text style={styles.highRiskActionTitle}>🚨 High Risk - Immediate Action Required</Text>
              <Text style={styles.highRiskActionText}>
                • Schedule a consultation with a sleep specialist{'\n'}
                • Consider a sleep study (polysomnography){'\n'}
                • Monitor symptoms closely{'\n'}
                • Review your recommendations tab for optimization strategies
              </Text>
            </View>
          )}
          
          {riskAssessment.overallRisk === 'Medium' && (
            <View style={styles.mediumRiskAction}>
              <Text style={styles.mediumRiskActionTitle}>⚠️ Medium Risk - Monitor & Optimize</Text>
              <Text style={styles.mediumRiskActionText}>
                • Implement sleep optimization recommendations{'\n'}
                • Track your sleep patterns for 2-4 weeks{'\n'}
                • Consider consulting a healthcare provider if symptoms persist{'\n'}
                • Focus on sleep hygiene improvements
              </Text>
            </View>
          )}
          
          {riskAssessment.overallRisk === 'Low' && (
            <View style={styles.lowRiskAction}>
              <Text style={styles.lowRiskActionTitle}>✅ Low Risk - Maintain Good Habits</Text>
              <Text style={styles.lowRiskActionText}>
                • Continue your current sleep routine{'\n'}
                • Check recommendations for potential improvements{'\n'}
                • Regular monitoring to maintain low risk status{'\n'}
                • Focus on preventive measures
              </Text>
            </View>
          )}
        </View>

        {/* Prevention Tips */}
        <View style={styles.preventionSection}>
          <Text style={styles.sectionTitle}>Prevention Tips</Text>
          <View style={styles.preventionList}>
            <View style={styles.preventionCard}>
              <Text style={styles.preventionTitle}>🌙 Sleep Hygiene</Text>
              <Text style={styles.preventionDescription}>
                Maintain a consistent sleep schedule, create a relaxing bedtime routine, 
                and optimize your sleep environment.
              </Text>
            </View>
            
            <View style={styles.preventionCard}>
              <Text style={styles.preventionTitle}>🏥 Regular Check-ups</Text>
              <Text style={styles.preventionDescription}>
                Schedule regular health check-ups and discuss any sleep concerns 
                with your healthcare provider.
              </Text>
            </View>
            
            <View style={styles.preventionCard}>
              <Text style={styles.preventionTitle}>📱 Continuous Monitoring</Text>
              <Text style={styles.preventionDescription}>
                Use this app to track your sleep patterns and identify 
                early warning signs of potential issues.
              </Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerSection}>
          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerText}>
              ⚠️ This risk assessment is for informational purposes only and should not 
              replace professional medical advice. Always consult with a healthcare provider 
              for proper diagnosis and treatment of sleep disorders.
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
  overallRiskCard: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  overallRiskTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.white,
  },
  overallRiskValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  overallRiskSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    color: colors.white,
  },
  riskFactorsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  riskFactorCard: {
    marginBottom: 16,
  },
  riskFactorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  riskFactorTitle: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 18,
  },
  riskFactorIcon: {
    fontSize: 24,
  },
  riskFactorContent: {
    marginBottom: 12,
  },
  riskLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  riskLevelLabel: {
    color: colors.gray[400],
    fontSize: 14,
  },
  riskLevelValue: {
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    backgroundColor: colors.gray[700],
    borderRadius: 4,
    height: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  riskPercentage: {
    color: colors.gray[400],
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  riskFactorDescription: {
    color: colors.gray[300],
    fontSize: 14,
  },
  actionsSection: {
    marginBottom: 24,
  },
  highRiskAction: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  highRiskActionTitle: {
    color: colors.red,
    fontWeight: '600',
    marginBottom: 8,
  },
  highRiskActionText: {
    color: colors.red,
    fontSize: 14,
  },
  mediumRiskAction: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  mediumRiskActionTitle: {
    color: colors.yellow,
    fontWeight: '600',
    marginBottom: 8,
  },
  mediumRiskActionText: {
    color: colors.yellow,
    fontSize: 14,
  },
  lowRiskAction: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  lowRiskActionTitle: {
    color: colors.green,
    fontWeight: '600',
    marginBottom: 8,
  },
  lowRiskActionText: {
    color: colors.green,
    fontSize: 14,
  },
  preventionSection: {
    marginBottom: 24,
  },
  preventionList: {
    gap: 12,
  },
  preventionCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderWidth: 1,
    borderColor: colors.gray[700],
    borderRadius: 8,
    padding: 16,
  },
  preventionTitle: {
    color: colors.white,
    fontWeight: '500',
    marginBottom: 8,
  },
  preventionDescription: {
    color: colors.gray[400],
    fontSize: 14,
  },
  disclaimerSection: {
    marginBottom: 24,
  },
  disclaimerCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    borderWidth: 1,
    borderColor: colors.gray[700],
    borderRadius: 8,
    padding: 16,
  },
  disclaimerText: {
    color: colors.gray[400],
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
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
  // Risk level styles
  highRiskText: {
    color: colors.red,
  },
  highRiskBg: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
  },
  highRiskBorder: {
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  mediumRiskText: {
    color: colors.yellow,
  },
  mediumRiskBg: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
  },
  mediumRiskBorder: {
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  lowRiskText: {
    color: colors.green,
  },
  lowRiskBg: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
  },
  lowRiskBorder: {
    borderColor: 'rgba(5, 150, 105, 0.3)',
  },
  defaultRiskText: {
    color: colors.gray[400],
  },
  defaultRiskBg: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  defaultRiskBorder: {
    borderColor: 'rgba(107, 114, 128, 0.3)',
  },
});
