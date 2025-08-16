import { MD3DarkTheme } from 'react-native-paper';

export const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary colors - calming blues and purples
    primary: '#6366f1', // Indigo
    primaryContainer: '#4338ca',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#e0e7ff',
    
    // Secondary colors - soft teals
    secondary: '#14b8a6', // Teal
    secondaryContainer: '#0f766e',
    onSecondary: '#ffffff',
    onSecondaryContainer: '#ccfbf1',
    
    // Tertiary colors - warm accents
    tertiary: '#f59e0b', // Amber
    tertiaryContainer: '#d97706',
    onTertiary: '#000000',
    onTertiaryContainer: '#fef3c7',
    
    // Surface colors - dark theme
    surface: '#0f172a', // Slate 900
    surfaceVariant: '#1e293b', // Slate 800
    onSurface: '#f1f5f9', // Slate 100
    onSurfaceVariant: '#cbd5e1', // Slate 300
    
    // Background colors
    background: '#020617', // Slate 950
    onBackground: '#f8fafc', // Slate 50
    
    // Error colors
    error: '#ef4444', // Red 500
    errorContainer: '#dc2626',
    onError: '#ffffff',
    onErrorContainer: '#fef2f2',
    
    // Success colors
    success: '#10b981', // Emerald 500
    successContainer: '#059669',
    onSuccess: '#ffffff',
    onSuccessContainer: '#ecfdf5',
    
    // Warning colors
    warning: '#f59e0b', // Amber 500
    warningContainer: '#d97706',
    onWarning: '#000000',
    onWarningContainer: '#fffbeb',
    
    // Info colors
    info: '#3b82f6', // Blue 500
    infoContainer: '#2563eb',
    onInfo: '#ffffff',
    onInfoContainer: '#eff6ff',
    
    // Outline and borders
    outline: '#334155', // Slate 700
    outlineVariant: '#475569', // Slate 600
    
    // Sleep-specific colors
    sleepScore: {
      excellent: '#10b981', // 90-100
      good: '#3b82f6', // 70-89
      fair: '#f59e0b', // 50-69
      poor: '#ef4444', // 0-49
    },
    
    riskLevel: {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626',
    },
    
    // Gradient colors
    gradients: {
      primary: ['#6366f1', '#4338ca'],
      secondary: ['#14b8a6', '#0f766e'],
      background: ['#020617', '#0f172a'],
      card: ['#1e293b', '#334155'],
    },
  },
  
  // Typography
  fonts: {
    ...MD3DarkTheme.fonts,
    // Custom font weights
    light: { fontWeight: '300' as const },
    regular: { fontWeight: '400' as const },
    medium: { fontWeight: '500' as const },
    semiBold: { fontWeight: '600' as const },
    bold: { fontWeight: '700' as const },
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    round: 50,
  },
  
  // Shadows
  shadows: {
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Animation durations
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};
