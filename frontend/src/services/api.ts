import axios from 'axios';
import { SleepData, SleepRecommendation, UserProfile, SleepRisk } from '../store/sleepStore';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const API_TIMEOUT = 10000; // 10 seconds

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth token management
const getAuthToken = (): string | null => {
  // In a real app, this would come from secure storage
  return null;
};

// API Types
export interface UploadAudioResponse {
  success: boolean;
  sleepData: SleepData;
  message?: string;
}

export interface GetRecommendationsResponse {
  recommendations: SleepRecommendation[];
  confidence: number;
  lastUpdated: string;
}

export interface GetRisksResponse {
  risks: SleepRisk[];
  lastUpdated: string;
}

export interface TrainingStatusResponse {
  status: 'idle' | 'training' | 'completed' | 'failed';
  progress: number;
  message: string;
  estimatedTime?: number;
}

// API Service Class
class SleepHealthAPI {
  // User Management
  async createUser(userProfile: Partial<UserProfile>): Promise<UserProfile> {
    const response = await api.post('/users', userProfile);
    return response.data;
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const response = await api.put(`/users/${userId}`, updates);
    return response.data;
  }

  // Sleep Data
  async uploadAudio(audioFile: File | Blob, userId: string): Promise<UploadAudioResponse> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('user_id', userId);

    const response = await api.post('/upload-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getSleepData(userId: string, days: number = 7): Promise<SleepData[]> {
    const response = await api.get(`/sleep-data/${userId}`, {
      params: { days },
    });
    return response.data;
  }

  async getLatestSleepData(userId: string): Promise<SleepData> {
    const response = await api.get(`/sleep-data/${userId}/latest`);
    return response.data;
  }

  // RL Agent Training
  async startTraining(userId: string, algorithm: string = 'PPO'): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/train-agent', {
      user_id: userId,
      algorithm,
    });
    return response.data;
  }

  async getTrainingStatus(userId: string): Promise<TrainingStatusResponse> {
    const response = await api.get(`/training-status/${userId}`);
    return response.data;
  }

  // Recommendations
  async getRecommendations(userId: string): Promise<GetRecommendationsResponse> {
    const response = await api.get(`/recommendations/${userId}`);
    return response.data;
  }

  async generateRecommendations(userId: string): Promise<GetRecommendationsResponse> {
    const response = await api.post(`/generate-recommendations`, {
      user_id: userId,
    });
    return response.data;
  }

  async updateRecommendation(userId: string, recommendationId: string, updates: Partial<SleepRecommendation>): Promise<SleepRecommendation> {
    const response = await api.put(`/recommendations/${userId}/${recommendationId}`, updates);
    return response.data;
  }

  // Risk Assessment
  async getRisks(userId: string): Promise<GetRisksResponse> {
    const response = await api.get(`/risks/${userId}`);
    return response.data;
  }

  async assessRisks(userId: string): Promise<GetRisksResponse> {
    const response = await api.post(`/assess-risks`, {
      user_id: userId,
    });
    return response.data;
  }

  // Analytics and Insights
  async getSleepTrends(userId: string, period: 'week' | 'month' | 'year' = 'week'): Promise<{
    trends: Array<{ date: string; sleepScore: number; apneaRisk: number; fragmentation: number }>;
    insights: string[];
  }> {
    const response = await api.get(`/analytics/trends/${userId}`, {
      params: { period },
    });
    return response.data;
  }

  async getSleepInsights(userId: string): Promise<{
    insights: string[];
    improvements: string[];
    warnings: string[];
  }> {
    const response = await api.get(`/analytics/insights/${userId}`);
    return response.data;
  }

  // Environment Optimization
  async getOptimalEnvironment(userId: string): Promise<{
    temperature: number;
    lightIntensity: number;
    noiseLevel: number;
    humidity: number;
    airflow: number;
    confidence: number;
  }> {
    const response = await api.get(`/environment/optimal/${userId}`);
    return response.data;
  }

  async updateEnvironmentPreferences(userId: string, preferences: {
    temperaturePreference?: 'celsius' | 'fahrenheit';
    noisePreference?: 'white' | 'pink' | 'nature' | 'none';
    lightSensitivity?: 'low' | 'medium' | 'high';
    temperatureSensitivity?: 'low' | 'medium' | 'high';
    noiseSensitivity?: 'low' | 'medium' | 'high';
  }): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/environment/preferences/${userId}`, preferences);
    return response.data;
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; version: string; timestamp: string }> {
    const response = await api.get('/health');
    return response.data;
  }

  // Data Export/Import
  async exportUserData(userId: string): Promise<{ data: string; filename: string }> {
    const response = await api.get(`/export-data/${userId}`);
    return response.data;
  }

  async importUserData(userId: string, data: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/import-data/${userId}`, { data });
    return response.data;
  }
}

