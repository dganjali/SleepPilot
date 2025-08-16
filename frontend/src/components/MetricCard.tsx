import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
}) => {
  return (
    <Card style={[styles.card, { backgroundColor: 'transparent' }]}>
      <Card.Content style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.value, { color }]} numberOfLines={1}>
            {value}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 12,
    elevation: 2,
  },
  content: {
    padding: 12,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default MetricCard;
