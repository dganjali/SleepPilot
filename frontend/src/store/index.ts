import { create } from 'zustand';
import { SleepScore, SleepMetrics, EnvironmentData, User, AudioData } from '../types';

interface AppState {
  // User data
  user: User | null;
  setUser: (user: User) => void;
  
  // Sleep data
  sleepScore: SleepScore;
  setSleepScore: (score: SleepScore) => void;
  
  sleepMetrics: SleepMetrics;
  setSleepMetrics: (metrics: SleepMetrics) => void;
  
  // Environment data
  environmentData: EnvironmentData;
  setEnvironmentData: (data: EnvironmentData) => void;
  
  // Audio data
  audioData: AudioData | null;
  setAudioData: (data: AudioData) => void;
  
  // UI state
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // User data
  user: null,
  setUser: (user) => set({ user }),
  
  // Sleep data
  sleepScore: {
    overall: 75,
    efficiency: 80,
    duration: 70,
    quality: 78,
  },
  setSleepScore: (sleepScore) => set({ sleepScore }),
  
  sleepMetrics: {
    snoringIntensity: 45,
    apneaRisk: 25,
    fragmentation: 30,
    restlessness: 35,
  },
  setSleepMetrics: (sleepMetrics) => set({ sleepMetrics }),
  
  // Environment data
  environmentData: {
    temperature: 22,
    noise: 35,
    light: 10,
    humidity: 45,
  },
  setEnvironmentData: (environmentData) => set({ environmentData }),
  
  // Audio data
  audioData: null,
  setAudioData: (audioData) => set({ audioData }),
  
  // UI state
  isRecording: false,
  setIsRecording: (isRecording) => set({ isRecording }),
  
  darkMode: true,
  setDarkMode: (darkMode) => set({ darkMode }),
  
  // Loading states
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}));
