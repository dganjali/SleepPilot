"""
Synthetic User Generator for Sleep Environment Optimization

This module generates realistic user profiles with varying sensitivities to
environmental factors that affect sleep quality.
"""

import numpy as np
from dataclasses import dataclass
from typing import Dict, List, Optional
import random


@dataclass
class UserProfile:
    """Represents a user's environmental preferences and sensitivities."""
    user_id: str
    
    # Temperature preferences (in Celsius)
    temp_min: float  # Minimum comfortable temperature
    temp_max: float  # Maximum comfortable temperature
    temp_optimal: float  # Optimal temperature for sleep
    
    # Light sensitivity (0-1, where 0 is very sensitive, 1 is not sensitive)
    light_sensitivity: float
    
    # Noise tolerance (0-1, where 0 is very sensitive, 1 is not sensitive)
    noise_tolerance: float
    
    # Humidity preferences (0-1, where 0 is dry preference, 1 is humid preference)
    humidity_preference: float
    
    # Airflow preference (0-1, where 0 is no airflow, 1 is high airflow)
    airflow_preference: float
    
    # Baseline sleep metrics (optional)
    baseline_sleep_score: Optional[float] = None
    baseline_apnea_risk: Optional[float] = None
    baseline_fragmentation: Optional[float] = None
    
    # Demographics (optional)
    age: Optional[int] = None
    gender: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None


class SyntheticUserGenerator:
    """Generates synthetic user profiles with realistic environmental sensitivities."""
    
    def __init__(self, seed: Optional[int] = None):
        """Initialize the user generator with optional seed for reproducibility."""
        if seed is not None:
            random.seed(seed)
            np.random.seed(seed)
    
    def generate_user_profile(self, user_id: Optional[str] = None) -> UserProfile:
        """
        Generate a single synthetic user profile.
        
        Args:
            user_id: Optional user ID. If None, generates a random ID.
            
        Returns:
            UserProfile object with realistic environmental preferences.
        """
        if user_id is None:
            user_id = f"user_{random.randint(1000, 9999)}"
        
        # Generate age (18-80)
        age = random.randint(18, 80)
        
        # Generate gender
        gender = random.choice(['male', 'female', 'other'])
        
        # Generate height and weight based on age and gender
        if gender == 'male':
            height = random.uniform(160, 190)  # cm
            weight = random.uniform(60, 100)   # kg
        elif gender == 'female':
            height = random.uniform(150, 175)  # cm
            weight = random.uniform(45, 85)    # kg
        else:
            height = random.uniform(155, 185)  # cm
            weight = random.uniform(50, 95)    # kg
        
        # Temperature preferences based on research and demographics
        # Most people prefer 16-22°C for sleep, with some variation
        temp_optimal = random.uniform(16.0, 22.0)
        temp_range = random.uniform(2.0, 4.0)  # Comfortable range
        temp_min = temp_optimal - temp_range
        temp_max = temp_optimal + temp_range
        
        # Light sensitivity (correlated with age - older people more sensitive)
        age_factor = min(age / 80.0, 1.0)  # Normalize age
        light_sensitivity = random.uniform(0.1, 0.9) * (1 + age_factor * 0.3)
        light_sensitivity = min(light_sensitivity, 1.0)
        
        # Noise tolerance (varies widely)
        noise_tolerance = random.uniform(0.1, 0.9)
        
        # Humidity preference (geographic and personal factors)
        humidity_preference = random.uniform(0.2, 0.8)
        
        # Airflow preference (personal preference)
        airflow_preference = random.uniform(0.1, 0.9)
        
        # Generate baseline sleep metrics
        baseline_sleep_score = random.uniform(40, 85)  # Realistic range
        baseline_apnea_risk = random.uniform(0.01, 0.3)  # 1-30% risk
        baseline_fragmentation = random.uniform(5, 25)  # Fragmentation events per night
        
        return UserProfile(
            user_id=user_id,
            temp_min=temp_min,
            temp_max=temp_max,
            temp_optimal=temp_optimal,
            light_sensitivity=light_sensitivity,
            noise_tolerance=noise_tolerance,
            humidity_preference=humidity_preference,
            airflow_preference=airflow_preference,
            baseline_sleep_score=baseline_sleep_score,
            baseline_apnea_risk=baseline_apnea_risk,
            baseline_fragmentation=baseline_fragmentation,
            age=age,
            gender=gender,
            weight=weight,
            height=height
        )
    
    def generate_user_batch(self, num_users: int, seed: Optional[int] = None) -> List[UserProfile]:
        """
        Generate multiple synthetic user profiles.
        
        Args:
            num_users: Number of users to generate
            seed: Optional seed for reproducibility
            
        Returns:
            List of UserProfile objects
        """
        if seed is not None:
            random.seed(seed)
            np.random.seed(seed)
        
        users = []
        for i in range(num_users):
            user_id = f"user_{i+1:04d}"
            users.append(self.generate_user_profile(user_id))
        
        return users
    
    def generate_diverse_users(self, num_users: int = 10) -> List[UserProfile]:
        """
        Generate a diverse set of users covering different demographic and preference ranges.
        
        Args:
            num_users: Number of users to generate
            
        Returns:
            List of diverse UserProfile objects
        """
        users = []
        
        # Generate users with different temperature preferences
        temp_ranges = [
            (15, 18),  # Cool sleepers
            (18, 21),  # Moderate sleepers
            (21, 24),  # Warm sleepers
        ]
        
        # Generate users with different light sensitivities
        light_sensitivities = [0.1, 0.3, 0.5, 0.7, 0.9]
        
        # Generate users with different noise tolerances
        noise_tolerances = [0.1, 0.3, 0.5, 0.7, 0.9]
        
        for i in range(num_users):
            user = self.generate_user_profile(f"diverse_user_{i+1:03d}")
            
            # Override some parameters to ensure diversity
            if i < len(temp_ranges):
                temp_min, temp_max = temp_ranges[i % len(temp_ranges)]
                user.temp_optimal = random.uniform(temp_min, temp_max)
                user.temp_min = user.temp_optimal - 2
                user.temp_max = user.temp_optimal + 2
            
            if i < len(light_sensitivities):
                user.light_sensitivity = light_sensitivities[i % len(light_sensitivities)]
            
            if i < len(noise_tolerances):
                user.noise_tolerance = noise_tolerances[i % len(noise_tolerances)]
            
            users.append(user)
        
        return users


