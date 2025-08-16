import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { colors } from '../constants/colors';

interface Cloud {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
}

const { width, height } = Dimensions.get('window');

export const LandingPage: React.FC = () => {
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const animationRef = useRef<number>();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(100));

  useEffect(() => {
    // Initialize clouds
    const initialClouds: Cloud[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 60 + 40,
      opacity: Math.random() * 0.4 + 0.1,
      rotation: Math.random() * 360,
    }));
    setClouds(initialClouds);

    // Start entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Start physics animation
    const animate = () => {
      setClouds(prevClouds => 
        prevClouds.map(cloud => {
          let newX = cloud.x + cloud.vx;
          let newY = cloud.y + cloud.vy;
          let newVx = cloud.vx;
          let newVy = cloud.vy;

          // Bounce off edges
          if (newX <= 0 || newX >= width - cloud.size) {
            newVx = -newVx;
            newX = Math.max(0, Math.min(width - cloud.size, newX));
          }
          if (newY <= 0 || newY >= height - cloud.size) {
            newVy = -newVy;
            newY = Math.max(0, Math.min(height - cloud.size, newY));
          }

          // Add some randomness to movement
          if (Math.random() < 0.01) {
            newVx += (Math.random() - 0.5) * 0.1;
            newVy += (Math.random() - 0.5) * 0.1;
          }

          // Clamp velocity
          newVx = Math.max(-1, Math.min(1, newVx));
          newVy = Math.max(-1, Math.min(1, newVy));

          return {
            ...cloud,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            rotation: cloud.rotation + 0.2,
          };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const renderCloud = (cloud: Cloud) => {
    return (
      <View
        key={cloud.id}
        style={[
          styles.cloud,
          {
            left: cloud.x,
            top: cloud.y,
            width: cloud.size,
            height: cloud.size,
            opacity: cloud.opacity,
            transform: [{ rotate: `${cloud.rotation}deg` }],
          },
        ]}
      >
        <Text style={styles.cloudEmoji}>☁️</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background gradient overlay */}
      <View style={styles.gradientOverlay} />
      
      {/* Interactive clouds */}
      {clouds.map(renderCloud)}
      
      {/* Content */}
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        {/* Logo and Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🌙</Text>
          </View>
          <Text style={styles.title}>Sleep Pilot</Text>
          <Text style={styles.subtitle}>
            Navigate your way to better sleep with AI-powered insights
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Smart Analytics</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Personalized Tips</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🔮</Text>
            <Text style={styles.featureText}>AI Predictions</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.signUpButton}>
            <Text style={styles.signUpText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signInButton}>
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
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${colors.background.primary} 0%, ${colors.background.secondary} 50%, ${colors.background.tertiary} 100%)`,
    opacity: 0.8,
  },
  cloud: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cloudEmoji: {
    fontSize: 40,
    opacity: 0.6,
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
