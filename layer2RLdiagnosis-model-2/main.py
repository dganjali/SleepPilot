#!/usr/bin/env python3
"""
Main script for training and evaluating the RL-based sleep apnea detection system.
"""

import os
import numpy as np
import torch
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, List, Tuple
import warnings
from tqdm import tqdm
warnings.filterwarnings('ignore')

# Import our custom modules
from data_loader import ApneaDataLoader, AudioPreprocessor
from apnea_detection_env import ApneaDetectionEnv, ApneaDetectionEnvWrapper
from rl_agent import ApneaRLAgent, EnhancedTrainingCallback

# Set random seeds for reproducibility
np.random.seed(42)
torch.manual_seed(42)


class ApneaDetectionPipeline:
    """Complete pipeline for apnea detection using RL."""
    
    def __init__(self, data_dir: str = None, model_save_dir: str = "models"):
        self.data_dir = data_dir
        self.model_save_dir = model_save_dir
        self.data_loader = None
        self.preprocessor = None
        self.agent = None
        
        # Create model directory
        os.makedirs(model_save_dir, exist_ok=True)
        
        # Training parameters
        self.training_params = {
            'total_timesteps': 100000,  # Adjust based on dataset size
            'learning_rate': 3e-4,
            'batch_size': 64,
            'n_epochs': 10,
            'n_steps': 2048
        }
    
    def setup_data(self) -> None:
        """Setup data loading and preprocessing with progress tracking."""
        print("🔧 Setting up data pipeline...")
        
        # Initialize data loader with progress tracking
        print("📥 Initializing data loader...")
        self.data_loader = ApneaDataLoader(data_dir=self.data_dir)
        
        # Initialize preprocessor
        print("🎵 Initializing audio preprocessor...")
        self.preprocessor = AudioPreprocessor()
        
        # Display dataset statistics
        print("📊 Computing dataset statistics...")
        stats = self.data_loader.get_patient_statistics()
        print(f"\n📈 Dataset Statistics:")
        print(f"   Total patients: {stats['total_patients']}")
        print(f"   Total segments: {stats['total_segments']}")
        print(f"   Apnea segments: {stats['total_apnea_segments']}")
        print(f"   Normal segments: {stats['total_normal_segments']}")
        
        # Visualize data distribution
        print("📊 Generating data distribution visualization...")
        self.data_loader.visualize_patient_distribution(save_path="dataset_distribution.png")
    
    def setup_environment(self, patient_ids: List[str]) -> ApneaDetectionEnv:
        """Setup RL environment for training with progress tracking."""
        print(f"🎮 Setting up RL environment for {len(patient_ids)} patients...")
        
        # Get environment data
        print("📋 Creating environment data...")
        env_data = self.data_loader.create_environment_data(patient_ids)
        
        if not env_data:
            raise ValueError("No environment data available")
        
        # Separate segments and labels
        segments, labels = zip(*env_data)
        
        # Create environment
        print("🏗️ Creating RL environment...")
        env = ApneaDetectionEnv(
            audio_segments=list(segments),
            labels=list(labels)
        )
        
        print(f"✅ Environment created with {len(segments)} segments")
        print(f"   Observation space: {env.observation_space.shape}")
        print(f"   Action space: {env.action_space}")
        return env
    
    def train_agent(self, train_patients: List[str], val_patients: List[str]) -> None:
        """Train the RL agent with enhanced progress tracking."""
        print("🚀 Starting enhanced agent training...")
        
        # Setup training environment
        print("🎯 Setting up training environment...")
        train_env = self.setup_environment(train_patients)
        
        # Initialize agent
        print("🤖 Initializing enhanced RL agent...")
        self.agent = ApneaRLAgent(
            env=train_env,
            learning_rate=self.training_params['learning_rate'],
            n_steps=self.training_params['n_steps'],
            batch_size=self.training_params['batch_size'],
            n_epochs=self.training_params['n_epochs']
        )
        
        # Setup enhanced callback for monitoring
        print("📊 Setting up enhanced training callback...")
        callback = EnhancedTrainingCallback(eval_freq=5000, verbose=1)
        
        # Train agent with progress tracking
        print(f"🎓 Training for {self.training_params['total_timesteps']} timesteps...")
        self.agent.train(
            total_timesteps=self.training_params['total_timesteps'],
            callback=callback,
            show_progress=True
        )
        
        # Save trained agent
        model_path = os.path.join(self.model_save_dir, "apnea_detection_agent")
        self.agent.save(model_path)
        print(f"💾 Trained agent saved to {model_path}")
        
        # Display training summary
        summary = self.agent.get_training_summary()
        print(f"\n📊 Training Summary:")
        print(f"   Total episodes: {summary['total_episodes']}")
        print(f"   Mean reward: {summary['mean_reward']:.4f} ± {summary['std_reward']:.4f}")
        print(f"   Mean episode length: {summary['mean_episode_length']:.2f}")
        print(f"   Mean ECE: {summary['mean_ece']:.4f}")
        print(f"   Mean confidence: {summary['mean_confidence']:.4f}")
        print(f"   Evaluations performed: {summary['evaluation_count']}")
        
        # Evaluate on validation set
        print("\n🧪 Evaluating on validation set...")
        self.evaluate_agent(val_patients, "validation")
    
    def evaluate_agent(self, patient_ids: List[str], split_name: str) -> Dict:
        """Evaluate the trained agent with progress tracking."""
        if self.agent is None:
            raise ValueError("Agent not trained yet")
        
        print(f"🔍 Evaluating agent on {split_name} set...")
        
        # Setup evaluation environment
        eval_env = self.setup_environment(patient_ids)
        
        # Evaluate with progress tracking
        results = self.agent.evaluate_episode(eval_env, show_progress=True)
        
        # Display results
        print(f"\n📊 {split_name.capitalize()} Results:")
        print(f"   Total reward: {results['total_reward']:.4f}")
        print(f"   Episode length: {results['episode_length']}")
        
        if results['episode_results']:
            episode_results = results['episode_results']
            print(f"   Apnea count: {episode_results['apnea_count']}")
            print(f"   Normal count: {episode_results['normal_count']}")
            print(f"   Severity: {episode_results['severity']:.4f}")
            print(f"   Median confidence: {episode_results['median_confidence']:.4f}")
            print(f"   ECE: {episode_results['ece']:.4f}")
        
        return results
    
    def test_on_custom_audio(self, audio_path: str) -> Dict:
        """Test the trained agent on a custom audio file with progress tracking."""
        if self.agent is None:
            raise ValueError("Agent not trained yet")
        
        print(f"🎵 Testing on custom audio: {audio_path}")
        
        # Load and preprocess audio with progress tracking
        print("📁 Loading audio file...")
        audio, sr = self.preprocessor.load_audio(audio_path)
        print(f"   Audio loaded: {len(audio)} samples, {sr} Hz")
        
        print("✂️ Segmenting audio...")
        segments = self.preprocessor.segment_audio(audio, sr)
        
        if not segments:
            raise ValueError("No valid segments extracted from audio")
        
        print(f"   Created {len(segments)} segments")
        
        # Create test environment
        print("🏗️ Creating test environment...")
        test_env = ApneaDetectionEnv(
            audio_segments=segments,
            labels=[0] * len(segments)  # Unknown labels for custom audio
        )
        
        # Evaluate with progress tracking
        print("🔍 Running inference...")
        results = self.agent.evaluate_episode(test_env, show_progress=True)
        
        # Display results
        print(f"\n📊 Custom Audio Test Results:")
        print(f"   Audio file: {audio_path}")
        print(f"   Total segments: {len(segments)}")
        print(f"   Episode length: {results['episode_length']}")
        
        if results['episode_results']:
            episode_results = results['episode_results']
            print(f"   Detected apnea events: {episode_results['apnea_count']}")
            print(f"   Severity score: {episode_results['severity']:.4f}")
            print(f"   Median confidence: {episode_results['median_confidence']:.4f}")
        
        return results
    
    def visualize_training_progress(self, save_path: str = "training_progress.png") -> None:
        """Visualize training progress with enhanced metrics."""
        if self.agent is None:
            print("❌ No training history available")
            return
        
        print("📊 Generating training progress visualization...")
        history = self.agent.training_history
        
        fig, axes = plt.subplots(2, 3, figsize=(18, 12))
        
        # Episode rewards
        if history['episode_rewards']:
            axes[0, 0].plot(history['episode_rewards'])
            axes[0, 0].set_title('Episode Rewards')
            axes[0, 0].set_xlabel('Episode')
            axes[0, 0].set_ylabel('Total Reward')
            axes[0, 0].grid(True, alpha=0.3)
        
        # Episode lengths
        if history['episode_lengths']:
            axes[0, 1].plot(history['episode_lengths'])
            axes[0, 1].set_title('Episode Lengths')
            axes[0, 1].set_xlabel('Episode')
            axes[0, 1].set_ylabel('Length')
            axes[0, 1].grid(True, alpha=0.3)
        
        # ECE scores
        if history['ece_scores']:
            axes[0, 2].plot(history['ece_scores'])
            axes[0, 2].set_title('ECE Scores')
            axes[0, 2].set_xlabel('Episode')
            axes[0, 2].set_ylabel('ECE')
            axes[0, 2].grid(True, alpha=0.3)
        
        # Confidence scores
        if history['confidence_scores']:
            axes[1, 0].plot(history['confidence_scores'])
            axes[1, 0].set_title('Median Confidence Scores')
            axes[1, 0].set_xlabel('Episode')
            axes[1, 0].set_ylabel('Median Confidence')
            axes[1, 0].grid(True, alpha=0.3)
        
        # Evaluation results over time
        if history['evaluation_results']:
            timesteps = [eval_result['timestep'] for eval_result in history['evaluation_results']]
            ece_scores = [eval_result['ece'] for eval_result in history['evaluation_results']]
            severity_scores = [eval_result['severity'] for eval_result in history['evaluation_results']]
            
            axes[1, 1].plot(timesteps, ece_scores, 'b-', label='ECE')
            axes[1, 1].plot(timesteps, severity_scores, 'r-', label='Severity')
            axes[1, 1].set_title('Evaluation Metrics Over Time')
            axes[1, 1].set_xlabel('Training Timesteps')
            axes[1, 1].set_ylabel('Score')
            axes[1, 1].legend()
            axes[1, 1].grid(True, alpha=0.3)
        
        # Training summary
        summary = self.agent.get_training_summary()
        if summary.get('status') != "No training data available":
            summary_text = f"""
Training Summary:
Total Episodes: {summary['total_episodes']}
Mean Reward: {summary['mean_reward']:.4f} ± {summary['std_reward']:.4f}
Mean Episode Length: {summary['mean_episode_length']:.2f}
Mean ECE: {summary['mean_ece']:.4f}
Mean Confidence: {summary['mean_confidence']:.4f}
Evaluations: {summary['evaluation_count']}
            """.strip()
            
            axes[1, 2].text(0.1, 0.5, summary_text, transform=axes[1, 2].transAxes,
                           fontsize=10, verticalalignment='center',
                           bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.5))
            axes[1, 2].set_title('Training Summary')
            axes[1, 2].axis('off')
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"💾 Training progress visualization saved to {save_path}")
        plt.show()
    
    def run_complete_pipeline(self) -> None:
        """Run the complete training and evaluation pipeline with enhanced progress tracking."""
        print("🚀 Starting complete apnea detection pipeline...")
        print("=" * 60)
        
        # Setup data
        self.setup_data()
        
        # Split patients
        print("\n📊 Splitting patients into train/validation/test sets...")
        train_patients, val_patients, test_patients = self.data_loader.split_patients()
        
        # Train agent
        self.train_agent(train_patients, val_patients)
        
        # Evaluate on test set
        print("\n🧪 Evaluating on test set...")
        test_results = self.evaluate_agent(test_patients, "test")
        
        # Test on custom audio (apnea.mp3)
        if os.path.exists("apnea.mp3"):
            print("\n" + "="*60)
            print("🎵 TESTING ON CUSTOM AUDIO (apnea.mp3)")
            print("="*60)
            custom_results = self.test_on_custom_audio("apnea.mp3")
        
        # Visualize training progress
        print("\n📊 Generating training progress visualization...")
        self.visualize_training_progress()
        
        print("\n🎉 Pipeline completed successfully!")
        print("=" * 60)


def main():
    """Main function to run the pipeline."""
    print("🌙 Sleep Apnea Detection using RL")
    print("🎯 Layer 2: Sleep Disorder Diagnosis (Apnea Detection)")
    print("🤖 Enhanced PPO Agent with ECE-based Rewards")
    print("📊 Progress Tracking with tqdm")
    print("=" * 60)
    
    # Initialize pipeline
    pipeline = ApneaDetectionPipeline()
    
    try:
        # Run complete pipeline
        pipeline.run_complete_pipeline()
        
    except KeyboardInterrupt:
        print("\n⏹️ Pipeline interrupted by user")
    except Exception as e:
        print(f"❌ Error in pipeline: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
