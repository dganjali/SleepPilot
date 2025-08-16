import React from 'react';
import { Platform, Switch, SwitchProps, TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface WebCompatibleSwitchProps extends Omit<SwitchProps, 'onValueChange'> {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const WebCompatibleSwitch: React.FC<WebCompatibleSwitchProps> = ({ 
  value, 
  onValueChange, 
  ...props 
}) => {
  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity
        onPress={() => onValueChange(!value)}
        style={[
          styles.webSwitch,
          value ? styles.webSwitchActive : styles.webSwitchInactive
        ]}
        activeOpacity={0.7}
      >
        <View style={[
          styles.webSwitchThumb,
          value ? styles.webSwitchThumbActive : styles.webSwitchThumbInactive
        ]} />
      </TouchableOpacity>
    );
  }
  
  // For native platforms, use the regular Switch
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#475569', true: '#3b82f6' }}
      thumbColor="#ffffff"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  webSwitch: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    padding: 2,
    justifyContent: 'center',
  },
  webSwitchActive: {
    backgroundColor: '#3b82f6',
  },
  webSwitchInactive: {
    backgroundColor: '#475569',
  },
  webSwitchThumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
  },
  webSwitchThumbActive: {
    backgroundColor: '#ffffff',
    transform: [{ translateX: 20 }],
  },
  webSwitchThumbInactive: {
    backgroundColor: '#ffffff',
    transform: [{ translateX: 0 }],
  },
});
