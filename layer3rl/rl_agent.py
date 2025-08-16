"""
Reinforcement Learning Agent for Sleep Environment Optimization

This module implements RL agents that learn to optimize environmental factors
to maximize sleep quality for individual users.
"""

import numpy as np
import torch
import torch.nn as nn
from typing import Dict, List, Optional, Tuple, Any
import os
import json
from datetime import datetime

from stable_baselines3 import PPO, SAC, TD3
from stable_baselines3.common.callbacks import BaseCallback, CheckpointCallback
from stable_baselines3.common.vec_env import DummyVecEnv, VecNormalize
from stable_baselines3.common.monitor import Monitor
from stable_baselines3.common.evaluation import evaluate_policy

from user_generator import UserProfile
from sleep_environment import SleepEnvironment, create_sleep_environment


class SleepOptimizationCallback(BaseCallback):
    """
    Custom callback for monitoring sleep optimization training progress.
    """
    
    def __init__(self, verbose: int = 0):
        super().__init__(verbose)
        self.episode_rewards = []
        self.episode_sleep_scores = []
        self.episode_fragmentation = []
        self.episode_apnea_risk = []
    
    def _on_step(self) -> bool:
        """Called after each step during training."""
        # Get the current environment info
        try:
            if hasattr(self.training_env, 'envs'):
                # VecEnv case
                env = self.training_env.envs[0]
                if hasattr(env, 'get_info'):
                    info = env.get_info()
                else:
                    # Fallback for Monitor wrapper
                    info = env.env.get_info() if hasattr(env, 'env') else {}
            else:
                # Single env case
                if hasattr(self.training_env, 'get_info'):
                    info = self.training_env.get_info()
                else:
                    # Fallback for Monitor wrapper
                    info = self.training_env.env.get_info() if hasattr(self.training_env, 'env') else {}
        except:
            # If we can't get info, use default values
            info = {}
        
        # Record metrics
        self.episode_sleep_scores.append(info.get('sleep_score', 0))
        self.episode_fragmentation.append(info.get('fragmentation', 0))
        self.episode_apnea_risk.append(info.get('apnea_risk', 0))
        
        return True
    
    def _on_rollout_end(self) -> None:
        """Called at the end of each rollout."""
        # Calculate average metrics for the rollout
        if self.episode_sleep_scores:
            avg_sleep_score = np.mean(self.episode_sleep_scores[-100:])  # Last 100 steps
            avg_fragmentation = np.mean(self.episode_fragmentation[-100:])
            avg_apnea_risk = np.mean(self.episode_apnea_risk[-100:])
            
            if self.verbose > 0:
                print(f"Rollout - Avg Sleep Score: {avg_sleep_score:.1f}, "
                      f"Fragmentation: {avg_fragmentation:.1f}, "
                      f"Apnea Risk: {avg_apnea_risk:.3f}")


