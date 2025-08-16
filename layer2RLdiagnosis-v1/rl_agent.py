import torch
import torch.nn as nn
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv, VecNormalize
from stable_baselines3.common.callbacks import EvalCallback, CheckpointCallback
from stable_baselines3.common.utils import set_random_seed
from huggingface_hub import HfApi, login
import os
from typing import Dict, Any, List
import numpy as np


class ApneaDetectionAgent:
    def __init__(self, env, model_name: str = "apnea-detection-rl", 
                 learning_rate: float = 3e-4, n_steps: int = 2048, 
                 model_path: str = None):
        self.env = env
        self.model_name = model_name
        self.learning_rate = learning_rate
        self.n_steps = n_steps
        
        if model_path and os.path.exists(model_path):
            # Load existing model
            print(f"Loading existing model from {model_path}")
            self.model = PPO.load(model_path)
        else:
            # Initialize PPO model
            self.model = PPO(
                "MlpPolicy",
                env,
                learning_rate=learning_rate,
                n_steps=n_steps,
                batch_size=64,
                n_epochs=10,
                gamma=0.99,
                gae_lambda=0.95,
                clip_range=0.2,
                clip_range_vf=None,
                normalize_advantage=True,
                ent_coef=0.05,  # Increased from 0.01 to encourage exploration
                vf_coef=0.5,
                max_grad_norm=0.5,
                use_sde=False,
                sde_sample_freq=-1,
                target_kl=None,
                tensorboard_log="./tensorboard_logs/",
                verbose=1
            )
            
            # Setup callbacks only for new models
            self.setup_callbacks()
        
    def setup_callbacks(self):
        """Setup training callbacks"""
        # Evaluation callback
        self.eval_callback = EvalCallback(
            self.env,
            best_model_save_path="./best_model/",
            log_path="./logs/",
            eval_freq=max(self.n_steps // 4, 1),
            deterministic=True,
            render=False
        )
        
        # Checkpoint callback
        self.checkpoint_callback = CheckpointCallback(
            save_freq=max(self.n_steps // 2, 1),
            save_path="./checkpoints/",
            name_prefix="apnea_model"
        )
        
    def train(self, total_timesteps: int = 1000000) -> Dict[str, Any]:
        """Train the RL agent"""
        print(f"Starting training for {total_timesteps} timesteps...")
        
        # Train the model
        self.model.learn(
            total_timesteps=total_timesteps,
            callback=[self.eval_callback, self.checkpoint_callback],
            progress_bar=True
        )
        
        # Save final model
        self.model.save(f"./models/{self.model_name}_final")
        
        return {"status": "training_completed", "total_timesteps": total_timesteps}
    
    def evaluate(self, n_eval_episodes: int = 100) -> Dict[str, Any]:
        """Evaluate the trained agent"""
        print(f"Evaluating agent on {n_eval_episodes} episodes...")
        
        episode_rewards = []
        episode_lengths = []
        episode_metrics = []
        
        for episode in range(n_eval_episodes):
            obs, _ = self.env.reset()
            episode_reward = 0
            episode_length = 0
            
            while True:
                action, _ = self.model.predict(obs, deterministic=True)
                obs, reward, terminated, truncated, info = self.env.step(action)
                episode_reward += reward
                episode_length += 1
                
                if terminated or truncated:
                    # Get episode metrics
                    metrics = self.env.get_episode_metrics()
                    if metrics:
                        episode_metrics.append(metrics)
                    break
            
            episode_rewards.append(episode_reward)
            episode_lengths.append(episode_length)
        
        # Calculate evaluation metrics
        eval_results = {
            "mean_reward": np.mean(episode_rewards),
            "std_reward": np.std(episode_rewards),
            "mean_episode_length": np.mean(episode_lengths),
            "n_episodes": n_eval_episodes
        }
        
        if episode_metrics:
            # Aggregate patient-level metrics
            patient_metrics = {}
            for metrics in episode_metrics:
                patient_id = metrics['patient_id']
                if patient_id not in patient_metrics:
                    patient_metrics[patient_id] = []
                patient_metrics[patient_id].append(metrics)
            
            # Calculate aggregated metrics
            all_accuracies = [m['accuracy'] for m in episode_metrics]
            all_eces = [m['ece'] for m in episode_metrics]
            all_severities = [m['severity_score'] for m in episode_metrics]
            all_ahi_scores = [m.get('ahi_score', 0) for m in episode_metrics]
            all_confidences = [m['mean_confidence'] for m in episode_metrics]
            
            eval_results.update({
                "mean_accuracy": np.mean(all_accuracies),
                "mean_ece": np.mean(all_eces),
                "mean_severity": np.mean(all_severities),
                "mean_ahi_score": np.mean(all_ahi_scores),
                "mean_confidence": np.mean(all_confidences),
                "patient_metrics": patient_metrics
            })
        
        return eval_results
    
    def predict_with_confidence(self, obs: np.ndarray) -> tuple:
        """Make prediction with confidence estimation"""
        action, _ = self.model.predict(obs, deterministic=True)
        
        # For confidence estimation, we can use the policy's action probabilities
        # or implement a separate confidence head
        if hasattr(self.model, 'policy'):
            action_probs = self.model.policy.get_distribution(obs).distribution.probs
            confidence = torch.max(action_probs).item()
        else:
            confidence = 0.8  # Default confidence
        
        return action, confidence
    
    def save_to_hub(self, repo_id: str, commit_message: str = "Add trained apnea detection model"):
        """Save model to Hugging Face Hub"""
        try:
            # Login to Hugging Face (requires token)
            api = HfApi()
            
            # Create model card
            model_card = f"""
            # Apnea Detection RL Agent
            
            This is a reinforcement learning agent trained to detect sleep apnea events from PSG audio data.
            
            ## Model Details
            - Algorithm: PPO (Proximal Policy Optimization)
            - Environment: Custom Gymnasium environment for apnea detection
            - Reward Function: ECE-inspired confidence calibration
            - Action Space: WAIT (0), DIAGNOSE (1), ESCALATE (2)
            
            ## Performance
            - Trained on PSG audio dataset
            - Optimized for both classification accuracy and confidence calibration
            - Handles patient-specific episode structure
            
            ## Usage
            ```python
            from stable_baselines3 import PPO
            model = PPO.load("path_to_model")
            action, confidence = model.predict(observation)
            ```
            """
            
            # Save model locally first
            local_path = f"./models/{self.model_name}_hub"
            self.model.save(local_path)
            
            # Upload to Hub
            api.upload_folder(
                folder_path=local_path,
                repo_id=repo_id,
                commit_message=commit_message
            )
            
            print(f"Model successfully uploaded to {repo_id}")
            return True
            
        except Exception as e:
            print(f"Failed to upload to Hub: {e}")
            return False
    
    def load_from_hub(self, repo_id: str) -> bool:
        """Load model from Hugging Face Hub"""
        try:
            # This would require the model to be previously uploaded
            # For now, just load from local path
            local_path = f"./models/{self.model_name}_final"
            if os.path.exists(local_path + ".zip"):
                self.model = PPO.load(local_path)
                print(f"Model loaded from {local_path}")
                return True
            else:
                print(f"Model not found at {local_path}")
                return False
        except Exception as e:
            print(f"Failed to load model: {e}")
            return False
