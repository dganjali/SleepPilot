import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface SleepData {
  id: string;
  date: string;
  sleepScore: number;
  snoringIntensity: number;
  apneaRisk: number;
  fragmentation: number;
  duration: number;
  efficiency: number;
  deepSleep: number;
  remSleep: number;
  lightSleep: number;
  awakeTime: number;
}

export interface SleepRecommendation {
  id: string;
  type: 'environment' | 'lifestyle' | 'medical';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'temperature' | 'lighting' | 'noise' | 'humidity' | 'routine' | 'health';
  value?: number;
  unit?: string;
  actionable: boolean;
  completed: boolean;
  confidence: number;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  temperaturePreference: 'celsius' | 'fahrenheit';
  noisePreference: 'white' | 'pink' | 'nature' | 'none';
  lightSensitivity: 'low' | 'medium' | 'high';
  temperatureSensitivity: 'low' | 'medium' | 'high';
  noiseSensitivity: 'low' | 'medium' | 'high';
  baselineSleepScore: number;
  targetSleepScore: number;
  sleepGoal: number; // hours
  bedtime: string; // HH:MM
  wakeTime: string; // HH:MM
}

export interface SleepRisk {
  id: string;
  type: 'apnea' | 'snoring' | 'fragmentation' | 'insomnia';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-100
  description: string;
  recommendations: string[];
  lastUpdated: string;
}

export interface AppSettings {
  notifications: boolean;
  soundAlerts: boolean;
  darkMode: boolean;
  autoSync: boolean;
  dataRetention: number; // days
  language: string;
  units: 'metric' | 'imperial';
}

interface SleepStore {
  // State
  sleepData: SleepData[];
  recommendations: SleepRecommendation[];
  userProfile: UserProfile | null;
  risks: SleepRisk[];
  settings: AppSettings;
  hasNewAlerts: boolean;
  isLoading: boolean;
  lastSync: string | null;
  
  // Actions
  setSleepData: (data: SleepData[]) => void;
  addSleepData: (data: SleepData) => void;
  updateSleepData: (id: string, updates: Partial<SleepData>) => void;
  
  setRecommendations: (recommendations: SleepRecommendation[]) => void;
  addRecommendation: (recommendation: SleepRecommendation) => void;
  updateRecommendation: (id: string, updates: Partial<SleepRecommendation>) => void;
  completeRecommendation: (id: string) => void;
  
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  
  setRisks: (risks: SleepRisk[]) => void;
  addRisk: (risk: SleepRisk) => void;
  updateRisk: (id: string, updates: Partial<SleepRisk>) => void;
  
  setSettings: (settings: AppSettings) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  setHasNewAlerts: (hasAlerts: boolean) => void;
  setLoading: (loading: boolean) => void;
  setLastSync: (timestamp: string) => void;
  
  // Computed
  getLatestSleepData: () => SleepData | null;
  getAverageSleepScore: (days?: number) => number;
  getSleepTrend: (days?: number) => 'improving' | 'declining' | 'stable';
  getHighPriorityRecommendations: () => SleepRecommendation[];
  getCriticalRisks: () => SleepRisk[];
  
  // Utilities
  clearAllData: () => void;
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<void>;
}

const defaultSettings: AppSettings = {
  notifications: true,
  soundAlerts: true,
  darkMode: true,
  autoSync: true,
  dataRetention: 365,
  language: 'en',
  units: 'metric',
};

const defaultUserProfile: UserProfile = {
  id: 'default-user',
  name: 'User',
  age: 30,
  gender: 'other',
  weight: 70,
  height: 170,
  temperaturePreference: 'celsius',
  noisePreference: 'white',
  lightSensitivity: 'medium',
  temperatureSensitivity: 'medium',
  noiseSensitivity: 'medium',
  baselineSleepScore: 75,
  targetSleepScore: 85,
  sleepGoal: 8,
  bedtime: '22:30',
  wakeTime: '07:00',
};

