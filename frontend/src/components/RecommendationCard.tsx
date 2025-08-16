import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Recommendation } from '../types';
import { colors } from '../constants/colors';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAddToRoutine?: (rec: Recommendation) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAddToRoutine,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'temperature':
        return '🌡️';
      case 'lighting':
        return '💡';
      case 'noise':
        return '🔊';
      case 'humidity':
        return '💧';
      case 'airflow':
        return '💨';
      default:
        return '✨';
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: styles.highPriorityBg, border: styles.highPriorityBorder };
      case 'medium':
        return { bg: styles.mediumPriorityBg, border: styles.mediumPriorityBorder };
      case 'low':
        return { bg: styles.lowPriorityBg, border: styles.lowPriorityBorder };
      default:
        return { bg: styles.defaultPriorityBg, border: styles.defaultPriorityBorder };
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return 'Priority';
    }
  };

  const priorityStyles = getPriorityStyles(recommendation.priority);

  return (
    <View style={[styles.card, priorityStyles.bg, priorityStyles.border]}>
      <View style={styles.header}>
        <View style={styles.iconTitleContainer}>
          <Text style={styles.icon}>{getTypeIcon(recommendation.type)}</Text>
          <View style={styles.titleDescriptionContainer}>
            <Text style={styles.title}>
              {recommendation.title}
            </Text>
            <Text style={styles.description}>
              {recommendation.description}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>
            {recommendation.value}
          </Text>
          <Text style={styles.unit}>
            {recommendation.unit}
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <Text style={styles.priorityText}>
            {getPriorityText(recommendation.priority)}
          </Text>
          
          {recommendation.actionable && onAddToRoutine && (
            <TouchableOpacity
              onPress={() => onAddToRoutine(recommendation)}
              style={styles.addButton}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>
                Add to Routine
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    marginBottom: 12,
  },
  iconTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  titleDescriptionContainer: {
    flex: 1,
  },
  title: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 4,
  },
  description: {
    color: colors.gray[300],
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  unit: {
    fontSize: 18,
    color: colors.gray[400],
    marginLeft: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 12,
    color: colors.gray[500],
    marginRight: 8,
  },
  addButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  // Priority styles
  highPriorityBg: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
  },
  highPriorityBorder: {
    borderColor: 'rgba(220, 38, 38, 0.5)',
  },
  mediumPriorityBg: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
  },
  mediumPriorityBorder: {
    borderColor: 'rgba(217, 119, 6, 0.5)',
  },
  lowPriorityBg: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  lowPriorityBorder: {
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  defaultPriorityBg: {
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
  },
  defaultPriorityBorder: {
    borderColor: colors.gray[600],
  },
});
