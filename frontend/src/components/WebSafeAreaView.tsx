import React from 'react';
import { Platform, View, ViewStyle } from 'react-native';

interface WebSafeAreaViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const WebSafeAreaView: React.FC<WebSafeAreaViewProps> = ({ children, style }) => {
  if (Platform.OS === 'web') {
    return (
      <View 
        testID="web-safe-area-view"
        style={[{ 
          flex: 1, 
          paddingTop: 20, 
          paddingBottom: 20,
          paddingHorizontal: 16 
        }, style]}
      >
        {children}
      </View>
    );
  }
  
  // For native platforms, use SafeAreaView
  const { SafeAreaView } = require('react-native-safe-area-context');
  return <SafeAreaView style={style}>{children}</SafeAreaView>;
};