export const useSleepStore = create<SleepStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sleepData: [],
      recommendations: [],
      userProfile: null,
      risks: [],
      settings: defaultSettings,
      hasNewAlerts: false,
      isLoading: false,
      lastSync: null,
      
      // Actions
      setSleepData: (data) => set({ sleepData: data }),
      
      addSleepData: (data) => set((state) => ({
        sleepData: [...state.sleepData, data],
      })),
      
      updateSleepData: (id, updates) => set((state) => ({
        sleepData: state.sleepData.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      })),
      
      setRecommendations: (recommendations) => set({ recommendations }),
      
      addRecommendation: (recommendation) => set((state) => ({
        recommendations: [...state.recommendations, recommendation],
        hasNewAlerts: true,
      })),
      
      updateRecommendation: (id, updates) => set((state) => ({
        recommendations: state.recommendations.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      })),
      
      completeRecommendation: (id) => set((state) => ({
        recommendations: state.recommendations.map((item) =>
          item.id === id ? { ...item, completed: true } : item
        ),
      })),
      
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      updateUserProfile: (updates) => set((state) => ({
        userProfile: state.userProfile ? { ...state.userProfile, ...updates } : null,
      })),
      
      setRisks: (risks) => set({ risks }),
      
      addRisk: (risk) => set((state) => ({
        risks: [...state.risks, risk],
        hasNewAlerts: risk.severity === 'high' || risk.severity === 'critical',
      })),
      
      updateRisk: (id, updates) => set((state) => ({
        risks: state.risks.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      })),
      
      setSettings: (settings) => set({ settings }),
      
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates },
      })),
      
      setHasNewAlerts: (hasAlerts) => set({ hasNewAlerts: hasAlerts }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setLastSync: (timestamp) => set({ lastSync: timestamp }),
      
      // Computed
      getLatestSleepData: () => {
        const { sleepData } = get();
        if (sleepData.length === 0) return null;
        return sleepData[sleepData.length - 1];
      },
      
      getAverageSleepScore: (days = 7) => {
        const { sleepData } = get();
        if (sleepData.length === 0) return 0;
        
        const recentData = sleepData
          .slice(-days)
          .map((data) => data.sleepScore);
        
        return recentData.reduce((sum, score) => sum + score, 0) / recentData.length;
      },
      
      getSleepTrend: (days = 7) => {
        const { sleepData } = get();
        if (sleepData.length < 2) return 'stable';
        
        const recentData = sleepData.slice(-days);
        if (recentData.length < 2) return 'stable';
        
        const firstHalf = recentData.slice(0, Math.floor(recentData.length / 2));
        const secondHalf = recentData.slice(Math.floor(recentData.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, data) => sum + data.sleepScore, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, data) => sum + data.sleepScore, 0) / secondHalf.length;
        
        const difference = secondAvg - firstAvg;
        
        if (difference > 5) return 'improving';
        if (difference < -5) return 'declining';
        return 'stable';
      },
      
      getHighPriorityRecommendations: () => {
        const { recommendations } = get();
        return recommendations.filter(
          (rec) => rec.priority === 'high' || rec.priority === 'critical'
        );
      },
      
      getCriticalRisks: () => {
        const { risks } = get();
        return risks.filter((risk) => risk.severity === 'critical');
      },
      
      // Utilities
      clearAllData: () => set({
        sleepData: [],
        recommendations: [],
        risks: [],
        hasNewAlerts: false,
        lastSync: null,
      }),
      
      exportData: async () => {
        const state = get();
        const exportData = {
          sleepData: state.sleepData,
          recommendations: state.recommendations,
          userProfile: state.userProfile,
          risks: state.risks,
          settings: state.settings,
          exportDate: new Date().toISOString(),
        };
        return JSON.stringify(exportData, null, 2);
      },
      
      importData: async (data: string) => {
        try {
          const importData = JSON.parse(data);
          set({
            sleepData: importData.sleepData || [],
            recommendations: importData.recommendations || [],
            userProfile: importData.userProfile || null,
            risks: importData.risks || [],
            settings: importData.settings || defaultSettings,
          });
        } catch (error) {
          console.error('Failed to import data:', error);
          throw new Error('Invalid data format');
        }
      },
    }),
    {
      name: 'sleep-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sleepData: state.sleepData,
        recommendations: state.recommendations,
        userProfile: state.userProfile,
        risks: state.risks,
        settings: state.settings,
        lastSync: state.lastSync,
      }),
    }
  )
);
