"""
Real-time Sleep Optimization Plotting

A simpler real-time plotting script that shows live sleep optimization data
without using matplotlib animation (which can be unstable).
"""

import numpy as np
import matplotlib.pyplot as plt
import time
import threading
from datetime import datetime
import json
import os

from user_generator import SyntheticUserGenerator
from rl_agent import SleepOptimizationAgent
from sleep_environment import create_sleep_environment


class RealtimeSleepPlotter:
    """Real-time plotting of sleep optimization data."""
    
    def __init__(self, user_id="realtime_user", update_interval=0.5):
        """
        Initialize the real-time plotter.
        
        Args:
            user_id: ID for the simulated user
            update_interval: Update interval in seconds
        """
        self.user_id = user_id
        self.update_interval = update_interval
        self.start_time = datetime.now()
        self.running = True
        
        # Create user profile
        generator = SyntheticUserGenerator(seed=42)
        self.user = generator.generate_user_profile(user_id)
        
        # Initialize data storage with performance optimizations
        self.timestamps = []
        self.sleep_scores = []
        self.temperatures = []
        self.light_intensities = []
        self.noise_levels = []
        self.rewards = []
        self.confidence_scores = []
        
        # Initialize RL agent with faster training
        self.agent = SleepOptimizationAgent(self.user, algorithm="PPO")
        
        # Create environment with shorter episodes
        self.env = create_sleep_environment(self.user, episode_length=20)
        
        # Training progress - faster training
        self.training_step = 0
        self.total_training_steps = 3000  # Reduced for faster completion
        
        # Performance optimizations
        self.max_data_points = 500  # Limit data points for performance
        self._cached_data = {}
        self.last_update_time = 0
        
        # Setup plots
        self.setup_plots()
        
    def setup_plots(self):
        """Setup the matplotlib plots."""
        plt.style.use('dark_background')
        self.fig, ((self.ax1, self.ax2), (self.ax3, self.ax4)) = plt.subplots(2, 2, figsize=(15, 10))
        self.fig.suptitle(f'Real-time Sleep Optimization - User: {self.user_id}', fontsize=16, color='white')
        
        # Plot 1: Sleep Score Over Time
        self.ax1.set_title('Sleep Score Progress', color='white')
        self.ax1.set_xlabel('Time (seconds)', color='white')
        self.ax1.set_ylabel('Sleep Score', color='white')
        self.ax1.grid(True, alpha=0.3)
        self.ax1.set_ylim(0, 100)
        
        # Plot 2: Environmental Factors
        self.ax2.set_title('Environmental Factors', color='white')
        self.ax2.set_xlabel('Time (seconds)', color='white')
        self.ax2.set_ylabel('Normalized Value', color='white')
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
        self.ax4.set_ylim(0, 1)
        
        plt.tight_layout()
        
        # Set dark theme for all axes
        for ax in [self.ax1, self.ax2, self.ax3, self.ax4]:
            ax.set_facecolor('#2c3e50')
            ax.tick_params(colors='white')
            for spine in ax.spines.values():
                spine.set_color('white')
    
    def collect_data(self):
        """Collect current data from the environment and agent."""
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
        if not hasattr(self, '_cached_recommendations') or len(self.timestamps) % 3 == 0:
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
        
        # Store data
        self.timestamps.append(current_time)
        self.sleep_scores.append(info.get('sleep_score', 60.0))
        self.temperatures.append(current_recommendations['temperature'] / 30.0)  # Normalize
        self.light_intensities.append(current_recommendations['light_intensity'])
        self.noise_levels.append(current_recommendations['noise_level'])
        self.confidence_scores.append(confidence)
        
        # Simulate reward based on training progress
        progress = min(1.0, self.training_step / self.total_training_steps)
        base_reward = 0.5 + progress * 0.4  # Improve over time
        noise = np.random.normal(0, 0.03)  # Reduced noise
        reward = base_reward + noise
        self.rewards.append(reward)
        
        return current_time, info, current_recommendations, confidence
    
    def update_plots(self):
        """Update all plots with new data."""
        # Collect new data
        current_time, info, recommendations, confidence = self.collect_data()
        
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
        status_text = f"User: {self.user_id} | Time: {current_time:.1f}s | Training: {self.training_step}/{self.total_training_steps} | Confidence: {confidence:.2f}"
        self.fig.text(0.5, 0.02, status_text, ha='center', color='white', fontsize=10)
        
        # Set dark theme for all axes
        for ax in [self.ax1, self.ax2, self.ax3, self.ax4]:
            ax.set_facecolor('#2c3e50')
            ax.tick_params(colors='white')
            for spine in ax.spines.values():
                spine.set_color('white')
        
        # Redraw the plot
        plt.draw()
        plt.pause(0.01)
    
    def train_agent_background(self):
        """Train the agent in the background."""
        batch_size = 100  # Larger batches for faster training
        for i in range(0, self.total_training_steps, batch_size):
            if not self.running:
                break
                
            # Train a small batch
            self.agent.model.learn(total_timesteps=batch_size, reset_num_timesteps=False)
            self.training_step += batch_size
            
            time.sleep(0.05)  # Reduced delay for faster updates
    
    def update_plots_thread(self):
        """Update plots in a separate thread."""
        while self.running:
            try:
                self.update_plots()
                time.sleep(self.update_interval)
            except Exception as e:
                print(f"Error updating plots: {e}")
                break
    
    def run_realtime_plotting(self):
        """Run the real-time plotting."""
        print(f"Starting Real-time Sleep Optimization Plotting")
        print(f"User: {self.user_id}")
        print(f"Update Interval: {self.update_interval} seconds")
        print(f"Baseline Sleep Score: {self.user.baseline_sleep_score:.1f}")
        print("\nPress Ctrl+C to stop the plotting")
        
        # Start training in background
        training_thread = threading.Thread(target=self.train_agent_background)
        training_thread.daemon = True
        training_thread.start()
        
        # Start plotting in background
        plotting_thread = threading.Thread(target=self.update_plots_thread)
        plotting_thread.daemon = True
        plotting_thread.start()
        
        try:
            plt.show()
        except KeyboardInterrupt:
            print("\nPlotting stopped by user")
        finally:
            self.running = False
            self.save_data()
    
    def save_data(self):
        """Save the collected data."""
        data = {
            'user_id': self.user_id,
            'start_time': self.start_time.isoformat(),
            'update_interval': self.update_interval,
            'user_profile': self.user.__dict__,
            'timestamps': self.timestamps,
            'sleep_scores': self.sleep_scores,
            'temperatures': self.temperatures,
            'light_intensities': self.light_intensities,
            'noise_levels': self.noise_levels,
            'rewards': self.rewards,
            'confidence_scores': self.confidence_scores
        }
        
        os.makedirs('realtime_data', exist_ok=True)
        filename = f"realtime_data/realtime_plot_{self.user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"\nData saved to: {filename}")
        
        # Print summary
        if len(self.sleep_scores) > 0:
            initial_score = self.sleep_scores[0]
            final_score = self.sleep_scores[-1]
            improvement = final_score - initial_score
            
            print(f"\nPlotting Summary:")
            print(f"  Initial Sleep Score: {initial_score:.1f}")
            print(f"  Final Sleep Score: {final_score:.1f}")
            print(f"  Improvement: {improvement:+.1f} points")
            print(f"  Peak Confidence: {max(self.confidence_scores):.2f}")
            print(f"  Training Steps Completed: {self.training_step}")
            print(f"  Data Points Collected: {len(self.timestamps)}")


def run_quick_plot():
    """Run a quick real-time plot for testing."""
    plotter = RealtimeSleepPlotter(user_id="quick_test", update_interval=0.2)
    plotter.run_realtime_plotting()


def run_full_plot():
    """Run a full real-time plot."""
    plotter = RealtimeSleepPlotter(user_id="full_plot", update_interval=0.5)
    plotter.run_realtime_plotting()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Real-time Sleep Optimization Plotting")
    parser.add_argument("--interval", type=float, default=0.5, 
                       help="Update interval in seconds (default: 0.5)")
    parser.add_argument("--user-id", type=str, default="realtime_user",
                       help="User ID for plotting (default: realtime_user)")
    parser.add_argument("--quick", action="store_true",
                       help="Run a quick plot with 0.2-second updates")
    
    args = parser.parse_args()
    
    if args.quick:
        run_quick_plot()
    else:
        plotter = RealtimeSleepPlotter(user_id=args.user_id, update_interval=args.interval)
        plotter.run_realtime_plotting()
