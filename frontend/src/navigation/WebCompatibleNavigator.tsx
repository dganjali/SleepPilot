import React from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../constants/colors';

interface WebCompatibleNavigatorProps {
  children: React.ReactNode;
}

export const WebCompatibleNavigator: React.FC<WebCompatibleNavigatorProps> = ({ children }) => {
  if (Platform.OS === 'web') {
    // Web version with simple tab navigation
    return (
      <View style={styles.webContainer}>
        <View style={styles.webHeader}>
          <Text style={styles.webHeaderTitle}>Sleep Health App</Text>
        </View>
        <View style={styles.webContent}>
          {children}
        </View>
      </View>
    );
  }
  
  // For native platforms, use regular navigation
  return <>{children}</>;
};

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: colors.sleep.darker,
  },
  webHeader: {
    backgroundColor: colors.sleep.dark,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[700],
  },
  webHeaderTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  webContent: {
    flex: 1,
    padding: 20,
  },
});
