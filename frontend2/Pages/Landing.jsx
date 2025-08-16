
import React, { useEffect, useRef, useState } from 'react';
import { Engine, Render, World, Bodies, Body, Events, Mouse, MouseConstraint } from 'matter-js';
import { Moon, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '../src/components/ui/button';
import { User } from '../src/entities/User';
import { motion } from 'framer-motion';

export default function Landing() {
  const sceneRef = useRef();
  const engineRef = useRef();
  const renderRef = useRef();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Update window size
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (windowSize.width === 0) return;

    // Create engine
    const engine = Engine.create();
    engine.world.gravity.y = 0.3;
    engineRef.current = engine;

    // Create renderer
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: windowSize.width,
        height: windowSize.height,
        wireframes: false,
        background: 'transparent',
        showAngleIndicator: false,
        showVelocity: false
      }
    });
    renderRef.current = render;

    // Create boundaries (invisible walls)
    const boundaries = [
      Bodies.rectangle(windowSize.width / 2, -25, windowSize.width, 50, { 
        isStatic: true, 
        render: { visible: false } 
      }),
      Bodies.rectangle(windowSize.width / 2, windowSize.height + 25, windowSize.width, 50, { 
        isStatic: true, 
        render: { visible: false } 
      }),
      Bodies.rectangle(-25, windowSize.height / 2, 50, windowSize.height, { 
        isStatic: true, 
        render: { visible: false } 
      }),
      Bodies.rectangle(windowSize.width + 25, windowSize.height / 2, 50, windowSize.height, { 
        isStatic: true, 
        render: { visible: false } 
      })
    ];

    // Create floating cloud-like circles with different sizes and colors
    const clouds = [];
    const cloudColors = [
      '#A890FE', // Purple
      '#1A2A6C', // Blue  
      '#C9B9FF', // Light purple
      '#4F46E5', // Indigo
      '#8B5CF6', // Violet
      '#6366F1'  // Blue-indigo
    ];

    for (let i = 0; i < 25; i++) {
      const radius = Math.random() * 30 + 15; // Random size between 15-45
      const x = Math.random() * (windowSize.width - 200) + 100;
      const y = Math.random() * (windowSize.height - 400) + 200;
      const color = cloudColors[Math.floor(Math.random() * cloudColors.length)];
      
      const cloud = Bodies.circle(x, y, radius, {
        restitution: 0.9, // Bouncy
        friction: 0.001,
        frictionAir: 0.01,
        render: {
          fillStyle: color,
          strokeStyle: 'rgba(255,255,255,0.2)',
          lineWidth: 2
        }
      });

      // Add initial random velocity
      Body.setVelocity(cloud, {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2
      });

      clouds.push(cloud);
    }

    // Add mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });

    // Add all bodies to world
    World.add(engine.world, [...boundaries, ...clouds, mouseConstraint]);

    // Add touch interaction for mobile
    const handleTouch = (event) => {
      const touch = event.touches[0];
      if (touch) {
        const rect = render.canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        // Find nearby clouds and push them away
        clouds.forEach(cloud => {
          const distance = Math.sqrt(
            Math.pow(cloud.position.x - touchX, 2) + 
            Math.pow(cloud.position.y - touchY, 2)
          );
          
          if (distance < 100) {
            const force = 0.02;
            const angle = Math.atan2(cloud.position.y - touchY, cloud.position.x - touchX);
            Body.applyForce(cloud, cloud.position, {
              x: Math.cos(angle) * force,
              y: Math.sin(angle) * force
            });
          }
        });
      }
    };

    render.canvas.addEventListener('touchstart', handleTouch);
    render.canvas.addEventListener('touchmove', handleTouch);

    // Run the engine
    Engine.run(engine);
    Render.run(render);

    // Add gentle floating animation
    const floatClouds = () => {
      clouds.forEach(cloud => {
        // Add small random forces to keep clouds moving gently
        if (Math.abs(cloud.velocity.x) < 0.5 && Math.abs(cloud.velocity.y) < 0.5) {
          Body.applyForce(cloud, cloud.position, {
            x: (Math.random() - 0.5) * 0.001,
            y: (Math.random() - 0.5) * 0.001
          });
        }
      });
    };

    const floatInterval = setInterval(floatClouds, 2000);

    // Cleanup
    return () => {
      clearInterval(floatInterval);
      render.canvas.removeEventListener('touchstart', handleTouch);
      render.canvas.removeEventListener('touchmove', handleTouch);
      Render.stop(render);
      World.clear(engine.world);
      Engine.clear(engine);
      if (render.canvas && render.canvas.parentNode) {
        render.canvas.parentNode.removeChild(render.canvas);
      }
    };
  }, [windowSize]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await User.login();
    } catch (error) {
      console.error('Sign in error:', error);
      setIsSigningIn(false);
    }
  };

  const handleSignUp = async () => {
    setIsSigningIn(true);
    try {
      await User.login(); // Same flow for now, can be customized
    } catch (error) {
      console.error('Sign up error:', error);
      setIsSigningIn(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Physics Canvas */}
      <div 
        ref={sceneRef} 
        className="absolute inset-0 z-0"
        style={{ touchAction: 'none' }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 z-10" />
      
      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        {/* Logo and App Name */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mb-8 text-center"
        >
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/cfce6c450_SleepPilotWhiteonBlack.png"
            alt="SleepPilot Logo"
            className="w-64 md:w-72 mx-auto mb-4"
          />
          <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)]">
            <Sparkles className="w-4 h-4 text-[#A890FE]" />
            <p className="text-lg">Navigate to Perfect Sleep</p>
            <Sparkles className="w-4 h-4 text-[#A890FE]" />
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mb-12 space-y-4 max-w-md"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-full bg-[#1A2A6C]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[#A890FE] text-sm font-bold">AI</span>
            </div>
            <p className="text-[var(--text-secondary)]">AI-powered sleep analysis and recommendations</p>
          </div>
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-full bg-[#1A2A6C]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[#A890FE] text-sm font-bold">📊</span>
            </div>
            <p className="text-[var(--text-secondary)]">Comprehensive sleep health tracking</p>
          </div>
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-full bg-[#1A2A6C]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[#A890FE] text-sm font-bold">⚡</span>
            </div>
            <p className="text-[var(--text-secondary)]">Real-time sleep disorder risk assessment</p>
          </div>
        </motion.div>

        {/* Interaction Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mb-8"
        >
          <p className="text-sm text-[var(--text-muted)] mb-2">
            ✨ Touch the floating clouds above ✨
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[#1A2A6C] to-[#A890FE] mx-auto rounded-full" />
        </motion.div>

        {/* Auth Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="space-y-4 w-full max-w-sm"
        >
          <Button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full h-14 bg-[#A890FE] hover:bg-[#C9B9FF] text-black font-semibold text-lg rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            {isSigningIn ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black" />
                Signing In...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Sign In
                <ChevronRight className="w-5 h-5" />
              </div>
            )}
          </Button>

          <Button
            onClick={handleSignUp}
            disabled={isSigningIn}
            variant="outline"
            className="w-full h-14 border-2 border-[#1A2A6C] text-[#A890FE] hover:bg-[#1A2A6C]/20 font-semibold text-lg rounded-2xl transition-all duration-300"
          >
            Create Account
          </Button>

          <p className="text-xs text-[var(--text-muted)] mt-4 leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy. 
            Start your journey to better sleep tonight.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
