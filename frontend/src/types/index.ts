export interface SleepScore {
  overall: number;
  efficiency: number;
  duration: number;
  quality: number;
}

export interface SleepMetrics {
  snoringIntensity: number;
  apneaRisk: number;
  fragmentation: number;
  restlessness: number;
}

export interface EnvironmentData {
  temperature: number;
  noise: number;
  light: number;
  humidity: number;
}

export interface EnvironmentRecommendation {
  id: string;
  type: 'temperature' | 'noise' | 'light' | 'humidity';
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  priority: 'low' | 'medium' | 'high';
  implemented: boolean;
}

export interface SleepRisk {
  type: 'apnea' | 'snoring' | 'fragmentation' | 'insomnia';
  likelihood: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendations: string[];
}

export interface LifestyleInsight {
  category: 'bedtime' | 'caffeine' | 'exercise' | 'environment';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface AudioData {
  frequency: number[];
  amplitude: number[];
  timestamp: number;
  snoringDetected: boolean;
  noiseLevel: number;
}

export interface ChartDataPoint {
  x: number | Date;
  y: number;
  label?: string;
}

export interface NavigationProps {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
}

export interface User {
  id: string;
  name: string;
  age: number;
  preferences: {
    darkMode: boolean;
    notifications: boolean;
    targetSleepHours: number;
    bedtime: string;
    wakeTime: string;
  };
}
