import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

interface StatusBannerProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  onPress?: () => void;
}

const StatusBanner: React.FC<StatusBannerProps> = ({
  type,
  title,
  message,
  onPress,
}) => {
  const theme = useTheme();

  const getBannerColors = () => {
    switch (type) {
      case 'error':
        return {
          background: theme.colors.errorContainer,
          text: theme.colors.onError,
          icon: theme.colors.error,
        };
      case 'warning':
        return {
          background: theme.colors.warningContainer,
          text: theme.colors.onWarning,
          icon: theme.colors.warning,
        };
      case 'success':
        return {
          background: theme.colors.successContainer,
          text: theme.colors.onSuccess,
          icon: theme.colors.success,
        };
      case 'info':
      default:
        return {
          background: theme.colors.infoContainer,
          text: theme.colors.onInfo,
          icon: theme.colors.info,
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'success':
        return 'checkmark-circle';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  const colors = getBannerColors();

  const BannerContent = () => (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={getIcon() as any} size={24} color={colors.icon} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
          {message}
        </Text>
      </View>
      {onPress && (
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        <BannerContent />
      </TouchableOpacity>
    );
  }

  return <BannerContent />;
};

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  arrowContainer: {
    marginLeft: 8,
  },
});

export default StatusBanner;
