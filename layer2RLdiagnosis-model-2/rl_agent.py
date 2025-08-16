import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from stable_baselines3 import PPO
from stable_baselines3.common.policies import BasePolicy
from stable_baselines3.common.torch_layers import BaseFeaturesExtractor
from stable_baselines3.common.utils import get_device
from stable_baselines3.common.callbacks import BaseCallback
from typing import Dict, List, Tuple, Optional, Union, Type
import gymnasium as gym
from tqdm import tqdm
import time


class ApneaFeatureExtractor(BaseFeaturesExtractor):
    """Feature extractor for mel-spectrogram inputs."""
    
    def __init__(self, observation_space: gym.spaces.Box, features_dim: int = 256):
        super().__init__(observation_space, features_dim)
        
        # CNN layers for mel-spectrogram processing
        self.conv1 = nn.Conv2d(1, 32, kernel_size=(3, 3), padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=(3, 3), padding=1)
        self.conv3 = nn.Conv2d(64, 128, kernel_size=(3, 3), padding=1)
        
        # Batch normalization
        self.bn1 = nn.BatchNorm2d(32)
        self.bn2 = nn.BatchNorm2d(64)
        self.bn3 = nn.BatchNorm2d(128)
        
        # Pooling
        self.pool = nn.AdaptiveAvgPool2d((4, 4))
        
        # Calculate the size after convolutions and pooling
        conv_output_size = 128 * 4 * 4
        
        # Fully connected layers
        self.fc1 = nn.Linear(conv_output_size, 512)
        self.fc2 = nn.Linear(512, features_dim)
        
        # Dropout for regularization
        self.dropout = nn.Dropout(0.3)
        
    def forward(self, observations: torch.Tensor) -> torch.Tensor:
        # Add channel dimension if not present
        if observations.dim() == 3:
            observations = observations.unsqueeze(1)  # (batch, 1, n_mels, n_frames)
        
        # Apply convolutions
        x = F.relu(self.bn1(self.conv1(observations)))
        x = F.relu(self.bn2(self.conv2(x)))
        x = F.relu(self.bn3(self.conv3(x)))
        
        # Pooling
        x = self.pool(x)
        
        # Flatten
        x = x.view(x.size(0), -1)
        
        # Fully connected layers
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        
        return x


