import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import LandingScreen from './src/screens/LandingScreen.jsx';
import DashboardScreen from './src/screens/DashboardScreen.jsx';
import TrendsScreen from './src/screens/TrendsScreen.jsx';
import RecommendationsScreen from './src/screens/RecommendationsScreen.jsx';
import RisksScreen from './src/screens/RisksScreen.jsx';
import ProfileScreen from './src/screens/ProfileScreen.jsx';

// Import icons
import { Home, TrendingUp, Lightbulb, AlertTriangle, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;

          switch (route.name) {
            case 'Dashboard':
              IconComponent = Home;
              break;
            case 'Trends':
              IconComponent = TrendingUp;
              break;
            case 'Recommendations':
              IconComponent = Lightbulb;
              break;
            case 'Risks':
              IconComponent = AlertTriangle;
              break;
            case 'Profile':
              IconComponent = User;
              break;
            default:
              IconComponent = Home;
          }

          return <IconComponent size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: 'rgba(15, 15, 35, 0.95)',
          borderTopColor: 'rgba(139, 92, 246, 0.2)',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Trends" component={TrendsScreen} />
      <Tab.Screen name="Recommendations" component={RecommendationsScreen} />
      <Tab.Screen name="Risks" component={RisksScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
