import { create } from 'zustand';
import { SleepData, Recommendation, RiskAssessment, UserPreferences } from '../types';

interface SleepStore {
  // State
  currentSleepData: SleepData | null;
  sleepHistory: SleepData[];
  recommendations: Recommendation[];
  riskAssessment: RiskAssessment | null;
  userPreferences: UserPreferences;
  isLoading: boolean;
  
  // Actions
  setCurrentSleepData: (data: SleepData) => void;
  setSleepHistory: (history: SleepData[]) => void;
  setRecommendations: (recs: Recommendation[]) => void;
  setRiskAssessment: (risk: RiskAssessment) => void;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  getAverageSleepScore: () => number;
  getWeeklyTrend: () => SleepData[];
}

export const useSleepStore = create<SleepStore>((set, get) => ({
  // Initial state
  currentSleepData: null,
  sleepHistory: [],
  recommendations: [],
  riskAssessment: null,
  userPreferences: {
    unitSystem: 'metric',
    noisePreference: 'white',
    temperatureSensitivity: 'medium',
    lightSensitivity: 'medium',
    noiseTolerance: 'medium',
  },
  isLoading: false,

  // Actions
  setCurrentSleepData: (data) => set({ currentSleepData: data }),
  setSleepHistory: (history) => set({ sleepHistory: history }),
  setRecommendations: (recs) => set({ recommendations: recs }),
  setRiskAssessment: (risk) => set({ riskAssessment: risk }),
  updateUserPreferences: (prefs) => 
    set((state) => ({ 
      userPreferences: { ...state.userPreferences, ...prefs } 
    })),
  setLoading: (loading) => set({ isLoading: loading }),

  // Computed values
  getAverageSleepScore: () => {
    const { sleepHistory } = get();
    if (sleepHistory.length === 0) return 0;
    const sum = sleepHistory.reduce((acc, data) => acc + data.sleepScore, 0);
    return Math.round(sum / sleepHistory.length);
  },

  getWeeklyTrend: () => {
    const { sleepHistory } = get();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return sleepHistory
      .filter(data => new Date(data.date) >= oneWeekAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
}));