class ApneaPolicy(BasePolicy):
    """Custom policy for apnea detection with confidence awareness."""
    
    def __init__(self, observation_space: gym.spaces.Box, action_space: gym.spaces.Discrete,
                 lr_schedule: callable, net_arch: Optional[List[int]] = None,
                 activation_fn: Type[nn.Module] = nn.ReLU, *args, **kwargs):
        
        super().__init__(observation_space, action_space, lr_schedule, *args, **kwargs)
        
        # Feature extractor
        self.features_extractor = ApneaFeatureExtractor(observation_space)
        
        # Action head (policy)
        self.action_net = nn.Sequential(
            nn.Linear(self.features_extractor.features_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, action_space.n)
        )
        
        # Confidence head (for diagnosis confidence)
        self.confidence_net = nn.Sequential(
            nn.Linear(self.features_extractor.features_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 1),
            nn.Sigmoid()  # Output confidence between 0 and 1
        )
        
        # Value head
        self.value_net = nn.Sequential(
            nn.Linear(self.features_extractor.features_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 1)
        )
        
    def forward(self, obs: torch.Tensor, deterministic: bool = False) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """Forward pass through the policy network."""
        features = self.features_extractor(obs)
        
        # Action logits
        action_logits = self.action_net(features)
        
        # Confidence (for diagnosis)
        confidence = self.confidence_net(features)
        
        # Value
        value = self.value_net(features)
        
        return action_logits, confidence, value
    
    def forward_actor(self, obs: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """Forward pass for actor (action and confidence)."""
        features = self.features_extractor(obs)
        action_logits = self.action_net(features)
        confidence = self.confidence_net(features)
        return action_logits, confidence
    
    def forward_critic(self, obs: torch.Tensor) -> torch.Tensor:
        """Forward pass for critic (value)."""
        features = self.features_extractor(obs)
        return self.value_net(features)
    
    def _predict(self, observation: torch.Tensor, deterministic: bool = False) -> Tuple[torch.Tensor, Optional[torch.Tensor]]:
        """Predict action and confidence."""
        action_logits, confidence = self.forward_actor(observation)
        
        if deterministic:
            action = torch.argmax(action_logits, dim=1)
        else:
            action_probs = F.softmax(action_logits, dim=1)
            action = torch.multinomial(action_probs, 1).squeeze(-1)
        
        return action, confidence.squeeze(-1)


class EnhancedTrainingCallback(BaseCallback):
    """Enhanced callback for monitoring training progress with tqdm."""
    
    def __init__(self, eval_freq: int = 1000, verbose: int = 1):
        super().__init__(verbose)
        self.eval_freq = eval_freq
        self.eval_results = []
        self.pbar = None
        self.start_time = None
        
    def _on_training_start(self) -> None:
        """Called at the start of training."""
        self.start_time = time.time()
        if self.verbose > 0:
            print(f"🚀 Starting training with {self.locals['total_timesteps']} timesteps")
            self.pbar = tqdm(total=self.locals['total_timesteps'], 
                           desc="Training Progress", 
                           unit="steps",
                           bar_format='{l_bar}{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}, {rate_fmt}]')
    
    def _on_step(self) -> bool:
        """Called after each step."""
        if self.pbar:
            self.pbar.update(self.locals['self'].n_steps)
        
        # Evaluate at specified frequency
        if self.locals['self'].num_timesteps % self.eval_freq == 0:
            self._evaluate_current_performance()
        
        return True
    
    def _evaluate_current_performance(self) -> None:
        """Evaluate current performance."""
        try:
            eval_env = self.locals['self'].env
            if hasattr(eval_env, 'get_episode_results'):
                obs, info = eval_env.reset()
                done = False
                while not done:
                    action, _ = self.locals['self'].predict(obs, deterministic=True)
                    obs, _, done, _, _ = eval_env.step(action)
                
                results = eval_env.get_episode_results()
                if results:
                    self.eval_results.append({
                        'timestep': self.locals['self'].num_timesteps,
                        'ece': results.get('ece', 0),
                        'severity': results.get('severity', 0),
                        'median_confidence': results.get('median_confidence', 0)
                    })
                    
                    if self.verbose > 0:
                        print(f"\n📊 Evaluation at {self.locals['self'].num_timesteps} steps:")
                        print(f"   ECE: {results.get('ece', 0):.4f}")
                        print(f"   Severity: {results.get('severity', 0):.4f}")
                        print(f"   Median Confidence: {results.get('median_confidence', 0):.4f}")
        except Exception as e:
            if self.verbose > 0:
                print(f"⚠️ Evaluation error: {e}")
    
    def _on_training_end(self) -> None:
        """Called at the end of training."""
        if self.pbar:
            self.pbar.close()
        
        if self.verbose > 0:
            elapsed_time = time.time() - self.start_time
            print(f"\n✅ Training completed in {elapsed_time:.2f} seconds")
            print(f"📈 Final evaluation results: {len(self.eval_results)} evaluations performed")


class ApneaRLAgent:
    """Enhanced RL agent for apnea detection with confidence awareness and progress tracking."""
    
    def __init__(self, env: gym.Env, learning_rate: float = 3e-4, 
                 n_steps: int = 2048, batch_size: int = 64, n_epochs: int = 10,
                 gamma: float = 0.99, gae_lambda: float = 0.95, clip_range: float = 0.2):
        
        self.env = env
        self.device = get_device("auto")
        
        # Create custom policy
        policy_kwargs = {
            "features_extractor_class": ApneaFeatureExtractor,
            "features_extractor_kwargs": {"features_dim": 256}
        }
        
        # Initialize PPO agent with enhanced parameters
        self.agent = PPO(
            "MlpPolicy",  # We'll override this with custom policy
            env,
            learning_rate=learning_rate,
            n_steps=n_steps,
            batch_size=batch_size,
            n_epochs=n_epochs,
            gamma=gamma,
            gae_lambda=gae_lambda,
            clip_range=clip_range,
            policy_kwargs=policy_kwargs,
            verbose=1,
            device=self.device,
            tensorboard_log="./tensorboard_logs/"  # Add tensorboard logging
        )
        
        # Replace policy with custom one
        self.agent.policy = ApneaPolicy(
            env.observation_space,
            env.action_space,
            self.agent.lr_schedule,
            device=self.device
        )
        
        # Training history
        self.training_history = {
            'episode_rewards': [],
            'episode_lengths': [],
            'ece_scores': [],
            'confidence_scores': [],
            'training_timesteps': [],
            'evaluation_results': []
        }
    
    def train(self, total_timesteps: int, callback=None, show_progress: bool = True) -> None:
        """Train the agent with enhanced progress tracking."""
        if callback is None:
            callback = EnhancedTrainingCallback(eval_freq=5000, verbose=1 if show_progress else 0)
        
        print(f"🤖 Starting PPO training for {total_timesteps} timesteps...")
        print(f"📊 Environment: {self.env.observation_space.shape} → {self.env.action_space.n} actions")
        print(f"🔧 Device: {self.device}")
        
        # Train agent
        self.agent.learn(
            total_timesteps=total_timesteps, 
            callback=callback,
            progress_bar=show_progress
        )
        
        # Update training history
        if hasattr(callback, 'eval_results'):
            self.training_history['evaluation_results'] = callback.eval_results
    
    def predict(self, observation: np.ndarray, deterministic: bool = False) -> Tuple[int, float]:
        """Predict action and confidence for a given observation."""
        # Convert to tensor
        obs_tensor = torch.FloatTensor(observation).unsqueeze(0).to(self.device)
        
        # Get prediction
        action, confidence = self.agent.policy._predict(obs_tensor, deterministic)
        
        return action.item(), confidence.item()
    
    def evaluate_episode(self, env: gym.Env, show_progress: bool = True) -> Dict:
        """Evaluate the agent on a single episode with progress tracking."""
        obs, info = env.reset()
        done = False
        total_reward = 0
        episode_length = 0
        predictions = []
        
        # Progress bar for episode evaluation
        if show_progress:
            pbar = tqdm(desc="Episode Evaluation", unit="steps")
        
        while not done:
            # Get action and confidence
            action, confidence = self.predict(obs, deterministic=True)
            
            # Take step
            obs, reward, done, truncated, info = env.step(action)
            
            # Record prediction
            if action == 1:  # DIAGNOSE action
                predictions.append({
                    'action': action,
                    'confidence': confidence,
                    'reward': reward
                })
            
            total_reward += reward
            episode_length += 1
            
            if show_progress:
                pbar.update(1)
                pbar.set_postfix({
                    'reward': f"{total_reward:.3f}",
                    'steps': episode_length
                })
        
        if show_progress:
            pbar.close()
        
        # Get episode results
        episode_results = env.get_episode_results()
        
        # Update training history
        self.training_history['episode_rewards'].append(total_reward)
        self.training_history['episode_lengths'].append(episode_length)
        self.training_history['training_timesteps'].append(episode_length)
        
        if episode_results:
            self.training_history['ece_scores'].append(episode_results.get('ece', 0))
            self.training_history['confidence_scores'].append(episode_results.get('median_confidence', 0))
        
        return {
            'total_reward': total_reward,
            'episode_length': episode_length,
            'episode_results': episode_results,
            'predictions': predictions
        }
    
    def save(self, path: str) -> None:
        """Save the trained agent."""
        self.agent.save(path)
        print(f"💾 Agent saved to {path}")
    
    def load(self, path: str) -> None:
        """Load a trained agent."""
        self.agent = PPO.load(path)
        # Ensure policy is custom
        if not isinstance(self.agent.policy, ApneaPolicy):
            self.agent.policy = ApneaPolicy(
                self.env.observation_space,
                self.env.action_space,
                self.agent.lr_schedule,
                device=self.device
            )
        print(f"📂 Agent loaded from {path}")
    
    def get_training_summary(self) -> Dict:
        """Get a summary of training performance."""
        if not self.training_history['episode_rewards']:
            return {"status": "No training data available"}
        
        return {
            "total_episodes": len(self.training_history['episode_rewards']),
            "mean_reward": np.mean(self.training_history['episode_rewards']),
            "std_reward": np.std(self.training_history['episode_rewards']),
            "mean_episode_length": np.mean(self.training_history['episode_lengths']),
            "mean_ece": np.mean(self.training_history['ece_scores']) if self.training_history['ece_scores'] else 0,
            "mean_confidence": np.mean(self.training_history['confidence_scores']) if self.training_history['confidence_scores'] else 0,
            "evaluation_count": len(self.training_history['evaluation_results'])
        }
