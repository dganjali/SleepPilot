import React, { useEffect, useRef, forwardRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Cloud component with floating and physics interaction
const Cloud = forwardRef(({ x, y, size, onUpdate }, ref) => {
  const translateX = useSharedValue(x);
  const translateY = useSharedValue(y);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0.8);
  
  // Physics constants
  const friction = 0.98;
  const maxSpeed = 2;
  const cursorInfluence = 0.8;
  const randomForce = 0.02;

  // Apply physics and movement
  useEffect(() => {
    const updatePhysics = () => {
      // Add random movement
      velocityX.value += (Math.random() - 0.5) * randomForce;
      velocityY.value += (Math.random() - 0.5) * randomForce;
      
      // Apply friction
      velocityX.value *= friction;
      velocityY.value *= friction;
      
      // Limit speed
      if (Math.abs(velocityX.value) > maxSpeed) {
        velocityX.value = Math.sign(velocityX.value) * maxSpeed;
      }
      if (Math.abs(velocityY.value) > maxSpeed) {
        velocityY.value = Math.sign(velocityY.value) * maxSpeed;
      }
      
      // Update position
      translateX.value += velocityX.value;
      translateY.value += velocityY.value;
      
      // Bounce off screen edges
      if (translateX.value < size) {
        translateX.value = size;
        velocityX.value *= -0.8;
      } else if (translateX.value > width - size) {
        translateX.value = width - size;
        velocityX.value *= -0.8;
      }
      
      if (translateY.value < size) {
        translateY.value = size;
        velocityY.value *= -0.8;
      } else if (translateY.value > height - size) {
        translateY.value = height - size;
        velocityY.value *= -0.8;
      }
      
      // Call update callback
      if (onUpdate) {
        onUpdate(translateX.value, translateY.value);
      }
    };

    const interval = setInterval(updatePhysics, 16); // 60fps
    return () => clearInterval(interval);
  }, []);

  // Gentle rotation
  useEffect(() => {
    const rotateAnimation = () => {
      rotation.value = withTiming(
        rotation.value + 0.2,
        { duration: 15000 }
      );
    };

    const interval = setInterval(rotateAnimation, 200);
    return () => clearInterval(rotateAnimation);
  }, []);

  // Apply cursor influence - clouds move away from cursor
  const applyCursorInfluence = (cursorX, cursorY) => {
    const distance = Math.sqrt(
      Math.pow(cursorX - translateX.value, 2) + 
      Math.pow(cursorY - translateY.value, 2)
    );
    
    const maxDistance = 150;
    const influenceStrength = Math.max(0, 1 - (distance / maxDistance));
    
    if (influenceStrength > 0) {
      // Calculate direction AWAY from cursor (opposite direction)
      const angle = Math.atan2(translateY.value - cursorY, translateX.value - cursorX);
      const force = influenceStrength * cursorInfluence;
      
      // Apply force to velocity (moving away from cursor)
      velocityX.value += Math.cos(angle) * force;
      velocityY.value += Math.sin(angle) * force;
      
      // Slight scale effect
      scale.value = withSpring(1 + influenceStrength * 0.1, { 
        damping: 20, 
        stiffness: 100 
      });
      opacity.value = withSpring(0.85 + influenceStrength * 0.1, { 
        damping: 20, 
        stiffness: 100 
      });
    } else {
      // Return to normal
      scale.value = withSpring(1, { damping: 20, stiffness: 100 });
      opacity.value = withSpring(0.8, { damping: 20, stiffness: 100 });
    }
  };

  // Animated style with physics
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  // Expose cursor influence method
  useEffect(() => {
    if (onUpdate) {
      onUpdate(translateX.value, translateY.value);
    }
  }, []);

  // Expose methods to parent via ref
  React.useImperativeHandle(ref, () => ({
    applyCursorInfluence,
  }));

  return (
    <Animated.View
      style={[
        styles.cloud,
        {
          width: size * 2,
          height: size * 1.5,
        },
        animatedStyle,
      ]}
    >
      {/* Main cloud body */}
      <View style={styles.cloudBody} />
      
      {/* Cloud puffs for realistic look */}
      <View style={[styles.cloudPuff, styles.cloudPuff1]} />
      <View style={[styles.cloudPuff, styles.cloudPuff2]} />
      <View style={[styles.cloudPuff, styles.cloudPuff3]} />
      <View style={[styles.cloudPuff, styles.cloudPuff4]} />
    </Animated.View>
  );
});

