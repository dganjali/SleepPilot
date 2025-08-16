import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subDays } from "date-fns";
import { Skeleton } from "../../src/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

export default function RiskTrends({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded bg-slate-800" />
            <Skeleton className="w-32 h-6 bg-slate-800" />
          </div>
          <Skeleton className="w-full h-64 bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          Risk Trends
        </h2>
        <div className="h-64 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <p>No trend data available</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = data.map(record => {
    // Calculate risk scores based on the data
    const apneaScore = record.apnea_risk === 'high' ? 80 : 
                      record.apnea_risk === 'medium' ? 50 : 20;
    const snoringScore = Math.min(100, (record.snoring_intensity || 0) / 60 * 100);
    const fragmentationScore = Math.min(100, (record.fragmentation_events || 0) / 10 * 100);
    const qualityScore = Math.max(0, 100 - (record.sleep_score || 0));

    return {
      date: format(new Date(record.date), 'MMM d'),
      apnea: Math.round(apneaScore),
      snoring: Math.round(snoringScore),
      fragmentation: Math.round(fragmentationScore),
      quality: Math.round(qualityScore)
    };
  }).reverse().slice(0, 14); // Show last 14 days

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-slate-700/50 rounded-lg">
          <p className="text-slate-200 font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Risk Trends Over Time
          </h2>
          <p className="text-slate-400">
            Track how your sleep health risks have changed over the past 14 days
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tick={{ fill: '#9CA3AF' }}
                domain={[0, 100]}
                label={{ value: 'Risk %', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: '#9CA3AF' }}
              />
              
              <Line 
                type="monotone" 
                dataKey="apnea" 
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 1, r: 3 }}
                name="Sleep Apnea"
              />
              <Line 
                type="monotone" 
                dataKey="snoring" 
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 1, r: 3 }}
                name="Snoring"
              />
              <Line 
                type="monotone" 
                dataKey="fragmentation" 
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 1, r: 3 }}
                name="Fragmentation"
              />
              <Line 
                type="monotone" 
                dataKey="quality" 
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', strokeWidth: 1, r: 3 }}
                name="Quality Risk"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { key: 'apnea', label: 'Sleep Apnea', color: 'text-red-400' },
            { key: 'snoring', label: 'Snoring', color: 'text-amber-400' },
            { key: 'fragmentation', label: 'Fragmentation', color: 'text-purple-400' },
            { key: 'quality', label: 'Quality Risk', color: 'text-cyan-400' }
          ].map((risk) => {
            const recent = chartData.slice(-3).map(d => d[risk.key]);
            const avg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
            const trend = recent[recent.length - 1] - recent[0];
            
            return (
              <div key={risk.key} className="text-center p-3 rounded-lg bg-slate-800/30">
                <div className={`text-sm font-medium ${risk.color}`}>
                  {risk.label}
                </div>
                <div className="text-lg font-bold text-slate-200 mt-1">
                  {Math.round(avg)}%
                </div>
                <div className={`text-xs mt-1 ${
                  trend > 0 ? 'text-rose-400' : trend < 0 ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} 
                  {Math.abs(Math.round(trend))}% 3-day
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}