import React from 'react';import { View, Text, ScrollView, StyleSheet } from 'react-native';import { SafeAreaView } from 'react-native-safe-area-context';const AgentScreen = () => {  return (    <SafeAreaView style={styles.container}>      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>        {/* Header */}        <View style={styles.header}>          <Text style={styles.title}>🤖 RL Agent</Text>          <Text style={styles.subtitle}>Environment Optimizer</Text>        </View>        {/* Environment Controls */}        <View style={styles.section}>          <Text style={styles.sectionTitle}>Current Environment</Text>                    <View style={styles.environmentGrid}>            <EnvironmentCard              icon="🌡️"
              title="Temperature"
              currentValue="22°C"
              targetValue="20°C"
              status="high"
            />
            <EnvironmentCard
              icon="🔊"
              title="Noise Level"
              currentValue="45 dB"
              targetValue="30 dB"
              status="high"
            />
            <EnvironmentCard
              icon="💡"
              title="Light"
              currentValue="15 lux"
              targetValue="10 lux"
              status="medium"
            />
            <EnvironmentCard
              icon="💧"
              title="Humidity"
              currentValue="45%"
              targetValue="50%"
              status="low"
            />
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Recommendations</Text>
          
          <View style={styles.recommendationsList}>
            <RecommendationCard
              priority="high"
              title="Lower Room Temperature"
              description="Reduce temperature by 2°C for optimal sleep"
              action="Set thermostat to 20°C"
            />
            <RecommendationCard
              priority="medium"
              title="Reduce Noise"
              description="High noise levels detected at bedtime"
              action="Enable white noise at 30dB"
            />
            <RecommendationCard
              priority="low"
              title="Increase Humidity"
              description="Air is slightly dry for optimal breathing"
              action="Turn on humidifier"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface EnvironmentCardProps {
  icon: string;
  title: string;
  currentValue: string;
  targetValue: string;
  status: 'low' | 'medium' | 'high';
}

const EnvironmentCard: React.FC<EnvironmentCardProps> = ({ 
  icon, title, currentValue, targetValue, status 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#94a3b8';
    }
  };

  return (
    <View style={styles.environmentCard}>
      <Text style={styles.environmentIcon}>{icon}</Text>
      <Text style={styles.environmentTitle}>{title}</Text>
      <Text style={[styles.environmentCurrent, { color: getStatusColor() }]}>
        {currentValue}
      </Text>
      <Text style={styles.environmentTarget}>Target: {targetValue}</Text>
    </View>
  );
};

interface RecommendationCardProps {
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  priority, title, description, action
}) => {
  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#94a3b8';
    }
  };

  return (
    <View style={styles.recommendationCard}>
      <View style={styles.recommendationHeader}>
        <Text style={styles.recommendationTitle}>{title}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
          <Text style={styles.priorityText}>{priority.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.recommendationDescription}>{description}</Text>
      <Text style={styles.recommendationAction}>💡 {action}</Text>
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
  environmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  environmentCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
  },
  environmentIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  environmentTitle: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  environmentCurrent: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  environmentTarget: {
    color: '#64748b',
    fontSize: 10,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  recommendationDescription: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  recommendationAction: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AgentScreen;
