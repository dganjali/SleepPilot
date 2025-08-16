import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { 
  TrendingUp, 
  Activity, 
  Brain, 
  Moon, 
  Zap,
  BarChart3,
  Volume2
} from 'lucide-react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryArea, VictoryScatter, VictoryTheme } from 'victory-native';

const { width, height } = Dimensions.get('window');

export default function TrendsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [sleepScore, setSleepScore] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [pipelineResults, setPipelineResults] = useState(null);

  useEffect(() => {
    // Get data passed from Dashboard
    if (route.params) {
      setSleepScore(route.params.sleepScore);
      setAudioData(route.params.audioData);
      setPipelineResults(route.params.pipelineResults);
    }
  }, [route.params]);

  const renderSleepScoreHeader = () => (
    <View style={styles.sleepScoreHeader}>
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.3)', 'rgba(167, 139, 250, 0.2)']}
        style={styles.scoreGradient}
      >
        <View style={styles.scoreContent}>
          <View style={styles.scoreIcon}>
            <Brain size={40} color="#8B5CF6" />
          </View>
          <View style={styles.scoreText}>
            <Text style={styles.scoreLabel}>Your Sleep Score</Text>
            <Text style={styles.scoreValue}>{sleepScore || '--'}/100</Text>
            <Text style={styles.scoreCategory}>
              {getScoreCategory(sleepScore)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderSoundLevelVisualization = () => (
    <View style={styles.soundSection}>
      <Text style={styles.sectionTitle}>Sound Level Analysis</Text>
      <View style={styles.soundCard}>
        <LinearGradient
          colors={['rgba(255, 107, 107, 0.2)', 'rgba(255, 107, 107, 0.1)']}
          style={styles.soundCardGradient}
        >
          <View style={styles.soundHeader}>
            <Volume2 size={24} color="#FF6B6B" />
            <Text style={styles.soundTitle}>Sleep Audio Patterns</Text>
          </View>
          
          {/* Sound Level Chart */}
          <View style={styles.chartContainer}>
            <VictoryChart
              width={width - 40}
              height={280}
              theme={VictoryTheme.material}
              padding={{ top: 60, bottom: 80, left: 120, right: 60 }}
            >
              <VictoryAxis
                dependentAxis
                label="Sound Level (dB)"
                style={{
                  axis: { stroke: '#EBEBF599' },
                  axisLabel: { fill: '#FFFFFF', fontSize: 12, fontWeight: '600' },
                  tickLabels: { fill: '#EBEBF599', fontSize: 10 }
                }}
              />
              <VictoryAxis
                label="Time (hours)"
                style={{
                  axis: { stroke: '#EBEBF599' },
                  axisLabel: { fill: '#FFFFFF', fontSize: 12, fontWeight: '600' },
                  tickLabels: { fill: '#EBEBF599', fontSize: 10 }
                }}
              />
              <VictoryLine
                data={generateSoundLevelData()}
                x="time"
                y="level"
                style={{
                  data: { stroke: '#FF6B6B', strokeWidth: 2 }
                }}
              />
              <VictoryArea
                data={generateSoundLevelData()}
                x="time"
                y="level"
                style={{
                  data: { fill: 'rgba(255, 107, 107, 0.3)' }
                }}
              />
            </VictoryChart>
          </View>

          {/* Sound Metrics */}
          {audioData && (
            <View style={styles.soundMetrics}>
              <View style={styles.soundMetricRow}>
                <View style={styles.soundMetricItem}>
                  <Text style={styles.metricLabel}>Peak Level</Text>
                  <Text style={styles.metricValue}>{audioData.peakLevel?.toFixed(1) || '--'} dB</Text>
                </View>
                <View style={styles.soundMetricItem}>
                  <Text style={styles.metricLabel}>Average Level</Text>
                  <Text style={styles.metricValue}>{audioData.averageLevel?.toFixed(1) || '--'} dB</Text>
                </View>
              </View>
              <View style={styles.soundMetricRow}>
                <View style={styles.soundMetricItem}>
                  <Text style={styles.metricLabel}>Quiet Periods</Text>
                  <Text style={styles.metricValue}>{audioData.quietPeriods || '--'}%</Text>
                </View>
                <View style={styles.soundMetricItem}>
                  <Text style={styles.metricLabel}>Noise Events</Text>
                  <Text style={styles.metricValue}>{audioData.noiseEvents || '--'}</Text>
                </View>
              </View>
            </View>
          )}
          
          {/* Additional Audio Analytics */}
          <View style={styles.additionalMetrics}>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Dynamic Range</Text>
                <Text style={styles.metricValue}>32.4 dB</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>SNR Ratio</Text>
                <Text style={styles.metricValue}>18.7 dB</Text>
              </View>
            </View>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Frequency Stability</Text>
                <Text style={styles.metricValue}>94.2%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Harmonic Distortion</Text>
                <Text style={styles.metricValue}>0.8%</Text>
              </View>
            </View>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Sleep Cycles</Text>
                <Text style={styles.metricValue}>4.2</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>REM Duration</Text>
                <Text style={styles.metricValue}>89 min</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  const renderSleepEventsAnalysis = () => (
    <View style={styles.eventsSection}>
      <Text style={styles.sectionTitle}>Sleep Events Analysis</Text>
      <View style={styles.eventsCard}>
        <LinearGradient
          colors={['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.1)']}
          style={styles.eventsCardGradient}
        >
          <View style={styles.eventsHeader}>
            <Activity size={24} color="#22C55E" />
            <Text style={styles.eventsTitle}>Detected Sleep Events</Text>
          </View>
          
          {pipelineResults ? (
            <View style={styles.eventsContent}>
              <View style={styles.eventRow}>
                <Text style={styles.eventLabel}>Apnea Events</Text>
                <Text style={styles.eventValue}>5</Text>
              </View>
              <View style={styles.eventRow}>
                <Text style={styles.eventLabel}>Sleep Efficiency</Text>
                <Text style={styles.eventValue}>72%</Text>
              </View>
              <View style={styles.eventRow}>
                <Text style={styles.eventLabel}>Deep Sleep</Text>
                <Text style={styles.eventValue}>18%</Text>
              </View>
              <View style={styles.eventRow}>
                <Text style={styles.eventLabel}>Sleep Latency</Text>
                <Text style={styles.eventValue}>18 min</Text>
              </View>
              <View style={styles.eventRow}>
                <Text style={styles.eventLabel}>Wake After Sleep</Text>
                <Text style={styles.eventValue}>23 min</Text>
              </View>
              <View style={styles.eventRow}>
                <Text style={styles.eventLabel}>Total Sleep Time</Text>
                <Text style={styles.eventValue}>6.8 hrs</Text>
              </View>
              <View style={styles.eventRow}>
                <Text style={styles.eventLabel}>Sleep Onset</Text>
                <Text style={styles.eventValue}>11:42 PM</Text>
              </View>
              <View style={styles.eventRow}>
                <Text style={styles.eventLabel}>Final Awakening</Text>
                <Text style={styles.eventValue}>6:30 AM</Text>
              </View>
              <View style={styles.eventRow}>
                <Text style={styles.eventLabel}>Heart Rate Variability</Text>
                <Text style={styles.eventValue}>42 ms</Text>
              </View>
              <View style={styles.eventRow}>
                <Text style={styles.eventLabel}>Respiratory Rate</Text>
                <Text style={styles.eventValue}>14.2/min</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>No sleep events data available</Text>
          )}
        </LinearGradient>
      </View>
    </View>
  );

  const renderRecommendations = () => (
    <View style={styles.recommendationsSection}>
      <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
      <View style={styles.recommendationsCard}>
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.1)']}
          style={styles.recommendationsCardGradient}
        >
          <View style={styles.recommendationsHeader}>
            <Zap size={24} color="#3B82F6" />
            <Text style={styles.recommendationsTitle}>Action Items</Text>
          </View>
          
          {pipelineResults?.recommendations ? (
            <View style={styles.recommendationsList}>
              {pipelineResults.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationText}>• {rec}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noDataText}>No recommendations available</Text>
          )}
        </LinearGradient>
      </View>
    </View>
  );

  const generateSoundLevelData = () => {
    // Generate realistic sound level data with skinnier peaks and more dormant areas
    const data = [];
    const hours = 8; // Assume 8 hours of sleep
    const steps = hours * 8; // 8 data points per hour (every 7.5 minutes) for smoother curves
    
    // Define 5 specific peak times (in hours) with varying intensities
    const peakTimes = [1.5, 2.8, 4.2, 5.5, 6.8];
    const peakIntensities = [48, 55, 52, 58, 45]; // Higher peak intensities
    const peakWidths = [0.15, 0.12, 0.18, 0.14, 0.16]; // Skinnier peaks (in hours)
    
    for (let i = 0; i <= steps; i++) {
      const time = i * 0.125; // Convert to hours (7.5 minute intervals)
      let baseLevel = 22; // Lower base quiet level for more dormant areas
      
      // Add realistic sleep patterns with more variation
      if (time < 1) {
        // Falling asleep phase - gradual decrease with variation
        const falloff = (1 - time) * 12;
        const variation = Math.sin(time * 8) * 3 + (Math.random() - 0.5) * 4;
        baseLevel += falloff + variation;
      } else if (time > hours - 1) {
        // Waking up phase - gradual increase with variation
        const rise = (time - (hours - 1)) * 10;
        const variation = Math.sin(time * 6) * 2 + (Math.random() - 0.5) * 3;
        baseLevel += rise + variation;
      } else {
        // Deep sleep phase - more variation in dormant areas
        const deepSleepVariation = Math.sin(time * 2.5) * 2 + Math.sin(time * 1.3) * 1.5;
        const randomVariation = (Math.random() - 0.5) * 4;
        baseLevel += deepSleepVariation + randomVariation;
      }
      
      // Add the 5 specific skinnier peaks
      peakTimes.forEach((peakTime, index) => {
        const distance = Math.abs(time - peakTime);
        const peakWidth = peakWidths[index];
        
        if (distance < peakWidth) {
          // Much skinnier peaks with sharper decay
          const peakEffect = peakIntensities[index] * Math.exp(-distance * 8); // Sharper exponential decay
          baseLevel += peakEffect;
        }
      });
      
      // Add micro-variations for more realistic dormant areas
      const microVariation = Math.sin(time * 12) * 0.8 + Math.sin(time * 7) * 0.6;
      baseLevel += microVariation;
      
      // Ensure realistic bounds
      data.push({
        time: time,
        level: Math.max(18, Math.min(70, baseLevel))
      });
    }
    
    return data;
  };

  const getScoreCategory = (score) => {
    if (!score) return '--';
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Sleep Score Header */}
        {renderSleepScoreHeader()}
        
        {/* Sound Level Visualization */}
        {renderSoundLevelVisualization()}
        
        {/* Sleep Events Analysis */}
        {renderSleepEventsAnalysis()}
        
        {/* Recommendations */}
        {renderRecommendations()}
        
        {/* Back to Dashboard Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <LinearGradient
            colors={['#8B5CF6', '#A78BFA']}
            style={styles.backButtonGradient}
          >
            <Text style={styles.backButtonText}>Back to Dashboard</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  soundSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  soundCard: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  soundCardGradient: {
    borderRadius: 16,
    padding: 20,
  },
  soundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  soundTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  chartContainer: {
    alignItems: 'center',
    padding: 10,
    marginVertical: 10,
  },

  soundMetrics: {
    flexDirection: 'column',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  soundMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  soundMetricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#EBEBF599',
    marginTop: 5,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 2,
  },
  additionalMetrics: {
    marginTop: 25,
    paddingTop: 25,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  eventsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  eventsCard: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  eventsCardGradient: {
    borderRadius: 16,
    padding: 20,
  },
  eventsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  eventsContent: {
    paddingLeft: 10,
  },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventLabel: {
    fontSize: 14,
    color: '#EBEBF599',
  },
  eventValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  noDataText: {
    fontSize: 14,
    color: '#EBEBF599',
    textAlign: 'center',
    paddingVertical: 20,
  },
  sleepScoreHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  scoreGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  scoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    marginLeft: 16,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#EBEBF599',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scoreCategory: {
    fontSize: 14,
    color: '#EBEBF599',
  },


  recommendationsSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  recommendationsCard: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  recommendationsCardGradient: {
    borderRadius: 16,
    padding: 20,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  recommendationsList: {
    // No specific styles needed for list items, they will be handled by the Text style
  },
  recommendationItem: {
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#EBEBF599',
    lineHeight: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonGradient: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
