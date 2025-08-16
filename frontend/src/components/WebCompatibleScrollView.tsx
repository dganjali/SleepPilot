import React from 'react';
import { Platform, ScrollView, ScrollViewProps } from 'react-native';

export const WebCompatibleScrollView: React.FC<ScrollViewProps> = ({ 
  children, 
  style, 
  contentContainerStyle,
  ...props 
}) => {
  if (Platform.OS === 'web') {
    return (
      <div 
        style={{
          ...(style as any),
          overflow: 'auto',
          height: '100%',
        }}
        {...props}
      >
        <div style={contentContainerStyle as any}>
          {children}
        </div>
      </div>
    );
  }
  
  return (
    <ScrollView style={style} contentContainerStyle={contentContainerStyle} {...props}>
      {children}
    </ScrollView>
  );
};