def print_user_profile(user: UserProfile):
    """Pretty print a user profile for debugging."""
    print(f"User Profile: {user.user_id}")
    print(f"  Age: {user.age}, Gender: {user.gender}")
    print(f"  Height: {user.height:.1f}cm, Weight: {user.weight:.1f}kg")
    print(f"  Temperature: {user.temp_min:.1f}°C - {user.temp_max:.1f}°C (optimal: {user.temp_optimal:.1f}°C)")
    print(f"  Light Sensitivity: {user.light_sensitivity:.2f}")
    print(f"  Noise Tolerance: {user.noise_tolerance:.2f}")
    print(f"  Humidity Preference: {user.humidity_preference:.2f}")
    print(f"  Airflow Preference: {user.airflow_preference:.2f}")
    print(f"  Baseline Sleep Score: {user.baseline_sleep_score:.1f}")
    print(f"  Baseline Apnea Risk: {user.baseline_apnea_risk:.3f}")
    print(f"  Baseline Fragmentation: {user.baseline_fragmentation:.1f}")


if __name__ == "__main__":
    # Test the user generator
    generator = SyntheticUserGenerator(seed=42)
    
    print("=== Single User Profile ===")
    user = generator.generate_user_profile()
    print_user_profile(user)
    
    print("\n=== Diverse User Batch ===")
    diverse_users = generator.generate_diverse_users(5)
    for user in diverse_users:
        print_user_profile(user)
        print()
