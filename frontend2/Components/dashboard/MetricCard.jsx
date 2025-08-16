
import React from "react";
import { Skeleton } from "../../src/components/ui/skeleton";
import { motion } from "framer-motion";

export default function MetricCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  color = "text-indigo-400",
  isLoading 
}) {
  if (isLoading) {
    return (
      <div className="ios-card p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)]" />
            <Skeleton className="w-20 h-5 bg-[var(--bg-tertiary)]" />
          </div>
          <Skeleton className="w-16 h-8 bg-[var(--bg-tertiary)]" />
          <Skeleton className="w-24 h-4 bg-[var(--bg-tertiary)]" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="ios-card p-4"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <h3 className="font-medium text-sm text-[var(--text-secondary)]">{title}</h3>
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-white">
            {value}
          </div>
          {subtitle && (
            <div className="text-sm font-semibold">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}