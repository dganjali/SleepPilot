import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  onPress?: () => void;
  variant?: 'default' | 'warning' | 'success' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  color,
  onPress,
  variant = 'default',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return { bg: styles.warningBg, border: styles.warningBorder, text: styles.warningText };
      case 'success':
        return { bg: styles.successBg, border: styles.successBorder, text: styles.successText };
      case 'danger':
        return { bg: styles.dangerBg, border: styles.dangerBorder, text: styles.dangerText };
      default:
        return { bg: styles.defaultBg, border: styles.defaultBorder, text: styles.defaultText };
    }
  };

  const variantStyles = getVariantStyles();

  const CardContent = () => (
    <View style={[styles.card, variantStyles.bg, variantStyles.border]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={[styles.value, variantStyles.text]}>
          {value}
        </Text>
        {unit && (
          <Text style={[styles.unit, variantStyles.text]}>
            {unit}
          </Text>
        )}
      </View>
      
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    color: colors.gray[400],
    fontWeight: '500',
  },
  iconContainer: {
    marginLeft: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 16,
    marginLeft: 4,
    opacity: 0.8,
  },
  subtitle: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 4,
  },
  // Variant styles
  defaultBg: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
  },
  defaultBorder: {
    borderColor: colors.gray[700],
  },
  defaultText: {
    color: colors.gray[300],
  },
  warningBg: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
  },
  warningBorder: {
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  warningText: {
    color: colors.yellow,
  },
  successBg: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
  },
  successBorder: {
    borderColor: 'rgba(5, 150, 105, 0.3)',
  },
  successText: {
    color: colors.green,
  },
  dangerBg: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
  },
  dangerBorder: {
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  dangerText: {
    color: colors.red,
  },
});
