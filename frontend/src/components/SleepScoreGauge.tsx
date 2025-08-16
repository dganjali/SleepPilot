import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { useTheme } from 'react-native-paper';

interface SleepScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

const SleepScoreGauge: React.FC<SleepScoreGaugeProps> = ({
  score,
  size = 200,
  strokeWidth = 12,
}) => {
  const theme = useTheme();
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress * circumference);

  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.colors.sleepScore.excellent;
    if (score >= 70) return theme.colors.sleepScore.good;
    if (score >= 50) return theme.colors.sleepScore.fair;
    return theme.colors.sleepScore.poor;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.outline}
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={0.3}
        />
        
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getScoreColor(score)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        
        {/* Score text */}
        <SvgText
          x={size / 2}
          y={size / 2 - 10}
          fontSize={size * 0.15}
          fontWeight="bold"
          textAnchor="middle"
          fill={theme.colors.onSurface}
        >
          {Math.round(score)}
        </SvgText>
        
        {/* Label text */}
        <SvgText
          x={size / 2}
          y={size / 2 + 15}
          fontSize={size * 0.08}
          textAnchor="middle"
          fill={theme.colors.onSurfaceVariant}
        >
          {getScoreLabel(score)}
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SleepScoreGauge;
