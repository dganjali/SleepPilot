import React from 'react';
import { Platform, TouchableOpacity, TouchableOpacityProps, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface WebCompatibleButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export const WebCompatibleButton: React.FC<WebCompatibleButtonProps> = ({ 
  title, 
  variant = 'primary', 
  size = 'medium',
  style,
  ...props 
}) => {
  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[size],
    style,
  ];

  if (Platform.OS === 'web') {
    return (
      <button
        style={buttonStyles as any}
        onClick={props.onPress}
        disabled={props.disabled}
        className={`web-button web-button-${variant} web-button-${size}`}
      >
        {title}
      </button>
    );
  }
  
  return (
    <TouchableOpacity style={buttonStyles} {...props}>
      <Text style={[styles.buttonText, styles[`${variant}Text`]]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primary: {
    backgroundColor: colors.blue,
  },
  secondary: {
    backgroundColor: colors.gray[600],
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.blue,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 44,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 52,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.blue,
  },
});
