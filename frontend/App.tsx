import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { WebCompatibleNavigator } from './src/navigation/WebCompatibleNavigator';

// Import CSS for web
if (Platform.OS === 'web') {
  require('./web.css');
}

// Web-compatible wrapper component
const WebSafeAreaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (Platform.OS === 'web') {
    return <div style={{ height: '100vh', width: '100vw' }}>{children}</div>;
  }
  
  // For native platforms, use SafeAreaProvider
  const { SafeAreaProvider } = require('react-native-safe-area-context');
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
};

// Web-compatible StatusBar
const WebStatusBar: React.FC = () => {
  if (Platform.OS === 'web') {
    return null; // StatusBar doesn't exist on web
  }
  
  return <StatusBar style="light" />;
};

export default function App() {
  return (
    <WebSafeAreaProvider>
      <WebStatusBar />
      <AppNavigator />
    </WebSafeAreaProvider>
  );
}
