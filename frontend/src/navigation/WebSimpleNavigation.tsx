import React, { useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

// Import fallback screen for testing
const WebFallbackScreen = ({ title }: { title: string }) => {
  const { WebFallbackScreen } = require('../screens/WebFallbackScreen');
  return <WebFallbackScreen title={title} />;
};

// Import screens conditionally
const HomeScreen = () => {
  try {
    const { WebHomeScreen } = require('../screens/WebHomeScreen');
    return <WebHomeScreen />;
  } catch (error) {
    return <WebFallbackScreen title="Home" message="Home screen is loading..." />;
  }
};

const TrendsScreen = () => {
  try {
    const { WebTrendsScreen } = require('../screens/WebTrendsScreen');
    return <WebTrendsScreen />;
  } catch (error) {
    return <WebFallbackScreen title="Trends" message="Trends screen is loading..." />;
  }
};

const RecommendationsScreen = () => {
  try {
    const { RecommendationsScreen } = require('../screens/RecommendationsScreen');
    return <RecommendationsScreen />;
  } catch (error) {
    return <WebFallbackScreen title="Recommendations" message="Recommendations screen is loading..." />;
  }
};

const RisksScreen = () => {
  try {
    const { RisksScreen } = require('../screens/RisksScreen');
    return <RisksScreen />;
  } catch (error) {
    return <WebFallbackScreen title="Risks" message="Risks screen is loading..." />;
  }
};

const ProfileScreen = () => {
  try {
    const { ProfileScreen } = require('../screens/ProfileScreen');
    return <ProfileScreen />;
  } catch (error) {
    return <WebFallbackScreen title="Profile" message="Profile screen is loading..." />;
  }
};

const screens = {
  home: HomeScreen,
  trends: TrendsScreen,
  recommendations: RecommendationsScreen,
  risks: RisksScreen,
  profile: ProfileScreen,
};

export const WebSimpleNavigation: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState('home');

  if (Platform.OS !== 'web') {
    // For native platforms, use regular navigation
    const { AppNavigator } = require('./AppNavigator');
    return <AppNavigator />;
  }

  const ActiveScreen = screens[activeScreen as keyof typeof screens];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sleep Pilot</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => window.location.reload()}
        >
          <Text style={styles.backButtonText}>← Back to Landing</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        {Object.keys(screens).map((screen) => (
          <TouchableOpacity
            key={screen}
            style={[
              styles.tab,
              activeScreen === screen && styles.activeTab
            ]}
            onPress={() => setActiveScreen(screen)}
          >
            <Text style={[
              styles.tabText,
              activeScreen === screen && styles.activeTabText
            ]}>
              {screen.charAt(0).toUpperCase() + screen.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ActiveScreen />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sleep.darker,
  },
  header: {
    backgroundColor: colors.sleep.dark,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[700],
  },
  headerTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.sleep.dark,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[700],
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.blue,
  },
  tabText: {
    color: colors.gray[400],
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: colors.gray[700],
    borderRadius: 8,
    alignSelf: 'center',
  },
  backButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});
