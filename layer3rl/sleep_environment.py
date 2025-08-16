"""
Simulated Sleep Environment for RL Training

This module implements a Gymnasium environment that simulates how environmental
factors (temperature, light, noise, humidity, airflow) affect sleep quality.
"""

import gymnasium as gym
import numpy as np
from gymnasium import spaces
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass

from user_generator import UserProfile


@dataclass
class EnvironmentState:
    """Represents the current state of the sleep environment."""
    # Environmental factors
    temperature: float  # Current room temperature (°C)
    light_intensity: float  # Light intensity (0-1, where 0 is dark, 1 is bright)
    light_color_temp: float  # Color temperature (0-1, where 0 is warm, 1 is cool)
    noise_level: float  # Ambient noise level (0-1, where 0 is quiet, 1 is loud)
    noise_type: float  # Noise type (0=white noise, 0.33=pink, 0.66=nature, 1=fan)
    humidity: float  # Relative humidity (0-1, where 0 is dry, 1 is humid)
    airflow: float  # Airflow intensity (0-1, where 0 is still, 1 is high)
    
    # Sleep metrics
    sleep_score: float  # Current predicted sleep score (0-100)
    fragmentation: float  # Sleep fragmentation events per night
    apnea_risk: float  # Risk of sleep apnea (0-1)
    
    # Time tracking
    time_step: int  # Current time step in the episode