class SleepOptimizationAgent:
    """
    RL agent for optimizing sleep environment settings.
    
    This agent learns to adjust environmental factors (temperature, light, noise, etc.)
    to maximize sleep quality for individual users.
    """
    
    def __init__(self, 
                 user_profile: UserProfile,
                 algorithm: str = "PPO",
                 model_path: Optional[str] = None,
                 device: str = "auto"):
        """
        Initialize the sleep optimization agent.
        
        Args:
            user_profile: User profile with environmental preferences
            algorithm: RL algorithm to use ("PPO", "SAC", "TD3")
            model_path: Path to load pre-trained model (optional)
            device: Device to run the model on ("cpu", "cuda", "auto")
        """
        self.user_profile = user_profile
        self.algorithm = algorithm
        self.device = device
        
        # Create environment
        self.env = create_sleep_environment(user_profile, episode_length=100)
        self.env = Monitor(self.env)
        
        # Wrap in VecEnv for training
        self.vec_env = DummyVecEnv([lambda: self.env])
        
        # Normalize observations and rewards
        self.vec_env = VecNormalize(
            self.vec_env,
            norm_obs=True,
            norm_reward=True,
            clip_obs=10.0,
            clip_reward=10.0
        )
        
        # Initialize model
        self.model = self._create_model(model_path)
        
        # Training history
        self.training_history = {
            'episode_rewards': [],
            'episode_sleep_scores': [],
            'episode_fragmentation': [],
            'episode_apnea_risk': [],
            'training_timestamps': []
        }
    
    def _create_model(self, model_path: Optional[str] = None):
        """Create or load the RL model."""
        if model_path and os.path.exists(model_path):
            # Check if model_path is a directory or file
            if os.path.isdir(model_path):
                # Look for model file in directory
                model_file = os.path.join(model_path, f"final_model_{self.algorithm}")
                if not os.path.exists(model_file):
                    # Try alternative names
                    model_file = os.path.join(model_path, f"model_{self.algorithm}")
                    if not os.path.exists(model_file):
                        # Try to find any model file
                        for file in os.listdir(model_path):
                            if file.startswith("model_") or file.startswith("final_model_") or file.endswith(".zip"):
                                model_file = os.path.join(model_path, file)
                                break
                        else:
                            raise ValueError(f"No model file found in {model_path}")
            else:
                model_file = model_path
            
            # Load pre-trained model
            if self.algorithm == "PPO":
                model = PPO.load(model_file, env=self.vec_env, device=self.device)
            elif self.algorithm == "SAC":
                model = SAC.load(model_file, env=self.vec_env, device=self.device)
            elif self.algorithm == "TD3":
                model = TD3.load(model_file, env=self.vec_env, device=self.device)
            else:
                raise ValueError(f"Unsupported algorithm: {self.algorithm}")
        else:
            # Create new model with smaller networks for faster training
            if self.algorithm == "PPO":
                model = PPO(
                    "MlpPolicy",
                    self.vec_env,
                    learning_rate=5e-4,  # Faster learning
                    n_steps=1024,  # Smaller steps
                    batch_size=32,  # Smaller batch
                    n_epochs=5,  # Fewer epochs
                    gamma=0.99,
                    gae_lambda=0.95,
                    clip_range=0.2,
                    clip_range_vf=None,
                    normalize_advantage=True,
                    ent_coef=0.01,
                    vf_coef=0.5,
                    max_grad_norm=0.5,
                    use_sde=False,
                    sde_sample_freq=-1,
                    target_kl=None,
                    tensorboard_log=None,
                    policy_kwargs=dict(
                        net_arch=dict(pi=[64, 64], vf=[64, 64])  # Smaller networks
                    ),
                    verbose=0,  # Less verbose for faster training
                    device=self.device
                )
            elif self.algorithm == "SAC":
                model = SAC(
                    "MlpPolicy",
                    self.vec_env,
                    learning_rate=5e-4,  # Faster learning
                    buffer_size=50000,  # Smaller buffer
                    learning_starts=50,  # Start learning earlier
                    batch_size=128,  # Smaller batch
                    tau=0.005,
                    gamma=0.99,
                    train_freq=1,
                    gradient_steps=1,
                    action_noise=None,
                    replay_buffer_class=None,
                    replay_buffer_kwargs=None,
                    optimize_memory_usage=False,
                    ent_coef="auto",
                    target_update_interval=1,
                    target_entropy="auto",
                    use_sde=False,
                    sde_sample_freq=-1,
                    use_sde_at_warmup=False,
                    policy_kwargs=dict(
                        net_arch=dict(pi=[64, 64], qf=[64, 64])  # Smaller networks
                    ),
                    verbose=0,  # Less verbose for faster training
                    device=self.device
                )
            elif self.algorithm == "TD3":
                model = TD3(
                    "MlpPolicy",
                    self.vec_env,
                    learning_rate=5e-4,  # Faster learning
                    buffer_size=50000,  # Smaller buffer
                    learning_starts=50,  # Start learning earlier
                    batch_size=64,  # Smaller batch
                    tau=0.005,
                    gamma=0.99,
                    train_freq=1,
                    gradient_steps=1,
                    action_noise=None,
                    replay_buffer_class=None,
                    replay_buffer_kwargs=None,
                    optimize_memory_usage=False,
                    policy_delay=2,
                    target_policy_noise=0.2,
                    target_noise_clip=0.5,
                    policy_kwargs=dict(
                        net_arch=dict(pi=[64, 64], qf=[64, 64])  # Smaller networks
                    ),
                    verbose=0,  # Less verbose for faster training
                    device=self.device
                )
            else:
                raise ValueError(f"Unsupported algorithm: {self.algorithm}")
        
        return model
    
    def train(self, 
              total_timesteps: int = 100000,
              save_path: Optional[str] = None,
              eval_freq: int = 10000) -> Dict[str, List[float]]:
        """
        Train the RL agent.
        
        Args:
            total_timesteps: Total number of timesteps to train for
            save_path: Path to save the trained model
            eval_freq: Frequency of evaluation during training
            
        Returns:
            Training history
        """
        # Create callbacks
        callbacks = [SleepOptimizationCallback(verbose=1)]
        
        if save_path:
            checkpoint_callback = CheckpointCallback(
                save_freq=max(eval_freq // self.vec_env.num_envs, 1),
                save_path=save_path,
                name_prefix=f"sleep_optimization_{self.algorithm}"
            )
            callbacks.append(checkpoint_callback)
        
        # Train the model
        self.model.learn(
            total_timesteps=total_timesteps,
            callback=callbacks,
            progress_bar=True
        )
        
        # Save the final model
        if save_path:
            final_model_path = os.path.join(save_path, f"final_model_{self.algorithm}")
            self.model.save(final_model_path)
            
            # Save the environment normalization
            vec_normalize_path = os.path.join(save_path, f"vec_normalize_{self.algorithm}")
            self.vec_env.save(vec_normalize_path)
            
            # Save user profile
            user_profile_path = os.path.join(save_path, "user_profile.json")
            with open(user_profile_path, 'w') as f:
                # Convert dataclass to dict, handling None values
                user_dict = {}
                for field, value in self.user_profile.__dict__.items():
                    if value is not None:
                        user_dict[field] = value
                json.dump(user_dict, f, indent=2)
            
            # Save training history
            history_path = os.path.join(save_path, "training_history.json")
            with open(history_path, 'w') as f:
                json.dump(self.training_history, f, indent=2)
        
        return self.training_history
    
    def evaluate(self, n_eval_episodes: int = 10) -> Dict[str, float]:
        """
        Evaluate the trained agent.
        
        Args:
            n_eval_episodes: Number of episodes to evaluate
            
        Returns:
            Evaluation metrics
        """
        # Create evaluation environment
        eval_env = create_sleep_environment(self.user_profile, episode_length=100)
        eval_env = Monitor(eval_env)
        
        # Evaluate the model
        mean_reward, std_reward = evaluate_policy(
            self.model,
            eval_env,
            n_eval_episodes=n_eval_episodes,
            deterministic=True
        )
        
        # Run additional evaluation to get detailed metrics
        sleep_scores = []
        fragmentations = []
        apnea_risks = []
        
        for _ in range(n_eval_episodes):
            obs, _ = eval_env.reset()
            episode_sleep_scores = []
            episode_fragmentations = []
            episode_apnea_risks = []
            
            for _ in range(100):  # episode_length
                action, _ = self.model.predict(obs, deterministic=True)
                obs, reward, terminated, truncated, info = eval_env.step(action)
                
                # Handle Monitor wrapper
                if hasattr(eval_env, 'env') and hasattr(eval_env.env, 'get_info'):
                    env_info = eval_env.env.get_info()
                else:
                    env_info = info
                
                episode_sleep_scores.append(env_info.get('sleep_score', 0))
                episode_fragmentations.append(env_info.get('fragmentation', 0))
                episode_apnea_risks.append(env_info.get('apnea_risk', 0))
                
                if terminated or truncated:
                    break
            
            sleep_scores.append(np.mean(episode_sleep_scores))
            fragmentations.append(np.mean(episode_fragmentations))
            apnea_risks.append(np.mean(episode_apnea_risks))
        
        return {
            'mean_reward': mean_reward,
            'std_reward': std_reward,
            'mean_sleep_score': np.mean(sleep_scores),
            'std_sleep_score': np.std(sleep_scores),
            'mean_fragmentation': np.mean(fragmentations),
            'std_fragmentation': np.std(fragmentations),
            'mean_apnea_risk': np.mean(apnea_risks),
            'std_apnea_risk': np.std(apnea_risks)
        }
    
    def get_recommendations(self, current_environment: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        """
        Get environment optimization recommendations for the user.
        
        Args:
            current_environment: Current environment settings (optional)
            
        Returns:
            Dictionary with recommended settings and expected improvements
        """
        # Set up environment with current settings if provided
        if current_environment:
            # Reset environment and apply current settings
            obs, _ = self.env.reset()
            # Note: This is a simplified approach. In practice, you'd need to
            # modify the environment to accept initial settings.
        
        # Run the trained agent to get optimal settings
        obs, _ = self.env.reset()
        optimal_settings = {}
        episode_sleep_scores = []
        
        for step in range(50):  # Run for 50 steps to find optimal settings
            action, _ = self.model.predict(obs, deterministic=True)
            obs, reward, terminated, truncated, info = self.env.step(action)
            
            # Handle Monitor wrapper
            if hasattr(self.env, 'env') and hasattr(self.env.env, 'get_info'):
                env_info = self.env.env.get_info()
            else:
                env_info = info
            
            episode_sleep_scores.append(env_info.get('sleep_score', 0))
            
            # Record the settings at the best sleep score
            if step == 0 or env_info.get('sleep_score', 0) > max(episode_sleep_scores[:-1]):
                # Get the underlying environment to access current_state
                underlying_env = self.env.env if hasattr(self.env, 'env') else self.env
                
                optimal_settings = {
                    'temperature': env_info.get('temperature', 20.0),
                    'light_intensity': env_info.get('light_intensity', 0.1),
                    'light_color_temp': underlying_env.current_state.light_color_temp if hasattr(underlying_env, 'current_state') else 0.3,
                    'noise_level': env_info.get('noise_level', 0.2),
                    'noise_type': underlying_env.current_state.noise_type if hasattr(underlying_env, 'current_state') else 0.0,
                    'humidity': env_info.get('humidity', 0.5),
                    'airflow': env_info.get('airflow', 0.3)
                }
            
            if terminated or truncated:
                break
        
        # Calculate expected improvements
        baseline_score = self.user_profile.baseline_sleep_score or 60.0
        optimal_score = max(episode_sleep_scores)
        improvement = optimal_score - baseline_score
        
        return {
            'recommended_settings': optimal_settings,
            'expected_sleep_score': optimal_score,
            'expected_improvement': improvement,
            'confidence': min(0.95, 0.7 + improvement / 100.0),  # Higher improvement = higher confidence
            'algorithm': self.algorithm,
            'user_id': self.user_profile.user_id
        }
    
    def save_model(self, path: str):
        """Save the trained model and environment."""
        os.makedirs(path, exist_ok=True)
        
        # Save model
        model_path = os.path.join(path, f"model_{self.algorithm}")
        self.model.save(model_path)
        
        # Save environment normalization
        vec_normalize_path = os.path.join(path, f"vec_normalize_{self.algorithm}")
        self.vec_env.save(vec_normalize_path)
        
        # Save user profile
        user_profile_path = os.path.join(path, "user_profile.json")
        with open(user_profile_path, 'w') as f:
            # Convert dataclass to dict, handling None values
            user_dict = {}
            for field, value in self.user_profile.__dict__.items():
                if value is not None:
                    user_dict[field] = value
            json.dump(user_dict, f, indent=2)
        
        # Save training history
        history_path = os.path.join(path, "training_history.json")
        with open(history_path, 'w') as f:
            json.dump(self.training_history, f, indent=2)
    
    @classmethod
    def load_model(cls, path: str, algorithm: str = "PPO") -> 'SleepOptimizationAgent':
        """Load a trained model."""
        # Check if path is a directory or file
        if os.path.isdir(path):
            # Load user profile
            user_profile_path = os.path.join(path, "user_profile.json")
            if not os.path.exists(user_profile_path):
                raise FileNotFoundError(f"User profile not found at {user_profile_path}")
            
            with open(user_profile_path, 'r') as f:
                user_data = json.load(f)
            
            user_profile = UserProfile(**user_data)
            
            # Create agent and load model
            agent = cls(user_profile, algorithm=algorithm, model_path=path)
            
            # Load environment normalization
            vec_normalize_path = os.path.join(path, f"vec_normalize_{algorithm}")
            if os.path.exists(vec_normalize_path):
                agent.vec_env = VecNormalize.load(vec_normalize_path, agent.vec_env)
            
            return agent
        else:
            # If path is a file, try to load it directly
            raise ValueError(f"Path {path} is not a directory. Please provide the directory containing the model files.")


def train_multiple_users(user_profiles: List[UserProfile], 
                        output_dir: str = "trained_models",
                        algorithm: str = "PPO",
                        total_timesteps: int = 50000) -> Dict[str, Dict[str, float]]:
    """
    Train RL agents for multiple users.
    
    Args:
        user_profiles: List of user profiles to train for
        output_dir: Directory to save trained models
        algorithm: RL algorithm to use
        total_timesteps: Training timesteps per user
        
    Returns:
        Dictionary of evaluation results for each user
    """
    results = {}
    
    for user_profile in user_profiles:
        print(f"\nTraining agent for user: {user_profile.user_id}")
        
        # Create output directory for this user
        user_output_dir = os.path.join(output_dir, f"user_{user_profile.user_id}")
        
        # Create and train agent
        agent = SleepOptimizationAgent(user_profile, algorithm=algorithm)
        agent.train(total_timesteps=total_timesteps, save_path=user_output_dir)
        
        # Evaluate agent
        eval_results = agent.evaluate(n_eval_episodes=10)
        results[user_profile.user_id] = eval_results
        
        # Save model
        agent.save_model(user_output_dir)
        
        print(f"User {user_profile.user_id} - Mean Sleep Score: {eval_results['mean_sleep_score']:.1f}")
    
    return results


if __name__ == "__main__":
    # Test the RL agent
    from user_generator import SyntheticUserGenerator
    
    # Create a test user
    generator = SyntheticUserGenerator(seed=42)
    user = generator.generate_user_profile("test_user")
    
    # Create and train agent
    agent = SleepOptimizationAgent(user, algorithm="PPO")
    
    print("Training agent...")
    agent.train(total_timesteps=10000, save_path="test_model")
    
    print("Evaluating agent...")
    eval_results = agent.evaluate(n_eval_episodes=5)
    print("Evaluation results:", eval_results)
    
    print("Getting recommendations...")
    recommendations = agent.get_recommendations()
    print("Recommendations:", recommendations)
