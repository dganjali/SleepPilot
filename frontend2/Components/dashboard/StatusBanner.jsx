
import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function StatusBanner({ 
  type, 
  icon: Icon, 
  message, 
  description,
  onDismiss 
}) {
  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-[var(--success)]/10 border-[var(--success)]/20 text-[var(--success)]';
      case 'warning':
        return 'bg-[var(--warning)]/10 border-[var(--warning)]/20 text-[var(--warning)]';
      case 'danger':
        return 'bg-[var(--danger)]/10 border-[var(--danger)]/20 text-[var(--danger)]';
      default:
        return 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/20 text-[var(--accent-primary)]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`ios-card rounded-xl p-4 border ${getColors()}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-0.5">
          <h3 className="font-semibold text-white">{message}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{description}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
