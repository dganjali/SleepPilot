import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Lightbulb, 
  Plus,
  Thermometer, 
  Lightbulb as LightIcon, 
  Volume2, 
  Droplets, 
  Clock,
  CheckCircle2,
  Circle,
  Grid
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function RecommendationsScreen() {
  const [activeFilter, setActiveFilter] = useState('all');

  const recommendations = [
    {
      id: 1,
      title: 'Optimize Room Temperature',
      description: 'Lower your room temperature to 18-20°C for optimal sleep',
      category: 'temperature',
      priority: 'high',
      is_completed: false,
      estimated_impact: '+15 points',
      time_to_implement: '5 minutes',
    },
    {
      id: 2,
      title: 'Reduce Blue Light Exposure',
      description: 'Use night mode on devices 2 hours before bedtime',
      category: 'lighting',
      priority: 'medium',
      is_completed: true,
      estimated_impact: '+8 points',
      time_to_implement: '2 minutes',
    },
    {
      id: 3,
      title: 'Create White Noise',
      description: 'Add a white noise machine to mask disruptive sounds',
      category: 'sound',
      priority: 'low',
      is_completed: false,
      estimated_impact: '+5 points',
      time_to_implement: '10 minutes',
    },
    {
      id: 4,
      title: 'Maintain Humidity Levels',
      description: 'Keep humidity between 40-60% for comfortable sleep',
      category: 'humidity',
      priority: 'medium',
      is_completed: false,
      estimated_impact: '+6 points',
      time_to_implement: '15 minutes',
    },
    {
      id: 5,
      title: 'Establish Sleep Routine',
      description: 'Go to bed and wake up at the same time daily',
      category: 'routine',
      priority: 'high',
      is_completed: false,
      estimated_impact: '+20 points',
      time_to_implement: 'Ongoing',
    },
  ];

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
      icon: Grid
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
      icon: LightIcon
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return '#EBEBF599';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'temperature': return Thermometer;
      case 'lighting': return LightIcon;
      case 'sound': return Volume2;
      case 'humidity': return Droplets;
      case 'routine': return Clock;
      default: return Lightbulb;
    }
  };

  const renderRecommendationCard = (recommendation) => {
    const CategoryIcon = getCategoryIcon(recommendation.category);
    const priorityColor = getPriorityColor(recommendation.priority);

    return (
      <TouchableOpacity key={recommendation.id} style={styles.recommendationCard}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryIcon}>
            <CategoryIcon size={20} color="#A890FE" />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>{recommendation.title}</Text>
            <View style={styles.priorityBadge}>
              <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1)} Priority
              </Text>
            </View>
          </View>
          {recommendation.is_completed && (
            <CheckCircle2 size={24} color="#34C759" />
          )}
        </View>
        
        <Text style={styles.cardDescription}>{recommendation.description}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.impactBadge}>
            <Text style={styles.impactText}>{recommendation.estimated_impact}</Text>
          </View>
          <Text style={styles.timeText}>{recommendation.time_to_implement}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterButton = ({ filter, isCompact = false }) => {
    const Icon = filter.icon;
    const count = getFilterCount(filter.key);
    const isActive = activeFilter === filter.key;
    
    return (
      <TouchableOpacity
        key={filter.key}
        onPress={() => setActiveFilter(filter.key)}
        disabled={count === 0}
        style={[
          styles.filterButton,
          isActive && styles.filterButtonActive,
          count === 0 && styles.filterButtonDisabled,
          isCompact && styles.filterButtonCompact
        ]}
      >
        <Icon size={16} color={isActive ? '#000000' : '#EBEBF599'} />
        <Text style={[
          styles.filterButtonText,
          isActive && styles.filterButtonTextActive,
          count === 0 && styles.filterButtonTextDisabled,
          isCompact && styles.filterButtonTextCompact
        ]}>
          {filter.label}
        </Text>
        <View style={[
          styles.filterCount,
          isActive && styles.filterCountActive,
          count === 0 && styles.filterCountDisabled
        ]}>
          <Text style={[
            styles.filterCountText,
            isActive && styles.filterCountTextActive,
            count === 0 && styles.filterCountTextDisabled
          ]}>
            {count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return !rec.is_completed;
    if (activeFilter === 'completed') return rec.is_completed;
    return rec.category === activeFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Recommendations</Text>
            <Text style={styles.headerSubtitle}>
              Personalized tips to improve your sleep quality
            </Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={24} color="#A890FE" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          {/* Main Filters */}
          <View style={styles.mainFilters}>
            {topFilters.map((filter) => (
              <FilterButton key={filter.key} filter={filter} />
            ))}
          </View>

          {/* Category Filters */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilters}
            contentContainerStyle={styles.categoryFiltersContent}
          >
            {categoryFilters.map((filter) => (
              <FilterButton key={filter.key} filter={filter} isCompact={true} />
            ))}
          </ScrollView>
        </View>

        {/* Recommendations List */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>
            {activeFilter === 'all' ? 'All Recommendations' : 
             activeFilter === 'pending' ? 'Pending Actions' :
             activeFilter === 'completed' ? 'Completed Actions' :
             `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Recommendations`}
          </Text>
          <View style={styles.recommendationsList}>
            {filteredRecommendations.map(renderRecommendationCard)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#EBEBF599',
    lineHeight: 22,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 144, 254, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  filtersSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  mainFilters: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
  },
  filterButtonActive: {
    backgroundColor: '#A890FE',
  },
  filterButtonDisabled: {
    opacity: 0.5,
  },
  filterButtonCompact: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EBEBF599',
  },
  filterButtonTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  filterButtonTextDisabled: {
    color: '#EBEBF54D',
  },
  filterButtonTextCompact: {
    fontSize: 12,
  },
  filterCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 56, 58, 0.8)',
  },
  filterCountActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  filterCountDisabled: {
    backgroundColor: 'rgba(56, 56, 58, 0.4)',
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EBEBF599',
  },
  filterCountTextActive: {
    color: '#000000',
  },
  filterCountTextDisabled: {
    color: '#EBEBF54D',
  },
  categoryFilters: {
    marginBottom: 8,
  },
  categoryFiltersContent: {
    gap: 8,
  },
  recommendationsSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  recommendationsList: {
    gap: 16,
  },
  recommendationCard: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 144, 254, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 14,
    color: '#EBEBF599',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  impactBadge: {
    backgroundColor: 'rgba(168, 144, 254, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  impactText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A890FE',
  },
  timeText: {
    fontSize: 12,
    color: '#EBEBF599',
  },
});
