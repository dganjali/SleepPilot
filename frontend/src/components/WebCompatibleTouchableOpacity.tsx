import React from 'react';
import { Platform, TouchableOpacity, TouchableOpacityProps } from 'react-native';

export const WebCompatibleTouchableOpacity: React.FC<TouchableOpacityProps> = ({ 
  children, 
  style, 
  onPress,
  activeOpacity = 0.7,
  ...props 
}) => {
  if (Platform.OS === 'web') {
    return (
      <button
        style={{
          ...(style as any),
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: 0,
          margin: 0,
          fontFamily: 'inherit',
          fontSize: 'inherit',
        }}
        onClick={onPress}
        onMouseDown={(e) => {
          if (activeOpacity !== 1) {
            (e.currentTarget as any).style.opacity = activeOpacity;
          }
        }}
        onMouseUp={(e) => {
          if (activeOpacity !== 1) {
            (e.currentTarget as any).style.opacity = '1';
          }
        }}
        onMouseLeave={(e) => {
          if (activeOpacity !== 1) {
            (e.currentTarget as any).style.opacity = '1';
          }
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
  
  return (
    <TouchableOpacity 
      style={style} 
      onPress={onPress} 
      activeOpacity={activeOpacity}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};
