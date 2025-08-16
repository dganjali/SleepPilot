import React, { useState, useEffect } from "react";
import { SleepData } from "../src/entities/SleepData";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { TrendingUp, Calendar, BarChart3, Moon } from "lucide-react";

import TrendChart from "../Components/trends/TrendChart";
import TrendFilters from "../Components/trends/TrendFilters";
import TrendStats from "../Components/trends/TrendStats";

export default function Trends() {
  const [sleepData, setSleepData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [selectedMetric, setSelectedMetric] = useState("sleep_score");

  useEffect(() => {
    loadTrendsData();
  }, []);

  useEffect(() => {
    filterDataByTimeRange();
  }, [sleepData, timeRange]);

  const loadTrendsData = async () => {
    setIsLoading(true);
    try {
      const data = await SleepData.getRecent(30);
      setSleepData(data);
    } catch (error) {
      console.error("Error loading trends data:", error);
    }
    setIsLoading(false);
  };

  const filterDataByTimeRange = () => {
    if (!sleepData.length) return;

    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "week":
        startDate = subDays(now, 7);
        break;
      case "month":
        startDate = subDays(now, 30);
        break;
      case "quarter":
        startDate = subDays(now, 90);
        break;
      default:
        startDate = subDays(now, 7);
    }

    const filtered = sleepData.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate;
    });

    setFilteredData(filtered);
  };

  const getMetricConfig = (metric) => {
    const configs = {
      sleep_score: {
        title: "Sleep Score",
        color: "#8b5cf6",
        unit: "/100",
        formatter: (value) => Math.round(value)
      },
      snoring_intensity: {
        title: "Snoring Intensity",
        color: "#f59e0b",
        unit: "dB",
        formatter: (value) => Math.round(value)
      },
      fragmentation_events: {
        title: "Sleep Fragmentation",
        color: "#ef4444",
        unit: "events/hr",
        formatter: (value) => Math.round(value)
      },
      deep_sleep_percentage: {
        title: "Deep Sleep",
        color: "#10b981",
        unit: "%",
        formatter: (value) => Math.round(value)
      }
    };
    return configs[metric] || configs.sleep_score;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
              Sleep Trends
            </h1>
            <p className="text-slate-400 text-lg">
              Analyze your sleep patterns over time
            </p>
          </div>

          <TrendFilters 
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
          />
        </div>

        {/* Statistics Cards */}
        <TrendStats 
          data={filteredData}
          metric={selectedMetric}
          isLoading={isLoading}
        />

        {/* Main Chart */}
        <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-100 mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              {getMetricConfig(selectedMetric).title} Trend
            </h2>
            <p className="text-slate-400">
              {timeRange === 'week' ? 'Past 7 days' : 
               timeRange === 'month' ? 'Past 30 days' : 'Past 90 days'}
            </p>
          </div>

          <TrendChart 
            data={filteredData}
            metric={selectedMetric}
            config={getMetricConfig(selectedMetric)}
            isLoading={isLoading}
          />
        </div>

        {/* Correlation Insights */}
        {filteredData.length > 0 && (
          <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-slate-100 mb-6 flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              Pattern Insights
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <h3 className="font-semibold text-slate-200 mb-2">Best Sleep Days</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Days with highest sleep scores tend to have:
                </p>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Lower fragmentation events</li>
                  <li>• Reduced snoring intensity</li>
                  <li>• Higher deep sleep percentage</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <h3 className="font-semibold text-slate-200 mb-2">Improvement Areas</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Focus on these factors for better sleep:
                </p>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Consistent bedtime routine</li>
                  <li>• Optimal room temperature</li>
                  <li>• Reduced evening screen time</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}