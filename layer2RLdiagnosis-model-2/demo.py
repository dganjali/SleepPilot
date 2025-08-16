#!/usr/bin/env python3
"""
Demo script for the RL-based Sleep Apnea Detection system.
This script demonstrates the key components without requiring full training.
"""

import numpy as np
import matplotlib.pyplot as plt
import librosa
import os
from typing import Dict, List
import warnings
warnings.filterwarnings('ignore')

# Import our custom modules
from data_loader import AudioPreprocessor
from apnea_detection_env import ApneaDetectionEnv
from rl_agent import ApneaFeatureExtractor


class ApneaDetectionDemo:
    """Demo class to showcase the apnea detection system."""
    
    def __init__(self):
        self.preprocessor = AudioPreprocessor()
        self.feature_extractor = None
        
        print("🚀 Sleep Apnea Detection Demo")
        print("=" * 50)
    
    def demo_audio_preprocessing(self, audio_path: str = "apnea.mp3") -> None:
        """Demonstrate audio preprocessing capabilities."""
        print(f"\n🎵 Audio Preprocessing Demo: {audio_path}")
        print("-" * 40)
        
        if not os.path.exists(audio_path):
            print(f"❌ Audio file {audio_path} not found. Creating synthetic audio for demo...")
            # Create synthetic audio for demo
            self._create_synthetic_audio()
            audio_path = "synthetic_apnea.wav"
        
        try:
            # Load audio
            audio, sr = self.preprocessor.load_audio(audio_path)
            print(f"✅ Audio loaded: {len(audio)} samples, {sr} Hz")
            
            # Segment audio
            segments = self.preprocessor.segment_audio(audio, sr)
            print(f"✅ Created {len(segments)} segments of 10 seconds each")
            
            # Extract features from first segment
            if segments:
                features = self.preprocessor.extract_features(segments[0])
                print(f"✅ Extracted mel-spectrogram: {features.shape}")
                
                # Visualize features
                self._visualize_mel_spectrogram(features, "Mel-Spectrogram Features")
            
        except Exception as e:
            print(f"❌ Error in audio preprocessing: {e}")
    
    def demo_environment(self) -> None:
        """Demonstrate the RL environment."""
        print(f"\n🎮 RL Environment Demo")
        print("-" * 40)
        
        try:
            # Create synthetic audio segments
            synthetic_segments = self._create_synthetic_segments()
            synthetic_labels = [1, 0, 1, 0, 1]  # Alternating apnea/normal
            
            # Create environment
            env = ApneaDetectionEnv(
                audio_segments=synthetic_segments,
                labels=synthetic_labels
            )
            
            print(f"✅ Environment created with {len(synthetic_segments)} segments")
            print(f"✅ Action space: {env.action_space}")
            print(f"✅ Observation space: {env.observation_space.shape}")
            
            # Demonstrate environment steps
            print(f"\n🔄 Environment Interaction Demo:")
            obs, info = env.reset()
            print(f"   Initial observation shape: {obs.shape}")
            
            # Take some actions
            actions = [0, 1, 0, 1, 2]  # WAIT, DIAGNOSE, WAIT, DIAGNOSE, ESCALATE
            for i, action in enumerate(actions):
                obs, reward, done, truncated, info = env.step(action)
                action_names = ["WAIT", "DIAGNOSE", "ESCALATE"]
                print(f"   Step {i+1}: Action={action_names[action]}, Reward={reward:.3f}, Done={done}")
                
                if done:
                    break
            
            # Get episode results
            results = env.get_episode_results()
            if results:
                print(f"\n📊 Episode Results:")
                print(f"   Total segments: {results['total_segments']}")
                print(f"   Apnea count: {results['apnea_count']}")
                print(f"   Severity: {results['severity']:.3f}")
                print(f"   ECE: {results['ece']:.3f}")
            
        except Exception as e:
            print(f"❌ Error in environment demo: {e}")
    
    def demo_feature_extraction(self) -> None:
        """Demonstrate the feature extraction network."""
        print(f"\n🧠 Feature Extraction Demo")
        print("-" * 40)
        
        try:
            # Create synthetic mel-spectrogram
            mel_spec = np.random.randn(128, 313).astype(np.float32)  # 128 mel bands, ~10s at 16kHz
            
            # Initialize feature extractor
            import gymnasium as gym
            obs_space = gym.spaces.Box(low=-np.inf, high=np.inf, shape=(128, 313), dtype=np.float32)
            feature_extractor = ApneaFeatureExtractor(obs_space, features_dim=256)
            
            print(f"✅ Feature extractor initialized")
            print(f"✅ Input shape: {mel_spec.shape}")
            
            # Extract features
            import torch
            mel_tensor = torch.FloatTensor(mel_spec).unsqueeze(0).unsqueeze(0)  # Add batch and channel dims
            features = feature_extractor(mel_tensor)
            
            print(f"✅ Output features: {features.shape}")
            print(f"✅ Feature statistics: mean={features.mean().item():.3f}, std={features.std().item():.3f}")
            
        except Exception as e:
            print(f"❌ Error in feature extraction demo: {e}")
    
    def demo_reward_function(self) -> None:
        """Demonstrate the ECE-inspired reward function."""
        print(f"\n🏆 Reward Function Demo")
        print("-" * 40)
        
        # Test different scenarios
        scenarios = [
            {"correctness": 1, "confidence": 0.9, "description": "Correct prediction, high confidence"},
            {"correctness": 1, "confidence": 0.5, "description": "Correct prediction, low confidence"},
            {"correctness": 0, "confidence": 0.1, "description": "Incorrect prediction, low confidence"},
            {"correctness": 0, "confidence": 0.9, "description": "Incorrect prediction, high confidence"},
            {"correctness": 1, "confidence": 1.0, "description": "Correct prediction, perfect confidence"},
        ]
        
        print("ECE-Inspired Reward: reward = correctness - (confidence - correctness)²")
        print("-" * 60)
        
        for scenario in scenarios:
            correctness = scenario["correctness"]
            confidence = scenario["confidence"]
            reward = correctness - (confidence - correctness) ** 2
            
            print(f"✅ {scenario['description']}")
            print(f"   Correctness: {correctness}, Confidence: {confidence:.1f}")
            print(f"   Reward: {reward:.3f}")
            print()
    
    def demo_severity_assessment(self) -> None:
        """Demonstrate severity assessment."""
        print(f"\n📊 Severity Assessment Demo")
        print("-" * 40)
        
        # Test different severity levels
        severity_levels = [
            (0.05, "Very Low"),
            (0.15, "Low"),
            (0.35, "Moderate"),
            (0.65, "High"),
            (0.85, "Very High")
        ]
        
        for severity_score, level in severity_levels:
            recommendation = self._get_recommendation(severity_score)
            print(f"✅ Severity Score: {severity_score:.2f} → {level}")
            print(f"   Recommendation: {recommendation}")
            print()
    
    def _create_synthetic_audio(self) -> None:
        """Create synthetic audio for demo purposes."""
        print("Creating synthetic audio for demo...")
        
        # Generate synthetic snoring/apnea audio
        sr = 16000
        duration = 30  # 30 seconds
        t = np.linspace(0, duration, sr * duration)
        
        # Base frequency (snoring)
        base_freq = 100
        snoring = 0.3 * np.sin(2 * np.pi * base_freq * t)
        
        # Add some variation and noise
        noise = 0.1 * np.random.randn(len(t))
        audio = snoring + noise
        
        # Normalize
        audio = audio / np.max(np.abs(audio))
        
        # Save as WAV
        import soundfile as sf
        sf.write("synthetic_apnea.wav", audio, sr)
        print("✅ Synthetic audio saved as 'synthetic_apnea.wav'")
    
    def _create_synthetic_segments(self) -> List[np.ndarray]:
        """Create synthetic audio segments for environment demo."""
        segments = []
        for i in range(5):
            # Create 10-second segments with different characteristics
            segment = np.random.randn(160000)  # 10s at 16kHz
            segments.append(segment)
        return segments
    
    def _visualize_mel_spectrogram(self, mel_spec: np.ndarray, title: str) -> None:
        """Visualize mel-spectrogram features."""
        plt.figure(figsize=(10, 6))
        plt.imshow(mel_spec, aspect='auto', origin='lower', cmap='viridis')
        plt.colorbar(label='dB')
        plt.title(title)
        plt.xlabel('Time Frames')
        plt.ylabel('Mel Frequency Bands')
        plt.tight_layout()
        plt.savefig(f"{title.lower().replace(' ', '_')}.png", dpi=300, bbox_inches='tight')
        plt.show()
    
    def _get_recommendation(self, severity: float) -> str:
        """Get recommendation based on severity score."""
        if severity < 0.1:
            return "No immediate action needed. Continue monitoring."
        elif severity < 0.25:
            return "Consider lifestyle changes and monitor sleep patterns."
        elif severity < 0.5:
            return "Consult a sleep specialist for evaluation."
        elif severity < 0.75:
            return "Immediate medical attention recommended."
        else:
            return "Urgent medical evaluation required."
    
    def run_full_demo(self) -> None:
        """Run the complete demo."""
        print("🎬 Starting Full Demo...")
        print("=" * 50)
        
        # Run all demo components
        self.demo_audio_preprocessing()
        self.demo_environment()
        self.demo_feature_extraction()
        self.demo_reward_function()
        self.demo_severity_assessment()
        
        print("\n🎉 Demo Complete!")
        print("=" * 50)
        print("💡 Key Features Demonstrated:")
        print("   • Audio preprocessing and segmentation")
        print("   • RL environment with 3-action space")
        print("   • CNN-based feature extraction")
        print("   • ECE-inspired reward function")
        print("   • Severity assessment and recommendations")
        print("\n🚀 Ready to train the full RL agent!")


def main():
    """Main function to run the demo."""
    demo = ApneaDetectionDemo()
    
    try:
        demo.run_full_demo()
    except KeyboardInterrupt:
        print("\n\n⏹️ Demo interrupted by user")
    except Exception as e:
        print(f"\n❌ Error in demo: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
