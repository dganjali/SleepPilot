import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import TrendsScreen from './src/screens/TrendsScreen';
import RecommendationsScreen from './src/screens/RecommendationsScreen';
import RisksScreen from './src/screens/RisksScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Import theme and store
import { theme } from './src/theme/theme';
import { useSleepStore } from './src/store/sleepStore';

const Tab = createBottomTabNavigator();

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={theme}>
            <NavigationContainer>
              <StatusBar style="light" backgroundColor={theme.colors.primary} />
              <TabNavigator />
            </NavigationContainer>
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function TabNavigator() {
  const { hasNewAlerts } = useSleepStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Trends') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Recommendations') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          } else if (route.name === 'Risks') {
            iconName = focused ? 'warning' : 'warning-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Sleep Health',
          tabBarBadge: hasNewAlerts ? '!' : undefined,
        }}
      />
      <Tab.Screen 
        name="Trends" 
        component={TrendsScreen}
        options={{ title: 'Trends & Insights' }}
      />
      <Tab.Screen 
        name="Recommendations" 
        component={RecommendationsScreen}
        options={{ title: 'Recommendations' }}
      />
      <Tab.Screen 
        name="Risks" 
        component={RisksScreen}
        options={{ title: 'Sleep Risks' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile & Settings' }}
      />
    </Tab.Navigator>
  );
}
