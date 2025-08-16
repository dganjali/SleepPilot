import React from 'react';
import { Platform, View, ViewProps } from 'react-native';
import { colors } from '../constants/colors';

interface WebCompatibleDividerProps extends ViewProps {
  color?: string;
  thickness?: number;
  marginVertical?: number;
}

export const WebCompatibleDivider: React.FC<WebCompatibleDividerProps> = ({ 
  color = colors.gray[300], 
  thickness = 1,
  marginVertical = 8,
  style,
  ...props 
}) => {
  const dividerStyles = [
    {
      height: thickness,
      backgroundColor: color,
      marginVertical,
    },
    style,
  ];

  if (Platform.OS === 'web') {
    return <hr style={dividerStyles as any} {...props} />;
  }
  
  return <View style={dividerStyles} {...props} />;
};
