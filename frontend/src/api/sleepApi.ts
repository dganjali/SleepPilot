import axios from 'axios';
import { SleepData, Recommendation, RiskAssessment, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000'; // Update with your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sleepApi = {
  // Get current sleep data
  getCurrentSleepData: async (): Promise<ApiResponse<SleepData>> => {
    try {
      const response = await api.get('/sleep/current');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch current sleep data');
    }
  },

  // Get sleep history
  getSleepHistory: async (days: number = 30): Promise<ApiResponse<SleepData[]>> => {
    try {
      const response = await api.get(`/sleep/history?days=${days}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch sleep history');
    }
  },

  // Get recommendations from RL agent
  getRecommendations: async (): Promise<ApiResponse<Recommendation[]>> => {
    try {
      const response = await api.get('/recommendations');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch recommendations');
    }
  },

  // Get risk assessment
  getRiskAssessment: async (): Promise<ApiResponse<RiskAssessment>> => {
    try {
      const response = await api.get('/sleep/risk-assessment');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch risk assessment');
    }
  },

  // Upload audio file for analysis
  uploadAudio: async (audioFile: FormData): Promise<ApiResponse<{ analysisId: string }>> => {
    try {
      const response = await api.post('/sleep/analyze', audioFile, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to upload audio file');
    }
  },

  // Get analysis results
  getAnalysisResults: async (analysisId: string): Promise<ApiResponse<SleepData>> => {
    try {
      const response = await api.get(`/sleep/analysis/${analysisId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch analysis results');
    }
  },
};

// Mock data for development
export const mockData = {
  currentSleepData: {
    id: '1',
    date: new Date().toISOString(),
    sleepScore: 78,
    snoringIntensity: 45,
    apneaRisk: 'Medium' as const,
    fragmentation: 12,
    duration: 7.5,
    efficiency: 85,
  },

  sleepHistory: [
    { id: '1', date: '2024-01-15', sleepScore: 78, snoringIntensity: 45, apneaRisk: 'Medium' as const, fragmentation: 12, duration: 7.5, efficiency: 85 },
    { id: '2', date: '2024-01-14', sleepScore: 82, snoringIntensity: 38, apneaRisk: 'Low' as const, fragmentation: 8, duration: 8.0, efficiency: 88 },
    { id: '3', date: '2024-01-13', sleepScore: 75, snoringIntensity: 52, apneaRisk: 'High' as const, fragmentation: 18, duration: 6.5, efficiency: 78 },
    { id: '4', date: '2024-01-12', sleepScore: 85, snoringIntensity: 35, apneaRisk: 'Low' as const, fragmentation: 6, duration: 7.8, efficiency: 92 },
    { id: '5', date: '2024-01-11', sleepScore: 79, snoringIntensity: 48, apneaRisk: 'Medium' as const, fragmentation: 14, duration: 7.2, efficiency: 82 },
  ],

  recommendations: [
    {
      id: '1',
      type: 'temperature' as const,
      title: 'Optimize Room Temperature',
      description: 'Set your thermostat to 20°C for optimal sleep',
      value: '20',
      unit: '°C',
      priority: 'high' as const,
      actionable: true,
    },
    {
      id: '2',
      type: 'lighting' as const,
      title: 'Dim Lights Gradually',
      description: 'Reduce lighting to 20% at 10:30 PM',
      value: '20',
      unit: '%',
      priority: 'medium' as const,
      actionable: true,
    },
    {
      id: '3',
      type: 'noise' as const,
      title: 'Add White Noise',
      description: 'Try white noise at 35 dB to mask disturbances',
      value: '35',
      unit: 'dB',
      priority: 'medium' as const,
      actionable: true,
    },
  ],

  riskAssessment: {
    apneaLikelihood: 35,
    snoringSeverity: 45,
    fragmentationRisk: 28,
    overallRisk: 'Medium' as const,
  },
};
