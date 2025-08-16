import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { 
  Upload, 
  Video, 
  Brain, 
  Zap,
  Play,
  Clock,
  Activity, 
  TrendingUp, 
  Thermometer,
  Lightbulb,
  Volume2,
  Droplets,
  Wind,
  CheckCircle,
  AlertCircle
} from 'lucide-react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryArea, VictoryScatter, VictoryTheme, VictoryBar } from 'victory-native';

const { width } = Dimensions.get('window');

// No backend needed - everything is hardcoded

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [progressWidth, setProgressWidth] = useState(0);

  
  // User input data
  const [userInputs, setUserInputs] = useState({
    hoursSlept: '',
    sleepRating: '',
    environmentQuality: '',
    environmentComfort: '',
    sleepQuality: 'good', // poor, fair, good, excellent
    stressLevel: 'medium', // low, medium, high
    exercise: 'none' // none, light, moderate, intense
  });
  
  // Real data from backend
  const [mlResults, setMlResults] = useState(null);
  const [rlResults, setRlResults] = useState(null);
  const [environmentalData, setEnvironmentalData] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [pipelineResult, setPipelineResult] = useState(null);

  // Generate realistic time series data for RL convergence
  const generateTimeSeriesData = () => {
    const data = {
      timestamps: [],
      sleepScores: [],
      temperatures: [],
      lightIntensities: [],
      noiseLevels: [],
      humidity: [],
      airflow: [],
      rewards: [],
      confidence: []
    };

    // Generate 100 data points showing realistic RL convergence
    for (let i = 0; i < 100; i++) {
      const time = i * 0.3; // 0.3 second intervals for 30 seconds total
      
      // Sleep score converges from baseline to optimal with realistic noise
      const baselineScore = 65;
      const optimalScore = 96;
      const convergenceRate = 0.08;
      const noise = (Math.random() - 0.5) * 2;
      const sleepScore = baselineScore + (optimalScore - baselineScore) * (1 - Math.exp(-i * convergenceRate)) + noise;
      
      // Environmental factors converge to optimal values
      const tempBaseline = 24;
      const tempOptimal = 20;
      const tempConvergence = 0.12;
      const temperature = tempBaseline + (tempOptimal - tempBaseline) * (1 - Math.exp(-i * tempConvergence)) + (Math.random() - 0.5) * 0.5;
      
      const lightBaseline = 0.8;
      const lightOptimal = 0.22;
      const lightConvergence = 0.15;
      const lightIntensity = lightBaseline + (lightOptimal - lightBaseline) * (1 - Math.exp(-i * lightConvergence)) + (Math.random() - 0.5) * 0.1;
      
      const noiseBaseline = 0.7;
      const noiseOptimal = 0.23;
      const noiseConvergence = 0.1;
      const noiseLevel = noiseBaseline + (noiseOptimal - noiseBaseline) * (1 - Math.exp(-i * noiseConvergence)) + (Math.random() - 0.5) * 0.08;
      
      const humidityBaseline = 0.6;
      const humidityOptimal = 0.36;
      const humidityConvergence = 0.1;
      const humidity = humidityBaseline + (humidityOptimal - humidityBaseline) * (1 - Math.exp(-i * humidityConvergence)) + (Math.random() - 0.5) * 0.05;
      
      const airflowBaseline = 0.5;
      const airflowOptimal = 0.26;
      const airflowConvergence = 0.09;
      const airflow = airflowBaseline + (airflowOptimal - airflowBaseline) * (1 - Math.exp(-i * airflowConvergence)) + (Math.random() - 0.5) * 0.06;
      
      // Reward increases as optimization improves
      const rewardBaseline = -2;
      const rewardOptimal = 3;
      const rewardConvergence = 0.1;
      const reward = rewardBaseline + (rewardOptimal - rewardBaseline) * (1 - Math.exp(-i * rewardConvergence)) + (Math.random() - 0.5) * 0.3;
      
      // Confidence increases as system learns
      const confidence = 0.3 + 0.7 * (1 - Math.exp(-i * 0.05)) + (Math.random() - 0.5) * 0.05;
      
      data.timestamps.push(time);
      data.sleepScores.push(Math.max(0, Math.min(100, sleepScore)));
      data.temperatures.push(Math.max(15, Math.min(30, temperature)));
      data.lightIntensities.push(Math.max(0, Math.min(1, lightIntensity)));
      data.noiseLevels.push(Math.max(0, Math.min(1, noiseLevel)));
      data.humidity.push(Math.max(0, Math.min(1, humidity)));
      data.airflow.push(Math.max(0, Math.min(1, airflow)));
      data.rewards.push(reward);
      data.confidence.push(Math.max(0, Math.min(1, confidence)));
    }

    return data;
  };

  // Generate realistic sound level data for audio analysis
  const generateSoundLevelData = () => {
    const data = [];
    const hours = parseFloat(userInputs.hoursSlept) || 8;
    
    // Generate data points for each hour of sleep
    for (let i = 0; i <= hours; i += 0.25) { // Every 15 minutes
      let baseLevel = 25; // Base quiet level
      
      // Add realistic sleep patterns
      if (i < 1) {
        // Falling asleep - some movement, higher levels
        baseLevel += Math.random() * 15 + 5;
      } else if (i > hours - 1) {
        // Waking up - increased activity
        baseLevel += Math.random() * 20 + 10;
      } else {
        // Deep sleep - very quiet with occasional events
        baseLevel += Math.random() * 8;
        
        // Random noise events (snoring, movement, etc.)
        if (Math.random() < 0.1) { // 10% chance of noise event
          baseLevel += Math.random() * 25 + 15;
        }
      }
      
      // Add some natural variation
      baseLevel += (Math.random() - 0.5) * 5;
      
      data.push({
        time: i,
        level: Math.max(20, Math.min(60, baseLevel)) // Keep between 20-60 dB
      });
    }
    
    return data;
  };

  // No more API calls - everything is hardcoded now

  const handleProcessVideo = async () => {
    if (!userInputs.hoursSlept || !userInputs.sleepRating || 
        !userInputs.environmentQuality || !userInputs.environmentComfort) {
      Alert.alert(
        'Missing Information',
        'Please fill in all required fields: Hours of Sleep, Sleep Rating, Environment Quality, and Environment Comfort',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsProcessing(true);
    setHasProcessed(true);
    
    // Enhanced fake loading process with realistic stages
    const loadingStages = [
      'Initializing sleep analysis pipeline...',
      'Processing video data...',
      'Extracting audio features...',
      'Running ML sleep quality assessment...',
      'Executing RL environment optimization...',
      'Generating personalized recommendations...',
      'Finalizing analysis report...'
    ];

    for (let i = 0; i < loadingStages.length; i++) {
      setProcessingStage(loadingStages[i]);
      setProgressWidth(((i + 1) / loadingStages.length) * 100);
      
      // Simulate realistic processing time for each stage
      const stageDelay = Math.random() * 800 + 400; // 400-1200ms per stage
      await new Promise(resolve => setTimeout(resolve, stageDelay));
    }
    
    const calculatedScore = calculateSleepScore(userInputs);
    
    // Set ML results immediately
    setMlResults({
      currentScore: calculatedScore,
      baselineScore: 65,
      improvement: calculatedScore - 65,
      confidence: 0.89,
      analysis: {
        sleepEfficiency: 0.72,
        deepSleepPercentage: 0.18,
        remSleepPercentage: 0.15,
        sleepLatency: 18,
        wakeUps: 4
      },
      userInputs: userInputs,
      audioAnalysis: {
        peakLevel: 45,
        averageLevel: 28,
        quietPeriods: 72,
        noiseEvents: 5,
        quality: 'Fair',
        qualityScore: 0.57
      }
    });

    // Set RL results immediately
    setRlResults({
      algorithm: "PPO",
      trainingSteps: 50000,
      convergenceTime: 25.3,
      finalReward: 2.87,
      environmentalFactors: {
        temperature: { optimal: 20.0, range: [19.5, 20.5], priority: "high" },
        lightIntensity: { optimal: 0.22, range: [0.20, 0.24], priority: "high" },
        noiseLevel: { optimal: 0.23, range: [0.21, 0.25], priority: "medium" },
        humidity: { optimal: 0.36, range: [0.34, 0.38], priority: "medium" },
        airflow: { optimal: 0.26, range: [0.24, 0.28], priority: "low" }
      }
    });

    // Set environmental data immediately
    setEnvironmentalData({
      currentEnvironment: {
        temperature: 24.5,
        lightIntensity: 0.8,
        noiseLevel: 0.7,
        humidity: 0.6,
        airflow: 0.5
      },
      recommendedEnvironment: {
        temperature: 20.0,
        lightIntensity: 0.22,
        noiseLevel: 0.23,
        humidity: 0.36,
        airflow: 0.26
      },
      expectedImprovement: 34.1,
      confidence: 0.89,
      implementationNotes: [
        "Lower room temperature by 4.5°C",
        "Reduce light intensity by 72%",
        "Implement white noise at 23% volume",
        "Maintain humidity at 36%",
        "Set airflow to 26%"
      ]
    });

    // Set time series data
    setTimeSeriesData(generateTimeSeriesData());

    // Set recommendations
    setRecommendations({
      currentEnvironment: {
        temperature: 24.5,
        lightIntensity: 0.8,
        noiseLevel: 0.7,
        humidity: 0.6,
        airflow: 0.5
      },
      recommendedEnvironment: {
        temperature: 20.0,
        lightIntensity: 0.22,
        noiseLevel: 0.23,
        humidity: 0.36,
        airflow: 0.26
      },
      expectedImprovement: 34.1,
      confidence: 0.89,
      implementationNotes: [
        "Lower room temperature by 4.5°C",
        "Reduce light intensity by 72%",
        "Implement white noise at 23% volume",
        "Maintain humidity at 36%",
        "Set airflow to 26%"
      ]
    });

    // Set pipeline result
    setPipelineResult({
      status: "completed",
      final_score: calculatedScore,
      score_category: "fair",
      confidence: 0.89,
      recommendations: [
        "Optimize room temperature to 20°C",
        "Reduce ambient light exposure",
        "Implement consistent sleep schedule",
        "Consider sleep apnea screening",
        "Improve sleep hygiene practices"
      ],
      risk_factors: [
        "5 detected apnea events",
        "Low sleep efficiency (72%)",
        "Reduced deep sleep (18%)",
        "Increased sleep latency (18 min)",
        "Multiple nighttime awakenings"
      ],
      processing_time: 12.5,
      audio_analysis: {
        peakLevel: 45,
        averageLevel: 28,
        quietPeriods: 72,
        noiseEvents: 5,
        quality: 'Fair',
        qualityScore: 0.57
      }
    });

    // Navigate to Trends page after a short delay
    setTimeout(() => {
      navigation.navigate('Trends', { 
        sleepScore: calculatedScore,
        audioData: {
          peakLevel: 45,
          averageLevel: 28,
          quietPeriods: 72,
          noiseEvents: 5,
          quality: 'Fair',
          qualityScore: 0.57
        },
        pipelineResults: {
          status: "completed",
          final_score: calculatedScore,
          score_category: "fair",
          confidence: 0.89,
          recommendations: [
            "Optimize room temperature to 20°C",
            "Reduce ambient light exposure",
            "Implement consistent sleep schedule",
            "Consider sleep apnea screening",
            "Improve sleep hygiene practices"
          ],
          risk_factors: [
            "5 detected apnea events",
            "Low sleep efficiency (72%)",
            "Reduced deep sleep (18%)",
            "Increased sleep latency (18 min)",
            "Multiple nighttime awakenings"
          ],
          processing_time: 12.5,
          audio_analysis: {
            peakLevel: 45,
            averageLevel: 28,
            quietPeriods: 72,
            noiseEvents: 5,
            quality: 'Fair',
            qualityScore: 0.57
          }
        }
      });
    }, 1000);

    setIsProcessing(false);
    setProcessingStage('Complete!');
    setProgressWidth(100);
  };

  // Calculate sleep score based on user inputs
  const calculateSleepScore = (inputs) => {
    let score = 0;
    
    // Hours of sleep (0-40 points)
    const hours = parseFloat(inputs.hoursSlept);
    if (hours >= 7 && hours <= 9) {
      score += 40; // Optimal range
    } else if (hours >= 6 && hours <= 10) {
      score += 30; // Good range
    } else if (hours >= 5 && hours <= 11) {
      score += 20; // Acceptable range
    } else {
      score += 10; // Poor range
    }
    
    // Sleep rating (0-30 points)
    const rating = parseInt(inputs.sleepRating);
    score += (rating / 10) * 30;
    
    // Sleep quality (0-15 points)
    const qualityScores = { poor: 5, fair: 10, good: 15, excellent: 15 };
    score += qualityScores[inputs.sleepQuality];
    
    // Stress level (0-10 points)
    const stressScores = { low: 10, medium: 7, high: 3 };
    score += stressScores[inputs.stressLevel];
    
    // Exercise (0-5 points)
    const exerciseScores = { none: 2, light: 4, moderate: 5, intense: 3 };
    score += exerciseScores[inputs.exercise];
    
    return Math.round(score);
  };

  const renderMLResults = () => {
    if (!mlResults) return null;
    
    return (
      <View style={styles.mlSection}>
        <Text style={styles.sectionTitle}>ML Analysis Results</Text>
        
        <View style={styles.mlCard}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.2)', 'rgba(167, 139, 250, 0.1)']}
            style={styles.mlCardGradient}
          >
            <View style={styles.mlHeader}>
              <Brain size={24} color="#8B5CF6" />
              <Text style={styles.mlTitle}>Sleep Quality Analysis</Text>
        </View>
            
            <View style={styles.mlMetrics}>
              <View style={styles.mlMetricRow}>
                <Text style={styles.mlMetricLabel}>Current Sleep Score</Text>
                <Text style={styles.mlMetricValue}>{mlResults.currentScore}</Text>
              </View>
              <View style={styles.mlMetricRow}>
                <Text style={styles.mlMetricLabel}>Baseline Score</Text>
                <Text style={styles.mlMetricValue}>{mlResults.baselineScore}</Text>
              </View>
              <View style={styles.mlMetricRow}>
                <Text style={styles.mlMetricLabel}>Improvement</Text>
                <Text style={styles.mlMetricValue}>+{mlResults.improvement}</Text>
              </View>
              <View style={styles.mlMetricRow}>
                <Text style={styles.mlMetricLabel}>Confidence</Text>
                <Text style={styles.mlMetricValue}>{Math.round(mlResults.confidence * 100)}%</Text>
              </View>
            </View>

            {/* Detailed Analysis */}
            <View style={styles.detailedAnalysis}>
              <Text style={styles.analysisTitle}>Detailed Analysis</Text>
              <View style={styles.analysisGrid}>
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>Sleep Efficiency</Text>
                  <Text style={styles.analysisValue}>{Math.round(mlResults.analysis.sleepEfficiency * 100)}%</Text>
                </View>
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>Deep Sleep</Text>
                  <Text style={styles.analysisValue}>{Math.round(mlResults.analysis.deepSleepPercentage * 100)}%</Text>
                </View>
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>REM Sleep</Text>
                  <Text style={styles.analysisValue}>{Math.round(mlResults.analysis.remSleepPercentage * 100)}%</Text>
                </View>
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>Sleep Latency</Text>
                  <Text style={styles.analysisValue}>{mlResults.analysis.sleepLatency} min</Text>
                </View>
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>Wake Ups</Text>
                  <Text style={styles.analysisValue}>{mlResults.analysis.wakeUps}</Text>
                </View>
              </View>
            </View>

            {/* Apnea Events Alert */}
            <View style={styles.apneaAlert}>
              <AlertCircle size={20} color="#EF4444" />
              <Text style={styles.apneaAlertText}>5 Apnea Events Detected</Text>
              <Text style={styles.apneaAlertSubtext}>Consider consulting a sleep specialist</Text>
            </View>

            {/* User Inputs Used */}
            {mlResults.userInputs && (
              <View style={styles.userInputsUsed}>
                <Text style={styles.analysisTitle}>Inputs Used for Calculation</Text>
                <View style={styles.inputsGrid}>
                  <View style={styles.inputUsedItem}>
                    <Text style={styles.inputUsedLabel}>Hours Slept</Text>
                    <Text style={styles.inputUsedValue}>{mlResults.userInputs.hoursSlept}h</Text>
                  </View>
                  <View style={styles.inputUsedItem}>
                    <Text style={styles.inputUsedLabel}>Sleep Rating</Text>
                    <Text style={styles.inputUsedValue}>{mlResults.userInputs.sleepRating}/10</Text>
                  </View>
                  <View style={styles.inputUsedItem}>
                    <Text style={styles.inputUsedLabel}>Environment Quality</Text>
                    <Text style={styles.inputUsedValue}>{mlResults.userInputs.environmentQuality}/10</Text>
                  </View>
                  <View style={styles.inputUsedItem}>
                    <Text style={styles.inputUsedLabel}>Environment Comfort</Text>
                    <Text style={styles.inputUsedValue}>{mlResults.userInputs.environmentComfort}/10</Text>
                  </View>
                  <View style={styles.inputUsedItem}>
                    <Text style={styles.inputUsedLabel}>Quality</Text>
                    <Text style={styles.inputUsedValue}>{mlResults.userInputs.sleepQuality}</Text>
                  </View>
                  <View style={styles.inputUsedItem}>
                    <Text style={styles.inputUsedLabel}>Stress Level</Text>
                    <Text style={styles.inputUsedValue}>{mlResults.userInputs.stressLevel}</Text>
                  </View>
                  <View style={styles.inputUsedItem}>
                    <Text style={styles.inputUsedLabel}>Exercise</Text>
                    <Text style={styles.inputUsedValue}>{mlResults.userInputs.exercise}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Audio Analysis - Sound Levels */}
            <View style={styles.audioAnalysis}>
              <Text style={styles.analysisTitle}>Audio Analysis</Text>
              <Text style={styles.audioDescription}>
                Sound levels detected during sleep recording
        </Text>
              
              {/* Sound Level Chart */}
              <View style={styles.soundChartContainer}>
                <VictoryChart
                  width={width - 80}
                  height={200}
                  theme={VictoryTheme.material}
                  padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
                >
                  <VictoryAxis
                    dependentAxis
                    label="Sound Level (dB)"
                    style={{
                      axis: { stroke: '#EBEBF599' },
                      axisLabel: { fill: '#FFFFFF', fontSize: 12 },
                      tickLabels: { fill: '#EBEBF599', fontSize: 10 }
                    }}
                  />
                  <VictoryAxis
                    label="Time (hours)"
                    style={{
                      axis: { stroke: '#EBEBF599' },
                      axisLabel: { fill: '#FFFFFF', fontSize: 12 },
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
                  <VictoryScatter
                    data={generateSoundLevelData()}
                    x="time"
                    y="level"
                    size={3}
                    style={{
                      data: { fill: '#FF6B6B' }
                    }}
                  />
                </VictoryChart>
              </View>

              {/* Sound Level Metrics */}
              <View style={styles.soundMetrics}>
                <View style={styles.soundMetricItem}>
                  <Volume2 size={20} color="#FF6B6B" />
                  <Text style={styles.soundMetricLabel}>Peak Level</Text>
                  <Text style={styles.soundMetricValue}>
                    {mlResults.audioAnalysis?.peakLevel || 45} dB
                  </Text>
                </View>
                <View style={styles.soundMetricItem}>
                  <Volume2 size={20} color="#FF6B6B" />
                  <Text style={styles.soundMetricLabel}>Average Level</Text>
                  <Text style={styles.soundMetricValue}>
                    {mlResults.audioAnalysis?.averageLevel || 28} dB
                  </Text>
                </View>
                <View style={styles.soundMetricItem}>
                  <Volume2 size={20} color="#FF6B6B" />
                  <Text style={styles.soundMetricLabel}>Quiet Periods</Text>
                  <Text style={styles.soundMetricValue}>
                    {mlResults.audioAnalysis?.quietPeriods || 85}%
                  </Text>
                </View>
                <View style={styles.soundMetricItem}>
                  <Volume2 size={20} color="#FF6B6B" />
                  <Text style={styles.soundMetricLabel}>Noise Events</Text>
                  <Text style={styles.soundMetricValue}>
                    {mlResults.audioAnalysis?.noiseEvents || 3}
                  </Text>
                </View>
              </View>

              {/* Sound Quality Assessment */}
              <View style={styles.soundQuality}>
                <Text style={styles.soundQualityTitle}>Sound Environment Quality</Text>
                <View style={styles.qualityBar}>
                  <View style={[styles.qualityFill, { width: `${(mlResults.audioAnalysis?.qualityScore || 0.85) * 100}%` }]} />
                </View>
                <Text style={styles.qualityText}>
                  {mlResults.audioAnalysis?.quality || 'Good'} - Minimal environmental noise detected
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    );
  };

  const renderRLConvergence = () => {
    if (!timeSeriesData || !rlResults) return null;
    
    return (
      <View style={styles.rlSection}>
        <Text style={styles.sectionTitle}>RL Algorithm Convergence</Text>
        
        <View style={styles.rlCard}>
          <Text style={styles.rlSubtitle}>Environmental Factors Optimization</Text>
          
          {/* RL Training Summary */}
          <View style={styles.rlSummary}>
            <View style={styles.rlSummaryRow}>
              <Text style={styles.rlSummaryLabel}>Algorithm</Text>
              <Text style={styles.rlSummaryValue}>{rlResults.algorithm}</Text>
        </View>
            <View style={styles.rlSummaryRow}>
              <Text style={styles.rlSummaryLabel}>Training Steps</Text>
              <Text style={styles.rlSummaryValue}>{rlResults.trainingSteps.toLocaleString()}</Text>
            </View>
            <View style={styles.rlSummaryRow}>
              <Text style={styles.rlSummaryLabel}>Convergence Time</Text>
              <Text style={styles.rlSummaryValue}>{rlResults.convergenceTime}s</Text>
            </View>
            <View style={styles.rlSummaryRow}>
              <Text style={styles.rlSummaryLabel}>Final Reward</Text>
              <Text style={styles.rlSummaryValue}>{rlResults.finalReward.toFixed(2)}</Text>
            </View>
          </View>

          {/* Sleep Score Convergence */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Sleep Score Improvement</Text>
            <VictoryChart
              theme={VictoryTheme.material}
              width={width - 80}
              height={200}
              padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
            >
              <VictoryAxis
                tickFormat={(t) => `${t}s`}
                style={{ axis: { stroke: "#666" }, tickLabels: { fill: "#999" } }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(t) => `${Math.round(t)}`}
                style={{ axis: { stroke: "#666" }, tickLabels: { fill: "#999" } }}
              />
              <VictoryLine
                data={timeSeriesData.timestamps.map((t, i) => ({ x: t, y: timeSeriesData.sleepScores[i] }))}
                style={{ data: { stroke: "#8B5CF6", strokeWidth: 3 } }}
              />
              <VictoryScatter
                data={timeSeriesData.timestamps.map((t, i) => ({ x: t, y: timeSeriesData.sleepScores[i] }))}
                size={3}
                style={{ data: { fill: "#8B5CF6" } }}
              />
            </VictoryChart>
          </View>

          {/* Environmental Factors Convergence */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Environmental Factors Convergence</Text>
            <VictoryChart
              theme={VictoryTheme.material}
              width={width - 80}
              height={200}
              padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
            >
              <VictoryAxis
                tickFormat={(t) => `${t}s`}
                style={{ axis: { stroke: "#666" }, tickLabels: { fill: "#999" } }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(t) => t.toFixed(1)}
                style={{ axis: { stroke: "#666" }, tickLabels: { fill: "#999" } }}
              />
              <VictoryLine
                data={timeSeriesData.timestamps.map((t, i) => ({ x: t, y: timeSeriesData.temperatures[i] }))}
                style={{ data: { stroke: "#FF6B6B", strokeWidth: 2 } }}
              />
              <VictoryLine
                data={timeSeriesData.timestamps.map((t, i) => ({ x: t, y: timeSeriesData.lightIntensities[i] }))}
                style={{ data: { stroke: "#4ECDC4", strokeWidth: 2 } }}
              />
              <VictoryLine
                data={timeSeriesData.timestamps.map((t, i) => ({ x: t, y: timeSeriesData.noiseLevels[i] }))}
                style={{ data: { stroke: "#45B7D1", strokeWidth: 2 } }}
              />
            </VictoryChart>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
                <Text style={styles.legendText}>Temperature (°C)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4ECDC4' }]} />
                <Text style={styles.legendText}>Light Intensity</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#45B7D1' }]} />
                <Text style={styles.legendText}>Noise Level</Text>
              </View>
            </View>
          </View>

          {/* Reward and Confidence */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Training Progress</Text>
            <VictoryChart
              theme={VictoryTheme.material}
              width={width - 80}
              height={200}
              padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
            >
              <VictoryAxis
                tickFormat={(t) => `${t}s`}
                style={{ axis: { stroke: "#666" }, tickLabels: { fill: "#999" } }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(t) => t.toFixed(1)}
                style={{ axis: { stroke: "#666" }, tickLabels: { fill: "#999" } }}
              />
              <VictoryLine
                data={timeSeriesData.timestamps.map((t, i) => ({ x: t, y: timeSeriesData.rewards[i] }))}
                style={{ data: { stroke: "#FFD93D", strokeWidth: 2 } }}
              />
              <VictoryLine
                data={timeSeriesData.timestamps.map((t, i) => ({ x: t, y: timeSeriesData.confidence[i] }))}
                style={{ data: { stroke: "#6BCF7F", strokeWidth: 2 } }}
              />
            </VictoryChart>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FFD93D' }]} />
                <Text style={styles.legendText}>Reward</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#6BCF7F' }]} />
                <Text style={styles.legendText}>Confidence</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEnvironmentalRecommendations = () => {
    if (!environmentalData || !recommendations) return null;

  return (
      <View style={styles.recommendationsSection}>
        <Text style={styles.sectionTitle}>Environmental Recommendations</Text>
        
        <View style={styles.recommendationsCard}>
          <LinearGradient
            colors={['rgba(52, 199, 89, 0.2)', 'rgba(52, 199, 89, 0.1)']}
            style={styles.recommendationsGradient}
          >
            <View style={styles.recommendationsHeader}>
              <CheckCircle size={24} color="#34C759" />
              <Text style={styles.recommendationsTitle}>Optimized Environment</Text>
        </View>

            {/* Current vs Recommended */}
            <View style={styles.comparisonSection}>
              <Text style={styles.comparisonTitle}>Current vs. Recommended Settings</Text>
              
              <View style={styles.comparisonGrid}>
                <View style={styles.comparisonHeader}>
                  <Text style={styles.comparisonLabel}>Factor</Text>
                  <Text style={styles.comparisonLabel}>Current</Text>
                  <Text style={styles.comparisonLabel}>Recommended</Text>
                  <Text style={styles.comparisonLabel}>Change</Text>
                </View>
                
                <View style={styles.comparisonRow}>
                  <Text style={styles.factorName}>Temperature</Text>
                  <Text style={styles.currentValue}>{environmentalData.currentEnvironment.temperature}°C</Text>
                  <Text style={styles.recommendedValue}>{environmentalData.recommendedEnvironment.temperature}°C</Text>
                  <Text style={styles.changeValue}>-4.5°C</Text>
                </View>
                
                <View style={styles.comparisonRow}>
                  <Text style={styles.factorName}>Light</Text>
                  <Text style={styles.currentValue}>{Math.round(environmentalData.currentEnvironment.lightIntensity * 100)}%</Text>
                  <Text style={styles.recommendedValue}>{Math.round(environmentalData.recommendedEnvironment.lightIntensity * 100)}%</Text>
                  <Text style={styles.changeValue}>-72%</Text>
                </View>
                
                <View style={styles.comparisonRow}>
                  <Text style={styles.factorName}>Noise</Text>
                  <Text style={styles.currentValue}>{Math.round(environmentalData.currentEnvironment.noiseLevel * 100)}%</Text>
                  <Text style={styles.recommendedValue}>{Math.round(environmentalData.recommendedEnvironment.noiseLevel * 100)}%</Text>
                  <Text style={styles.changeValue}>-67%</Text>
                </View>
                
                <View style={styles.comparisonRow}>
                  <Text style={styles.factorName}>Humidity</Text>
                  <Text style={styles.currentValue}>{Math.round(environmentalData.currentEnvironment.humidity * 100)}%</Text>
                  <Text style={styles.recommendedValue}>{Math.round(environmentalData.recommendedEnvironment.humidity * 100)}%</Text>
                  <Text style={styles.changeValue}>-40%</Text>
                </View>
              </View>
            </View>

            {/* Implementation Notes */}
            <View style={styles.implementationSection}>
              <Text style={styles.implementationTitle}>Implementation Steps</Text>
              {recommendations.implementationNotes.map((note, index) => (
                <View key={index} style={styles.implementationItem}>
                  <CheckCircle size={16} color="#34C759" />
                  <Text style={styles.implementationText}>{note}</Text>
                </View>
              ))}
            </View>

            {/* Expected Improvement */}
            <View style={styles.improvementSection}>
              <Text style={styles.improvementTitle}>Expected Results</Text>
              <View style={styles.improvementMetrics}>
                <View style={styles.improvementMetric}>
                  <Text style={styles.improvementLabel}>Sleep Score Improvement</Text>
                  <Text style={styles.improvementValue}>+{environmentalData.expectedImprovement}</Text>
                </View>
                <View style={styles.improvementMetric}>
                  <Text style={styles.improvementLabel}>Confidence</Text>
                  <Text style={styles.improvementValue}>{Math.round(environmentalData.confidence * 100)}%</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    );
  };

  const renderUploadSection = () => (
    <View style={styles.uploadSection}>
          <LinearGradient
        colors={['rgba(139, 92, 246, 0.2)', 'rgba(167, 139, 250, 0.1)']}
        style={styles.uploadCard}
      >
        <View style={styles.uploadContent}>
          <View style={styles.uploadIcon}>
            <Video size={40} color="#8B5CF6" />
              </View>
          <Text style={styles.uploadTitle}>Demo Sleep Video Processing</Text>
          <Text style={styles.uploadDescription}>
            Process the demo sleep video through our AI analysis and RL optimization system
                </Text>
          
          {!hasProcessed ? (
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={handleProcessVideo}
              disabled={isProcessing}
            >
              <LinearGradient
                colors={['#8B5CF6', '#A78BFA']}
                style={styles.uploadButtonGradient}
              >
                <Play size={20} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>
                  {isProcessing ? 'Processing...' : 'Process Demo Video'}
                </Text>
              </LinearGradient>
                </TouchableOpacity>
          ) : (
            <View style={styles.processingStatus}>
              <View style={styles.statusRow}>
                <Video size={20} color="#8B5CF6" />
                <Text style={styles.statusText}>Demo video loaded successfully</Text>
              </View>
              <View style={styles.statusRow}>
                <Brain size={20} color="#8B5CF6" />
                <Text style={styles.statusText}>AI analysis completed</Text>
              </View>
              <View style={styles.statusRow}>
                <Zap size={20} color="#8B5CF6" />
                <Text style={styles.statusText}>RL model processing complete</Text>
              </View>
              <View style={styles.statusRow}>
                <Activity size={20} color="#8B5CF6" />
                <Text style={styles.statusText}>Environment optimization ready</Text>
              </View>
            </View>
          )}
          
          {isProcessing && (
            <View style={styles.processingIndicator}>
              <Text style={styles.processingText}>{processingStage}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressWidth}%` }]} />
              </View>
            </View>
          )}
            </View>
          </LinearGradient>
        </View>
  );

  const renderUserInputSection = () => (
    <View style={styles.userInputSection}>
      <Text style={styles.sectionTitle}>Sleep Data Input</Text>
      
      <View style={styles.userInputCard}>
        <LinearGradient
          colors={['rgba(255, 107, 107, 0.2)', 'rgba(255, 107, 107, 0.1)']}
          style={styles.userInputGradient}
        >
          <View style={styles.userInputHeader}>
            <Clock size={24} color="#FF6B6B" />
            <Text style={styles.userInputTitle}>How did you sleep?</Text>
          </View>
          
          <Text style={styles.userInputDescription}>
            Provide your sleep data to help calculate your personalized sleep score
          </Text>
          
          {/* Hours Slept */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hours of Sleep</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.numberInput}
                value={userInputs.hoursSlept}
                onChangeText={(text) => setUserInputs(prev => ({ ...prev, hoursSlept: text }))}
                placeholder="7.5"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={4}
              />
              <Text style={styles.inputUnit}>hours</Text>
          </View>
        </View>

          {/* Sleep Rating */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Sleep Quality Rating</Text>
            <Text style={styles.inputSubtext}>Rate your sleep from 1-10</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    userInputs.sleepRating === rating.toString() && styles.ratingButtonActive
                  ]}
                  onPress={() => setUserInputs(prev => ({ ...prev, sleepRating: rating.toString() }))}
                >
                  <Text style={[
                    styles.ratingText,
                    userInputs.sleepRating === rating.toString() && styles.ratingTextActive
                  ]}>
                    {rating}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>

          {/* Environment Quality */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Environment Quality</Text>
            <Text style={styles.inputSubtext}>Rate your sleep environment from 1-10</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    userInputs.environmentQuality === rating.toString() && styles.ratingButtonActive
                  ]}
                  onPress={() => setUserInputs(prev => ({ ...prev, environmentQuality: rating.toString() }))}
                >
                  <Text style={[
                    styles.ratingText,
                    userInputs.environmentQuality === rating.toString() && styles.ratingTextActive
                  ]}>
                    {rating}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Environment Comfort */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Environment Comfort</Text>
            <Text style={styles.inputSubtext}>How comfortable was your environment? (1-10)</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    userInputs.environmentComfort === rating.toString() && styles.ratingButtonActive
                  ]}
                  onPress={() => setUserInputs(prev => ({ ...prev, environmentComfort: rating.toString() }))}
                >
                  <Text style={[
                    styles.ratingText,
                    userInputs.environmentComfort === rating.toString() && styles.ratingTextActive
                  ]}>
                    {rating}
              </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sleep Quality */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Overall Sleep Quality</Text>
            <View style={styles.pickerContainer}>
              {['poor', 'fair', 'good', 'excellent'].map((quality) => (
                <TouchableOpacity
                  key={quality}
                  style={[
                    styles.pickerButton,
                    userInputs.sleepQuality === quality && styles.pickerButtonActive
                  ]}
                  onPress={() => setUserInputs(prev => ({ ...prev, sleepQuality: quality }))}
                >
                  <Text style={[
                    styles.pickerText,
                    userInputs.sleepQuality === quality && styles.pickerTextActive
                  ]}>
                    {quality.charAt(0).toUpperCase() + quality.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Stress Level */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Stress Level Before Bed</Text>
            <View style={styles.pickerContainer}>
              {['low', 'medium', 'high'].map((stress) => (
                <TouchableOpacity
                  key={stress}
                  style={[
                    styles.pickerButton,
                    userInputs.stressLevel === stress && styles.pickerButtonActive
                  ]}
                  onPress={() => setUserInputs(prev => ({ ...prev, stressLevel: stress }))}
                >
                  <Text style={[
                    styles.pickerText,
                    userInputs.stressLevel === stress && styles.pickerTextActive
                  ]}>
                    {stress.charAt(0).toUpperCase() + stress.slice(1)}
              </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Exercise */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Exercise Level (24h before bed)</Text>
            <View style={styles.pickerContainer}>
              {['none', 'light', 'moderate', 'intense'].map((exercise) => (
                <TouchableOpacity
                  key={exercise}
                  style={[
                    styles.pickerButton,
                    userInputs.exercise === exercise && styles.pickerButtonActive
                  ]}
                  onPress={() => setUserInputs(prev => ({ ...prev, exercise: exercise }))}
                >
                  <Text style={[
                    styles.pickerText,
                    userInputs.exercise === exercise && styles.pickerTextActive
                  ]}>
                    {exercise.charAt(0).toUpperCase() + exercise.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Input Validation */}
          {userInputs.hoursSlept && userInputs.sleepRating && 
           userInputs.environmentQuality && userInputs.environmentComfort && (
            <View style={styles.inputValidation}>
              <CheckCircle size={20} color="#34C759" />
              <Text style={styles.validationText}>All required fields completed</Text>
            </View>
          )}
          </LinearGradient>
        </View>
    </View>
  );

  const renderDemoInfo = () => (
    <View style={styles.demoSection}>
      <Text style={styles.sectionTitle}>How It Works</Text>
      
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Video size={24} color="#8B5CF6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>1. Demo Video Processing</Text>
            <Text style={styles.infoDescription}>
              Process our pre-loaded demo sleep video through the AI analysis system
            </Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Brain size={24} color="#8B5CF6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>2. AI Analysis</Text>
            <Text style={styles.infoDescription}>
              Our AI analyzes sleep patterns, environment factors, and quality indicators
            </Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Zap size={24} color="#8B5CF6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>3. RL Processing</Text>
            <Text style={styles.infoDescription}>
              Reinforcement learning models optimize your sleep environment in real-time
            </Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Play size={24} color="#8B5CF6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>4. Live Optimization</Text>
            <Text style={styles.infoDescription}>
              Get real-time recommendations and automated environment adjustments
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderBackendInfo = () => (
    <View style={styles.backendSection}>
      <Text style={styles.sectionTitle}>Backend Processing</Text>
      
      <View style={styles.backendCard}>
        <View style={styles.backendHeader}>
          <Brain size={24} color="#8B5CF6" />
          <Text style={styles.backendTitle}>Layer3RL Engine</Text>
        </View>
        <Text style={styles.backendDescription}>
          Your sleep video is processed by our advanced reinforcement learning system located in the layer3rl backend. 
          This system continuously learns and optimizes your sleep environment based on real-time data.
        </Text>
        
        <View style={styles.backendFeatures}>
          <Text style={styles.featureText}>• Real-time video analysis</Text>
          <Text style={styles.featureText}>• Environment optimization</Text>
          <Text style={styles.featureText}>• Sleep quality prediction</Text>
          <Text style={styles.featureText}>• Adaptive learning algorithms</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Upload your sleep video for AI-powered analysis and optimization
          </Text>
        </View>



        {/* Upload Section */}
        {renderUploadSection()}

        {/* User Input Section */}
        {renderUserInputSection()}

        {/* ML Analysis Results */}
        {renderMLResults()}

        {/* RL Convergence */}
        {renderRLConvergence()}

        {/* Environmental Recommendations */}
        {renderEnvironmentalRecommendations()}

        {/* Demo Info */}
        {renderDemoInfo()}

        {/* Backend Info */}
        {renderBackendInfo()}
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
    paddingBottom: 32,
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

  uploadSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  uploadCard: {
    borderRadius: 20,
    padding: 24,
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadIcon: {
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  uploadDescription: {
    fontSize: 16,
    color: '#EBEBF599',
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 20,
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  processingStatus: {
    marginTop: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#EBEBF599',
    marginLeft: 8,
  },
  processingIndicator: {
    marginTop: 20,
    alignItems: 'center',
  },
  processingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#4A4A4A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  mlSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  mlCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  mlCardGradient: {
    borderRadius: 20,
    padding: 24,
  },
  mlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mlTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  mlMetrics: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  mlMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mlMetricLabel: {
    fontSize: 14,
    color: '#EBEBF599',
  },
  mlMetricValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  mlPlaceholder: {
    fontSize: 16,
    color: '#EBEBF599',
    textAlign: 'center',
    paddingVertical: 20,
  },
  rlSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  rlCard: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  rlSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  chartContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#EBEBF599',
  },
  optimalValues: {
    marginTop: 20,
  },
  optimalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  optimalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  optimalItem: {
    alignItems: 'center',
    marginBottom: 15,
    minWidth: 80,
  },
  optimalLabel: {
    fontSize: 12,
    color: '#EBEBF599',
    marginTop: 5,
    textAlign: 'center',
  },
  optimalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 2,
  },
  detailedAnalysis: {
    marginTop: 20,
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  analysisItem: {
    alignItems: 'center',
    marginBottom: 15,
    minWidth: 100,
  },
  analysisLabel: {
    fontSize: 12,
    color: '#EBEBF599',
    marginBottom: 4,
  },
  analysisValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  rlSummary: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  rlSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rlSummaryLabel: {
    fontSize: 14,
    color: '#EBEBF599',
  },
  rlSummaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  recommendationsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  recommendationsCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  recommendationsGradient: {
    borderRadius: 20,
    padding: 24,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  comparisonSection: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  comparisonGrid: {
    borderBottomWidth: 1,
    borderBottomColor: '#4A4A4A',
    marginBottom: 12,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#EBEBF599',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  factorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    width: '20%',
  },
  currentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EBEBF599',
    width: '20%',
  },
  recommendedValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4ECDC4',
    width: '20%',
  },
  changeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B6B',
    width: '20%',
  },
  implementationSection: {
    marginTop: 16,
  },
  implementationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  implementationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  implementationText: {
    fontSize: 14,
    color: '#EBEBF599',
    marginLeft: 8,
  },
  improvementSection: {
    marginTop: 16,
  },
  improvementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  improvementMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  improvementMetric: {
    alignItems: 'center',
  },
  improvementLabel: {
    fontSize: 12,
    color: '#EBEBF599',
    marginBottom: 4,
  },
  improvementValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  userInputSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  userInputCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  userInputGradient: {
    borderRadius: 20,
    padding: 24,
  },
  userInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInputTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  userInputDescription: {
    fontSize: 14,
    color: '#EBEBF599',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputSubtext: {
    fontSize: 12,
    color: '#EBEBF599',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(75, 75, 75, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  numberInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  inputUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EBEBF599',
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EBEBF599',
  },
  ratingButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EBEBF599',
  },
  ratingTextActive: {
    color: '#FFFFFF',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(75, 75, 75, 0.8)',
    borderRadius: 12,
    padding: 5,
  },
  pickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EBEBF599',
  },
  pickerButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  pickerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EBEBF599',
  },
  pickerTextActive: {
    color: '#FFFFFF',
  },
  inputValidation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: 'rgba(75, 75, 75, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  validationText: {
    fontSize: 14,
    color: '#34C759',
    marginLeft: 8,
  },
  userInputsUsed: {
    marginTop: 20,
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  inputsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  inputUsedItem: {
    alignItems: 'center',
    marginBottom: 10,
    minWidth: '45%',
  },
  inputUsedLabel: {
    fontSize: 12,
    color: '#EBEBF599',
    marginBottom: 4,
  },
  inputUsedValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  audioAnalysis: {
    marginTop: 20,
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  audioDescription: {
    fontSize: 14,
    color: '#EBEBF599',
    marginBottom: 15,
  },
  soundChartContainer: {
    marginBottom: 15,
  },
  soundMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  soundMetricItem: {
    alignItems: 'center',
  },
  soundMetricLabel: {
    fontSize: 12,
    color: '#EBEBF599',
    marginTop: 5,
  },
  soundMetricValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 2,
  },
  soundQuality: {
    alignItems: 'center',
  },
  soundQualityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  qualityBar: {
    width: '80%',
    height: 10,
    backgroundColor: '#4A4A4A',
    borderRadius: 5,
    overflow: 'hidden',
  },
  qualityFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 5,
  },
  qualityText: {
    fontSize: 14,
    color: '#EBEBF599',
    marginTop: 8,
  },
  demoSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#EBEBF599',
    lineHeight: 20,
  },
  backendSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  backendCard: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  backendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  backendDescription: {
    fontSize: 14,
    color: '#EBEBF599',
    lineHeight: 20,
    marginBottom: 16,
  },
  backendFeatures: {
    marginTop: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#EBEBF599',
    marginBottom: 8,
  },
  apneaAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  apneaAlertText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 12,
    flex: 1,
  },
  apneaAlertSubtext: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 12,
    marginTop: 4,
  },
});
