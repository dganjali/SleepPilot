import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { TrendsScreen } from '../screens/TrendsScreen';
import { RecommendationsScreen } from '../screens/RecommendationsScreen';
import { RisksScreen } from '../screens/RisksScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../constants/colors';

const Tab = createBottomTabNavigator();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
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
          tabBarActiveTintColor: colors.blue,
          tabBarInactiveTintColor: colors.gray[500],
          tabBarStyle: {
            backgroundColor: colors.sleep.dark,
            borderTopColor: colors.gray[700],
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 88,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={HomeScreen}
          options={{
            tabBarLabel: 'Dashboard',
          }}
        />
        <Tab.Screen 
          name="Trends" 
          component={TrendsScreen}
          options={{
            tabBarLabel: 'Trends',
          }}
        />
        <Tab.Screen 
          name="Recommendations" 
          component={RecommendationsScreen}
          options={{
            tabBarLabel: 'Tips',
          }}
        />
        <Tab.Screen 
          name="Risks" 
          component={RisksScreen}
          options={{
            tabBarLabel: 'Risks',
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
