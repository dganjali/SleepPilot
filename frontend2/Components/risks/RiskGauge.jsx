import React from "react";
import { motion } from "framer-motion";
import { Button } from "../../src/components/ui/button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Skeleton } from "../../src/components/ui/skeleton";

export default function RiskGauge({ risk, level, onLearnMore, isLoading }) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-6 border border-slate-700/50">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg bg-slate-800" />
            <div className="space-y-2">
              <Skeleton className="w-32 h-5 bg-slate-800" />
              <Skeleton className="w-40 h-4 bg-slate-800" />
            </div>
          </div>
          <Skeleton className="w-24 h-24 rounded-full mx-auto bg-slate-800" />
          <Skeleton className="w-full h-20 bg-slate-800" />
        </div>
      </div>
    );
  }

  const getRiskColor = () => {
    switch (level) {
      case 'high': return { 
        text: 'text-rose-400', 
        bg: 'bg-rose-500/10', 
        border: 'border-rose-500/20',
        gradient: 'from-rose-500 to-rose-400'
      };
      case 'medium': return { 
        text: 'text-amber-400', 
        bg: 'bg-amber-500/10', 
        border: 'border-amber-500/20',
        gradient: 'from-amber-500 to-amber-400'
      };
      case 'low': return { 
        text: 'text-emerald-400', 
        bg: 'bg-emerald-500/10', 
        border: 'border-emerald-500/20',
        gradient: 'from-emerald-500 to-emerald-400'
      };
      default: return { 
        text: 'text-slate-400', 
        bg: 'bg-slate-500/10', 
        border: 'border-slate-500/20',
        gradient: 'from-slate-500 to-slate-400'
      };
    }
  };

  const colors = getRiskColor();
  const Icon = risk.icon;
  
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (risk.percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-card rounded-xl p-6 border ${colors.border} ${colors.bg}`}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800/50">
              <Icon className={`w-6 h-6 ${colors.text}`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">{risk.title}</h3>
              <p className="text-sm text-slate-400">{risk.description}</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onLearnMore}
            className="text-slate-400 hover:text-slate-300"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>

        {/* Risk Percentage Gauge */}
        <div className="flex justify-center">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-slate-700"
              />
              
              {/* Progress Circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#riskGradient)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />

              <defs>
                <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className={`stop-color-${level === 'high' ? 'rose' : level === 'medium' ? 'amber' : 'emerald'}-500`} />
                  <stop offset="100%" className={`stop-color-${level === 'high' ? 'rose' : level === 'medium' ? 'amber' : 'emerald'}-400`} />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-xl font-bold ${colors.text}`}>
                  {risk.percentage}%
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">
                  {level}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300">Key Risk Factors:</h4>
          <div className="space-y-2">
            {risk.factors.map((factor, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-slate-400">
                <div className={`w-1.5 h-1.5 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
                {factor}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}