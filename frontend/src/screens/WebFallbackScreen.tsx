import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface WebFallbackScreenProps {
  title: string;
  message?: string;
}

export const WebFallbackScreen: React.FC<WebFallbackScreenProps> = ({ 
  title, 
  message = "This screen is being loaded..." 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    color: colors.gray[400],
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
