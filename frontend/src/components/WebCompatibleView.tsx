import React from 'react';
import { Platform, View, ViewProps } from 'react-native';

export const WebCompatibleView: React.FC<ViewProps> = ({ children, style, ...props }) => {
  if (Platform.OS === 'web') {
    return (
      <div style={style as any} {...props}>
        {children}
      </div>
    );
  }
  
  return <View style={style} {...props}>{children}</View>;
};
