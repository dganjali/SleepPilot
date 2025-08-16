import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';

const DashboardScreen = () => {
  const { sleepScore, sleepMetrics, isRecording, setIsRecording } = useAppStore();

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good Evening</Text>
          <Text style={styles.subGreeting}>Ready for quality sleep?</Text>
        </View>

        {/* Sleep Score Gauge */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep Score</Text>
          <View style={styles.gaugeContainer}>
            <Text style={styles.scoreText}>{sleepScore.overall}</Text>
            <Text style={styles.scoreLabel}>Overall Score</Text>
            <View style={styles.scoreDetails}>
              <ScoreDetail label="Efficiency" value={sleepScore.efficiency} />
              <ScoreDetail label="Duration" value={sleepScore.duration} />
              <ScoreDetail label="Quality" value={sleepScore.quality} />
            </View>
          </View>
        </View>

        {/* Audio Monitoring */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Monitoring</Text>
          <TouchableOpacity style={styles.soundwaveBox} onPress={toggleRecording}>
            <Text style={styles.soundwaveIcon}>
              {isRecording ? '🔴' : '🎤'}
            </Text>
            <Text style={styles.soundwaveText}>
              {isRecording ? 'Recording in progress...' : 'Tap to start monitoring'}
            </Text>
            {isRecording && (
              <View style={styles.waveform}>
                <View style={[styles.wave, { height: 20 }]} />
                <View style={[styles.wave, { height: 35 }]} />
                <View style={[styles.wave, { height: 15 }]} />
                <View style={[styles.wave, { height: 40 }]} />
                <View style={[styles.wave, { height: 25 }]} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Metrics Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep Metrics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Snoring Intensity"
              value={sleepMetrics.snoringIntensity}
              unit="%"
              color="#f59e0b"
              icon="🔊"
            />
            <MetricCard
              title="Apnea Risk"
              value={sleepMetrics.apneaRisk}
              unit="%"
              color="#ef4444"
              icon="⚠️"
            />
            <MetricCard
              title="Fragmentation"
              value={sleepMetrics.fragmentation}
              unit="%"
              color="#8b5cf6"
              icon="📊"
            />
            <MetricCard
              title="Restlessness"
              value={sleepMetrics.restlessness}
              unit="%"
              color="#06b6d4"
              icon="🔄"
            />
          </View>
        </View>

        {/* Status Banner */}
        <View style={styles.section}>
          <View style={styles.statusBanner}>
            <Text style={styles.statusIcon}>⚠️</Text>
            <Text style={styles.statusText}>
              Monitor tonight for sleep apnea patterns
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  color: string;
  icon: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, color, icon }) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricIcon}>{icon}</Text>
    <Text style={styles.metricTitle}>{title}</Text>
    <Text style={[styles.metricValue, { color }]}>
      {value}{unit}
    </Text>
  </View>
);

interface ScoreDetailProps {
  label: string;
  value: number;
}

const ScoreDetail: React.FC<ScoreDetailProps> = ({ label, value }) => (
  <View style={styles.scoreDetailItem}>
    <Text style={styles.scoreDetailLabel}>{label}</Text>
    <Text style={styles.scoreDetailValue}>{value}</Text>
  </View>
);

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
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subGreeting: {
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
  gaugeContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10b981',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
    marginBottom: 16,
  },
  scoreDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  scoreDetailItem: {
    alignItems: 'center',
  },
  scoreDetailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  scoreDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  soundwaveBox: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  soundwaveIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  soundwaveText: {
    color: '#6366f1',
    fontSize: 16,
    marginBottom: 16,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  wave: {
    width: 4,
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricTitle: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusBanner: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    flex: 1,
  },
});

export default DashboardScreen;
