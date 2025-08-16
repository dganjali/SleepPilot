export interface SleepData {
  id: string;
  date: string;
  sleepScore: number;
  snoringIntensity: number;
  apneaRisk: 'Low' | 'Medium' | 'High';
  fragmentation: number;
  duration: number;
  efficiency: number;
}

export interface Recommendation {
  id: string;
  type: 'temperature' | 'lighting' | 'noise' | 'humidity' | 'airflow';
  title: string;
  description: string;
  value: string;
  unit: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export interface RiskAssessment {
  apneaLikelihood: number;
  snoringSeverity: number;
  fragmentationRisk: number;
  overallRisk: 'Low' | 'Medium' | 'High';
}

export interface UserPreferences {
  unitSystem: 'metric' | 'imperial';
  noisePreference: 'white' | 'pink' | 'nature';
  temperatureSensitivity: 'low' | 'medium' | 'high';
  lightSensitivity: 'low' | 'medium' | 'high';
  noiseTolerance: 'low' | 'medium' | 'high';
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