export default function LandingScreen() {
  const navigation = useNavigation();
  const cloudRefs = useRef([]);
  const cloudPositions = useRef([
    { 
      x: width * 0.15, 
      y: height * 0.25, 
      size: 45 + Math.random() * 25,
    },
    { 
      x: width * 0.85, 
      y: height * 0.35, 
      size: 35 + Math.random() * 20,
    },
    { 
      x: width * 0.1, 
      y: height * 0.65, 
      size: 50 + Math.random() * 30,
    },
    { 
      x: width * 0.75, 
      y: height * 0.75, 
      size: 30 + Math.random() * 25,
    },
    { 
      x: width * 0.5, 
      y: height * 0.15, 
      size: 55 + Math.random() * 35,
    },
    { 
      x: width * 0.3, 
      y: height * 0.8, 
      size: 40 + Math.random() * 20,
    },
    { 
      x: width * 0.9, 
      y: height * 0.6, 
      size: 35 + Math.random() * 25,
    },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [progressWidth, setProgressWidth] = useState(0);

  const handleProcessVideo = () => {
    // Simulate processing demo video through RL backend
    setIsProcessing(true);
    setHasProcessed(true);
    setProgressWidth(0);
    
    // Simulate different processing stages
    const stages = [
      'Loading demo video...',
      'Analyzing sleep patterns...',
      'Processing through AI models...',
      'Running RL optimization...',
      'Generating recommendations...',
      'Complete!'
    ];
    
    let currentStage = 0;
    const processInterval = setInterval(() => {
      if (currentStage < stages.length) {
        setProcessingStage(stages[currentStage]);
        setProgressWidth(((currentStage + 1) / stages.length) * 100);
        currentStage++;
      } else {
        clearInterval(processInterval);
        setIsProcessing(false);
        setProcessingStage('Processing complete!');
        setProgressWidth(100);
      }
    }, 1500);
  };

  // Pan responder for cursor interaction
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      const touchX = gestureState.x0;
      const touchY = gestureState.y0;
      
      // Apply cursor influence to nearby clouds
      cloudRefs.current.forEach((cloudRef) => {
        if (cloudRef && cloudRef.applyCursorInfluence) {
          cloudRef.applyCursorInfluence(touchX, touchY);
        }
      });
    },
    onPanResponderMove: (evt, gestureState) => {
      const touchX = gestureState.moveX;
      const touchY = gestureState.moveY;
      
      // Continuous cursor influence while moving
      cloudRefs.current.forEach((cloudRef) => {
        if (cloudRef && cloudRef.applyCursorInfluence) {
          cloudRef.applyCursorInfluence(touchX, touchY);
        }
      });
    },
    onPanResponderRelease: () => {
      // Clouds will continue their natural movement
    },
  });

  const handleGetStarted = () => {
    navigation.navigate('Main');
  };

  const updateCloudPosition = (index, x, y) => {
    cloudPositions.current[index] = { ...cloudPositions.current[index], x, y };
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Interactive Clouds */}
      {cloudPositions.current.map((cloud, index) => (
        <Cloud
          key={index}
          x={cloud.x}
          y={cloud.y}
          size={cloud.size}
          onUpdate={(x, y) => updateCloudPosition(index, x, y)}
          ref={(ref) => {
            cloudRefs.current[index] = ref;
          }}
        />
      ))}

      {/* Content Overlay */}
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image 
              source={require('../../assets/favicon.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* One Liner */}
        <Text style={styles.tagline}>
          Sleep optimization powered by AI
        </Text>

        {/* Get Started Button */}
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <LinearGradient
            colors={['#8B5CF6', '#A78BFA']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>GET STARTED</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Interactive Hint */}
      <Text style={styles.interactiveHint}>
        Move your finger near the clouds to interact with them
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cloud: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cloudBody: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 50,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  cloudPuff: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  cloudPuff1: {
    width: '60%',
    height: '60%',
    top: '-20%',
    left: '10%',
  },
  cloudPuff2: {
    width: '50%',
    height: '50%',
    top: '10%',
    right: '5%',
  },
  cloudPuff3: {
    width: '40%',
    height: '40%',
    bottom: '5%',
    left: '20%',
  },
  cloudPuff4: {
    width: '45%',
    height: '45%',
    top: '30%',
    left: '50%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 8,
    textShadowColor: 'rgba(139, 92, 246, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  tagline: {
    fontSize: 18,
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 24,
    fontWeight: '300',
  },
  getStartedButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  interactiveHint: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 14,
    color: '#9CA3AF',
    zIndex: 2,
  },
});
