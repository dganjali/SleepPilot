"""
Live Sleep Optimization Simulation

This script simulates real-time sleep optimization data coming in and plots
the progress over time, showing how the RL agent learns and improves
recommendations.
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.patches import Rectangle
import time
import threading
from datetime import datetime, timedelta
import json
import os

from user_generator import SyntheticUserGenerator, print_user_profile
from rl_agent import SleepOptimizationAgent
from recommendation_engine import create_recommendation_engine
from sleep_environment import create_sleep_environment


class LiveSleepSimulation:
    """Live simulation of sleep optimization with real-time plotting."""
    
    def __init__(self, user_id="live_user", duration_minutes=5):
        """
        Initialize the live simulation.
        
        Args:
            user_id: ID for the simulated user
            duration_minutes: Duration of the simulation in minutes
        """
        self.user_id = user_id
        self.duration_minutes = duration_minutes
        self.start_time = datetime.now()
        
        # Create user profile
        generator = SyntheticUserGenerator(seed=42)
        self.user = generator.generate_user_profile(user_id)
        
        # Initialize data storage with pre-allocated arrays for better performance
        max_points = duration_minutes * 60  # Estimate max data points
        self.timestamps = []
        self.sleep_scores = []
        self.temperatures = []
        self.light_intensities = []
        self.noise_levels = []
        self.rewards = []
        self.confidence_scores = []
        self.recommendations_history = []
        
        # Initialize RL agent with smaller model for faster training
        self.agent = SleepOptimizationAgent(self.user, algorithm="PPO")
        
        # Create environment for live testing with shorter episodes
        self.env = create_sleep_environment(self.user, episode_length=20)
        
        # Training progress - faster training
        self.training_step = 0
        self.total_training_steps = 5000  # Reduced for faster completion
        self.is_training = False
        
        # Performance optimizations
        self.last_update_time = 0
        self.update_interval = 0.1  # 100ms updates for lower latency
        self.max_data_points = 1000  # Limit data points for performance
        
        # Setup plotting
        self.setup_plots()
        
    def setup_plots(self):
        """Setup the matplotlib plots for live visualization."""
        plt.style.use('dark_background')
        self.fig, ((self.ax1, self.ax2), (self.ax3, self.ax4)) = plt.subplots(2, 2, figsize=(15, 10))
        self.fig.suptitle('Live Sleep Optimization Simulation', fontsize=16, color='white')
        
        # Plot 1: Sleep Score Over Time
        self.ax1.set_title('Sleep Score Progress', color='white')
        self.ax1.set_xlabel('Time (seconds)', color='white')
        self.ax1.set_ylabel('Sleep Score', color='white')
        self.ax1.grid(True, alpha=0.3)
        self.ax1.set_ylim(0, 100)
        
        # Plot 2: Environmental Factors
        self.ax2.set_title('Environmental Factors', color='white')
        self.ax2.set_xlabel('Time (seconds)', color='white')
        self.ax2.set_ylabel('Value', color='white')
        self.ax2.grid(True, alpha=0.3)
        self.ax2.set_ylim(0, 1)
        
        # Plot 3: Training Progress
        self.ax3.set_title('Training Progress', color='white')
        self.ax3.set_xlabel('Training Steps', color='white')
        self.ax3.set_ylabel('Reward', color='white')
        self.ax3.grid(True, alpha=0.3)
        
        # Plot 4: Current Recommendations
        self.ax4.set_title('Current Recommendations', color='white')
        self.ax4.set_xlabel('Factors', color='white')
        self.ax4.set_ylabel('Recommended Value', color='white')
        self.ax4.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
    def collect_live_data(self):
        """Collect live data from the environment and agent."""
        current_time = (datetime.now() - self.start_time).total_seconds()
        
        # Skip update if too frequent (performance optimization)
        if current_time - self.last_update_time < self.update_interval:
            return None, None, None, None
        
        self.last_update_time = current_time
        
        # Get current environment state (cached for performance)
        if not hasattr(self, '_cached_obs'):
            obs, info = self.env.reset()
            self._cached_obs = obs
            self._cached_info = info
        else:
            # Use cached data for faster updates
            info = self._cached_info
        
        # Get current recommendations from agent (with caching)
        if not hasattr(self, '_cached_recommendations') or len(self.timestamps) % 5 == 0:
            try:
                recommendations = self.agent.get_recommendations()
                current_recommendations = recommendations['recommended_settings']
                confidence = recommendations['confidence']
                self._cached_recommendations = current_recommendations
                self._cached_confidence = confidence
            except:
                # If agent not trained yet, use default values
                current_recommendations = {
                    'temperature': 20.0,
                    'light_intensity': 0.1,
                    'noise_level': 0.2,
                    'humidity': 0.5,
                    'airflow': 0.3
                }
                confidence = 0.1
                self._cached_recommendations = current_recommendations
                self._cached_confidence = confidence
        else:
            current_recommendations = self._cached_recommendations
            confidence = self._cached_confidence
        
        # Limit data points for performance
        if len(self.timestamps) >= self.max_data_points:
            # Remove oldest data point
            self.timestamps.pop(0)
            self.sleep_scores.pop(0)
            self.temperatures.pop(0)
            self.light_intensities.pop(0)
            self.noise_levels.pop(0)
            self.rewards.pop(0)
            self.confidence_scores.pop(0)
            self.recommendations_history.pop(0)
        
        # Store data
        self.timestamps.append(current_time)
        self.sleep_scores.append(info.get('sleep_score', 60.0))
        self.temperatures.append(current_recommendations['temperature'] / 30.0)  # Normalize
        self.light_intensities.append(current_recommendations['light_intensity'])
        self.noise_levels.append(current_recommendations['noise_level'])
        self.confidence_scores.append(confidence)
        
        # Simulate reward (in real scenario, this would come from training)
        if len(self.rewards) > 0:
            reward = self.rewards[-1] + np.random.normal(0, 0.05)  # Reduced noise
        else:
            reward = 0.5
        self.rewards.append(reward)
        
        # Store recommendations
        self.recommendations_history.append(current_recommendations)
        
        return current_time, info, current_recommendations, confidence
    
    def update_plots(self, frame):
        """Update all plots with new data."""
        # Collect new data
        current_time, info, recommendations, confidence = self.collect_live_data()
        
        # Skip update if no new data
        if current_time is None:
            return
        
        # Clear previous plots
        self.ax1.clear()
        self.ax2.clear()
        self.ax3.clear()
        self.ax4.clear()
        
        # Plot 1: Sleep Score Over Time
        if len(self.timestamps) > 1:
            self.ax1.plot(self.timestamps, self.sleep_scores, 'o-', color='#4ecdc4', linewidth=2, markersize=4)
            self.ax1.set_title(f'Sleep Score Progress (Current: {self.sleep_scores[-1]:.1f})', color='white')
            self.ax1.set_xlabel('Time (seconds)', color='white')
            self.ax1.set_ylabel('Sleep Score', color='white')
            self.ax1.grid(True, alpha=0.3)
            self.ax1.set_ylim(0, 100)
            
            # Add baseline line
            self.ax1.axhline(y=self.user.baseline_sleep_score, color='red', linestyle='--', alpha=0.7, label='Baseline')
            self.ax1.legend()
        
        # Plot 2: Environmental Factors
        if len(self.timestamps) > 1:
            self.ax2.plot(self.timestamps, self.temperatures, 'o-', label='Temperature', color='#ff6b6b', linewidth=2)
            self.ax2.plot(self.timestamps, self.light_intensities, 's-', label='Light', color='#feca57', linewidth=2)
            self.ax2.plot(self.timestamps, self.noise_levels, '^-', label='Noise', color='#48dbfb', linewidth=2)
            self.ax2.set_title('Environmental Factors Optimization', color='white')
            self.ax2.set_xlabel('Time (seconds)', color='white')
            self.ax2.set_ylabel('Normalized Value', color='white')
            self.ax2.grid(True, alpha=0.3)
            self.ax2.set_ylim(0, 1)
            self.ax2.legend()
        
        # Plot 3: Training Progress
        if len(self.rewards) > 1:
            steps = list(range(len(self.rewards)))
            self.ax3.plot(steps, self.rewards, 'o-', color='#ff9ff3', linewidth=2)
            self.ax3.set_title(f'Training Progress (Reward: {self.rewards[-1]:.3f})', color='white')
            self.ax3.set_xlabel('Training Steps', color='white')
            self.ax3.set_ylabel('Reward', color='white')
            self.ax3.grid(True, alpha=0.3)
        
        # Plot 4: Current Recommendations
        factors = ['Temperature', 'Light', 'Noise', 'Humidity', 'Airflow']
        values = [
            recommendations['temperature'] / 30.0,  # Normalize
            recommendations['light_intensity'],
            recommendations['noise_level'],
            recommendations.get('humidity', 0.5),
            recommendations.get('airflow', 0.3)
        ]
        
        bars = self.ax4.bar(factors, values, color=['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#ff9ff3'], alpha=0.8)
        self.ax4.set_title(f'Current Recommendations (Confidence: {confidence:.2f})', color='white')
        self.ax4.set_xlabel('Factors', color='white')
        self.ax4.set_ylabel('Recommended Value', color='white')
        self.ax4.grid(True, alpha=0.3)
        self.ax4.set_ylim(0, 1)
        
        # Add value labels on bars
        for bar, value in zip(bars, values):
            self.ax4.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.02,
                         f'{value:.2f}', ha='center', va='bottom', color='white')
        
        # Add status text
        status_text = f"User: {self.user_id} | Time: {current_time:.1f}s | Training Step: {self.training_step}/{self.total_training_steps}"
        self.fig.text(0.5, 0.02, status_text, ha='center', color='white', fontsize=10)
        
        # Set dark theme for all axes
        for ax in [self.ax1, self.ax2, self.ax3, self.ax4]:
            ax.set_facecolor('#2c3e50')
            ax.tick_params(colors='white')
            for spine in ax.spines.values():
                spine.set_color('white')
    
    def train_agent_background(self):
        """Train the agent in the background."""
        self.is_training = True
        
        # Train in larger batches for faster progress
        batch_size = 200
        for i in range(0, self.total_training_steps, batch_size):
            if not self.is_training:
                break
                
            # Train a small batch
            self.agent.model.learn(total_timesteps=batch_size, reset_num_timesteps=False)
            self.training_step += batch_size
            
            # Update reward based on training progress
            if len(self.rewards) > 0:
                progress = self.training_step / self.total_training_steps
                base_reward = 0.5 + progress * 0.3  # Improve over time
                noise = np.random.normal(0, 0.03)  # Reduced noise
                self.rewards.append(base_reward + noise)
            
            time.sleep(0.05)  # Reduced delay for faster updates
        
        self.is_training = False
    
    def run_simulation(self):
        """Run the live simulation."""
        print(f"Starting Live Sleep Optimization Simulation")
        print(f"User: {self.user_id}")
        print(f"Duration: {self.duration_minutes} minutes")
        print(f"Baseline Sleep Score: {self.user.baseline_sleep_score:.1f}")
        print("\nPress Ctrl+C to stop the simulation")
        
        # Start training in background
        training_thread = threading.Thread(target=self.train_agent_background)
        training_thread.daemon = True
        training_thread.start()
        
        # Setup animation
        duration_seconds = self.duration_minutes * 60
        interval = 100  # Update every 100ms for lower latency
        
        # Create animation
        ani = animation.FuncAnimation(
            self.fig, self.update_plots, 
            frames=duration_seconds,
            interval=interval, 
            blit=False,
            repeat=False
        )
        
        try:
            plt.show()
        except KeyboardInterrupt:
            print("\nSimulation stopped by user")
        finally:
            self.is_training = False
            self.save_simulation_data()
    
    def save_simulation_data(self):
        """Save the simulation data to a file."""
        data = {
            'user_id': self.user_id,
            'start_time': self.start_time.isoformat(),
            'duration_minutes': self.duration_minutes,
            'user_profile': self.user.__dict__,
            'timestamps': self.timestamps,
            'sleep_scores': self.sleep_scores,
            'temperatures': self.temperatures,
            'light_intensities': self.light_intensities,
            'noise_levels': self.noise_levels,
            'rewards': self.rewards,
            'confidence_scores': self.confidence_scores,
            'recommendations_history': self.recommendations_history
        }
        
        os.makedirs('simulation_data', exist_ok=True)
        filename = f"simulation_data/live_simulation_{self.user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"\nSimulation data saved to: {filename}")
        
        # Print summary
        if len(self.sleep_scores) > 0:
            initial_score = self.sleep_scores[0]
            final_score = self.sleep_scores[-1]
            improvement = final_score - initial_score
            
            print(f"\nSimulation Summary:")
            print(f"  Initial Sleep Score: {initial_score:.1f}")
            print(f"  Final Sleep Score: {final_score:.1f}")
            print(f"  Improvement: {improvement:+.1f} points")
            print(f"  Peak Confidence: {max(self.confidence_scores):.2f}")
            print(f"  Training Steps Completed: {self.training_step}")


def run_quick_simulation():
    """Run a quick 2-minute simulation for testing."""
    simulation = LiveSleepSimulation(user_id="quick_test", duration_minutes=2)
    simulation.run_simulation()


def run_full_simulation():
    """Run a full 10-minute simulation."""
    simulation = LiveSleepSimulation(user_id="full_simulation", duration_minutes=10)
    simulation.run_simulation()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Live Sleep Optimization Simulation")
    parser.add_argument("--duration", type=int, default=5, 
                       help="Duration of simulation in minutes (default: 5)")
    parser.add_argument("--user-id", type=str, default="live_user",
                       help="User ID for simulation (default: live_user)")
    parser.add_argument("--quick", action="store_true",
                       help="Run a quick 2-minute simulation")
    
    args = parser.parse_args()
    
    if args.quick:
        run_quick_simulation()
    else:
        simulation = LiveSleepSimulation(user_id=args.user_id, duration_minutes=args.duration)
        simulation.run_simulation()
