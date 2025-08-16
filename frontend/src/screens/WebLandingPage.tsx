import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/colors';

interface WebLandingPageProps {
  onEnterApp: () => void;
}

export const WebLandingPage: React.FC<WebLandingPageProps> = ({ onEnterApp }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(100));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  if (typeof window !== 'undefined') {
    // Add CSS animations for clouds on web
    useEffect(() => {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
          75% { transform: translateY(-15px) rotate(2deg); }
        }
        
        @keyframes drift {
          0% { transform: translateX(0px); }
          50% { transform: translateX(30px); }
          100% { transform: translateX(0px); }
        }
        
        .floating-cloud {
          animation: float 6s ease-in-out infinite, drift 8s ease-in-out infinite;
        }
        
        .floating-cloud:nth-child(2n) {
          animation-delay: -2s;
        }
        
        .floating-cloud:nth-child(3n) {
          animation-delay: -4s;
        }
        
        .floating-cloud:nth-child(4n) {
          animation-delay: -6s;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }, []);
  }

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <View style={styles.gradientBackground} />
      
      {/* Floating clouds */}
      <View style={styles.cloudsContainer}>
        <Text style={[styles.cloud, styles.cloud1, styles.floatingCloud]}>☁️</Text>
        <Text style={[styles.cloud, styles.cloud2, styles.floatingCloud]}>☁️</Text>
        <Text style={[styles.cloud, styles.cloud3, styles.floatingCloud]}>☁️</Text>
        <Text style={[styles.cloud, styles.cloud4, styles.floatingCloud]}>☁️</Text>
        <Text style={[styles.cloud, styles.cloud5, styles.floatingCloud]}>☁️</Text>
        <Text style={[styles.cloud, styles.cloud6, styles.floatingCloud]}>☁️</Text>
        <Text style={[styles.cloud, styles.cloud7, styles.floatingCloud]}>☁️</Text>
        <Text style={[styles.cloud, styles.cloud8, styles.floatingCloud]}>☁️</Text>
      </View>
      
      {/* Content */}
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }] 
          }
        ]}
        className="landing-content"
      >
        {/* Logo and Title */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { className: 'logo-container' }]}>
            <Text style={styles.logoEmoji}>🌙</Text>
          </View>
          <Text style={styles.title}>Sleep Pilot</Text>
          <Text style={styles.subtitle}>
            Navigate your way to better sleep with AI-powered insights
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={[styles.feature, { className: 'feature' }]}>
            <Text style={[styles.featureIcon, { className: 'feature-icon' }]}>📊</Text>
            <Text style={styles.featureText}>Smart Analytics</Text>
          </View>
          <View style={[styles.feature, { className: 'feature' }]}>
            <Text style={[styles.featureIcon, { className: 'feature-icon' }]}>🎯</Text>
            <Text style={styles.featureText}>Personalized Tips</Text>
          </View>
          <View style={[styles.feature, { className: 'feature' }]}>
            <Text style={[styles.featureIcon, { className: 'feature-icon' }]}>🔮</Text>
            <Text style={styles.featureText}>AI Predictions</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.signUpButton} 
            onPress={onEnterApp}
            className="sign-up-button"
          >
            <Text style={styles.signUpText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.signInButton}
            className="sign-in-button"
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Join thousands of pilots on their sleep journey
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${colors.background.primary} 0%, ${colors.background.secondary} 50%, ${colors.background.tertiary} 100%)`,
    opacity: 0.9,
  },
  cloudsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  cloud: {
    position: 'absolute',
    fontSize: 60,
    opacity: 0.3,
    zIndex: 1,
  },
  cloud1: { top: '10%', left: '5%', fontSize: 80 },
  cloud2: { top: '20%', right: '10%', fontSize: 70 },
  cloud3: { top: '60%', left: '15%', fontSize: 90 },
  cloud4: { top: '70%', right: '20%', fontSize: 65 },
  cloud5: { top: '30%', left: '60%', fontSize: 75 },
  cloud6: { top: '80%', left: '70%', fontSize: 55 },
  cloud7: { top: '15%', left: '40%', fontSize: 85 },
  cloud8: { top: '85%', left: '30%', fontSize: 60 },
  floatingCloud: {
    // This will be handled by CSS animations on web
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    zIndex: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoEmoji: {
    fontSize: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: colors.purple,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 60,
    maxWidth: 400,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  actions: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 40,
  },
  signUpButton: {
    backgroundColor: colors.purple,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  signUpText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  signInButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.purple,
  },
  signInText: {
    color: colors.purple,
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
    opacity: 0.8,
  },
});
