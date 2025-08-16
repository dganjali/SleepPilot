import React from "react";
import { 
  Thermometer, 
  Lightbulb, 
  Volume2, 
  Droplets, 
  Clock,
  CheckCircle2,
  Circle,
  Grid3X3
} from "lucide-react";

export default function RecommendationFilters({ 
  activeFilter, 
  setActiveFilter, 
  recommendations 
}) {
  const getFilterCount = (filter) => {
    if (filter === "all") return recommendations.length;
    if (filter === "pending") return recommendations.filter(r => !r.is_completed).length;
    if (filter === "completed") return recommendations.filter(r => r.is_completed).length;
    return recommendations.filter(r => r.category === filter).length;
  };

  const topFilters = [
    {
      key: "all",
      label: "All",
      icon: Grid3X3
    },
    {
      key: "pending",
      label: "Pending",
      icon: Circle
    },
    {
      key: "completed",
      label: "Done",
      icon: CheckCircle2
    }
  ];

  const categoryFilters = [
    {
      key: "temperature",
      label: "Temp",
      icon: Thermometer
    },
    {
      key: "lighting",
      label: "Light",
      icon: Lightbulb
    },
    {
      key: "sound",
      label: "Sound",
      icon: Volume2
    },
    {
      key: "humidity",
      label: "Humidity",
      icon: Droplets
    },
    {
      key: "routine",
      label: "Routine",
      icon: Clock
    }
  ];

  const FilterButton = ({ filter, isCompact = false }) => {
    const Icon = filter.icon;
    const count = getFilterCount(filter.key);
    const isActive = activeFilter === filter.key;
    
    return (
      <button
        key={filter.key}
        onClick={() => setActiveFilter(filter.key)}
        disabled={count === 0}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
          isActive 
            ? 'bg-[var(--accent-primary)] text-black font-medium' 
            : count === 0 
            ? 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] opacity-50' 
            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/80'
        } ${isCompact ? 'text-xs' : 'text-sm'}`}
      >
        <Icon className={`${isCompact ? 'w-4 h-4' : 'w-4 h-4'}`} />
        <span className={isCompact ? 'hidden sm:inline' : ''}>{filter.label}</span>
        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
          isActive 
            ? 'bg-black/20 text-black' 
            : 'bg-[var(--separator)] text-[var(--text-muted)]'
        }`}>
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Filters */}
      <div className="flex gap-2">
        {topFilters.map((filter) => (
          <FilterButton key={filter.key} filter={filter} />
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categoryFilters.map((filter) => (
          <FilterButton key={filter.key} filter={filter} isCompact={true} />
        ))}
      </div>
    </div>
  );
}