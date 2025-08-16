import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RisksScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>⚠️ Sleep Risks</Text>
          <Text style={styles.subtitle}>Health Assessment</Text>
        </View>

        {/* Risk Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Assessment</Text>
          
          <View style={styles.riskOverview}>
            <View style={styles.overallRisk}>
              <Text style={styles.overallRiskText}>MODERATE</Text>
              <Text style={styles.overallRiskSubtext}>Overall Risk Level</Text>
            </View>
          </View>
        </View>

        {/* Risk Gauges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disorder Likelihood</Text>
          
          <View style={styles.riskGauges}>
            <RiskGauge
              title="Sleep Apnea"
              percentage={35}
              severity="medium"
              description="Moderate risk based on snoring patterns"
            />
            <RiskGauge
              title="Snoring Severity"
              percentage={60}
              severity="high"
              description="Frequent loud snoring detected"
            />
            <RiskGauge
              title="Sleep Fragmentation"
              percentage={25}
              severity="low"
              description="Occasional sleep disruptions"
            />
            <RiskGauge
              title="Insomnia Risk"
              percentage={15}
              severity="low"
              description="Good sleep initiation and maintenance"
            />
          </View>
        </View>

        {/* Educational Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learn More</Text>
          
          <View style={styles.educationCards}>
            <EducationCard
              title="What is Sleep Apnea?"
              description="Learn about symptoms, causes, and treatment options"
              severity="high"
            />
            <EducationCard
              title="Reducing Snoring"
              description="Tips and techniques to minimize snoring"
              severity="medium"
            />
            <EducationCard
              title="Sleep Hygiene"
              description="Best practices for quality sleep"
              severity="low"
            />
          </View>
        </View>

        {/* Action Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Actions</Text>
          
          <View style={styles.actionItems}>
            <ActionItem
              priority="high"
              action="Consult a sleep specialist"
              description="Consider professional evaluation for sleep apnea"
            />
            <ActionItem
              priority="medium"
              action="Try sleeping position changes"
              description="Sleep on your side to reduce snoring"
            />
            <ActionItem
              priority="low"
              action="Monitor progress"
              description="Continue tracking with SleepPilot"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface RiskGaugeProps {
  title: string;
  percentage: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ title, percentage, severity, description }) => {
  const getSeverityColor = () => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#94a3b8';
    }
  };

  return (
    <View style={styles.riskGauge}>
      <View style={styles.gaugeHeader}>
        <Text style={styles.gaugeTitle}>{title}</Text>
        <Text style={[styles.gaugePercentage, { color: getSeverityColor() }]}>
          {percentage}%
        </Text>
      </View>
      <View style={styles.gaugeBar}>
        <View 
          style={[
            styles.gaugeProgress, 
            { 
              width: `${percentage}%`, 
              backgroundColor: getSeverityColor() 
            }
          ]} 
        />
      </View>
      <Text style={styles.gaugeDescription}>{description}</Text>
    </View>
  );
};

interface EducationCardProps {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

const EducationCard: React.FC<EducationCardProps> = ({ title, description, severity }) => (
  <TouchableOpacity style={styles.educationCard}>
    <Text style={styles.educationTitle}>{title}</Text>
    <Text style={styles.educationDescription}>{description}</Text>
    <Text style={styles.educationAction}>Tap to learn more →</Text>
  </TouchableOpacity>
);

interface ActionItemProps {
  priority: 'low' | 'medium' | 'high';
  action: string;
  description: string;
}

const ActionItem: React.FC<ActionItemProps> = ({ priority, action, description }) => {
  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#94a3b8';
    }
  };

  return (
    <View style={styles.actionItem}>
      <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor() }]} />
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{action}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
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
  riskOverview: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  overallRisk: {
    alignItems: 'center',
  },
  overallRiskText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 4,
  },
  overallRiskSubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  riskGauges: {
    gap: 16,
  },
  riskGauge: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gaugeTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  gaugePercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gaugeBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    marginBottom: 8,
  },
  gaugeProgress: {
    height: '100%',
    borderRadius: 4,
  },
  gaugeDescription: {
    color: '#94a3b8',
    fontSize: 12,
  },
  educationCards: {
    gap: 12,
  },
  educationCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  educationTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  educationDescription: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  educationAction: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: '500',
  },
  actionItems: {
    gap: 12,
  },
  actionItem: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    color: '#94a3b8',
    fontSize: 14,
  },
});

export default RisksScreen;
