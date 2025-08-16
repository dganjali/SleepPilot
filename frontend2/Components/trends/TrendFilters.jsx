import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../src/components/ui/select";
import { Button } from "../../src/components/ui/button";
import { Calendar, BarChart3 } from "lucide-react";

export default function TrendFilters({ 
  timeRange, 
  setTimeRange, 
  selectedMetric, 
  setSelectedMetric 
}) {
  const timeRanges = [
    { value: "week", label: "7 Days" },
    { value: "month", label: "30 Days" },
    { value: "quarter", label: "90 Days" }
  ];

  const metrics = [
    { value: "sleep_score", label: "Sleep Score" },
    { value: "snoring_intensity", label: "Snoring Intensity" },
    { value: "fragmentation_events", label: "Fragmentation" },
    { value: "deep_sleep_percentage", label: "Deep Sleep %" }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">Time Range</span>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map(range => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">Metric</span>
        </div>
        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="w-44 bg-slate-800/50 border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {metrics.map(metric => (
              <SelectItem key={metric.value} value={metric.value}>
                {metric.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}