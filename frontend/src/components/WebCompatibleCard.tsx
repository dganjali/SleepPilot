import React from 'react';
import { Platform, View, ViewProps } from 'react-native';
import { colors } from '../constants/colors';

interface WebCompatibleCardProps extends ViewProps {
  children: React.ReactNode;
  elevation?: number;
  margin?: number;
}

export const WebCompatibleCard: React.FC<WebCompatibleCardProps> = ({ 
  children, 
  elevation = 2, 
  margin = 8,
  style,
  ...props 
}) => {
  const cardStyles = [
    {
      backgroundColor: colors.white,
      borderRadius: 8,
      padding: 16,
      margin,
      ...(Platform.OS === 'web' && {
        boxShadow: `0 ${elevation}px ${elevation * 2}px rgba(0, 0, 0, 0.1)`,
      }),
    },
    style,
  ];

  if (Platform.OS === 'web') {
    return (
      <div style={cardStyles as any} {...props}>
        {children}
      </div>
    );
  }
  
  return <View style={cardStyles} {...props}>{children}</View>;
};
