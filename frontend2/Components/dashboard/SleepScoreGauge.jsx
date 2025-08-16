
import React from "react";
import { motion } from "framer-motion";
import { Skeleton } from "../../src/components/ui/skeleton";
import { Moon, Star } from "lucide-react";

export default function SleepScoreGauge({ score, isLoading }) {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-[var(--success)]";
    if (score >= 60) return "text-[var(--warning)]";
    return "text-[var(--danger)]";
  };

  const getScoreStopColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (score / 100) * circumference;

  if (isLoading) {
    return (
      <div className="ios-card p-6">
        <div className="text-center space-y-4">
          <Skeleton className="w-48 h-48 rounded-full mx-auto bg-[var(--bg-tertiary)]" />
          <Skeleton className="w-32 h-8 mx-auto bg-[var(--bg-tertiary)]" />
          <Skeleton className="w-24 h-6 mx-auto bg-[var(--bg-tertiary)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="ios-card p-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Moon className="w-6 h-6 text-[var(--accent-primary)]" />
          <h2 className="text-xl font-semibold text-white">Sleep Score</h2>
        </div>

        {/* Circular Progress */}
        <div className="relative w-48 h-48 mx-auto">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 168 168">
            {/* Background Circle */}
            <circle
              cx="84"
              cy="84"
              r="80"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-[var(--bg-tertiary)]"
            />
            
            {/* Progress Circle */}
            <circle
              cx="84"
              cy="84"
              r="80"
              stroke={getScoreStopColor(score)}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Score Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-[var(--text-secondary)] text-sm mt-1">out of 100</div>
            </div>
          </div>
        </div>

        {/* Score Label */}
        <div className="space-y-1">
          <div className={`text-2xl font-semibold ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {score >= 80 
              ? "Outstanding sleep quality." 
              : score >= 60 
              ? "Good sleep. Room for improvement." 
              : "Consider optimizing your routine."}
          </p>
        </div>
      </div>
    </div>
  );
}
