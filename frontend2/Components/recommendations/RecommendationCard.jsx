import React from "react";
import { motion } from "framer-motion";
import {
  Thermometer,
  Lightbulb,
  Volume2,
  Droplets,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight
} from "lucide-react";
import { Button } from "../../src/components/ui/button";

export default function RecommendationCard({ recommendation, onToggleComplete }) {
  const getCategoryIcon = (category) => {
    const icons = {
      temperature: Thermometer,
      lighting: Lightbulb,
      sound: Volume2,
      humidity: Droplets,
      routine: Clock
    };
    return icons[category] || Clock;
  };

  const getCategoryColor = (category) => {
    const colors = {
      temperature: "text-cyan-400",
      lighting: "text-[var(--warning)]",
      sound: "text-[var(--accent-primary)]",
      humidity: "text-[var(--success)]",
      routine: "text-blue-400"
    };
    return colors[category] || "text-[var(--text-secondary)]";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-[var(--danger)]/20 text-[var(--danger)]';
      case 'medium': return 'bg-[var(--warning)]/20 text-[var(--warning)]';
      case 'low': return 'bg-[var(--success)]/20 text-[var(--success)]';
      default: return 'bg-[var(--text-secondary)]/20 text-[var(--text-secondary)]';
    }
  };

  const CategoryIcon = getCategoryIcon(recommendation.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`ios-card p-4 ${
        recommendation.is_completed 
          ? 'bg-[var(--success)]/5 border border-[var(--success)]/20' 
          : ''
      }`}
    >
      {/* Header Row */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-[var(--bg-tertiary)] ${getCategoryColor(recommendation.category)} flex-shrink-0`}>
          <CategoryIcon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-semibold text-base leading-tight ${
              recommendation.is_completed ? 'text-[var(--text-secondary)] line-through' : 'text-white'
            }`}>
              {recommendation.title}
            </h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getPriorityColor(recommendation.priority)}`}>
              {recommendation.priority.toUpperCase()}
            </div>
          </div>
          
          <p className={`text-sm leading-relaxed mb-3 ${
            recommendation.is_completed ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'
          }`}>
            {recommendation.description}
          </p>
          
          {recommendation.target_value && (
            <div className="flex items-center gap-2 text-sm mb-3">
              <span className="text-[var(--text-muted)]">Target:</span>
              <span className={`font-medium ${getCategoryColor(recommendation.category)}`}>
                {recommendation.target_value}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--separator)]">
        <div className="ios-inset-card px-3 py-2 flex-1 mr-3">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Quick Tip
          </div>
          <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {getImplementationTip(recommendation.category)}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleComplete}
          className={`transition-all duration-200 flex-shrink-0 ${
            recommendation.is_completed
              ? 'text-[var(--success)] hover:text-[var(--success)]/80'
              : 'text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          {recommendation.is_completed ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </Button>
      </div>
    </motion.div>
  );

  function getImplementationTip(category) {
    const tips = {
      temperature: "Use smart thermostat to auto-adjust 30min before bed.",
      lighting: "Smart bulbs with warm light settings after sunset work great.",
      sound: "Consistent background sounds help mask disruptions.",
      humidity: "A humidifier or good ventilation maintains optimal levels.",
      routine: "Set phone reminders to build consistent habits."
    };
    return tips[category] || "Follow consistently for 7-14 days for best results.";
  }
}