// Mock data for development/testing
export const mockSleepData: SleepData[] = [
  {
    id: '1',
    date: '2024-01-15',
    sleepScore: 85,
    snoringIntensity: 45,
    apneaRisk: 12,
    fragmentation: 8,
    duration: 7.5,
    efficiency: 92,
    deepSleep: 2.1,
    remSleep: 1.8,
    lightSleep: 3.2,
    awakeTime: 0.4,
  },
  {
    id: '2',
    date: '2024-01-14',
    sleepScore: 78,
    snoringIntensity: 52,
    apneaRisk: 18,
    fragmentation: 12,
    duration: 6.8,
    efficiency: 88,
    deepSleep: 1.9,
    remSleep: 1.6,
    lightSleep: 2.9,
    awakeTime: 0.4,
  },
  {
    id: '3',
    date: '2024-01-13',
    sleepScore: 92,
    snoringIntensity: 38,
    apneaRisk: 8,
    fragmentation: 5,
    duration: 8.2,
    efficiency: 95,
    deepSleep: 2.4,
    remSleep: 2.0,
    lightSleep: 3.4,
    awakeTime: 0.4,
  },
];

export const mockRecommendations: SleepRecommendation[] = [
  {
    id: '1',
    type: 'environment',
    title: 'Optimize Room Temperature',
    description: 'Set your thermostat to 20°C (68°F) for optimal sleep quality',
    priority: 'high',
    category: 'temperature',
    value: 20,
    unit: '°C',
    actionable: true,
    completed: false,
    confidence: 0.85,
  },
  {
    id: '2',
    type: 'environment',
    title: 'Reduce Light Exposure',
    description: 'Dim lights to 20% brightness 30 minutes before bedtime',
    priority: 'medium',
    category: 'lighting',
    value: 20,
    unit: '%',
    actionable: true,
    completed: false,
    confidence: 0.72,
  },
  {
    id: '3',
    type: 'environment',
    title: 'Add White Noise',
    description: 'Use white noise at 35 dB to mask disruptive sounds',
    priority: 'low',
    category: 'noise',
    value: 35,
    unit: 'dB',
    actionable: true,
    completed: false,
    confidence: 0.68,
  },
];

export const mockRisks: SleepRisk[] = [
  {
    id: '1',
    type: 'apnea',
    severity: 'medium',
    probability: 18,
    description: 'Moderate risk of sleep apnea detected. Consider consulting a sleep specialist.',
    recommendations: [
      'Sleep on your side instead of your back',
      'Maintain a healthy weight',
      'Avoid alcohol before bedtime',
    ],
    lastUpdated: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    type: 'snoring',
    severity: 'low',
    probability: 25,
    description: 'Mild snoring detected. This is common and usually not concerning.',
    recommendations: [
      'Try sleeping on your side',
      'Use a humidifier in your bedroom',
      'Avoid alcohol and sedatives',
    ],
    lastUpdated: '2024-01-15T08:00:00Z',
  },
];

// Create and export API instance
export const sleepHealthAPI = new SleepHealthAPI();

// Export default for convenience
export default sleepHealthAPI;
