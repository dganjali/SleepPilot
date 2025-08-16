import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Skeleton } from "../../src/components/ui/skeleton";

export default function TrendChart({ data, metric, config, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-64 bg-slate-800/50" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p>No data available for the selected period</p>
        </div>
      </div>
    );
  }

  const chartData = data.map(record => ({
    ...record,
    date_formatted: format(new Date(record.date), 'MMM d'),
    value: record[metric] || 0
  })).reverse();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-slate-700/50 rounded-lg">
          <p className="text-slate-200 font-medium">{label}</p>
          <p className="text-indigo-400">
            {config.title}: {config.formatter(payload[0].value)}{config.unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="date_formatted" 
            stroke="#9CA3AF"
            fontSize={12}
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tick={{ fill: '#9CA3AF' }}
            domain={metric === 'sleep_score' ? [0, 100] : ['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={config.color}
            strokeWidth={3}
            dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: config.color, strokeWidth: 2, fill: '#1e293b' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}