import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../constants/colors';

interface SleepScoreGaugeProps {
  score: number;
  size?: number;
}

export const SleepScoreGauge: React.FC<SleepScoreGaugeProps> = ({ 
  score, 
  size = 200 
}) => {
  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Poor';
    return 'Very Poor';
  };

  if (Platform.OS === 'web') {
    // Web version using HTML/CSS
    const circumference = 2 * Math.PI * (size / 2 - 10);
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    return (
      <View style={styles.container}>
        <svg width={size} height={size} style={styles.svg}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 10}
            fill="none"
            stroke={colors.gray[700]}
            strokeWidth="20"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 10}
            fill="none"
            stroke={colors.blue}
            strokeWidth="20"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        
        {/* Score text */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}</Text>
          <Text style={styles.scoreLabel}>{getScoreLabel(score)}</Text>
        </View>
      </View>
    );
  }
  
  // Native version using react-native-svg
  try {
    const Svg = require('react-native-svg').default;
    const Circle = require('react-native-svg').Circle;
    
    const circumference = 2 * Math.PI * (size / 2 - 10);
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    return (
      <View style={styles.container}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 10}
            fill="none"
            stroke={colors.gray[700]}
            strokeWidth="20"
          />
          
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 10}
            fill="none"
            stroke={colors.blue}
            strokeWidth="20"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        
        {/* Score text */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}</Text>
          <Text style={styles.scoreLabel}>{getScoreLabel(score)}</Text>
        </View>
      </View>
    );
  } catch (error) {
    // Fallback if SVG fails
    return (
      <View style={styles.container}>
        <View style={[styles.fallbackCircle, { width: size, height: size }]}>
          <Text style={styles.scoreText}>{score}</Text>
          <Text style={styles.scoreLabel}>{getScoreLabel(score)}</Text>
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  scoreContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scoreLabel: {
    fontSize: 18,
    color: '#d1d5db',
  },
  fallbackCircle: {
    backgroundColor: '#1e293b',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
});
