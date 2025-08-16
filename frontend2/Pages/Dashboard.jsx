
import React, { useState, useEffect } from "react";
import { SleepData } from "../src/entities/SleepData";
import { User } from "../src/entities/User";
import { format, subDays } from "date-fns";
import { Moon, Activity, Volume2, AlertTriangle, TrendingUp, Brain } from "lucide-react";

import SleepScoreGauge from "../Components/dashboard/SleepScoreGauge.jsx";
import MetricCard from "../Components/dashboard/MetricCard";
import StatusBanner from "../Components/dashboard/StatusBanner";
import QuickInsights from "../Components/dashboard/QuickInsights";
import Landing from "./Landing";

export default function Dashboard() {
  const [todayData, setTodayData] = useState(null);
  const [recentData, setRecentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      loadDashboardData();
    } catch (error) {
      // User not authenticated, will show landing page
      setUser(null);
    }
    setIsCheckingAuth(false);
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const recent = await SleepData.list('-date', 7);
      
      const todayRecord = recent.find(record => record.date === today);
      setTodayData(todayRecord);
      setRecentData(recent);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A890FE] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading SleepPilot...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!user) {
    return <Landing />;
  }

  const getStatusMessage = () => {
    if (!todayData) return null;
    
    if (todayData.apnea_risk === 'high') {
      return {
        type: 'danger',
        icon: AlertTriangle,
        message: 'High Risk of Apnea Detected',
        description: 'Consider consulting with a sleep specialist'
      };
    } else if (todayData.snoring_severity === 'high') {
      return {
        type: 'warning',
        icon: Volume2,
        message: 'Elevated Snoring Levels',
        description: 'Try sleeping on your side or a humidifier'
      };
    } else if (todayData.sleep_score >= 80) {
      return {
        type: 'success',
        icon: TrendingUp,
        message: 'Excellent Sleep Quality!',
        description: 'You\'re on a great track. Keep it up!'
      };
    }
    return null;
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-[var(--success)]';
      case 'medium': return 'text-[var(--warning)]';
      case 'high': return 'text-[var(--danger)]';
      default: return 'text-[var(--text-secondary)]';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'text-[var(--success)]';
      case 'moderate': return 'text-[var(--warning)]';
      case 'high': return 'text-[var(--danger)]';
      default: return 'text-[var(--text-secondary)]';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="px-2">
        <p className="text-base text-[var(--text-secondary)]">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
        <h1 className="text-4xl font-bold text-white">
          Dashboard
        </h1>
      </div>

      {/* Status Banner */}
      {getStatusMessage() && (
        <StatusBanner {...getStatusMessage()} />
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sleep Score Gauge */}
        <div className="lg:col-span-1">
          <SleepScoreGauge 
            score={todayData?.sleep_score || 0}
            isLoading={isLoading}
          />
        </div>

        {/* Metrics Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <MetricCard
            icon={Volume2}
            title="Snoring"
            value={`${todayData?.snoring_intensity || 0} dB`}
            subtitle={
              <span className={getSeverityColor(todayData?.snoring_severity)}>
                {todayData?.snoring_severity || 'N/A'}
              </span>
            }
            color="text-[var(--warning)]"
            isLoading={isLoading}
          />

          <MetricCard
            icon={AlertTriangle}
            title="Apnea Risk"
            value={todayData?.apnea_risk || 'N/A'}
            subtitle="Disruption risk"
            color={getRiskColor(todayData?.apnea_risk)}
            isLoading={isLoading}
          />

          <MetricCard
            icon={Activity}
            title="Fragmentation"
            value={`${todayData?.fragmentation_events || 0}`}
            subtitle="events/hr"
            color="text-[var(--accent-primary)]"
            isLoading={isLoading}
          />

          <MetricCard
            icon={Brain}
            title="Deep Sleep"
            value={`${todayData?.deep_sleep_percentage || 0}%`}
            subtitle="Restorative"
            color="text-cyan-400"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Quick Insights */}
      <QuickInsights 
        recentData={recentData}
        isLoading={isLoading}
      />

      {/* Sleep Phases Overview */}
      {todayData && (
        <div className="ios-card p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5 text-[var(--accent-primary)]" />
            Sleep Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center ios-inset-card p-3">
              <div className="text-2xl font-bold text-[var(--accent-primary)]">
                {Math.round((todayData.total_sleep_time || 0) / 60 * 100) / 100}h
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Total Sleep</div>
            </div>
            <div className="text-center ios-inset-card p-3">
              <div className="text-2xl font-bold text-cyan-400">
                {todayData.deep_sleep_percentage || 0}%
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Deep</div>
            </div>
            <div className="text-center ios-inset-card p-3">
              <div className="text-2xl font-bold text-emerald-400">
                {todayData.rem_sleep_percentage || 0}%
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">REM</div>
            </div>
            <div className="text-center ios-inset-card p-3">
              <div className="text-2xl font-bold text-slate-300">
                {100 - (todayData.deep_sleep_percentage || 0) - (todayData.rem_sleep_percentage || 0)}%
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Light</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
