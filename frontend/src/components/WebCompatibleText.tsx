import React from 'react';
import { Platform, Text, TextProps } from 'react-native';

export const WebCompatibleText: React.FC<TextProps> = ({ children, style, ...props }) => {
  if (Platform.OS === 'web') {
    return (
      <span style={style as any} {...props}>
        {children}
      </span>
    );
  }
  
  return <Text style={style} {...props}>{children}</Text>;
};