class SleepEnvironment(gym.Env):
    """
    Gymnasium environment for sleep environment optimization.
    
    The environment simulates how changes in environmental factors affect sleep quality.
    The RL agent learns to adjust these factors to maximize sleep quality.
    """
    
    def __init__(self, user_profile: UserProfile, episode_length: int = 100):
        """
        Initialize the sleep environment.
        
        Args:
            user_profile: User profile with environmental preferences
            episode_length: Number of time steps per episode
        """
        super().__init__()
        
        self.user_profile = user_profile
        self.episode_length = episode_length
        
        # Environment bounds
        self.temp_bounds = (10.0, 30.0)  # °C
        self.light_bounds = (0.0, 1.0)
        self.noise_bounds = (0.0, 1.0)
        self.humidity_bounds = (0.2, 0.8)  # 20-80% RH
        self.airflow_bounds = (0.0, 1.0)
        
        # Action space: adjustments to environmental factors
        # [temp_change, light_change, light_color_change, noise_change, 
        #  noise_type_change, humidity_change, airflow_change]
        self.action_space = spaces.Box(
            low=np.array([-2.0, -0.2, -0.2, -0.2, -0.2, -0.2, -0.2], dtype=np.float32),
            high=np.array([2.0, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2], dtype=np.float32),
            dtype=np.float32
        )
        
        # State space: current environment + sleep metrics + user profile
        # [temp, light_intensity, light_color, noise_level, noise_type, humidity, airflow,
        #  sleep_score, fragmentation, apnea_risk, time_step,
        #  user_temp_pref, user_light_sens, user_noise_tol, user_humidity_pref, user_airflow_pref]
        self.observation_space = spaces.Box(
            low=np.array([10.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0,
                         15.0, 0.0, 0.0, 0.0, 0.0], dtype=np.float32),
            high=np.array([30.0, 1.0, 1.0, 1.0, 1.0, 0.8, 1.0, 100.0, 50.0, 1.0, 100.0,
                          25.0, 1.0, 1.0, 1.0, 1.0], dtype=np.float32),
            dtype=np.float32
        )
        
        # Current state
        self.current_state = None
        self.time_step = 0
        
        # Track episode history for analysis
        self.episode_history = []
    
    def reset(self, seed: Optional[int] = None) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Reset the environment to initial state.
        
        Returns:
            Initial observation and info dict
        """
        super().reset(seed=seed)
        
        # Initialize environment to baseline values
        self.current_state = EnvironmentState(
            temperature=20.0,  # Moderate temperature
            light_intensity=0.1,  # Low light
            light_color_temp=0.3,  # Warm light
            noise_level=0.2,  # Low noise
            noise_type=0.0,  # White noise
            humidity=0.5,  # Moderate humidity
            airflow=0.3,  # Low airflow
            sleep_score=self.user_profile.baseline_sleep_score or 60.0,
            fragmentation=self.user_profile.baseline_fragmentation or 15.0,
            apnea_risk=self.user_profile.baseline_apnea_risk or 0.1,
            time_step=0
        )
        
        self.time_step = 0
        self.episode_history = []
        
        return self._get_observation(), self._get_info()
    
    def step(self, action: np.ndarray) -> Tuple[np.ndarray, float, bool, bool, Dict[str, Any]]:
        """
        Take an action to adjust the environment.
        
        Args:
            action: Array of environmental adjustments
            
        Returns:
            observation, reward, terminated, truncated, info
        """
        # Apply action to current state
        self._apply_action(action)
        
        # Update time step
        self.time_step += 1
        self.current_state.time_step = self.time_step
        
        # Calculate new sleep metrics
        self._update_sleep_metrics()
        
        # Calculate reward
        reward = self._calculate_reward()
        
        # Check if episode is done
        terminated = False  # No natural termination
        truncated = self.time_step >= self.episode_length
        
        # Record state for analysis
        self.episode_history.append({
            'time_step': self.time_step,
            'state': self.current_state,
            'action': action,
            'reward': reward
        })
        
        return self._get_observation(), reward, terminated, truncated, self._get_info()
    
    def _apply_action(self, action: np.ndarray):
        """Apply the action to adjust environmental factors."""
        # Unpack action
        temp_change, light_change, light_color_change, noise_change, \
        noise_type_change, humidity_change, airflow_change = action
        
        # Apply changes with bounds checking
        self.current_state.temperature = np.clip(
            self.current_state.temperature + temp_change,
            self.temp_bounds[0], self.temp_bounds[1]
        )
        
        self.current_state.light_intensity = np.clip(
            self.current_state.light_intensity + light_change,
            self.light_bounds[0], self.light_bounds[1]
        )
        
        self.current_state.light_color_temp = np.clip(
            self.current_state.light_color_temp + light_color_change,
            self.light_bounds[0], self.light_bounds[1]
        )
        
        self.current_state.noise_level = np.clip(
            self.current_state.noise_level + noise_change,
            self.noise_bounds[0], self.noise_bounds[1]
        )
        
        self.current_state.noise_type = np.clip(
            self.current_state.noise_type + noise_type_change,
            0.0, 1.0
        )
        
        self.current_state.humidity = np.clip(
            self.current_state.humidity + humidity_change,
            self.humidity_bounds[0], self.humidity_bounds[1]
        )
        
        self.current_state.airflow = np.clip(
            self.current_state.airflow + airflow_change,
            self.airflow_bounds[0], self.airflow_bounds[1]
        )
    
    def _update_sleep_metrics(self):
        """Update sleep metrics based on current environment and user profile."""
        # Calculate temperature factor (0-1, optimal at user's preferred temperature)
        temp_diff = abs(self.current_state.temperature - self.user_profile.temp_optimal)
        temp_factor = max(0, 1 - temp_diff / 5.0)  # 5°C tolerance
        
        # Calculate light factor (lower is better for sleep)
        light_factor = 1 - self.current_state.light_intensity * self.user_profile.light_sensitivity
        
        # Calculate noise factor (depends on user tolerance and noise type)
        noise_factor = 1 - (self.current_state.noise_level * (1 - self.user_profile.noise_tolerance))
        
        # Adjust for noise type preference
        if self.current_state.noise_type < 0.5:  # White/pink noise (generally good for sleep)
            noise_factor = min(1.0, noise_factor + 0.2)
        
        # Calculate humidity factor
        humidity_diff = abs(self.current_state.humidity - self.user_profile.humidity_preference)
        humidity_factor = max(0, 1 - humidity_diff)
        
        # Calculate airflow factor
        airflow_diff = abs(self.current_state.airflow - self.user_profile.airflow_preference)
        airflow_factor = max(0, 1 - airflow_diff)
        
        # Combine factors to calculate sleep score (0-100)
        base_score = 60.0  # Baseline score
        environmental_bonus = (
            temp_factor * 15.0 +
            light_factor * 10.0 +
            noise_factor * 10.0 +
            humidity_factor * 3.0 +
            airflow_factor * 2.0
        )
        
        self.current_state.sleep_score = np.clip(base_score + environmental_bonus, 0, 100)
        
        # Update fragmentation (fewer disruptions with better environment)
        base_fragmentation = self.user_profile.baseline_fragmentation or 15.0
        fragmentation_reduction = (self.current_state.sleep_score - 60.0) / 40.0 * 10.0
        self.current_state.fragmentation = max(0, base_fragmentation - fragmentation_reduction)
        
        # Update apnea risk (temperature and humidity can affect breathing)
        base_apnea_risk = self.user_profile.baseline_apnea_risk or 0.1
        apnea_modifier = 1.0
        
        # Temperature extremes can increase apnea risk
        if self.current_state.temperature < 15 or self.current_state.temperature > 25:
            apnea_modifier += 0.2
        
        # High humidity can increase apnea risk
        if self.current_state.humidity > 0.7:
            apnea_modifier += 0.1
        
        self.current_state.apnea_risk = min(1.0, base_apnea_risk * apnea_modifier)
    
    def _calculate_reward(self) -> float:
        """
        Calculate reward based on sleep quality improvement and comfort.
        
        Returns:
            Reward value (higher is better)
        """
        # Primary reward: sleep score improvement
        sleep_reward = self.current_state.sleep_score / 100.0
        
        # Comfort penalty: penalize extreme or uncomfortable conditions
        comfort_penalty = 0.0
        
        # Temperature comfort penalty
        temp_comfort = 1 - abs(self.current_state.temperature - self.user_profile.temp_optimal) / 10.0
        comfort_penalty += max(0, 0.5 - temp_comfort) * 0.3
        
        # Light comfort penalty (too bright is uncomfortable)
        if self.current_state.light_intensity > 0.5:
            comfort_penalty += (self.current_state.light_intensity - 0.5) * 0.2
        
        # Noise comfort penalty (too loud is uncomfortable)
        if self.current_state.noise_level > 0.7:
            comfort_penalty += (self.current_state.noise_level - 0.7) * 0.2
        
        # Apnea risk penalty
        apnea_penalty = self.current_state.apnea_risk * 0.5
        
        # Fragmentation penalty
        fragmentation_penalty = (self.current_state.fragmentation / 50.0) * 0.3
        
        # Total reward
        total_reward = sleep_reward - comfort_penalty - apnea_penalty - fragmentation_penalty
        
        return np.clip(total_reward, -1.0, 1.0)
    
    def _get_observation(self) -> np.ndarray:
        """Convert current state to observation array."""
        return np.array([
            self.current_state.temperature,
            self.current_state.light_intensity,
            self.current_state.light_color_temp,
            self.current_state.noise_level,
            self.current_state.noise_type,
            self.current_state.humidity,
            self.current_state.airflow,
            self.current_state.sleep_score,
            self.current_state.fragmentation,
            self.current_state.apnea_risk,
            self.current_state.time_step,
            self.user_profile.temp_optimal,
            self.user_profile.light_sensitivity,
            self.user_profile.noise_tolerance,
            self.user_profile.humidity_preference,
            self.user_profile.airflow_preference
        ], dtype=np.float32)
    
    def _get_info(self) -> Dict[str, Any]:
        """Get additional information about the current state."""
        return {
            'sleep_score': self.current_state.sleep_score,
            'fragmentation': self.current_state.fragmentation,
            'apnea_risk': self.current_state.apnea_risk,
            'temperature': self.current_state.temperature,
            'light_intensity': self.current_state.light_intensity,
            'noise_level': self.current_state.noise_level,
            'humidity': self.current_state.humidity,
            'airflow': self.current_state.airflow,
            'time_step': self.time_step
        }
    
    def get_optimal_settings(self) -> Dict[str, float]:
        """
        Get the optimal environmental settings based on user profile.
        This is used for comparison with RL agent recommendations.
        
        Returns:
            Dictionary of optimal settings
        """
        return {
            'temperature': self.user_profile.temp_optimal,
            'light_intensity': 0.0,  # Dark for sleep
            'light_color_temp': 0.3,  # Warm light if needed
            'noise_level': 0.1,  # Low noise
            'noise_type': 0.0,  # White noise
            'humidity': self.user_profile.humidity_preference,
            'airflow': self.user_profile.airflow_preference
        }
    
    def render(self):
        """Render the current environment state (for debugging)."""
        print(f"Time Step: {self.time_step}")
        print(f"Temperature: {self.current_state.temperature:.1f}°C")
        print(f"Light: {self.current_state.light_intensity:.2f} (color: {self.current_state.light_color_temp:.2f})")
        print(f"Noise: {self.current_state.noise_level:.2f} (type: {self.current_state.noise_type:.2f})")
        print(f"Humidity: {self.current_state.humidity:.2f}")
        print(f"Airflow: {self.current_state.airflow:.2f}")
        print(f"Sleep Score: {self.current_state.sleep_score:.1f}")
        print(f"Fragmentation: {self.current_state.fragmentation:.1f}")
        print(f"Apnea Risk: {self.current_state.apnea_risk:.3f}")


def create_sleep_environment(user_profile: UserProfile, episode_length: int = 100) -> SleepEnvironment:
    """
    Factory function to create a sleep environment for a given user profile.
    
    Args:
        user_profile: User profile with environmental preferences
        episode_length: Number of time steps per episode
        
    Returns:
        Configured SleepEnvironment instance
    """
    return SleepEnvironment(user_profile, episode_length)


if __name__ == "__main__":
    # Test the environment
    from user_generator import SyntheticUserGenerator
    
    # Create a test user
    generator = SyntheticUserGenerator(seed=42)
    user = generator.generate_user_profile("test_user")
    
    # Create environment
    env = create_sleep_environment(user, episode_length=50)
    
    # Test reset
    obs, info = env.reset()
    print("Initial observation shape:", obs.shape)
    print("Initial info:", info)
    
    # Test a few steps
    for i in range(5):
        action = env.action_space.sample()
        obs, reward, terminated, truncated, info = env.step(action)
        print(f"Step {i+1}: Reward = {reward:.3f}, Sleep Score = {info['sleep_score']:.1f}")
    
    # Test optimal settings
    optimal = env.get_optimal_settings()
    print("\nOptimal settings:", optimal)
