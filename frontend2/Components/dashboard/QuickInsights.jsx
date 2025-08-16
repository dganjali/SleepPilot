import React from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "../../src/components/ui/skeleton";

export default function QuickInsights({ recentData, isLoading }) {
  const generateInsights = () => {
    if (!recentData || recentData.length < 2) return [];

    const insights = [];
    const recent = recentData.slice(0, 7);
    const avgScore = recent.reduce((sum, day) => sum + (day.sleep_score || 0), 0) / recent.length;
    
    // Sleep score trend
    const lastWeekAvg = recent.slice(0, 3).reduce((sum, day) => sum + (day.sleep_score || 0), 0) / 3;
    const previousWeekAvg = recent.slice(3, 6).reduce((sum, day) => sum + (day.sleep_score || 0), 0) / 3;
    const scoreTrend = lastWeekAvg - previousWeekAvg;

    if (scoreTrend > 5) {
      insights.push({
        icon: TrendingUp,
        color: "text-emerald-400",
        title: "Sleep Quality Improving",
        description: `Your sleep score has improved by ${Math.round(scoreTrend)} points this week.`
      });
    } else if (scoreTrend < -5) {
      insights.push({
        icon: TrendingDown,
        color: "text-amber-400",
        title: "Sleep Quality Declining",
        description: `Your sleep score has decreased by ${Math.abs(Math.round(scoreTrend))} points. Consider adjusting your routine.`
      });
    }

    // Fragmentation insights
    const highFragmentation = recent.filter(day => (day.fragmentation_events || 0) > 5).length;
    if (highFragmentation >= 3) {
      insights.push({
        icon: Brain,
        color: "text-purple-400",
        title: "High Sleep Fragmentation",
        description: `You've had ${highFragmentation} nights with disrupted sleep this week. Try reducing screen time before bed.`
      });
    }

    // Default positive insight if no issues
    if (insights.length === 0 && avgScore >= 70) {
      insights.push({
        icon: TrendingUp,
        color: "text-emerald-400",
        title: "Stable Sleep Pattern",
        description: `Your average sleep score is ${Math.round(avgScore)}. Keep maintaining your healthy sleep habits!`
      });
    }

    return insights.slice(0, 2); // Show max 2 insights
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded bg-slate-800" />
            <Skeleton className="w-32 h-6 bg-slate-800" />
          </div>
          <div className="space-y-3">
            <Skeleton className="w-full h-16 rounded-xl bg-slate-800" />
            <Skeleton className="w-full h-16 rounded-xl bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  const insights = generateInsights();

  if (insights.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card rounded-2xl p-6 border border-slate-700/50"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-indigo-400" />
          <h3 className="text-xl font-semibold text-slate-100">AI Insights</h3>
        </div>

        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30"
            >
              <div className="p-2 rounded-lg bg-slate-800/50">
                <insight.icon className={`w-5 h-5 ${insight.color}`} />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold text-slate-100">{insight.title}</h4>
                <p className="text-sm text-slate-400">{insight.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}