import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "../../src/components/ui/skeleton";

export default function TrendStats({ data, metric, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-6 border border-slate-700/50">
            <div className="space-y-3">
              <Skeleton className="w-20 h-4 bg-slate-800" />
              <Skeleton className="w-16 h-8 bg-slate-800" />
              <Skeleton className="w-24 h-4 bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  const calculateStats = () => {
    const values = data.map(record => record[metric] || 0);
    const current = values[0] || 0;
    const previous = values[1] || 0;
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const trend = current - previous;

    return { current, average, min, max, trend };
  };

  const { current, average, min, max, trend } = calculateStats();

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-rose-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return "text-emerald-400";
    if (trend < 0) return "text-rose-400";
    return "text-slate-400";
  };

  const formatValue = (value) => {
    if (metric === 'sleep_score' || metric === 'deep_sleep_percentage') {
      return Math.round(value);
    }
    return Math.round(value * 10) / 10;
  };

  const getUnit = () => {
    switch (metric) {
      case 'sleep_score': return '/100';
      case 'snoring_intensity': return 'dB';
      case 'fragmentation_events': return '/hr';
      case 'deep_sleep_percentage': return '%';
      default: return '';
    }
  };

  const stats = [
    {
      label: "Current",
      value: formatValue(current),
      icon: getTrendIcon(trend),
      color: getTrendColor(trend),
      subtitle: trend !== 0 ? `${Math.abs(formatValue(trend))} from yesterday` : "No change"
    },
    {
      label: "Average",
      value: formatValue(average),
      color: "text-indigo-400",
      subtitle: "Period average"
    },
    {
      label: "Best",
      value: formatValue(max),
      color: "text-emerald-400",
      subtitle: "Highest recorded"
    },
    {
      label: "Lowest",
      value: formatValue(min),
      color: "text-amber-400",
      subtitle: "Room for improvement"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="glass-card rounded-xl p-6 border border-slate-700/50"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{stat.label}</span>
              {stat.icon}
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}{getUnit()}
            </div>
            <p className="text-xs text-slate-500">{stat.subtitle}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}