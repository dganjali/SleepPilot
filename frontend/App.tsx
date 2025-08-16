import React, { useState } from 'react';
import { Platform } from 'react-native';

// Import CSS for web
if (Platform.OS === 'web') {
  require('./web.css');
}

// Landing page component
const LandingPage: React.FC<{ onEnterApp: () => void }> = ({ onEnterApp }) => {
  const { WebLandingPage } = require('./src/screens/WebLandingPage');
  return <WebLandingPage onEnterApp={onEnterApp} />;
};

// Simple web-compatible app
const WebApp: React.FC = () => {
  const { WebSimpleNavigation } = require('./src/navigation/WebSimpleNavigation');
  return <WebSimpleNavigation />;
};

// Native app with full navigation
const NativeApp: React.FC = () => {
  const { AppNavigator } = require('./src/navigation/AppNavigator');
  const { WebCompatibleNavigator } = require('./src/navigation/WebCompatibleNavigator');
  
  return (
    <WebCompatibleNavigator>
      <AppNavigator />
    </WebCompatibleNavigator>
  );
};

export default function App() {
  const [showLandingPage, setShowLandingPage] = useState(true);

  if (Platform.OS === 'web') {
    if (showLandingPage) {
      return <LandingPage onEnterApp={() => setShowLandingPage(false)} />;
    }
    return <WebApp />;
  }
  
  return <NativeApp />;
}
