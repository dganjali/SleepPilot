
import React, { useState, useEffect } from "react";
import { SleepRecommendation } from "../src/entities/SleepRecommendation";
import { format } from "date-fns";
import { Lightbulb, Plus } from "lucide-react"; // Removed 'Filter' as per outline
import { Button } from "../src/components/ui/button";

import RecommendationCard from "../Components/recommendations/RecommendationCard";
import RecommendationFilters from "../Components/recommendations/RecommendationFilters";
import AddRecommendationDialog from "../Components/recommendations/AddRecommendationDialog.jsx";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  useEffect(() => {
    filterRecommendations();
  }, [recommendations, activeFilter]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const data = await SleepRecommendation.list('-date', 20);
      setRecommendations(data);
    } catch (error) {
      console.error("Error loading recommendations:", error);
    }
    setIsLoading(false);
  };

  const filterRecommendations = () => {
    if (activeFilter === "all") {
      setFilteredRecommendations(recommendations);
    } else if (activeFilter === "pending") {
      setFilteredRecommendations(recommendations.filter(r => !r.is_completed));
    } else if (activeFilter === "completed") {
      setFilteredRecommendations(recommendations.filter(r => r.is_completed));
    } else {
      setFilteredRecommendations(recommendations.filter(r => r.category === activeFilter));
    }
  };

  const handleCompleteRecommendation = async (recommendationId) => {
    try {
      const recommendation = recommendations.find(r => r.id === recommendationId);
      await SleepRecommendation.update(recommendationId, {
        ...recommendation,
        is_completed: !recommendation.is_completed
      });
      loadRecommendations();
    } catch (error) {
      console.error("Error updating recommendation:", error);
    }
  };

  const handleAddRecommendation = async (newRecommendation) => {
    try {
      await SleepRecommendation.create({
        ...newRecommendation,
        date: format(new Date(), 'yyyy-MM-dd')
      });
      setShowAddDialog(false);
      loadRecommendations();
    } catch (error) {
      console.error("Error adding recommendation:", error);
    }
  };

  const getCompletionStats = () => {
    const total = recommendations.length;
    const completed = recommendations.filter(r => r.is_completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  const stats = getCompletionStats();

  return (
    <div className="min-h-screen p-4 space-y-6 pb-32">
      {/* Header */}
      <div className="px-2">
        <h1 className="text-3xl font-bold text-white mb-1">
          Recommendations
        </h1>
        <p className="text-[var(--text-secondary)] text-base">
          AI-powered sleep optimization
        </p>
      </div>

      {/* Add Button */}
      <Button
        onClick={() => setShowAddDialog(true)}
        className="w-full h-12 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-black font-semibold"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Custom Recommendation
      </Button>

      {/* Progress Stats */}
      <div className="ios-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Progress</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {stats.completed} of {stats.total} completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[var(--accent-primary)]">{stats.percentage}%</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2">
          <div 
            className="bg-[var(--accent-primary)] h-2 rounded-full transition-all duration-500"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <RecommendationFilters 
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        recommendations={recommendations}
      />

      {/* Recommendations List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-[var(--text-secondary)]">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent-primary)]" />
              Loading recommendations...
            </div>
          </div>
        ) : filteredRecommendations.length > 0 ? (
          filteredRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onToggleComplete={() => handleCompleteRecommendation(recommendation.id)}
            />
          ))
        ) : (
          <div className="text-center py-16 px-4">
            <div className="text-6xl mb-4">🌙</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No recommendations found
            </h3>
            <p className="text-[var(--text-secondary)] text-center max-w-sm mx-auto">
              {activeFilter === "all" 
                ? "Add your first sleep optimization recommendation to get started"
                : "Try adjusting your filters to see more results"}
            </p>
          </div>
        )}
      </div>

      {/* Add Recommendation Dialog */}
      <AddRecommendationDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddRecommendation}
      />
    </div>
  );
}
